import type { ExtractedCOIData } from '@/types/models'

/**
 * Mock Vectorize service for testing when API is unavailable
 * This simulates the Vectorize IRIS extraction with realistic data
 */
export class MockVectorizeService {
  private static extractionJobs = new Map<string, any>()

  /**
   * Simulate COI extraction with realistic mock data
   */
  static async simulateExtraction(file: File): Promise<{
    extractionId: string
    status: 'processing'
  }> {
    const extractionId = `mock_extraction_${Date.now()}`
    
    // Simulate async processing
    setTimeout(() => {
      this.completeExtraction(extractionId, file.name)
    }, 2000) // Complete after 2 seconds

    this.extractionJobs.set(extractionId, {
      status: 'processing',
      startTime: Date.now(),
      fileName: file.name,
    })

    return { extractionId, status: 'processing' }
  }

  /**
   * Complete extraction with mock COI data
   */
  private static completeExtraction(extractionId: string, fileName: string) {
    const mockData: ExtractedCOIData = {
      carrier: 'Acme Insurance Company',
      policyNumber: 'GL-2024-12345',
      insuredName: 'ABC Construction LLC',
      effectiveDate: '2024-01-15',
      expirationDate: '2025-01-15',
      coverages: {
        generalLiability: {
          policyNumber: 'GL-2024-12345',
          limit: 1000000,
          aggregate: 2000000,
          perOccurrence: 1000000,
        },
        autoLiability: {
          policyNumber: 'AUTO-2024-67890',
          limit: 1000000,
          perOccurrence: 1000000,
        },
        workersCompensation: {
          policyNumber: 'WC-2024-11111',
          limit: 500000,
          perOccurrence: 500000,
        },
      },
      additionalInsured: ['Property Management Co LLC'],
      certificateHolder: 'Property Management Co LLC',
      waiverOfSubrogation: true,
    }

    // Simulate some variations based on filename
    if (fileName.includes('partial')) {
      // Simulate partial coverage
      if (mockData.coverages) {
        delete mockData.coverages.workersCompensation
        if (mockData.coverages.generalLiability) {
          mockData.coverages.generalLiability.limit = 500000
        }
      }
    } else if (fileName.includes('expired')) {
      // Simulate expired certificate
      mockData.expirationDate = '2023-12-31'
    } else if (fileName.includes('missing')) {
      // Simulate missing coverages
      mockData.coverages = {
        generalLiability: {
          limit: 1000000,
          perOccurrence: 1000000,
        },
      }
    }

    this.extractionJobs.set(extractionId, {
      status: 'completed',
      completedTime: Date.now(),
      fileName,
      extraction: mockData,
      confidence: 0.95,
      text: `# Certificate of Insurance

**Carrier:** ${mockData.carrier}
**Policy Number:** ${mockData.policyNumber}
**Insured:** ${mockData.insuredName}

## Coverage Details
- General Liability: $${mockData.coverages?.generalLiability?.limit?.toLocaleString() || 'N/A'}
- Auto Liability: $${mockData.coverages?.autoLiability?.limit?.toLocaleString() || 'N/A'}
- Workers Compensation: $${mockData.coverages?.workersCompensation?.limit?.toLocaleString() || 'N/A'}`,
    })
  }

  /**
   * Get extraction status and results
   */
  static async getExtractionStatus(extractionId: string): Promise<any> {
    const job = this.extractionJobs.get(extractionId)
    
    if (!job) {
      return {
        status: 'failed',
        error: 'Extraction not found',
      }
    }

    return job
  }

  /**
   * Transform mock extraction to match Vectorize format
   */
  static transformToVectorizeFormat(extraction: ExtractedCOIData): any {
    return {
      insurance_company: extraction.carrier,
      policy_number: extraction.policyNumber,
      insured_name: extraction.insuredName,
      effective_date: extraction.effectiveDate,
      expiration_date: extraction.expirationDate,
      general_liability: extraction.coverages?.generalLiability ? {
        policy_number: extraction.coverages.generalLiability.policyNumber,
        each_occurrence: extraction.coverages.generalLiability.limit,
        general_aggregate: extraction.coverages.generalLiability.aggregate || (extraction.coverages.generalLiability.limit ? extraction.coverages.generalLiability.limit * 2 : 0),
      } : null,
      automobile_liability: extraction.coverages?.autoLiability ? {
        policy_number: extraction.coverages.autoLiability.policyNumber,
        combined_single_limit: extraction.coverages.autoLiability.limit,
      } : null,
      workers_compensation: extraction.coverages?.workersCompensation ? {
        policy_number: extraction.coverages.workersCompensation.policyNumber,
        each_accident: extraction.coverages.workersCompensation.limit,
      } : null,
      additional_insured: extraction.additionalInsured || [],
      certificate_holder: extraction.certificateHolder,
      waiver_of_subrogation: extraction.waiverOfSubrogation || false,
    }
  }
}