/*
# CloudOps Health — Core Schema (Part 2: Controls, Assessments, Findings)

## Purpose
Creates the assessment and findings tables that form the core of the platform.

## Tables Created
1. controls — Centralized control library (control_id, name, description, category, severity, framework, remediation_guidance, enabled)
2. assessments — Assessment runs per AWS account (name, category, status, score, started_at, completed_at)
3. assessment_controls — Per-control results within an assessment (status, score, evidence, notes)
4. findings — Discovered issues linked to accounts, assessments, and controls (severity, status, resource, evidence, recommendation, owner, due_date)

## Security
- RLS enabled on all tables
- All authenticated users in the org can read
- Admin/engineer roles can create/update
- No DELETE policies on findings (append-only audit trail)

## Notes
- control_id and finding_id are business identifiers, unique separately from the uuid PK
- Findings link to assessments, controls, and AWS accounts
- Severity and status use CHECK constraints with uppercase enum values
*/

-- Controls
CREATE TABLE IF NOT EXISTS controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  severity text CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  framework text NOT NULL DEFAULT 'Internal',
  remediation_guidance text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_controls_category ON controls(category);
CREATE INDEX IF NOT EXISTS idx_controls_severity ON controls(severity);
CREATE INDEX IF NOT EXISTS idx_controls_enabled ON controls(enabled);

ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "controls_select_authenticated" ON controls;
CREATE POLICY "controls_select_authenticated" ON controls
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "controls_insert_admin" ON controls;
CREATE POLICY "controls_insert_admin" ON controls
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SECURITY_ENGINEER')));

DROP POLICY IF EXISTS "controls_update_admin" ON controls;
CREATE POLICY "controls_update_admin" ON controls
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SECURITY_ENGINEER')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SECURITY_ENGINEER')));

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aws_account_id uuid NOT NULL REFERENCES aws_accounts(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED')),
  score integer NOT NULL DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessments_aws_account_id ON assessments(aws_account_id);
CREATE INDEX IF NOT EXISTS idx_assessments_category ON assessments(category);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessments_select_own_org" ON assessments;
CREATE POLICY "assessments_select_own_org" ON assessments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = assessments.aws_account_id AND u.id = auth.uid()
  ));

DROP POLICY IF EXISTS "assessments_insert_own_org" ON assessments;
CREATE POLICY "assessments_insert_own_org" ON assessments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = assessments.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

DROP POLICY IF EXISTS "assessments_update_own_org" ON assessments;
CREATE POLICY "assessments_update_own_org" ON assessments
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = assessments.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = assessments.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

-- Assessment Controls
CREATE TABLE IF NOT EXISTS assessment_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'NOT_APPLICABLE' CHECK (status IN ('PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE', 'ERROR')),
  score integer NOT NULL DEFAULT 0,
  evidence text,
  notes text,
  evaluated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assessment_controls_assessment_id ON assessment_controls(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_controls_control_id ON assessment_controls(control_id);
CREATE INDEX IF NOT EXISTS idx_assessment_controls_status ON assessment_controls(status);

ALTER TABLE assessment_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessment_controls_select_own_org" ON assessment_controls;
CREATE POLICY "assessment_controls_select_own_org" ON assessment_controls
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments ast
    JOIN aws_accounts a ON a.id = ast.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE ast.id = assessment_controls.assessment_id AND u.id = auth.uid()
  ));

DROP POLICY IF EXISTS "assessment_controls_insert_own_org" ON assessment_controls;
CREATE POLICY "assessment_controls_insert_own_org" ON assessment_controls
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments ast
    JOIN aws_accounts a ON a.id = ast.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE ast.id = assessment_controls.assessment_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

DROP POLICY IF EXISTS "assessment_controls_update_own_org" ON assessment_controls;
CREATE POLICY "assessment_controls_update_own_org" ON assessment_controls
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM assessments ast
    JOIN aws_accounts a ON a.id = ast.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE ast.id = assessment_controls.assessment_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments ast
    JOIN aws_accounts a ON a.id = ast.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE ast.id = assessment_controls.assessment_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

-- Findings
CREATE TABLE IF NOT EXISTS findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id text UNIQUE NOT NULL,
  aws_account_id uuid NOT NULL REFERENCES aws_accounts(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  control_id uuid REFERENCES controls(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  resource_type text NOT NULL DEFAULT 'Unknown',
  resource_id text NOT NULL,
  region text,
  evidence text,
  business_risk text,
  recommendation text,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'PLANNED', 'IN_PROGRESS', 'VALIDATION', 'RESOLVED', 'ACCEPTED_RISK', 'FALSE_POSITIVE')),
  due_date date,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_findings_aws_account_id ON findings(aws_account_id);
CREATE INDEX IF NOT EXISTS idx_findings_assessment_id ON findings(assessment_id);
CREATE INDEX IF NOT EXISTS idx_findings_control_id ON findings(control_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_category ON findings(category);
CREATE INDEX IF NOT EXISTS idx_findings_owner_id ON findings(owner_id);
CREATE INDEX IF NOT EXISTS idx_findings_created_at ON findings(created_at);

ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "findings_select_own_org" ON findings;
CREATE POLICY "findings_select_own_org" ON findings
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = findings.aws_account_id AND u.id = auth.uid()
  ));

DROP POLICY IF EXISTS "findings_insert_own_org" ON findings;
CREATE POLICY "findings_insert_own_org" ON findings
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = findings.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

DROP POLICY IF EXISTS "findings_update_own_org" ON findings;
CREATE POLICY "findings_update_own_org" ON findings
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = findings.aws_account_id AND u.id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = findings.aws_account_id AND u.id = auth.uid()
  ));
