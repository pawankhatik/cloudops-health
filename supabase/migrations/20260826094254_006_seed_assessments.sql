/*
# CloudOps Health — Seed Assessments and Assessment Controls

## Data Created
- 17 assessments across all 3 AWS accounts
- Assessment control results for EKS and Security assessments

## Notes
- Uses subqueries to reference control UUIDs by control_id text
- All assessments reference seeded AWS accounts and users
*/

-- Assessments (17 total)
INSERT INTO assessments (id, aws_account_id, name, category, status, score, started_at, completed_at, created_by, created_at) VALUES
  ('00000000-0000-0000-0000-000000000a01', '00000000-0000-0000-0000-000000000100', 'EKS Reliability Assessment', 'EKS', 'COMPLETED', 84, '2026-08-18T09:00:00Z', '2026-08-18T09:30:00Z', '00000000-0000-0000-0000-000000000011', '2026-08-18T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000a02', '00000000-0000-0000-0000-000000000100', 'Security Posture Assessment', 'Security', 'COMPLETED', 91, '2026-08-17T10:00:00Z', '2026-08-17T10:45:00Z', '00000000-0000-0000-0000-000000000013', '2026-08-17T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000a03', '00000000-0000-0000-0000-000000000100', 'IAM Privilege Review', 'IAM', 'COMPLETED', 82, '2026-08-16T11:00:00Z', '2026-08-16T11:30:00Z', '00000000-0000-0000-0000-000000000013', '2026-08-16T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000a04', '00000000-0000-0000-0000-000000000100', 'S3 Configuration Audit', 'S3', 'COMPLETED', 88, '2026-08-15T09:00:00Z', '2026-08-15T09:20:00Z', '00000000-0000-0000-0000-000000000011', '2026-08-15T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000a05', '00000000-0000-0000-0000-000000000100', 'Networking Flow Log Audit', 'Networking', 'COMPLETED', 76, '2026-08-14T13:00:00Z', '2026-08-14T13:30:00Z', '00000000-0000-0000-0000-000000000012', '2026-08-14T13:00:00Z'),
  ('00000000-0000-0000-0000-000000000a06', '00000000-0000-0000-0000-000000000100', 'Observability Coverage Assessment', 'Observability', 'COMPLETED', 73, '2026-08-13T10:00:00Z', '2026-08-13T10:40:00Z', '00000000-0000-0000-0000-000000000011', '2026-08-13T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000a07', '00000000-0000-0000-0000-000000000100', 'Backup & DR Readiness Assessment', 'Backup', 'COMPLETED', 69, '2026-08-12T09:00:00Z', '2026-08-12T09:30:00Z', '00000000-0000-0000-0000-000000000011', '2026-08-12T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000a08', '00000000-0000-0000-0000-000000000100', 'Governance & Tagging Audit', 'Governance', 'COMPLETED', 78, '2026-08-11T11:00:00Z', '2026-08-11T11:20:00Z', '00000000-0000-0000-0000-000000000011', '2026-08-11T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000a16', '00000000-0000-0000-0000-000000000100', 'Compute Optimization Assessment', 'Compute', 'RUNNING', 0, '2026-08-19T08:00:00Z', NULL, '00000000-0000-0000-0000-000000000012', '2026-08-19T08:00:00Z'),
  ('00000000-0000-0000-0000-000000000a17', '00000000-0000-0000-0000-000000000100', 'Database Reliability Assessment', 'Database', 'SCHEDULED', 0, NULL, NULL, '00000000-0000-0000-0000-000000000011', '2026-08-19T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000a09', '00000000-0000-0000-0000-000000000200', 'EKS Reliability Assessment', 'EKS', 'COMPLETED', 72, '2026-08-17T14:00:00Z', '2026-08-17T14:30:00Z', '00000000-0000-0000-0000-000000000012', '2026-08-17T14:00:00Z'),
  ('00000000-0000-0000-0000-000000000a10', '00000000-0000-0000-0000-000000000200', 'Security Posture Assessment', 'Security', 'COMPLETED', 79, '2026-08-16T10:00:00Z', '2026-08-16T10:30:00Z', '00000000-0000-0000-0000-000000000013', '2026-08-16T10:00:00Z'),
  ('00000000-0000-0000-0000-000000000a11', '00000000-0000-0000-0000-000000000200', 'IAM Privilege Review', 'IAM', 'COMPLETED', 74, '2026-08-15T11:00:00Z', '2026-08-15T11:20:00Z', '00000000-0000-0000-0000-000000000013', '2026-08-15T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000a12', '00000000-0000-0000-0000-000000000200', 'S3 Configuration Audit', 'S3', 'COMPLETED', 80, '2026-08-14T09:00:00Z', '2026-08-14T09:15:00Z', '00000000-0000-0000-0000-000000000012', '2026-08-14T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000a14', '00000000-0000-0000-0000-000000000200', 'Backup & DR Readiness Assessment', 'Backup', 'COMPLETED', 71, '2026-08-13T09:00:00Z', '2026-08-13T09:20:00Z', '00000000-0000-0000-0000-000000000012', '2026-08-13T09:00:00Z'),
  ('00000000-0000-0000-0000-000000000a15', '00000000-0000-0000-0000-000000000200', 'Governance & Tagging Audit', 'Governance', 'COMPLETED', 75, '2026-08-12T11:00:00Z', '2026-08-12T11:15:00Z', '00000000-0000-0000-0000-000000000012', '2026-08-12T11:00:00Z'),
  ('00000000-0000-0000-0000-000000000a13', '00000000-0000-0000-0000-000000000300', 'EKS Reliability Assessment', 'EKS', 'COMPLETED', 85, '2026-08-16T11:00:00Z', '2026-08-16T11:30:00Z', '00000000-0000-0000-0000-000000000012', '2026-08-16T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Assessment Controls for EKS Reliability Assessment (a01)
INSERT INTO assessment_controls (assessment_id, control_id, status, score, evidence, notes, evaluated_at) VALUES
  ('00000000-0000-0000-0000-000000000a01', (SELECT id FROM controls WHERE control_id = 'EKS-001'), 'PASS', 100, 'Cluster version 1.29. Supported versions: 1.27-1.31.', 'Control plane running supported version.', '2026-08-18T09:15:00Z'),
  ('00000000-0000-0000-0000-000000000a01', (SELECT id FROM controls WHERE control_id = 'EKS-002'), 'FAIL', 0, 'vpc-cni version differs between prod (v1.12.0) and dev (v1.11.3).', 'Add-on versions inconsistent across environments.', '2026-08-18T09:18:00Z'),
  ('00000000-0000-0000-0000-000000000a01', (SELECT id FROM controls WHERE control_id = 'EKS-003'), 'PASS', 100, 'All 12 nodes in Ready state. 0 NotReady nodes.', 'Nodes healthy.', '2026-08-18T09:20:00Z'),
  ('00000000-0000-0000-0000-000000000a01', (SELECT id FROM controls WHERE control_id = 'EKS-004'), 'WARNING', 50, '23 of 67 deployments have no resource requests. 41 have no resource limits.', 'Resource requests not configured for many deployments.', '2026-08-18T09:22:00Z'),
  ('00000000-0000-0000-0000-000000000a01', (SELECT id FROM controls WHERE control_id = 'EKS-005'), 'PASS', 100, 'Karpenter v0.34.0 running, 3 nodes provisioned, 0 errors.', 'Karpenter healthy.', '2026-08-18T09:25:00Z')
ON CONFLICT DO NOTHING;

-- Assessment Controls for Security Posture Assessment (a02)
INSERT INTO assessment_controls (assessment_id, control_id, status, score, evidence, notes, evaluated_at) VALUES
  ('00000000-0000-0000-0000-000000000a02', (SELECT id FROM controls WHERE control_id = 'SEC-001'), 'FAIL', 0, 'Inbound rule: port 22, source 0.0.0.0/0 on sg-prod-web-01.', 'SSH open to internet on production web tier.', '2026-08-17T10:15:00Z'),
  ('00000000-0000-0000-0000-000000000a02', (SELECT id FROM controls WHERE control_id = 'SEC-002'), 'FAIL', 0, 'Bucket s3-prod-customer-exports has public read policy.', 'S3 bucket with customer data is publicly readable.', '2026-08-17T10:20:00Z'),
  ('00000000-0000-0000-0000-000000000a02', (SELECT id FROM controls WHERE control_id = 'SEC-003'), 'FAIL', 0, 'Trail logging disabled for us-west-2 on 2026-07-30.', 'CloudTrail blind spot in us-west-2.', '2026-08-17T10:25:00Z'),
  ('00000000-0000-0000-0000-000000000a02', (SELECT id FROM controls WHERE control_id = 'SEC-005'), 'PASS', 100, 'Root MFA enabled with virtual device.', 'Root account protected.', '2026-08-17T10:30:00Z')
ON CONFLICT DO NOTHING;
