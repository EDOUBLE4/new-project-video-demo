import type { VectorizeExtractionResult } from '@/types/models'

const VECTORIZE_API_URL = 'https://api.vectorize.io/v1'

export class VectorizeClient {
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Vectorize API key is required')
    }
    this.apiKey = apiKey
  }

  /**
   * Upload document to Vectorize IRIS for COI extraction
   */
  async extractCOI(file: File): Promise<VectorizeExtractionResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('pipeline', 'insurance_coi_extraction')
      formData.append('async', 'true')

      const response = await fetch(`${VECTORIZE_API_URL}/extract`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Vectorize API error: ${response.statusText}`)
      }

      const result = await response.json()

      return {
        success: true,
        data: result.job_id,
        confidence: result.confidence || 0,
      }
    } catch (error) {
      console.error('Vectorize extraction failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Get extraction status and results
   */
  async getExtractionStatus(jobId: string): Promise<VectorizeExtractionResult> {
    try {
      const response = await fetch(`${VECTORIZE_API_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Vectorize API error: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.status === 'completed') {
        return {
          success: true,
          data: result.extraction,
          confidence: result.confidence || 0,
          fields: result.fields,
        }
      } else if (result.status === 'failed') {
        return {
          success: false,
          error: result.error || 'Extraction failed',
        }
      } else {
        // Still processing
        return {
          success: true,
          data: { status: result.status },
        }
      }
    } catch (error) {
      console.error('Failed to get extraction status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Transform Vectorize extraction to our ExtractedCOIData format
   */
  static transformExtraction(vectorizeData: any): any {
    return {
      carrier: vectorizeData.insurance_company || vectorizeData.carrier,
      policyNumber: vectorizeData.policy_number,
      insuredName: vectorizeData.insured_name,
      effectiveDate: vectorizeData.effective_date,
      expirationDate: vectorizeData.expiration_date,
      coverages: {
        generalLiability: {
          policyNumber: vectorizeData.general_liability?.policy_number,
          limit: vectorizeData.general_liability?.each_occurrence,
          aggregate: vectorizeData.general_liability?.general_aggregate,
          perOccurrence: vectorizeData.general_liability?.each_occurrence,
        },
        autoLiability: {
          policyNumber: vectorizeData.automobile_liability?.policy_number,
          limit: vectorizeData.automobile_liability?.combined_single_limit,
          perOccurrence: vectorizeData.automobile_liability?.combined_single_limit,
        },
        workersCompensation: {
          policyNumber: vectorizeData.workers_compensation?.policy_number,
          limit: vectorizeData.workers_compensation?.each_accident,
          perOccurrence: vectorizeData.workers_compensation?.each_accident,
        },
      },
      additionalInsured: vectorizeData.additional_insured || [],
      certificateHolder: vectorizeData.certificate_holder,
      waiverOfSubrogation: vectorizeData.waiver_of_subrogation === true,
    }
  }
}

// Singleton instance
let vectorizeClient: VectorizeClient | null = null

export function getVectorizeClient(): VectorizeClient {
  if (!vectorizeClient) {
    const apiKey = process.env.VECTORIZE_API_KEY
    if (!apiKey) {
      throw new Error('VECTORIZE_API_KEY environment variable is not set')
    }
    vectorizeClient = new VectorizeClient(apiKey)
  }
  return vectorizeClient
}