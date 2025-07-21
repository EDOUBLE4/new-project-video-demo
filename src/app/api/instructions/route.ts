import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/supabase'
import { getInstructionGenerator } from '@/lib/ai/openai'
import type { ComplianceGap } from '@/types/models'

export async function POST(req: NextRequest) {
  try {
    const { certificateId } = await req.json()

    if (!certificateId) {
      return NextResponse.json(
        { error: 'Certificate ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get certificate and vendor info
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select(`
        *,
        vendor:vendors(*)
      `)
      .eq('id', certificateId)
      .single()

    if (certError || !certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      )
    }

    // Get gap analysis
    const { data: gaps, error: gapsError } = await supabase
      .from('gap_analysis')
      .select('*')
      .eq('certificate_id', certificateId)

    if (gapsError || !gaps || gaps.length === 0) {
      return NextResponse.json(
        { error: 'No gaps found for this certificate' },
        { status: 400 }
      )
    }

    // Convert to ComplianceGap format
    const complianceGaps: ComplianceGap[] = gaps.map(gap => ({
      coverageType: gap.coverage_type,
      required: gap.required_amount || 0,
      actual: gap.actual_amount,
      gap: gap.gap_amount || 0,
      instruction: gap.instruction || '',
    }))

    // Generate enhanced instructions using GPT-4
    const generator = getInstructionGenerator()
    const instructions = await generator.generateFixInstructions(
      certificate.vendor.name,
      complianceGaps,
      certificate.vendor.business_type
    )

    // Update gap analysis with enhanced instructions
    for (const gap of gaps) {
      const enhancedGap = complianceGaps.find(g => g.coverageType === gap.coverage_type)
      if (enhancedGap) {
        await supabase
          .from('gap_analysis')
          .update({ instruction: enhancedGap.instruction })
          .eq('id', gap.id)
      }
    }

    // Log instruction generation event
    await supabase.rpc('log_compliance_event', {
      p_event_type: 'instructions_generated',
      p_certificate_id: certificateId,
      p_vendor_id: certificate.vendor_id,
      p_event_data: {
        gap_count: gaps.length,
        method: 'gpt-4',
      },
    })

    return NextResponse.json({
      success: true,
      instructions,
      gaps: complianceGaps,
      vendor: {
        id: certificate.vendor.id,
        name: certificate.vendor.name,
        email: certificate.vendor.email,
      },
    })
  } catch (error) {
    console.error('Instruction generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate instructions' },
      { status: 500 }
    )
  }
}