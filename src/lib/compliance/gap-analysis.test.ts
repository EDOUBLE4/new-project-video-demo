// Import only the engine class, not the full module to avoid DB dependencies
import type { ExtractedCOIData, ComplianceRequirement } from '@/types/models'

// Mock the supabase module before importing the gap-analysis module
jest.mock('@/lib/db/supabase', () => ({
  createAdminClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn() })),
      delete: jest.fn(() => ({ eq: jest.fn() })),
      insert: jest.fn(),
      select: jest.fn(() => ({ eq: jest.fn(() => ({ single: jest.fn() })) })),
    })),
    rpc: jest.fn(),
  })),
}))

// Now import after mocking
import { GapAnalysisEngine } from './gap-analysis'

describe('GapAnalysisEngine', () => {
  let engine: GapAnalysisEngine

  beforeEach(() => {
    engine = new GapAnalysisEngine()
  })

  describe('analyzeGaps', () => {
    it('should return no gaps for fully compliant COI', () => {
      const compliantCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: {
            limit: 1000000,
            perOccurrence: 1000000,
          },
          autoLiability: {
            limit: 1000000,
            perOccurrence: 1000000,
          },
          workersCompensation: {
            limit: 500000,
            perOccurrence: 500000,
          },
        },
      }

      const gaps = engine.analyzeGaps(compliantCOI)
      expect(gaps).toHaveLength(0)
    })

    it('should identify missing coverage gaps', () => {
      const missingCoverageCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: {
            limit: 1000000,
            perOccurrence: 1000000,
          },
          // Missing auto and workers comp
        },
      }

      const gaps = engine.analyzeGaps(missingCoverageCOI)
      expect(gaps).toHaveLength(2)
      expect(gaps[0].coverageType).toBe('auto_liability')
      expect(gaps[0].actual).toBeNull()
      expect(gaps[0].instruction).toContain('Add Automobile Liability Insurance')
      expect(gaps[1].coverageType).toBe('workers_compensation')
      expect(gaps[1].actual).toBeNull()
      expect(gaps[1].instruction).toContain('Add Workers Compensation Insurance')
    })

    it('should identify insufficient coverage gaps', () => {
      const insufficientCoverageCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: {
            limit: 500000, // Below required 1M
            perOccurrence: 500000,
          },
          autoLiability: {
            limit: 1000000,
            perOccurrence: 1000000,
          },
          workersCompensation: {
            limit: 250000, // Below required 500K
            perOccurrence: 250000,
          },
        },
      }

      const gaps = engine.analyzeGaps(insufficientCoverageCOI)
      expect(gaps).toHaveLength(2)
      
      const glGap = gaps.find(g => g.coverageType === 'general_liability')
      expect(glGap).toBeDefined()
      expect(glGap?.actual).toBe(500000)
      expect(glGap?.required).toBe(1000000)
      expect(glGap?.gap).toBe(500000)
      expect(glGap?.instruction).toContain('Increase General Liability Insurance from $500,000 to $1,000,000')

      const wcGap = gaps.find(g => g.coverageType === 'workers_compensation')
      expect(wcGap).toBeDefined()
      expect(wcGap?.actual).toBe(250000)
      expect(wcGap?.required).toBe(500000)
      expect(wcGap?.gap).toBe(250000)
    })
  })

  describe('isCompliant', () => {
    it('should return true for compliant COI', () => {
      const compliantCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: { limit: 1000000 },
          autoLiability: { limit: 1000000 },
          workersCompensation: { limit: 500000 },
        },
      }

      expect(engine.isCompliant(compliantCOI)).toBe(true)
    })

    it('should return false for non-compliant COI', () => {
      const nonCompliantCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: { limit: 500000 }, // Below minimum
          autoLiability: { limit: 1000000 },
          workersCompensation: { limit: 500000 },
        },
      }

      expect(engine.isCompliant(nonCompliantCOI)).toBe(false)
    })
  })

  describe('getCompliancePercentage', () => {
    it('should return 100% for fully compliant COI', () => {
      const compliantCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: { limit: 1000000 },
          autoLiability: { limit: 1000000 },
          workersCompensation: { limit: 500000 },
        },
      }

      expect(engine.getCompliancePercentage(compliantCOI)).toBe(100)
    })

    it('should return 67% for 2/3 compliant requirements', () => {
      const partiallyCompliantCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: { limit: 1000000 },
          autoLiability: { limit: 1000000 },
          // Missing workers comp
        },
      }

      expect(engine.getCompliancePercentage(partiallyCompliantCOI)).toBe(67)
    })

    it('should return 0% for completely non-compliant COI', () => {
      const nonCompliantCOI: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {}, // No coverages
      }

      expect(engine.getCompliancePercentage(nonCompliantCOI)).toBe(0)
    })
  })

  describe('custom requirements', () => {
    it('should use custom requirements when provided', () => {
      const customRequirements: ComplianceRequirement[] = [
        {
          id: 'general_liability',
          coverageType: 'general_liability',
          minimumAmount: 2000000, // Higher requirement
          required: true,
          vendorTypes: [],
          description: 'General Liability Insurance',
        },
      ]

      const customEngine = new GapAnalysisEngine(customRequirements)
      const coi: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: { limit: 1000000 }, // Below custom requirement
        },
      }

      const gaps = customEngine.analyzeGaps(coi)
      expect(gaps).toHaveLength(1)
      expect(gaps[0].required).toBe(2000000)
      expect(gaps[0].gap).toBe(1000000)
    })
  })

  describe('edge cases', () => {
    it('should handle coverage with zero amounts', () => {
      const coi: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: { limit: 0 },
          autoLiability: { limit: 0 },
          workersCompensation: { limit: 0 },
        },
      }

      const gaps = engine.analyzeGaps(coi)
      expect(gaps).toHaveLength(3)
      gaps.forEach(gap => {
        expect(gap.actual).toBe(0) // Zero is treated as insufficient coverage
        expect(gap.instruction).toContain('Increase')
      })
    })

    it('should handle alternative field names for coverage amounts', () => {
      const coi: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: {
            perOccurrence: 1000000, // Using perOccurrence instead of limit
          },
          autoLiability: {
            combinedSingleLimit: 1000000, // Using combinedSingleLimit
          },
          workersCompensation: {
            eachAccident: 500000, // Using eachAccident
          },
        },
      }

      const gaps = engine.analyzeGaps(coi)
      expect(gaps).toHaveLength(0) // Should recognize all alternative field names
    })

    it('should handle null and undefined coverage data', () => {
      const coi: ExtractedCOIData = {
        carrier: 'Test Insurance Co',
        policyNumber: 'TEST-123',
        insuredName: 'Test Company LLC',
        effectiveDate: '2024-01-01',
        expirationDate: '2025-01-01',
        coverages: {
          generalLiability: null as any,
          autoLiability: undefined as any,
          workersCompensation: {},
        },
      }

      const gaps = engine.analyzeGaps(coi)
      expect(gaps).toHaveLength(3)
      gaps.forEach(gap => {
        expect(gap.actual).toBeNull()
        expect(gap.instruction).toContain('Add')
      })
    })
  })
})