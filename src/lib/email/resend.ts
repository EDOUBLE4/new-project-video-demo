import { Resend } from 'resend'
import type { VendorNotification } from '@/types/models'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send vendor notification email with fix instructions
 */
export async function sendVendorNotification(
  notification: VendorNotification,
  instructions: {
    vendorInstructions: string
    agentInstructions: string
    emailBody: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const portalButton = `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${notification.portalUrl}" 
           style="background-color: #2563EB; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Upload Updated COI
        </a>
      </div>
    `

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${instructions.emailBody.replace(/\n/g, '<br>')}
        
        ${portalButton}
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e5e5;">
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Instructions for Your Insurance Agent</h3>
          <p style="white-space: pre-wrap;">${instructions.agentInstructions}</p>
        </div>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'IntelliCOI <compliance@intellicoi.com>',
      to: notification.vendorEmail,
      subject: 'Insurance Certificate Update Required',
      html,
      text: instructions.emailBody,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send compliance achieved notification
 */
export async function sendComplianceAchievedEmail(
  vendorEmail: string,
  vendorName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">✅ Certificate of Insurance Approved!</h2>
        
        <p>Dear ${vendorName},</p>
        
        <p>Great news! Your Certificate of Insurance has been reviewed and approved. 
        You are now compliant with our insurance requirements.</p>
        
        <p>Thank you for your prompt attention to this matter. We appreciate your 
        cooperation in maintaining proper insurance coverage.</p>
        
        <p>If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>
        Property Management Team</p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'IntelliCOI <compliance@intellicoi.com>',
      to: vendorEmail,
      subject: '✅ COI Approved - You\'re Compliant!',
      html,
      text: `Dear ${vendorName}, Great news! Your Certificate of Insurance has been reviewed and approved. You are now compliant with our insurance requirements.`,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send renewal reminder email
 */
export async function sendRenewalReminderEmail(
  vendorEmail: string,
  vendorName: string,
  daysUntilExpiration: number,
  portalUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const urgency = daysUntilExpiration <= 30 ? '🚨 Urgent: ' : ''
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F59E0B;">${urgency}Insurance Renewal Required</h2>
        
        <p>Dear ${vendorName},</p>
        
        <p>Your Certificate of Insurance will expire in <strong>${daysUntilExpiration} days</strong>.</p>
        
        <p>To maintain compliance and avoid any disruption to our working relationship, 
        please renew your insurance and upload the updated certificate as soon as possible.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" 
             style="background-color: #2563EB; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Upload Renewed COI
          </a>
        </div>
        
        <p>If you have any questions about the renewal requirements, please contact us.</p>
        
        <p>Best regards,<br>
        Property Management Team</p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'IntelliCOI <compliance@intellicoi.com>',
      to: vendorEmail,
      subject: `${urgency}COI Renewal Required - ${daysUntilExpiration} Days Until Expiration`,
      html,
      text: `Dear ${vendorName}, Your Certificate of Insurance will expire in ${daysUntilExpiration} days. Please renew and upload your updated certificate at: ${portalUrl}`,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}