export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ComplianceStatus = 'compliant' | 'partial' | 'non_compliant' | 'expired' | 'pending'
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'requires_review'

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          name: string
          business_type: string | null
          email: string | null
          phone: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          name: string
          business_type?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          name?: string
          business_type?: string | null
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          metadata?: Json
        }
      }
      certificates: {
        Row: {
          id: string
          vendor_id: string
          document_url: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          extracted_data: Json
          extraction_confidence: number | null
          processing_status: ProcessingStatus
          vectorize_job_id: string | null
          compliance_status: ComplianceStatus
          expires_at: string | null
          uploaded_at: string
          processed_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          vendor_id: string
          document_url: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          extracted_data?: Json
          extraction_confidence?: number | null
          processing_status?: ProcessingStatus
          vectorize_job_id?: string | null
          compliance_status?: ComplianceStatus
          expires_at?: string | null
          uploaded_at?: string
          processed_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string
          document_url?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          extracted_data?: Json
          extraction_confidence?: number | null
          processing_status?: ProcessingStatus
          vectorize_job_id?: string | null
          compliance_status?: ComplianceStatus
          expires_at?: string | null
          uploaded_at?: string
          processed_at?: string | null
          created_by?: string | null
        }
      }
      compliance_requirements: {
        Row: {
          id: string
          coverage_type: string
          minimum_amount: number
          required: boolean
          vendor_types: string[]
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coverage_type: string
          minimum_amount: number
          required?: boolean
          vendor_types?: string[]
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coverage_type?: string
          minimum_amount?: number
          required?: boolean
          vendor_types?: string[]
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      gap_analysis: {
        Row: {
          id: string
          certificate_id: string
          coverage_type: string
          required_amount: number | null
          actual_amount: number | null
          gap_amount: number | null
          is_compliant: boolean
          instruction: string | null
          created_at: string
        }
        Insert: {
          id?: string
          certificate_id: string
          coverage_type: string
          required_amount?: number | null
          actual_amount?: number | null
          gap_amount?: number | null
          is_compliant?: boolean
          instruction?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          certificate_id?: string
          coverage_type?: string
          required_amount?: number | null
          actual_amount?: number | null
          gap_amount?: number | null
          is_compliant?: boolean
          instruction?: string | null
          created_at?: string
        }
      }
      compliance_events: {
        Row: {
          id: string
          event_type: string
          vendor_id: string | null
          certificate_id: string | null
          event_data: Json
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          event_type: string
          vendor_id?: string | null
          certificate_id?: string | null
          event_data?: Json
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          event_type?: string
          vendor_id?: string | null
          certificate_id?: string | null
          event_data?: Json
          created_at?: string
          created_by?: string | null
        }
      }
      vendor_access_tokens: {
        Row: {
          id: string
          vendor_id: string
          token: string
          expires_at: string
          created_at: string
          last_used_at: string | null
        }
        Insert: {
          id?: string
          vendor_id: string
          token?: string
          expires_at?: string
          created_at?: string
          last_used_at?: string | null
        }
        Update: {
          id?: string
          vendor_id?: string
          token?: string
          expires_at?: string
          created_at?: string
          last_used_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      log_compliance_event: {
        Args: {
          p_event_type: string
          p_vendor_id?: string
          p_certificate_id?: string
          p_event_data?: Json
        }
        Returns: string
      }
    }
    Enums: {
      compliance_status: ComplianceStatus
      processing_status: ProcessingStatus
    }
  }
}