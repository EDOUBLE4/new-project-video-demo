import type { ComplianceStatus, ProcessingStatus } from './database'

// Branded types for IDs
type Brand<K, T> = K & { __brand: T }
export type VendorId = Brand<string, 'VendorId'>
export type CertificateId = Brand<string, 'CertificateId'>

// Domain models
export interface Vendor {
  id: VendorId
  name: string
  businessType?: string
  email?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export interface Certificate {
  id: CertificateId
  vendorId: VendorId
  documentUrl: string
  fileName: string
  fileSize?: number
  mimeType?: string
  extractedData: ExtractedCOIData
  extractionConfidence?: number
  processingStatus: ProcessingStatus
  complianceStatus: ComplianceStatus
  expiresAt?: Date
  uploadedAt: Date
  processedAt?: Date
}

export interface ExtractedCOIData {
  carrier?: string
  policyNumber?: string
  insuredName?: string
  effectiveDate?: string
  expirationDate?: string
  coverages?: {
    generalLiability?: Coverage
    autoLiability?: Coverage
    workersCompensation?: Coverage
    [key: string]: Coverage | undefined
  }
  additionalInsured?: string[]
  certificateHolder?: string
  waiverOfSubrogation?: boolean
}

export interface Coverage {
  policyNumber?: string
  limit?: number
  aggregate?: number
  deductible?: number
  perOccurrence?: number
  combinedSingleLimit?: number
  eachAccident?: number
  amount?: number
}

export interface ComplianceRequirement {
  id: string
  coverageType: string
  minimumAmount: number
  required: boolean
  vendorTypes: string[]
  description?: string
}

export interface GapAnalysis {
  id: string
  certificateId: CertificateId
  coverageType: string
  requiredAmount?: number
  actualAmount?: number
  gapAmount?: number
  isCompliant: boolean
  instruction?: string
}

export interface ComplianceGap {
  coverageType: string
  required: number
  actual: number | null
  gap: number
  instruction: string
}

export interface ProcessingResult {
  success: boolean
  certificateId?: CertificateId
  confidence?: number
  gaps?: ComplianceGap[]
  error?: string
}

// Vectorize types
export interface VectorizeExtractionResult {
  success: boolean
  data?: any
  confidence?: number
  fields?: Record<string, any>
  error?: string
}

// Email types
export interface VendorNotification {
  vendorId: VendorId
  vendorEmail: string
  vendorName: string
  gaps: ComplianceGap[]
  portalUrl: string
}