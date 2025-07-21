-- IntelliCOI Database Schema
-- Following the agentic-first approach with simple, extensible design

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE compliance_status AS ENUM ('compliant', 'partial', 'non_compliant', 'expired', 'pending');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'requires_review');

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    business_type TEXT,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Certificates table with JSONB for flexible extracted data
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    document_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    -- Extraction results
    extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    extraction_confidence DECIMAL(3,2) CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
    processing_status processing_status DEFAULT 'pending',
    vectorize_job_id TEXT,
    
    -- Compliance tracking
    compliance_status compliance_status DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for certificates table
CREATE INDEX idx_certificates_vendor_id ON certificates(vendor_id);
CREATE INDEX idx_certificates_expires_at ON certificates(expires_at);
CREATE INDEX idx_certificates_compliance_status ON certificates(compliance_status);

-- Compliance requirements table (hardcoded initially per MVP rules)
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coverage_type TEXT NOT NULL,
    minimum_amount DECIMAL(12,2) NOT NULL,
    required BOOLEAN DEFAULT true,
    vendor_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gap analysis results
CREATE TABLE gap_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id UUID NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    coverage_type TEXT NOT NULL,
    required_amount DECIMAL(12,2),
    actual_amount DECIMAL(12,2),
    gap_amount DECIMAL(12,2),
    is_compliant BOOLEAN DEFAULT false,
    instruction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for gap_analysis
CREATE INDEX idx_gap_analysis_certificate_id ON gap_analysis(certificate_id);

-- Compliance events for analytics (per MVP rules)
CREATE TABLE compliance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    certificate_id UUID REFERENCES certificates(id),
    event_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for compliance_events
CREATE INDEX idx_compliance_events_event_type ON compliance_events(event_type);
CREATE INDEX idx_compliance_events_created_at ON compliance_events(created_at);

-- Vendor portal access tokens (no login required per MVP)
CREATE TABLE vendor_access_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for vendor_access_tokens
CREATE INDEX idx_vendor_access_tokens_token ON vendor_access_tokens(token);
CREATE INDEX idx_vendor_access_tokens_vendor_id ON vendor_access_tokens(vendor_id);

-- Insert default compliance requirements (MVP hardcoded values)
INSERT INTO compliance_requirements (coverage_type, minimum_amount, required, description) VALUES
('general_liability', 1000000, true, 'General Liability Insurance'),
('auto_liability', 1000000, true, 'Automobile Liability Insurance'),
('workers_compensation', 500000, true, 'Workers Compensation Insurance');

-- Row Level Security (RLS) policies
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_access_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (property managers)
CREATE POLICY "Users can view their own vendors" ON vendors
    FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can view their own certificates" ON certificates
    FOR ALL USING (vendor_id IN (SELECT id FROM vendors WHERE created_by = auth.uid()));

CREATE POLICY "Users can view gap analysis for their certificates" ON gap_analysis
    FOR SELECT USING (certificate_id IN (
        SELECT c.id FROM certificates c 
        JOIN vendors v ON c.vendor_id = v.id 
        WHERE v.created_by = auth.uid()
    ));

CREATE POLICY "Users can view their compliance events" ON compliance_events
    FOR SELECT USING (created_by = auth.uid() OR vendor_id IN (
        SELECT id FROM vendors WHERE created_by = auth.uid()
    ));

-- Policy for vendor portal access (using token)
CREATE POLICY "Vendors can view their own data via token" ON certificates
    FOR SELECT USING (
        vendor_id IN (
            SELECT vendor_id FROM vendor_access_tokens 
            WHERE token = current_setting('app.vendor_token', true)::text
            AND expires_at > NOW()
        )
    );

-- Helper functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_requirements_updated_at BEFORE UPDATE ON compliance_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log compliance events
CREATE OR REPLACE FUNCTION log_compliance_event(
    p_event_type TEXT,
    p_vendor_id UUID DEFAULT NULL,
    p_certificate_id UUID DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO compliance_events (event_type, vendor_id, certificate_id, event_data, created_by)
    VALUES (p_event_type, p_vendor_id, p_certificate_id, p_event_data, auth.uid())
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX idx_extracted_data_gin ON certificates USING GIN (extracted_data);
CREATE INDEX idx_event_data_gin ON compliance_events USING GIN (event_data);
CREATE INDEX idx_metadata_gin ON vendors USING GIN (metadata);