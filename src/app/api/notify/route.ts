import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/db/supabase'
import { sendVendorNotification, sendComplianceAchievedEmail } from '@/lib/email/resend'
import type { VendorNotification } from '@/types/models'

export async function POST(req: NextRequest) {
  try {
    const { certificateId, instructions } = await req.json()

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

    // Check if vendor has email
    if (!certificate.vendor.email) {
      return NextResponse.json(
        { error: 'Vendor email not found' },
        { status: 400 }
      )
    }

    // Check compliance status
    if (certificate.compliance_status === 'compliant') {
      // Send compliance achieved email
      const result = await sendComplianceAchievedEmail(
        certificate.vendor.email,
        certificate.vendor.name
      )

      if (result.success) {
        await supabase.rpc('log_compliance_event', {
          p_event_type: 'vendor_notified',
          p_certificate_id: certificateId,
          p_vendor_id: certificate.vendor_id,
          p_event_data: {
            notification_type: 'compliance_achieved',
          },
        })
      }

      return NextResponse.json(result)
    }

    // Get or create vendor access token
    let { data: token, error: tokenError } = await supabase
      .from('vendor_access_tokens')
      .select('token')
      .eq('vendor_id', certificate.vendor_id)
      .single()

    if (tokenError || !token) {
      // Create new token
      const { data: newToken, error: createError } = await supabase
        .from('vendor_access_tokens')
        .insert({ vendor_id: certificate.vendor_id })
        .select('token')
        .single()

      if (createError || !newToken) {
        throw new Error('Failed to create vendor access token')
      }
      token = newToken
    }

    // Generate portal URL
    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/${token.token}`

    // Get gaps for notification
    const { data: gaps } = await supabase
      .from('gap_analysis')
      .select('*')
      .eq('certificate_id', certificateId)

    if (!gaps || gaps.length === 0) {
      return NextResponse.json(
        { error: 'No gaps found to notify about' },
        { status: 400 }
      )
    }

    // Prepare notification
    const notification: VendorNotification = {
      vendorId: certificate.vendor_id as any,
      vendorEmail: certificate.vendor.email,
      vendorName: certificate.vendor.name,
      gaps: gaps.map(gap => ({
        coverageType: gap.coverage_type,
        required: gap.required_amount || 0,
        actual: gap.actual_amount,
        gap: gap.gap_amount || 0,
        instruction: gap.instruction || '',
      })),
      portalUrl,
    }

    // Send email
    const result = await sendVendorNotification(notification, instructions)

    if (result.success) {
      // Log event
      await supabase.rpc('log_compliance_event', {
        p_event_type: 'vendor_notified',
        p_certificate_id: certificateId,
        p_vendor_id: certificate.vendor_id,
        p_event_data: {
          notification_type: 'gap_notification',
          gap_count: gaps.length,
          portal_url: portalUrl,
        },
      })

      // Update token last used
      await supabase
        .from('vendor_access_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('token', token.token)
    }

    return NextResponse.json({
      success: result.success,
      error: result.error,
      portalUrl,
    })
  } catch (error) {
    console.error('Notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}