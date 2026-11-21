-- ====================================================================
-- SCAMSHIELD: PRODUCTION POSTGRESQL & ROW LEVEL SECURITY (RLS) SCHEMA
-- ====================================================================

-- 1. Create Custom Enum Types
CREATE TYPE risk_severity_enum AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE');
CREATE TYPE threat_category_enum AS ENUM (
  'DIGITAL_ARREST',
  'REVERSE_UPI_QR',
  'COURIER_DELIVERY_SMISHING',
  'MALICIOUS_DOCUMENT',
  'MALICIOUS_APK',
  'MALICIOUS_EXECUTABLE',
  'PHISHING_CREDENTIAL_HARVEST',
  'TELEGRAM_JOB_TASK',
  'IMPERSONATION_SOCIAL_ENGINEERING',
  'BENIGN_SAFE'
);
CREATE TYPE user_role_enum AS ENUM ('citizen', 'security_analyst', 'admin');

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.users_profile (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  role user_role_enum DEFAULT 'citizen',
  trust_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scam Campaigns Table
CREATE TABLE IF NOT EXISTS public.scam_campaigns (
  id TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  threat_category threat_category_enum NOT NULL,
  pattern_hash TEXT,
  indicators TEXT[] DEFAULT '{}',
  victim_count_estimate INTEGER DEFAULT 1,
  active_status TEXT DEFAULT 'active' CHECK (active_status IN ('active', 'mitigated', 'monitoring')),
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  description TEXT NOT NULL
);

-- 4. Scan Records Table (Core Telemetry)
CREATE TABLE IF NOT EXISTS public.scan_records (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('universal', 'file', 'url', 'message', 'qr')),
  target_name TEXT NOT NULL,
  risk_severity risk_severity_enum NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW')),
  threat_category threat_category_enum NOT NULL,
  deterministic_score INTEGER NOT NULL CHECK (deterministic_score BETWEEN 0 AND 100),
  sha256_hash TEXT,
  detected_mime TEXT,
  claimed_extension TEXT,
  file_size_bytes BIGINT,
  entropy_score NUMERIC(4, 3),
  flags JSONB DEFAULT '[]'::jsonb,
  indicators JSONB DEFAULT '{}'::jsonb,
  ai_explanation JSONB NOT NULL,
  quarantine_status TEXT DEFAULT 'analyzed_safe' CHECK (quarantine_status IN ('quarantined', 'analyzed_safe', 'ephemeral_purged')),
  is_quarantined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Community Threat Reports Table
CREATE TABLE IF NOT EXISTS public.community_threats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  threat_type threat_category_enum NOT NULL,
  sanitized_snippet TEXT NOT NULL,
  risk_severity risk_severity_enum NOT NULL,
  verified_by_admin BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  reporting_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Incident Cases Table
CREATE TABLE IF NOT EXISTS public.incident_cases (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users_profile(id) ON DELETE SET NULL,
  scan_id TEXT REFERENCES public.scan_records(id) ON DELETE SET NULL,
  threat_category threat_category_enum NOT NULL,
  financial_loss_amount NUMERIC(12, 2) DEFAULT 0.00,
  transaction_reference TEXT,
  suspect_contact_or_handle TEXT,
  cybercell_portal_filed BOOLEAN DEFAULT FALSE,
  cybercell_ack_number TEXT,
  bank_notified BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'REPORTED' CHECK (status IN ('REPORTED', 'EVIDENCE_COLLECTED', 'ACKNOWLEDGED', 'RESOLVED')),
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Immutable Security Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  client_ip_hash TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_threats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scam_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users_profile
CREATE POLICY "Users can read their own profile"
  ON public.users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users_profile FOR UPDATE
  USING (auth.uid() = id);

-- Policy: scan_records
CREATE POLICY "Users can view their own scans"
  ON public.scan_records FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert scans"
  ON public.scan_records FOR INSERT
  WITH CHECK (true);

-- Policy: community_threats
CREATE POLICY "Anyone can read verified community threats"
  ON public.community_threats FOR SELECT
  USING (verified_by_admin = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated or guest users can submit community threats"
  ON public.community_threats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can upvote community threats"
  ON public.community_threats FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: scam_campaigns
CREATE POLICY "Public can view active scam campaigns"
  ON public.scam_campaigns FOR SELECT
  USING (true);

-- Policy: incident_cases
CREATE POLICY "Users can view and update their own incident cases"
  ON public.incident_cases FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: audit_logs
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users_profile
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_scan_records_user ON public.scan_records(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_records_sha256 ON public.scan_records(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_community_threats_verified ON public.community_threats(verified_by_admin);
CREATE INDEX IF NOT EXISTS idx_incident_cases_user ON public.incident_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(created_at DESC);

-- Grants & Schema Access for Supabase Roles (service_role, anon, authenticated)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
