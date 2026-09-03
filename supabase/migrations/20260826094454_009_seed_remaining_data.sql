/*
# CloudOps Health — Seed Remaining Data (Comments, Remediations, Automations, Reports, Audit Logs, Notifications)

## Data Created
- 5 finding comments
- 10 remediations linked to findings
- 6 automations (1 active, 5 planned)
- 3 automation executions
- 3 monthly reports
- 10 audit log entries
- 5 notifications
*/

-- Finding Comments
INSERT INTO finding_comments (id, finding_id, user_id, comment, created_at) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000011', 'Coordinating with DBA team for a restore window this weekend.', '2026-08-16T10:00:00Z'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000010', 'This is the top priority for the platform team this sprint.', '2026-08-18T08:00:00Z'),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000013', 'Public policy removed. Running CloudTrail analysis to check for access in the last 90 days.', '2026-08-17T12:00:00Z'),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000012', 'Upgrade window scheduled for Sept 2. Running compatibility tests in staging first.', '2026-08-15T09:00:00Z'),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000013', 'Working with the web team to migrate to Session Manager.', '2026-08-14T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Remediations
INSERT INTO remediations (id, finding_id, owner_id, title, description, status, progress, due_date, created_at) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000011', 'Validate RDS backup restore for Production', 'Execute full restore test into isolated VPC and document RTO/RPO', 'IN_PROGRESS', 35, '2026-08-26', '2026-08-12T08:00:00Z'),
  ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000013', 'Remove S3 public read access', 'Remove public policy, enable Block Public Access, audit CloudTrail', 'IN_PROGRESS', 60, '2026-08-22', '2026-08-14T12:30:00Z'),
  ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000012', 'Upgrade EKS to supported version', 'Plan controlled upgrade to 1.29 with rollback procedures', 'PLANNED', 15, '2026-09-02', '2026-08-10T09:00:00Z'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000012', 'Standardize EKS add-on versions', 'Align add-on versions across all clusters via GitOps', 'IN_PROGRESS', 45, '2026-09-05', '2026-08-08T10:00:00Z'),
  ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000013', 'Replace wildcard IAM policy', 'Scope down IAM role permissions using Access Analyzer data', 'PLANNED', 20, '2026-09-01', '2026-08-09T14:00:00Z'),
  ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000011', 'Add observability to critical workloads', 'Instrument services with OpenTelemetry, define SLOs and dashboards', 'IN_PROGRESS', 30, '2026-09-10', '2026-08-06T11:00:00Z'),
  ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0001-000000000010', '00000000-0000-0000-0000-000000000011', 'Configure AWS Backup for payments RDS', 'Enroll RDS in AWS Backup plan with cross-region copy', 'IN_PROGRESS', 50, '2026-08-28', '2026-08-11T13:00:00Z'),
  ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0001-000000000013', '00000000-0000-0000-0000-000000000011', 'Apply required resource tags', 'Tag all production resources and implement tag policies', 'IN_PROGRESS', 40, '2026-09-20', '2026-08-02T08:00:00Z'),
  ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0001-000000000012', '00000000-0000-0000-0000-000000000012', 'Upgrade EKS node group AMI', 'Migrate from AL2 to Amazon Linux 2023 via rolling update', 'PLANNED', 10, '2026-09-15', '2026-08-03T11:00:00Z'),
  ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0001-000000000016', '00000000-0000-0000-0000-000000000012', 'Configure EKS resource requests', 'Define CPU and memory requests for all deployments', 'PLANNED', 15, '2026-09-18', '2026-08-01T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Automations
INSERT INTO automations (id, name, description, category, status, last_execution_at) VALUES
  ('00000000-0000-0000-0004-000000000001', 'AWS Security Group Scanner', 'Scans all security groups for unrestricted SSH, RDP, and overly permissive rules across connected accounts.', 'Security', 'ACTIVE', '2026-08-19T06:00:00Z'),
  ('00000000-0000-0000-0004-000000000002', 'EKS Health Scanner', 'Checks EKS clusters for supported versions, add-on alignment, node health, and resource request compliance.', 'EKS', 'PLANNED', NULL),
  ('00000000-0000-0000-0004-000000000003', 'S3 Configuration Scanner', 'Audits S3 buckets for public access, encryption, versioning, and lifecycle policies.', 'S3', 'PLANNED', NULL),
  ('00000000-0000-0000-0004-000000000004', 'IAM Permission Analyzer', 'Analyzes IAM roles and policies for least-privilege violations, unused roles, and key age.', 'IAM', 'PLANNED', NULL),
  ('00000000-0000-0000-0004-000000000005', 'CloudWatch Retention Scanner', 'Identifies CloudWatch log groups without retention policies and excessive storage.', 'Observability', 'PLANNED', NULL),
  ('00000000-0000-0000-0004-000000000006', 'AWS Resource Inventory', 'Inventories all resources across connected accounts and validates required tagging compliance.', 'Governance', 'PLANNED', NULL)
ON CONFLICT (id) DO NOTHING;

