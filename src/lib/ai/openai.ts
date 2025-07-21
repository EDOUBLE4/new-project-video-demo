import OpenAI from 'openai'
import type { ComplianceGap } from '@/types/models'

export class InstructionGenerator {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey })
  }

  /**
   * Generate vendor-specific fix instructions using GPT-4
   */
  async generateFixInstructions(
    vendorName: string,
    gaps: ComplianceGap[],
    vendorType?: string
  ): Promise<{
    vendorInstructions: string
    agentInstructions: string
    emailBody: string
  }> {
    const gapSummary = gaps
      .map(gap => {
        if (gap.actual === null) {
          return `- Missing ${this.formatCoverageType(gap.coverageType)} coverage (requires $${gap.required.toLocaleString()})`
        }
        return `- ${this.formatCoverageType(gap.coverageType)}: Currently $${gap.actual.toLocaleString()}, needs to be $${gap.required.toLocaleString()}`
      })
      .join('\n')

    const prompt = `You are an insurance compliance expert helping property managers communicate with vendors.

Vendor: ${vendorName}
Vendor Type: ${vendorType || 'General Contractor'}

Coverage Gaps Found:
${gapSummary}

Generate three things:

1. VENDOR INSTRUCTIONS: Clear, actionable steps the vendor should take to fix these gaps. Write in simple language that a busy contractor would understand. Be specific about what they need to tell their insurance agent.

2. INSURANCE AGENT INSTRUCTIONS: Technical details the vendor's insurance agent needs to make the changes. Include specific endorsement names and coverage terms.

3. EMAIL BODY: A professional but friendly email the property manager can send to the vendor explaining the gaps and next steps.

Make sure all instructions are specific, actionable, and will result in compliance.`

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in commercial insurance and COI compliance. Provide clear, specific instructions that will help vendors become compliant quickly.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      })

      const response = completion.choices[0].message.content || ''
      
      // Parse the response into sections
      const sections = this.parseInstructionSections(response)
      
      return {
        vendorInstructions: sections.vendorInstructions || this.generateBasicVendorInstructions(gaps),
        agentInstructions: sections.agentInstructions || this.generateBasicAgentInstructions(gaps),
        emailBody: sections.emailBody || this.generateBasicEmailBody(vendorName, gaps),
      }
    } catch (error) {
      console.error('GPT-4 instruction generation failed:', error)
      // Fallback to basic instructions
      return {
        vendorInstructions: this.generateBasicVendorInstructions(gaps),
        agentInstructions: this.generateBasicAgentInstructions(gaps),
        emailBody: this.generateBasicEmailBody(vendorName, gaps),
      }
    }
  }

  /**
   * Parse GPT-4 response into sections
   */
  private parseInstructionSections(response: string): {
    vendorInstructions?: string
    agentInstructions?: string
    emailBody?: string
  } {
    const sections: any = {}
    
    // Simple parsing based on section headers
    const vendorMatch = response.match(/VENDOR INSTRUCTIONS:?\s*([\s\S]*?)(?=INSURANCE AGENT INSTRUCTIONS:|EMAIL BODY:|$)/i)
    const agentMatch = response.match(/INSURANCE AGENT INSTRUCTIONS:?\s*([\s\S]*?)(?=EMAIL BODY:|$)/i)
    const emailMatch = response.match(/EMAIL BODY:?\s*([\s\S]*?)$/i)
    
    if (vendorMatch) sections.vendorInstructions = vendorMatch[1].trim()
    if (agentMatch) sections.agentInstructions = agentMatch[1].trim()
    if (emailMatch) sections.emailBody = emailMatch[1].trim()
    
    return sections
  }

  /**
   * Generate basic vendor instructions (fallback)
   */
  private generateBasicVendorInstructions(gaps: ComplianceGap[]): string {
    const instructions = ['To become compliant, please take these steps:\n']
    
    gaps.forEach((gap, index) => {
      instructions.push(`${index + 1}. ${gap.instruction}`)
    })
    
    instructions.push('\nPlease contact your insurance agent with these requirements and upload your updated COI once the changes are made.')
    
    return instructions.join('\n')
  }

  /**
   * Generate basic agent instructions (fallback)
   */
  private generateBasicAgentInstructions(gaps: ComplianceGap[]): string {
    const instructions = ['Insurance Agent Requirements:\n']
    
    gaps.forEach(gap => {
      const coverageType = this.formatCoverageType(gap.coverageType)
      if (gap.actual === null) {
        instructions.push(`- Add ${coverageType} with minimum limit of $${gap.required.toLocaleString()}`)
      } else {
        instructions.push(`- Increase ${coverageType} from $${gap.actual.toLocaleString()} to $${gap.required.toLocaleString()}`)
      }
    })
    
    instructions.push('\nEnsure the certificate holder is listed correctly and all endorsements are included.')
    
    return instructions.join('\n')
  }

  /**
   * Generate basic email body (fallback)
   */
  private generateBasicEmailBody(vendorName: string, gaps: ComplianceGap[]): string {
    return `Dear ${vendorName},

We've reviewed your Certificate of Insurance and found a few items that need to be updated to meet our requirements:

${gaps.map(gap => `• ${gap.instruction}`).join('\n')}

These changes are required to maintain compliance with our vendor insurance requirements. Please forward this email to your insurance agent and request these updates.

Once your coverage has been updated, please upload your new COI through our vendor portal.

If you have any questions about these requirements, please don't hesitate to reach out.

Best regards,
Property Management Team`
  }

  /**
   * Format coverage type for display
   */
  private formatCoverageType(coverageType: string): string {
    const typeMap: Record<string, string> = {
      general_liability: 'General Liability',
      auto_liability: 'Automobile Liability',
      workers_compensation: 'Workers Compensation',
    }
    return typeMap[coverageType] || coverageType
  }
}

// Singleton instance
let instructionGenerator: InstructionGenerator | null = null

export function getInstructionGenerator(): InstructionGenerator {
  if (!instructionGenerator) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    instructionGenerator = new InstructionGenerator(apiKey)
  }
  return instructionGenerator
}