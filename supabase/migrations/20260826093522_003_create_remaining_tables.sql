/*
# CloudOps Health — Core Schema (Part 3: Comments, Remediations, Automations, Reports, Audit Logs, Notifications)

## Purpose
Creates the remaining tables for the platform: finding comments, remediation tracking,
automation catalog and executions, reports, audit logs, and user notifications.

## Tables Created
1. finding_comments — Comments on findings (user_id, comment, timestamps)
2. remediations — Remediation tracking linked to findings (status, progress, due_date)
3. automations — Automation catalog (name, description, category, status, schedule)
4. automation_executions — Execution history for automations (status, findings_generated, output)
5. reports — Generated reports (organization_id, name, report_type, period, status)
6. audit_logs — Append-only audit trail (user, action, entity, previous/new values, metadata)
7. notifications — User notifications (type, title, message, read)

## Security
- RLS enabled on all tables
- Org-scoped read access for all authenticated users
- Admin/engineer roles for write operations
- Audit logs: append-only (INSERT only, no UPDATE/DELETE for non-admins)
- Notifications: users can only read/update their own

## Notes
- Audit logs use jsonb metadata column for flexible context
- Automation executions store output as text
- Reports have period_start/period_end for date ranges
*/

-- Finding Comments
CREATE TABLE IF NOT EXISTS finding_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finding_comments_finding_id ON finding_comments(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_comments_user_id ON finding_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_finding_comments_created_at ON finding_comments(created_at);

ALTER TABLE finding_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finding_comments_select_own_org" ON finding_comments;
CREATE POLICY "finding_comments_select_own_org" ON finding_comments
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM findings f
    JOIN aws_accounts a ON a.id = f.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE f.id = finding_comments.finding_id AND u.id = auth.uid()
  ));

DROP POLICY IF EXISTS "finding_comments_insert_own_org" ON finding_comments;
CREATE POLICY "finding_comments_insert_own_org" ON finding_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM findings f
      JOIN aws_accounts a ON a.id = f.aws_account_id
      JOIN users u ON u.organization_id = a.organization_id
      WHERE f.id = finding_comments.finding_id AND u.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "finding_comments_update_own" ON finding_comments;
CREATE POLICY "finding_comments_update_own" ON finding_comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Remediations
CREATE TABLE IF NOT EXISTS remediations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'BACKLOG' CHECK (status IN ('BACKLOG', 'PLANNED', 'IN_PROGRESS', 'VALIDATION', 'RESOLVED')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_remediations_finding_id ON remediations(finding_id);
CREATE INDEX IF NOT EXISTS idx_remediations_owner_id ON remediations(owner_id);
CREATE INDEX IF NOT EXISTS idx_remediations_status ON remediations(status);
CREATE INDEX IF NOT EXISTS idx_remediations_due_date ON remediations(due_date);

ALTER TABLE remediations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "remediations_select_own_org" ON remediations;
CREATE POLICY "remediations_select_own_org" ON remediations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM findings f
    JOIN aws_accounts a ON a.id = f.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE f.id = remediations.finding_id AND u.id = auth.uid()
  ));

DROP POLICY IF EXISTS "remediations_insert_own_org" ON remediations;
CREATE POLICY "remediations_insert_own_org" ON remediations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM findings f
    JOIN aws_accounts a ON a.id = f.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE f.id = remediations.finding_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

DROP POLICY IF EXISTS "remediations_update_own_org" ON remediations;
CREATE POLICY "remediations_update_own_org" ON remediations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM findings f
    JOIN aws_accounts a ON a.id = f.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE f.id = remediations.finding_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM findings f
    JOIN aws_accounts a ON a.id = f.aws_account_id
    JOIN users u ON u.organization_id = a.organization_id
    WHERE f.id = remediations.finding_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER')
  ));

-- Automations
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('ACTIVE', 'PLANNED', 'DISABLED')),
  last_execution_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automations_category ON automations(category);
CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "automations_select_authenticated" ON automations;
CREATE POLICY "automations_select_authenticated" ON automations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "automations_insert_admin" ON automations;
CREATE POLICY "automations_insert_admin" ON automations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

DROP POLICY IF EXISTS "automations_update_admin" ON automations;
CREATE POLICY "automations_update_admin" ON automations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

-- Automation Executions
CREATE TABLE IF NOT EXISTS automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  findings_generated integer NOT NULL DEFAULT 0,
  output text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_executions_automation_id ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_created_at ON automation_executions(created_at);

ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "automation_executions_select_authenticated" ON automation_executions;
CREATE POLICY "automation_executions_select_authenticated" ON automation_executions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "automation_executions_insert_admin" ON automation_executions;
CREATE POLICY "automation_executions_insert_admin" ON automation_executions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

DROP POLICY IF EXISTS "automation_executions_update_admin" ON automation_executions;
CREATE POLICY "automation_executions_update_admin" ON automation_executions
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  report_type text NOT NULL DEFAULT 'MONTHLY',
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'GENERATED' CHECK (status IN ('GENERATED', 'PENDING', 'FAILED')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_organization_id ON reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own_org" ON reports;
CREATE POLICY "reports_select_own_org" ON reports
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

DROP POLICY IF EXISTS "reports_insert_own_org" ON reports;
CREATE POLICY "reports_insert_own_org" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN'))
  );

DROP POLICY IF EXISTS "reports_update_own_org" ON reports;
CREATE POLICY "reports_update_own_org" ON reports
  FOR UPDATE TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN'))
  )
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN'))
  );

-- Audit Logs (append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  previous_value text,
  new_value text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select_own_org" ON audit_logs;
CREATE POLICY "audit_logs_select_own_org" ON audit_logs
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

DROP POLICY IF EXISTS "audit_logs_insert_own_org" ON audit_logs;
CREATE POLICY "audit_logs_insert_own_org" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND user_id = auth.uid()
  );

-- No UPDATE or DELETE policies on audit_logs — append-only by design

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('critical', 'info', 'warning', 'success')),
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
