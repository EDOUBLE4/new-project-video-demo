import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/supabase'
import { VectorizeClient } from '@/lib/ai/vectorize'
import type { ProcessingStatus } from '@/types/database'

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = req.headers.get('x-vectorize-signature')
    if (webhookSecret !== process.env.VECTORIZE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, status, extraction, confidence, error } = await req.json()

    // Queue for processing (following MVP pattern)
    // In production, this would go to a job queue
    await processExtraction({
      jobId,
      status,
      extraction,
      confidence,
      error,
    })

    // Return immediately as per CLAUDE.md guidelines
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processExtraction(data: {
  jobId: string
  status: string
  extraction?: any
  confidence?: number
  error?: string
}) {
  const supabase = createAdminClient()

  try {
    // Find the certificate by vectorize_job_id
    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select('*')
      .eq('vectorize_job_id', data.jobId)
      .single()

    if (fetchError || !certificate) {
      console.error('Certificate not found for job:', data.jobId)
      return
    }

    if (data.status === 'completed' && data.extraction) {
      // Transform extraction data
      const extractedData = VectorizeClient.transformExtraction(data.extraction)

      // Update certificate with extraction results
      const { error: updateError } = await supabase
        .from('certificates')
        .update({
          extracted_data: extractedData,
          extraction_confidence: data.confidence || 0,
          processing_status: 'completed' as ProcessingStatus,
          processed_at: new Date().toISOString(),
          expires_at: extractedData.expirationDate || null,
        })
        .eq('id', certificate.id)

      if (updateError) {
        console.error('Failed to update certificate:', updateError)
        return
      }

      // Log compliance event
      await supabase.rpc('log_compliance_event', {
        p_event_type: 'coi_processed',
        p_certificate_id: certificate.id,
        p_vendor_id: certificate.vendor_id,
        p_event_data: {
          confidence: data.confidence,
          processing_time: Date.now() - new Date(certificate.uploaded_at).getTime(),
        },
      })

      // Trigger gap analysis
      const { analyzeCompliance } = await import('@/lib/compliance/gap-analysis')
      await analyzeCompliance(certificate.id, extractedData)

    } else if (data.status === 'failed') {
      // Update certificate with failure status
      await supabase
        .from('certificates')
        .update({
          processing_status: 'failed' as ProcessingStatus,
          processed_at: new Date().toISOString(),
        })
        .eq('id', certificate.id)

      // Log failure event
      await supabase.rpc('log_compliance_event', {
        p_event_type: 'coi_processing_failed',
        p_certificate_id: certificate.id,
        p_vendor_id: certificate.vendor_id,
        p_event_data: {
          error: data.error || 'Unknown error',
        },
      })
    }
  } catch (error) {
    console.error('Error processing extraction:', error)
  }
}