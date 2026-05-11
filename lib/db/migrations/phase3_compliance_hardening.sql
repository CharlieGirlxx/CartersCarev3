-- Phase 3: NDIS Compliance Hardening Migrations
-- Run this script to add compliance-related tables to your database

-- ============================================================
-- 1. Audit Logs Table
-- ============================================================
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'view', 'export', 'download');

CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  action audit_action NOT NULL,
  changed_by INTEGER NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(changed_at);

-- ============================================================
-- 2. Documents Table (with versioning and expiry tracking)
-- ============================================================
CREATE TYPE document_type AS ENUM ('support_plan', 'service_agreement', 'behaviour_support_plan', 'medical_record', 'worker_screening', 'risk_assessment', 'other');

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER,
  staff_id INTEGER,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  version_number INTEGER DEFAULT 1 NOT NULL,
  previous_version_id INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documents_participant ON documents(participant_id);
CREATE INDEX idx_documents_staff ON documents(staff_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_expires ON documents(expires_at);
CREATE INDEX idx_documents_active ON documents(is_active);

-- ============================================================
-- 3. Consent Records Table
-- ============================================================
CREATE TYPE consent_type AS ENUM ('data_sharing', 'photography', 'emergency_services', 'medical_treatment', 'research', 'media', 'other');

CREATE TABLE consent_records (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL,
  consent_type consent_type NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMP NOT NULL,
  consent_expires_at TIMESTAMP,
  given_by TEXT,
  recorded_by INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_consent_participant ON consent_records(participant_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);

-- ============================================================
-- 4. Staff Compliance Table
-- ============================================================
CREATE TYPE compliance_check_type AS ENUM ('working_with_children', 'ndi_worker_check', 'first_aid', 'ndis_training', 'manual_handling', 'vaccination', 'other');
CREATE TYPE compliance_status AS ENUM ('valid', 'expiring', 'expired', 'pending', 'failed');

CREATE TABLE staff_compliance (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER NOT NULL,
  check_type compliance_check_type NOT NULL,
  check_date TIMESTAMP,
  expiry_date TIMESTAMP,
  status compliance_status NOT NULL DEFAULT 'pending',
  certificate_url TEXT,
  verified_by INTEGER,
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_staff_compliance_staff ON staff_compliance(staff_id);
CREATE INDEX idx_staff_compliance_status ON staff_compliance(status);
CREATE INDEX idx_staff_compliance_expiry ON staff_compliance(expiry_date);

-- ============================================================
-- 5. Access Logs Table (for Privacy Act compliance)
-- ============================================================
CREATE TYPE access_action AS ENUM ('view', 'download', 'export', 'print', 'share');
CREATE TYPE access_resource_type AS ENUM ('participant', 'document', 'incident', 'case_note', 'shift', 'report');

CREATE TABLE access_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  participant_id INTEGER,
  resource_type access_resource_type NOT NULL,
  resource_id INTEGER,
  action access_action NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW() NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT
);

CREATE INDEX idx_access_logs_user ON access_logs(user_id);
CREATE INDEX idx_access_logs_participant ON access_logs(participant_id);
CREATE INDEX idx_access_logs_timestamp ON access_logs(accessed_at);
CREATE INDEX idx_access_logs_action ON access_logs(action);

-- ============================================================
-- 6. Add Soft Delete Support (add deleted_at column)
-- ============================================================
-- Run these ALTER commands to add soft delete support
-- ALTER TABLE participants ADD COLUMN deleted_at TIMESTAMP;
-- ALTER TABLE shifts ADD COLUMN deleted_at TIMESTAMP;
-- ALTER TABLE incidents ADD COLUMN deleted_at TIMESTAMP;
-- ALTER TABLE case_notes ADD COLUMN deleted_at TIMESTAMP;
-- ALTER TABLE documents ADD COLUMN deleted_at TIMESTAMP;
-- ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- After running the migration, update your ORM queries to:
-- WHERE deleted_at IS NULL

-- ============================================================
-- Done!
-- ============================================================
