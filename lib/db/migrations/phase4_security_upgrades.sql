-- Phase 4: Privacy & Security Upgrades Migration
-- Run this script to add security fields to users table and soft delete support

-- ============================================================
-- 1. Enhance Users Table with Security Fields
-- ============================================================
ALTER TABLE users ADD COLUMN last_password_change_at TIMESTAMP;
ALTER TABLE users ADD COLUMN password_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN mfa_secret TEXT;
ALTER TABLE users ADD COLUMN session_token TEXT;
ALTER TABLE users ADD COLUMN token_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;

-- ============================================================
-- 2. Add Soft Delete Support to Sensitive Tables
-- ============================================================
ALTER TABLE participants ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE shifts ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE incidents ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE case_notes ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN deleted_at TIMESTAMP;

-- ============================================================
-- 3. Add Security Indexes
-- ============================================================
CREATE INDEX idx_users_session_token ON users(session_token) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_locked_until ON users(locked_until) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted ON users(deleted_at);

CREATE INDEX idx_participants_deleted ON participants(deleted_at);
CREATE INDEX idx_shifts_deleted ON shifts(deleted_at);
CREATE INDEX idx_incidents_deleted ON incidents(deleted_at);
CREATE INDEX idx_case_notes_deleted ON case_notes(deleted_at);
CREATE INDEX idx_documents_deleted ON documents(deleted_at);

-- ============================================================
-- 4. Update Query Patterns
-- ============================================================
-- All existing queries that read from these tables should now include:
-- WHERE deleted_at IS NULL

-- Example for participants:
-- SELECT * FROM participants WHERE deleted_at IS NULL;

-- For updates, set deleted_at instead of actually deleting:
-- UPDATE participants SET deleted_at = NOW() WHERE id = ?;

-- For hard delete recovery (within legal hold period):
-- UPDATE participants SET deleted_at = NULL WHERE id = ?;

-- ============================================================
-- 5. Password Policy for Admins (Optional)
-- ============================================================
-- Uncomment if you want to enforce password expiry for admins
-- UPDATE users SET password_expires_at = NOW() + INTERVAL '90 days' 
-- WHERE role = 'admin' AND password_expires_at IS NULL;

-- ============================================================
-- Done!
-- ============================================================
