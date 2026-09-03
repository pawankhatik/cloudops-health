/*
# CloudOps Health — Seed Data (Part 1: Organization, Users, AWS Accounts, Regions, Controls)

## Purpose
Seeds the database with realistic demo data. Auth users were already created via execute_sql.
This migration creates the application-level records that reference those auth users.

## Data Created
1. One demo organization: "CloudOps Demo"
2. Five application users linked to pre-created auth.users
3. Three AWS accounts: Production, Development, Test (fake account IDs)
4. Regions: us-east-1 and us-west-2 per account
5. 22 controls across Security, EKS, Networking, IAM, S3, Observability, Backup/DR, Governance

## Notes
- All data is DEMO data, clearly marked
- Auth users created separately with password Demo1234!
- AWS account IDs are fake (111111111111, 222222222222, 333333333333)
*/

-- Create the demo organization
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'CloudOps Demo', 'cloudops-demo')
ON CONFLICT (id) DO NOTHING;

-- Create application user records (linked to pre-created auth.users)
INSERT INTO users (id, organization_id, name, email, role, status) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Pawan Kumar', 'pawan@cloudops.demo', 'SUPER_ADMIN', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Sarah Chen', 'sarah@cloudops.demo', 'PLATFORM_ADMIN', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Marcus Webb', 'marcus@cloudops.demo', 'DEVOPS_ENGINEER', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Elena Rossi', 'elena@cloudops.demo', 'SECURITY_ENGINEER', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'David Park', 'david@cloudops.demo', 'VIEWER', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- AWS Accounts (metadata only, no credentials)
INSERT INTO aws_accounts (id, organization_id, name, account_id, environment, status, primary_region, health_score, last_assessment_at) VALUES
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Production', '111111111111', 'Production', 'Connected', 'us-east-1', 86, '2026-08-18T09:30:00Z'),
  ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000001', 'Development', '222222222222', 'Development', 'Connected', 'us-east-1', 78, '2026-08-17T14:00:00Z'),
  ('00000000-0000-0000-0000-000000000300', '00000000-0000-0000-0000-000000000001', 'Test', '333333333333', 'Test', 'Connected', 'us-east-1', 82, '2026-08-16T11:15:00Z')
ON CONFLICT (id) DO NOTHING;

-- Regions
INSERT INTO aws_regions (aws_account_id, region_name, enabled) VALUES
  ('00000000-0000-0000-0000-000000000100', 'us-east-1', true),
  ('00000000-0000-0000-0000-000000000100', 'us-west-2', true),
  ('00000000-0000-0000-0000-000000000200', 'us-east-1', true),
  ('00000000-0000-0000-0000-000000000300', 'us-east-1', true),
  ('00000000-0000-0000-0000-000000000300', 'us-west-2', true)
ON CONFLICT DO NOTHING;

