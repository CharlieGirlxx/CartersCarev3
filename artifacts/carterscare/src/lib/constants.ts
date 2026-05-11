// Application Constants - NDIS & Aged Care Specific

export const serviceTypeOptions = [
  { value: 'daily_activities', label: 'Daily Activities' },
  { value: 'community_participation', label: 'Community Participation' },
  { value: 'personal_care', label: 'Personal Care' },
  { value: 'domestic_assistance', label: 'Domestic Assistance' },
  { value: 'transport', label: 'Transport' },
  { value: 'therapy_support', label: 'Therapy Support' },
  { value: 'high_intensity_support', label: 'High Intensity Support' },
  { value: 'respite', label: 'Respite Care' },
  { value: 'nursing_care', label: 'Nursing Care' },
];

export const shiftStatusOptions = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-50 text-blue-700' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-50 text-green-700' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-50 text-purple-700' },
  { value: 'completed', label: 'Completed', color: 'bg-slate-50 text-slate-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-rose-50 text-rose-700' },
  { value: 'no_show', label: 'No Show', color: 'bg-orange-50 text-orange-700' },
];

export const userRoles = [
  { value: 'admin', label: 'System Administrator' },
  { value: 'coordinator', label: 'Coordination Officer' },
  { value: 'support_worker', label: 'Support Worker' },
  { value: 'viewer', label: 'Viewer/Auditor' },
];

export const fundingTypes = [
  { value: 'ndis', label: 'NDIS' },
  { value: 'aged_care_commonwealth', label: 'Aged Care - Commonwealth' },
  { value: 'aged_care_state', label: 'Aged Care - State' },
  { value: 'private', label: 'Private' },
  { value: 'mixed', label: 'Mixed Funding' },
];

export const participantStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'waitlist', label: 'Waitlist' },
  { value: 'discharged', label: 'Discharged' },
];

export const riskLevels = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' },
];

export const documentTypes = [
  { value: 'support_plan', label: 'Support Plan' },
  { value: 'service_agreement', label: 'Service Agreement' },
  { value: 'behaviour_support_plan', label: 'Behaviour Support Plan' },
  { value: 'medical_record', label: 'Medical Record' },
  { value: 'worker_screening', label: 'Worker Screening' },
  { value: 'risk_assessment', label: 'Risk Assessment' },
  { value: 'other', label: 'Other' },
];

export const incidentTypes = [
  { value: 'injury', label: 'Injury' },
  { value: 'medication_error', label: 'Medication Error' },
  { value: 'behaviour_incident', label: 'Behaviour Incident' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'near_miss', label: 'Near Miss' },
  { value: 'property_damage', label: 'Property Damage' },
  { value: 'missing_person', label: 'Missing Person' },
  { value: 'abuse_neglect', label: 'Abuse/Neglect' },
  { value: 'restrictive_practice', label: 'Restrictive Practice' },
  { value: 'financial_abuse', label: 'Financial Abuse' },
  { value: 'environmental_hazard', label: 'Environmental Hazard' },
  { value: 'other', label: 'Other' },
];

export const incidentSeverityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-50 text-green-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700' },
  { value: 'critical', label: 'Critical', color: 'bg-rose-50 text-rose-700' },
];

export const complianceCheckTypes = [
  { value: 'working_with_children', label: 'Working with Children Check' },
  { value: 'ndi_worker_check', label: 'NDIS Worker Check' },
  { value: 'first_aid', label: 'First Aid Certificate' },
  { value: 'ndis_training', label: 'NDIS Training' },
  { value: 'manual_handling', label: 'Manual Handling' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'other', label: 'Other' },
];

export const consentTypes = [
  { value: 'data_sharing', label: 'Data Sharing' },
  { value: 'photography', label: 'Photography' },
  { value: 'emergency_services', label: 'Emergency Services' },
  { value: 'medical_treatment', label: 'Medical Treatment' },
  { value: 'research', label: 'Research' },
  { value: 'media', label: 'Media/Communications' },
  { value: 'other', label: 'Other' },
];

// Pagination & Display
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SHIFT_DURATION_HOURS = 8;

// Time Formats
export const TIME_FORMAT = 'HH:mm';
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Compliance Retention Periods (in days)
export const DATA_RETENTION_DAYS = 2555; // 7 years
export const AUDIT_LOG_RETENTION_DAYS = 2555; // 7 years
export const SOFT_DELETE_RETENTION_DAYS = 90; // Before hard delete
export const PASSWORD_EXPIRY_DAYS_ADMIN = 90;
export const PASSWORD_EXPIRY_DAYS_SUPPORT_WORKER = 180;

// Security Thresholds
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
export const SESSION_TIMEOUT_MINUTES = 480; // 8 hours
export const PASSWORD_MIN_LENGTH = 12;

// Feature Flags (set via environment variables)
export const FEATURE_FLAGS = {
  MFA_ENABLED: process.env.FEATURE_MFA_ENABLED !== 'false',
  AUDIT_LOGGING_ENABLED: process.env.FEATURE_AUDIT_LOGGING !== 'false',
  DOCUMENT_VERSIONING_ENABLED: process.env.FEATURE_DOCUMENT_VERSIONING !== 'false',
  EXPORT_REPORTS_ENABLED: process.env.FEATURE_EXPORT_REPORTS !== 'false',
  RATE_LIMITING_ENABLED: process.env.FEATURE_API_RATE_LIMITING !== 'false',
};
