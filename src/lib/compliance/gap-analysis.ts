import type { ExtractedCOIData, ComplianceGap, ComplianceRequirement } from '@/types/models'
import { createAdminClient } from '@/lib/db/supabase'

// Hardcoded requirements per MVP rules
const DEFAULT_REQUIREMENTS: ComplianceRequirement[] = [
  {
    id: 'general_liability',
    coverageType: 'general_liability',
    minimumAmount: 1000000,
    required: true,
    vendorTypes: [],
    description: 'General Liability Insurance',
  },
  {
    id: 'auto_liability',
    coverageType: 'auto_liability',
    minimumAmount: 1000000,
    required: true,
    vendorTypes: [],
    description: 'Automobile Liability Insurance',
  },
  {
    id: 'workers_compensation',
    coverageType: 'workers_compensation',
    minimumAmount: 500000,
    required: true,
    vendorTypes: [],
    description: 'Workers Compensation Insurance',
  },
]

export class GapAnalysisEngine {
  private requirements: ComplianceRequirement[]

  constructor(requirements?: ComplianceRequirement[]) {
    this.requirements = requirements || DEFAULT_REQUIREMENTS
  }

  /**
   * Analyze COI data against requirements and identify gaps
   */
  analyzeGaps(extractedData: ExtractedCOIData): ComplianceGap[] {
    const gaps: ComplianceGap[] = []

    for (const requirement of this.requirements) {
      const gap = this.analyzeSingleCoverage(requirement, extractedData)
      if (gap) {
        gaps.push(gap)
      }
    }

    return gaps
  }

  /**
   * Analyze a single coverage type
   */
  private analyzeSingleCoverage(
    requirement: ComplianceRequirement,
    extractedData: ExtractedCOIData
  ): ComplianceGap | null {
    const coverage = this.getCoverageData(requirement.coverageType, extractedData)
    const actualAmount = this.extractAmount(coverage)

    // Check if coverage exists
    if (!coverage || actualAmount === null) {
      return {
        coverageType: requirement.coverageType,
        required: requirement.minimumAmount,
        actual: null,
        gap: requirement.minimumAmount,
        instruction: this.generateMissingCoverageInstruction(requirement),
      }
    }

    // Check if coverage amount is sufficient
    if (actualAmount < requirement.minimumAmount) {
      const gapAmount = requirement.minimumAmount - actualAmount
      return {
        coverageType: requirement.coverageType,
        required: requirement.minimumAmount,
        actual: actualAmount,
        gap: gapAmount,
        instruction: this.generateInsufficientCoverageInstruction(
          requirement,
          actualAmount,
          gapAmount
        ),
      }
    }

    // Coverage is compliant
    return null
  }

  /**
   * Get coverage data from extracted COI
   */
  private getCoverageData(coverageType: string, extractedData: ExtractedCOIData): any {
    switch (coverageType) {
      case 'general_liability':
        return extractedData.coverages?.generalLiability
      case 'auto_liability':
        return extractedData.coverages?.autoLiability
      case 'workers_compensation':
        return extractedData.coverages?.workersCompensation
      default:
        return extractedData.coverages?.[coverageType]
    }
  }

  /**
   * Extract coverage amount from coverage data
   */
  private extractAmount(coverage: any): number | null {
    if (!coverage) return null

    // Try different fields where amount might be stored
    const amount = 
      coverage.limit ||
      coverage.perOccurrence ||
      coverage.combinedSingleLimit ||
      coverage.eachAccident ||
      coverage.amount

    return typeof amount === 'number' ? amount : null
  }

  /**
   * Generate instruction for missing coverage
   */
  private generateMissingCoverageInstruction(requirement: ComplianceRequirement): string {
    const formattedAmount = this.formatCurrency(requirement.minimumAmount)
    return `Add ${requirement.description} coverage of at least ${formattedAmount}`
  }

  /**
   * Generate instruction for insufficient coverage
   */
  private generateInsufficientCoverageInstruction(
    requirement: ComplianceRequirement,
    actualAmount: number,
    gapAmount: number
  ): string {
    const formattedRequired = this.formatCurrency(requirement.minimumAmount)
    const formattedActual = this.formatCurrency(actualAmount)
    const formattedGap = this.formatCurrency(gapAmount)
    
    return `Increase ${requirement.description} from ${formattedActual} to ${formattedRequired} (gap of ${formattedGap})`
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`
  }

  /**
   * Check if COI is fully compliant
   */
  isCompliant(extractedData: ExtractedCOIData): boolean {
    const gaps = this.analyzeGaps(extractedData)
    return gaps.length === 0
  }

  /**
   * Get compliance percentage
   */
  getCompliancePercentage(extractedData: ExtractedCOIData): number {
    const totalRequirements = this.requirements.length
    const gaps = this.analyzeGaps(extractedData)
    const compliantCount = totalRequirements - gaps.length
    
    return Math.round((compliantCount / totalRequirements) * 100)
  }
}

/**
 * Analyze compliance for a certificate and store results in database
 */
export async function analyzeCompliance(
  certificateId: string,
  extractedData: ExtractedCOIData
): Promise<{ success: boolean; gaps?: ComplianceGap[]; error?: string }> {
  try {
    const engine = new GapAnalysisEngine()
    const gaps = engine.analyzeGaps(extractedData)
    const isCompliant = gaps.length === 0
    const complianceStatus = isCompliant ? 'compliant' : 'non_compliant'

    const supabase = createAdminClient()

    // Update certificate compliance status
    await supabase
      .from('certificates')
      .update({ compliance_status: complianceStatus })
      .eq('id', certificateId)

    // Delete existing gap analysis records
    await supabase
      .from('gap_analysis')
      .delete()
      .eq('certificate_id', certificateId)

    // Insert new gap analysis records
    if (gaps.length > 0) {
      const gapRecords = gaps.map(gap => ({
        certificate_id: certificateId,
        coverage_type: gap.coverageType,
        required_amount: gap.required,
        actual_amount: gap.actual,
        gap_amount: gap.gap,
        is_compliant: false,
        instruction: gap.instruction,
      }))

      await supabase.from('gap_analysis').insert(gapRecords)

      // Log gap detection event
      await supabase.rpc('log_compliance_event', {
        p_event_type: 'gap_detected',
        p_certificate_id: certificateId,
        p_event_data: {
          gap_count: gaps.length,
          compliance_percentage: engine.getCompliancePercentage(extractedData),
        },
      })
    } else {
      // Log compliance achieved
      await supabase.rpc('log_compliance_event', {
        p_event_type: 'compliance_achieved',
        p_certificate_id: certificateId,
        p_event_data: {
          all_requirements_met: true,
        },
      })
    }

    return { success: true, gaps }
  } catch (error) {
    console.error('Gap analysis failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}