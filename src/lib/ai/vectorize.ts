import type { VectorizeExtractionResult } from '@/types/models'
import { MockVectorizeService } from './vectorize-mock'

const VECTORIZE_API_URL = 'https://api.vectorize.io'
const VECTORIZE_ORG_ID = '5a5057dd-3cdc-4bfa-a4b5-43a1d3a78908'
const USE_MOCK = process.env.USE_MOCK_VECTORIZE === 'true' || process.env.NODE_ENV === 'development'

export class VectorizeClient {
  private apiKey: string
  private orgId: string

  constructor(apiKey: string, orgId: string = VECTORIZE_ORG_ID) {
    if (!apiKey) {
      throw new Error('Vectorize API key is required')
    }
    this.apiKey = apiKey
    this.orgId = orgId
  }

  /**
   * Upload document to Vectorize IRIS for COI extraction
   */
  async extractCOI(file: File): Promise<VectorizeExtractionResult> {
    try {
      // Use mock service in development or when API is unavailable
      if (USE_MOCK) {
        console.log('Using mock Vectorize service for testing')
        const result = await MockVectorizeService.simulateExtraction(file)
        return {
          success: true,
          data: result.extractionId,
          confidence: 0.95,
        }
      }
      // Step 1: Start file upload
      const startUploadUrl = `${VECTORIZE_API_URL}/v1/files/upload`
      
      console.log('Starting file upload to Vectorize:', {
        url: startUploadUrl,
        fileName: file.name,
        fileType: file.type,
        orgId: this.orgId,
      })

      const startUploadResponse = await fetch(startUploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Organization-Id': this.orgId,
        },
        body: JSON.stringify({
          content_type: file.type,
          name: file.name,
        }),
      })

      if (!startUploadResponse.ok) {
        const errorBody = await startUploadResponse.text()
        console.error('Start upload error:', startUploadResponse.status, errorBody)
        throw new Error(`Failed to start upload: ${startUploadResponse.statusText} - ${errorBody}`)
      }

      const uploadData = await startUploadResponse.json()
      console.log('Upload started:', uploadData)

      // Step 2: Upload file to the provided URL
      if (uploadData.upload_url) {
        const uploadResponse = await fetch(uploadData.upload_url, {
          method: uploadData.upload_method || 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        })

        if (!uploadResponse.ok) {
          throw new Error(`File upload failed: ${uploadResponse.statusText}`)
        }
      }

      // Step 3: Start extraction
      const extractionUrl = `${VECTORIZE_API_URL}/v1/extractions`
      
      const extractionResponse = await fetch(extractionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Organization-Id': this.orgId,
        },
        body: JSON.stringify({
          file_id: uploadData.file_id,
          // Optional: specify extraction schema for COI
          metadata_schema: {
            insurance_company: 'string',
            policy_number: 'string',
            insured_name: 'string',
            effective_date: 'date',
            expiration_date: 'date',
            general_liability: 'object',
            automobile_liability: 'object',
            workers_compensation: 'object',
          },
        }),
      })

      if (!extractionResponse.ok) {
        const errorBody = await extractionResponse.text()
        console.error('Start extraction error:', extractionResponse.status, errorBody)
        throw new Error(`Failed to start extraction: ${extractionResponse.statusText} - ${errorBody}`)
      }

      const extractionData = await extractionResponse.json()
      console.log('Extraction started:', extractionData)

      return {
        success: true,
        data: extractionData.extraction_id || extractionData.id,
        confidence: 0.95, // Will be updated when webhook receives results
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
  async getExtractionStatus(extractionId: string): Promise<VectorizeExtractionResult> {
    try {
      // Use mock service in development
      if (USE_MOCK) {
        const result = await MockVectorizeService.getExtractionStatus(extractionId)
        if (result.status === 'completed') {
          return {
            success: true,
            data: result.extraction,
            confidence: result.confidence,
            fields: result.extraction,
          }
        } else if (result.status === 'failed') {
          return {
            success: false,
            error: result.error || 'Extraction failed',
          }
        } else {
          return {
            success: true,
            data: { status: result.status },
          }
        }
      }
      const url = `${VECTORIZE_API_URL}/v1/extractions/${extractionId}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Organization-Id': this.orgId,
        },
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('Get extraction status error:', response.status, errorBody)
        throw new Error(`Vectorize API error: ${response.statusText} - ${errorBody}`)
      }

      const result = await response.json()
      console.log('Extraction status:', result)

      if (result.status === 'completed' || result.state === 'completed') {
        return {
          success: true,
          data: result.text || result.extraction || result,
          confidence: result.confidence || 0.95,
          fields: result.metadata || result.fields,
        }
      } else if (result.status === 'failed' || result.state === 'failed') {
        return {
          success: false,
          error: result.error || 'Extraction failed',
        }
      } else {
        // Still processing
        return {
          success: true,
          data: { status: result.status || result.state },
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