-- Controls (22 controls across all categories)
INSERT INTO controls (id, control_id, name, description, category, severity, framework, remediation_guidance, enabled) VALUES
  ('00000000-0000-0000-0000-000000001001', 'SEC-001', 'No unrestricted SSH access', 'Security groups must not allow inbound SSH (port 22) from 0.0.0.0/0.', 'Security', 'HIGH', 'CIS AWS 1.4', 'Restrict SSH access to approved administrative networks or use AWS Systems Manager Session Manager.', true),
  ('00000000-0000-0000-0000-000000001002', 'SEC-002', 'S3 public access blocked', 'S3 buckets must have public access blocked at the account level.', 'S3', 'CRITICAL', 'CIS AWS 1.3', 'Enable S3 Block Public Access at the account and bucket level.', true),
  ('00000000-0000-0000-0000-000000001003', 'SEC-003', 'CloudTrail enabled', 'AWS CloudTrail must be enabled in all regions for audit logging.', 'Security', 'HIGH', 'CIS AWS 2.1', 'Enable CloudTrail in all regions with log file validation and encryption.', true),
  ('00000000-0000-0000-0000-000000001004', 'SEC-004', 'No overly permissive security groups', 'Security groups must not allow all inbound traffic on all ports.', 'Security', 'MEDIUM', 'CIS AWS 1.6', 'Restrict inbound rules to required ports and source IP ranges only.', true),
  ('00000000-0000-0000-0000-000000001005', 'SEC-005', 'Root MFA enabled', 'Root account must have MFA enabled.', 'Security', 'CRITICAL', 'CIS AWS 1.1', 'Enable virtual or hardware MFA on the root account immediately.', true),
  ('00000000-0000-0000-0000-000000002001', 'EKS-001', 'Supported Kubernetes version', 'EKS clusters must run a Kubernetes version within the vendor-supported window.', 'EKS', 'HIGH', 'EKS Best Practices', 'Upgrade EKS clusters to a supported Kubernetes version following the upgrade documentation.', true),
  ('00000000-0000-0000-0000-000000002002', 'EKS-002', 'Approved EKS add-ons', 'EKS add-ons must be aligned to approved versions across environments.', 'EKS', 'HIGH', 'EKS Best Practices', 'Standardize add-on versions via GitOps and enforce version parity via CI checks.', true),
  ('00000000-0000-0000-0000-000000002003', 'EKS-003', 'Nodes healthy', 'All EKS nodes must be in Ready state.', 'EKS', NULL, 'EKS Best Practices', 'Investigate and replace NotReady nodes. Check node group health and AMI compatibility.', true),
  ('00000000-0000-0000-0000-000000002004', 'EKS-004', 'Resource requests configured', 'Deployments must have CPU and memory resource requests defined.', 'EKS', 'MEDIUM', 'EKS Best Practices', 'Define resource requests for all workloads. Use VPA in recommendation mode to right-size.', true),
  ('00000000-0000-0000-0000-000000002005', 'EKS-005', 'Network policies enforced', 'EKS clusters must have network policies to restrict pod-to-pod communication.', 'EKS', 'MEDIUM', 'EKS Best Practices', 'Install Calico or Cilium. Start with default-deny and add allow rules per service.', true),
  ('00000000-0000-0000-0000-000000003001', 'NET-001', 'VPC Flow Logs enabled', 'VPC Flow Logs must be enabled for all production VPCs.', 'Networking', 'MEDIUM', 'AWS Well-Architected', 'Enable VPC Flow Logs to a dedicated S3 bucket with appropriate retention.', true),
  ('00000000-0000-0000-0000-000000003002', 'NET-002', 'Transit Gateway Flow Logs enabled', 'Transit Gateway Flow Logs must be enabled for network auditability.', 'Networking', 'MEDIUM', 'AWS Well-Architected', 'Enable TGW Flow Logs to a dedicated S3 bucket with 1-year retention.', true),
  ('00000000-0000-0000-0000-000000004001', 'IAM-001', 'Least privilege IAM', 'IAM roles and policies must follow least-privilege principles with no wildcard actions.', 'IAM', 'MEDIUM', 'CIS AWS 1.16', 'Replace wildcard policies with scoped-down permissions. Use IAM Access Analyzer to identify usage.', true),
  ('00000000-0000-0000-0000-000000004002', 'IAM-002', 'No unused IAM roles', 'IAM roles unused for 90+ days should be removed or have permissions reduced.', 'IAM', 'MEDIUM', 'CIS AWS 1.17', 'Remove unused roles or reduce permissions. Document business justification for retained roles.', true),
  ('00000000-0000-0000-0000-000000004003', 'IAM-003', 'Access keys rotated', 'IAM access keys older than 90 days must be rotated.', 'IAM', 'MEDIUM', 'CIS AWS 1.18', 'Rotate access keys. Consider migrating to OIDC-based federation for CI/CD.', true),
  ('00000000-0000-0000-0000-000000004004', 'IAM-004', 'MFA enabled for all users', 'All IAM users with console access must have MFA enabled.', 'IAM', 'LOW', 'CIS AWS 1.2', 'Enroll virtual MFA devices. Enforce MFA via IAM policy conditions.', true),
  ('00000000-0000-0000-0000-000000005001', 'S3-001', 'S3 encryption enabled', 'S3 buckets must use KMS-managed server-side encryption.', 'S3', 'MEDIUM', 'CIS AWS 1.15', 'Enable SSE-KMS with a customer-managed key. Update bucket policy to require KMS encryption.', true),
  ('00000000-0000-0000-0000-000000005002', 'S3-002', 'S3 versioning enabled', 'S3 buckets must have versioning enabled for data protection.', 'S3', 'LOW', 'AWS Well-Architected', 'Enable versioning on the bucket. Consider MFA delete for critical artifacts.', true),
  ('00000000-0000-0000-0000-000000005003', 'S3-003', 'S3 lifecycle policy configured', 'S3 buckets must have lifecycle policies for cost optimization.', 'S3', 'LOW', 'AWS Well-Architected', 'Add lifecycle rules: transition to Glacier after 60 days, expire after 180 days.', true),
  ('00000000-0000-0000-0000-000000006001', 'OBS-001', 'CloudWatch log retention configured', 'CloudWatch log groups must have a defined retention policy.', 'Observability', 'MEDIUM', 'AWS Well-Architected', 'Set appropriate retention policies. Archive old logs to S3 with Glacier transition.', true),
  ('00000000-0000-0000-0000-000000006002', 'OBS-002', 'CloudWatch alarm notifications configured', 'CloudWatch alarms must have SNS notification actions configured.', 'Observability', 'MEDIUM', 'AWS Well-Architected', 'Attach SNS topics with email and Slack/PagerDuty subscriptions to alarm actions.', true),
  ('00000000-0000-0000-0000-000000007001', 'DR-001', 'Critical workloads backed up', 'Critical workloads must have AWS Backup plans configured.', 'Backup', 'HIGH', 'AWS Well-Architected', 'Enroll critical resources in AWS Backup plans with daily snapshots and cross-region copy.', true),
  ('00000000-0000-0000-0000-000000007002', 'DR-002', 'Backup restore tested', 'Backup restore procedures must be validated at least quarterly.', 'Backup', 'CRITICAL', 'AWS Well-Architected', 'Schedule and execute restore tests into isolated VPCs. Document RTO/RPO and establish quarterly cadence.', true),
  ('00000000-0000-0000-0000-000000008001', 'GOV-001', 'Required resource tags', 'Resources must carry required tags: owner, environment, cost-center, data-classification.', 'Governance', 'LOW', 'Internal Governance', 'Apply required tags. Implement tag policies via AWS Organizations and auto-tagging Lambda.', true)
ON CONFLICT (id) DO NOTHING;
