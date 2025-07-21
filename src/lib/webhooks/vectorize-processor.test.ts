// Mock all dependencies BEFORE imports
jest.mock('@/lib/db/supabase', () => ({
  createAdminClient: jest.fn(),
}))
jest.mock('@/lib/ai/vectorize', () => ({
  VectorizeClient: {
    transformExtraction: jest.fn(),
  },
}))
jest.mock('@/lib/compliance/gap-analysis', () => ({
  analyzeCompliance: jest.fn(),
}))

import { processVectorizeWebhook } from './vectorize-processor'
import { createAdminClient } from '@/lib/db/supabase'
import { VectorizeClient } from '@/lib/ai/vectorize'
import { analyzeCompliance } from '@/lib/compliance/gap-analysis'

describe('processVectorizeWebhook', () => {
  let mockSupabase: any
  let mockAnalyzeCompliance: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mock Supabase client
    const mockFrom = jest.fn()
    const mockSelect = jest.fn()
    const mockUpdate = jest.fn()
    const mockEq = jest.fn()
    const mockSingle = jest.fn()
    
    mockSupabase = {
      from: mockFrom,
      rpc: jest.fn().mockResolvedValue({ error: null }),
    }
    
    // Setup default chain behavior
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    })
    
    mockSelect.mockReturnValue({
      eq: mockEq,
    })
    
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })
    
    mockEq.mockReturnValue({
      single: mockSingle,
    })
    
    mockSingle.mockResolvedValue({
      data: {
        id: 'cert-123',
        vendor_id: 'vendor-123',
        uploaded_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    })
    
    ;(createAdminClient as jest.Mock).mockReturnValue(mockSupabase)
    
    // Setup mock compliance analysis
    mockAnalyzeCompliance = analyzeCompliance as jest.Mock
    mockAnalyzeCompliance.mockResolvedValue({ success: true, gaps: [] })
    
    // Setup mock Vectorize transformer
    ;(VectorizeClient as any).transformExtraction = jest.fn().mockReturnValue({
      carrier: 'Test Insurance',
      expirationDate: '2025-01-01',
      coverages: {
        generalLiability: { limit: 1000000 },
      },
    })
  })

  describe('successful extraction', () => {
    it('should process extraction and update certificate', async () => {
      const webhookData = {
        jobId: 'job-123',
        status: 'completed',
        extraction: {
          insurance_company: 'Test Insurance',
          general_liability: { each_occurrence: 1000000 },
        },
        confidence: 0.95,
      }

      const result = await processVectorizeWebhook(webhookData)

      expect(result).toEqual({ 
        success: true, 
        certificateId: 'cert-123' 
      })

      // Verify certificate was fetched
      expect(mockSupabase.from).toHaveBeenCalledWith('certificates')
      expect(mockSupabase.from('certificates').select).toHaveBeenCalledWith('*')

      // Verify certificate was updated
      const updateCall = mockSupabase.from('certificates').update
      expect(updateCall).toHaveBeenCalledWith({
        extracted_data: expect.objectContaining({
          carrier: 'Test Insurance',
        }),
        extraction_confidence: 0.95,
        processing_status: 'completed',
        processed_at: expect.any(String),
        expires_at: '2025-01-01',
      })

      // Verify compliance event was logged
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_compliance_event', {
        p_event_type: 'coi_processed',
        p_certificate_id: 'cert-123',
        p_vendor_id: 'vendor-123',
        p_event_data: expect.objectContaining({
          confidence: 0.95,
          processing_time: expect.any(Number),
        }),
      })

      // Verify gap analysis was triggered
      expect(mockAnalyzeCompliance).toHaveBeenCalledWith(
        'cert-123',
        expect.objectContaining({
          carrier: 'Test Insurance',
        })
      )
    })

    it('should transform extraction data correctly', async () => {
      const extractionData = {
        insurance_company: 'Acme Insurance',
        policy_number: 'POL-123',
        general_liability: {
          each_occurrence: 2000000,
          general_aggregate: 4000000,
        },
      }

      await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'completed',
        extraction: extractionData,
        confidence: 0.98,
      })

      expect(VectorizeClient.transformExtraction).toHaveBeenCalledWith(extractionData)
    })
  })

  describe('failed extraction', () => {
    it('should handle extraction failure', async () => {
      const webhookData = {
        jobId: 'job-123',
        status: 'failed',
        error: 'Poor document quality',
      }

      const result = await processVectorizeWebhook(webhookData)

      expect(result).toEqual({ 
        success: false, 
        error: 'Poor document quality' 
      })

      // Verify certificate was updated with failure
      const updateCall = mockSupabase.from('certificates').update
      expect(updateCall).toHaveBeenCalledWith({
        processing_status: 'failed',
        processed_at: expect.any(String),
      })

      // Verify failure event was logged
      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_compliance_event', {
        p_event_type: 'coi_processing_failed',
        p_certificate_id: 'cert-123',
        p_vendor_id: 'vendor-123',
        p_event_data: {
          error: 'Poor document quality',
        },
      })

      // Verify gap analysis was NOT triggered
      expect(mockAnalyzeCompliance).not.toHaveBeenCalled()
    })

    it('should handle missing error message', async () => {
      const result = await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'failed',
      })

      expect(result).toEqual({ 
        success: false, 
        error: 'Processing failed' 
      })

      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_compliance_event', {
        p_event_type: 'coi_processing_failed',
        p_certificate_id: 'cert-123',
        p_vendor_id: 'vendor-123',
        p_event_data: {
          error: 'Unknown error',
        },
      })
    })
  })

  describe('error handling', () => {
    it('should handle certificate not found', async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          })),
        })),
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await processVectorizeWebhook({
        jobId: 'unknown-job',
        status: 'completed',
        extraction: {},
      })

      expect(result).toEqual({ 
        success: false, 
        error: 'Certificate not found' 
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Certificate not found for job:',
        'unknown-job'
      )

      // Should not attempt to update
      expect(mockSupabase.from('certificates').update).not.toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle database update errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'cert-123', vendor_id: 'vendor-123', uploaded_at: '2024-01-01' },
              error: null,
            }),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Database error' },
          }),
        })),
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'completed',
        extraction: {},
        confidence: 0.95,
      })

      expect(result).toEqual({ 
        success: false, 
        error: 'Failed to update certificate' 
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update certificate:',
        { message: 'Database error' }
      )

      // Should not proceed to gap analysis
      expect(mockAnalyzeCompliance).not.toHaveBeenCalled()
      
      consoleErrorSpy.mockRestore()
    })

    it('should handle unexpected errors', async () => {
      mockSupabase.from.mockImplementationOnce(() => {
        throw new Error('Unexpected database error')
      })

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'completed',
        extraction: {},
      })

      expect(result).toEqual({ 
        success: false, 
        error: 'Unexpected database error' 
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error processing extraction:',
        expect.any(Error)
      )
      
      consoleErrorSpy.mockRestore()
    })
  })

  describe('processing time calculation', () => {
    it('should calculate correct processing time', async () => {
      const uploadTime = new Date('2024-01-01T12:00:00Z')
      const processTime = new Date('2024-01-01T12:00:30Z') // 30 seconds later
      
      jest.useFakeTimers()
      jest.setSystemTime(processTime)

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'cert-123',
                vendor_id: 'vendor-123',
                uploaded_at: uploadTime.toISOString(),
              },
              error: null,
            }),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      })

      await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'completed',
        extraction: {},
        confidence: 0.95,
      })

      expect(mockSupabase.rpc).toHaveBeenCalledWith('log_compliance_event', {
        p_event_type: 'coi_processed',
        p_certificate_id: 'cert-123',
        p_vendor_id: 'vendor-123',
        p_event_data: {
          confidence: 0.95,
          processing_time: 30000, // 30 seconds in milliseconds
        },
      })

      jest.useRealTimers()
    })
  })

  describe('edge cases', () => {
    it('should handle status other than completed or failed', async () => {
      const result = await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'processing',
      })

      expect(result).toEqual({ success: true })
      
      // Should not update certificate
      expect(mockSupabase.from('certificates').update).not.toHaveBeenCalled()
      expect(mockAnalyzeCompliance).not.toHaveBeenCalled()
    })

    it('should handle completed status without extraction data', async () => {
      const result = await processVectorizeWebhook({
        jobId: 'job-123',
        status: 'completed',
        // No extraction data
      })

      expect(result).toEqual({ success: true })
      
      // Should not update certificate
      expect(mockSupabase.from('certificates').update).not.toHaveBeenCalled()
      expect(mockAnalyzeCompliance).not.toHaveBeenCalled()
    })
  })
})