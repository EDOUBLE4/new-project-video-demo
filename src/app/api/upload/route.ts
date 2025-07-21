import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/supabase'
import { getVectorizeClient } from '@/lib/ai/vectorize'
import type { ProcessingStatus } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const vendorId = formData.get('vendorId') as string
    const vendorName = formData.get('vendorName') as string
    const vendorEmail = formData.get('vendorEmail') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type and size
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, PNG, or JPG files.' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create vendor if vendorId not provided
    let actualVendorId = vendorId
    if (!actualVendorId) {
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: vendorName || 'New Vendor',
          email: vendorEmail || null,
          created_by: null, // TODO: Get from auth
        })
        .select()
        .single()

      if (vendorError) {
        throw vendorError
      }
      actualVendorId = vendor.id
    }

    // Upload to Supabase Storage
    const fileName = `${actualVendorId}/${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('coi-documents')
      .upload(fileName, file)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('coi-documents')
      .getPublicUrl(fileName)

    // Create certificate record
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        vendor_id: actualVendorId,
        document_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        processing_status: 'pending' as ProcessingStatus,
        created_by: null, // TODO: Get from auth
      })
      .select()
      .single()

    if (certError) {
      throw certError
    }

    // Send to Vectorize for processing
    const vectorize = getVectorizeClient()
    const extractionResult = await vectorize.extractCOI(file)

    if (extractionResult.success && extractionResult.data) {
      // Update certificate with job ID
      await supabase
        .from('certificates')
        .update({
          vectorize_job_id: extractionResult.data,
          processing_status: 'processing' as ProcessingStatus,
        })
        .eq('id', certificate.id)

      // Log upload event
      await supabase.rpc('log_compliance_event', {
        p_event_type: 'coi_uploaded',
        p_certificate_id: certificate.id,
        p_vendor_id: actualVendorId,
        p_event_data: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        },
      })

      // In development/mock mode, automatically trigger webhook after a delay
      if (process.env.USE_MOCK_VECTORIZE === 'true' || process.env.NODE_ENV === 'development') {
        setTimeout(async () => {
          try {
            // Get mock extraction data
            const { MockVectorizeService } = await import('@/lib/ai/vectorize-mock')
            const mockStatus = await MockVectorizeService.getExtractionStatus(extractionResult.data as string)
            
            if (mockStatus.status === 'completed') {
              const webhookData = {
                jobId: extractionResult.data,
                status: 'completed',
                extraction: MockVectorizeService.transformToVectorizeFormat(mockStatus.extraction),
                confidence: mockStatus.confidence,
              }

              // Call our own webhook endpoint
              const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/webhooks/vectorize`
              await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-vectorize-signature': process.env.VECTORIZE_WEBHOOK_SECRET || 'dev-secret',
                },
                body: JSON.stringify(webhookData),
              })
              
              console.log('Mock webhook triggered for job:', extractionResult.data)
            }
          } catch (error) {
            console.error('Failed to trigger mock webhook:', error)
          }
        }, 2000) // Wait 2 seconds to simulate async processing
      }

      return NextResponse.json({
        success: true,
        certificateId: certificate.id,
        vendorId: actualVendorId,
        jobId: extractionResult.data,
        message: 'COI uploaded and processing started',
      })
    } else {
      // Update status to failed
      await supabase
        .from('certificates')
        .update({
          processing_status: 'failed' as ProcessingStatus,
        })
        .eq('id', certificate.id)

      return NextResponse.json(
        { error: extractionResult.error || 'Failed to start processing' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload COI' },
      { status: 500 }
    )
  }
}