-- Automation Executions
INSERT INTO automation_executions (id, automation_id, status, started_at, completed_at, findings_generated, output) VALUES
  ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0004-000000000001', 'COMPLETED', '2026-08-19T06:00:00Z', '2026-08-19T06:04:32Z', 2, 'Scanned 15 security groups across 3 accounts. Found 2 findings: unrestricted SSH on sg-prod-web-01, all outbound on sg-dev-default.'),
  ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0004-000000000001', 'COMPLETED', '2026-08-18T06:00:00Z', '2026-08-18T06:03:51Z', 1, 'Scanned 15 security groups across 3 accounts. Found 1 finding: unrestricted SSH on sg-prod-web-01.'),
  ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0004-000000000001', 'COMPLETED', '2026-08-17T06:00:00Z', '2026-08-17T06:04:10Z', 0, 'Scanned 15 security groups across 3 accounts. No new findings.')
ON CONFLICT (id) DO NOTHING;

-- Reports
INSERT INTO reports (id, organization_id, name, report_type, period_start, period_end, status, created_by, created_at) VALUES
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000001', 'Monthly AWS Platform Health — August 2026', 'MONTHLY', '2026-08-01', '2026-08-31', 'GENERATED', '00000000-0000-0000-0000-000000000011', '2026-08-19T08:00:00Z'),
  ('00000000-0000-0000-0006-000000000002', '00000000-0000-0000-0000-000000000001', 'Monthly AWS Platform Health — July 2026', 'MONTHLY', '2026-07-01', '2023-07-31', 'GENERATED', '00000000-0000-0000-0000-000000000011', '2026-07-31T08:00:00Z'),
  ('00000000-0000-0000-0006-000000000003', '00000000-0000-0000-0000-000000000001', 'Monthly AWS Platform Health — June 2026', 'MONTHLY', '2026-06-01', '2026-06-30', 'GENERATED', '00000000-0000-0000-0000-000000000011', '2026-06-30T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Audit Logs
INSERT INTO audit_logs (id, organization_id, user_id, action, entity_type, entity_id, previous_value, new_value, created_at) VALUES
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'STATUS_CHANGED', 'FINDING', 'F-1024', 'OPEN', 'IN_PROGRESS', '2026-08-19T09:15:00Z'),
  ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'ASSIGNED', 'FINDING', 'F-1001', NULL, 'Sarah Chen', '2026-08-19T08:30:00Z'),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'SEVERITY_CHANGED', 'FINDING', 'F-1002', 'HIGH', 'CRITICAL', '2026-08-18T16:45:00Z'),
  ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'STATUS_CHANGED', 'FINDING', 'F-0992', 'IN_PROGRESS', 'RESOLVED', '2026-08-18T14:20:00Z'),
  ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'ACCEPTED_RISK', 'FINDING', 'F-0988', 'OPEN', 'ACCEPTED_RISK', '2026-08-17T15:30:00Z'),
  ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000013', 'AUTOMATION_EXECUTED', 'AUTOMATION', 'AWS Security Group Scanner', NULL, NULL, '2026-08-19T06:00:00Z'),
  ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 'REPORT_GENERATED', 'REPORT', 'Monthly AWS Platform Health — August 2026', NULL, NULL, '2026-08-19T08:00:00Z'),
  ('00000000-0000-0000-0007-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 'STATUS_CHANGED', 'FINDING', 'F-1005', 'PLANNED', 'IN_PROGRESS', '2026-08-17T10:15:00Z'),
  ('00000000-0000-0000-0007-000000000009', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'SETTINGS_UPDATED', 'SETTINGS', 'Notification Settings', NULL, NULL, '2026-08-16T09:00:00Z'),
  ('00000000-0000-0000-0007-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'LOGIN', 'AUTH', 'pawan@cloudops.demo', NULL, NULL, '2026-08-19T07:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Notifications
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES
  ('00000000-0000-0000-0008-000000000001', '00000000-0000-0000-0000-000000000010', 'critical', '4 critical findings require attention', 'Critical findings in Production account need immediate action.', false, '2026-08-19T09:00:00Z'),
  ('00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0000-000000000010', 'info', 'EKS assessment completed', 'EKS Reliability Assessment for Production completed with score 84/100.', false, '2026-08-18T09:30:00Z'),
  ('00000000-0000-0000-0008-000000000003', '00000000-0000-0000-0000-000000000010', 'warning', 'Finding F-1006 is due in 7 days', 'Security group allows unrestricted SSH access — due Sep 15.', false, '2026-08-19T08:00:00Z'),
  ('00000000-0000-0000-0008-000000000004', '00000000-0000-0000-0000-000000000010', 'success', '31 findings resolved this month', 'Great progress — 31 findings resolved in August.', true, '2026-08-19T07:00:00Z'),
  ('00000000-0000-0000-0008-000000000005', '00000000-0000-0000-0000-000000000010', 'info', 'Automation completed', 'AWS Security Group Scanner generated 2 new findings.', true, '2026-08-19T06:04:00Z')
ON CONFLICT (id) DO NOTHING;
