export type Role = 'SUPER_ADMIN' | 'PLATFORM_ADMIN' | 'DEVOPS_ENGINEER' | 'SECURITY_ENGINEER' | 'VIEWER';

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type FindingStatus = 'OPEN' | 'INVESTIGATING' | 'PLANNED' | 'IN_PROGRESS' | 'VALIDATION' | 'RESOLVED' | 'ACCEPTED_RISK' | 'FALSE_POSITIVE';
export type AssessmentStatus = 'SCHEDULED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type ControlStatus = 'PASS' | 'FAIL' | 'WARNING' | 'NOT_APPLICABLE' | 'ERROR';
export type RemediationStatus = 'BACKLOG' | 'PLANNED' | 'IN_PROGRESS' | 'VALIDATION' | 'RESOLVED';
export type AutomationStatus = 'ACTIVE' | 'PLANNED' | 'DISABLED';
export type ExecutionStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface DbUser {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrganization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface DbAwsAccount {
  id: string;
  organization_id: string;
  name: string;
  account_id: string;
  environment: string;
  status: string;
  primary_region: string;
  health_score: number;
  last_assessment_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAwsRegion {
  id: string;
  aws_account_id: string;
  region_name: string;
  enabled: boolean;
  created_at: string;
}

export interface DbControl {
  id: string;
  control_id: string;
  name: string;
  description: string;
  category: string;
  severity: Severity | null;
  framework: string;
  remediation_guidance: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAssessment {
  id: string;
  aws_account_id: string;
  name: string;
  category: string;
  status: AssessmentStatus;
  score: number;
  started_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAssessmentControl {
  id: string;
  assessment_id: string;
  control_id: string;
  status: ControlStatus;
  score: number;
  evidence: string | null;
  notes: string | null;
  evaluated_at: string;
}

export interface DbFinding {
  id: string;
  finding_id: string;
  aws_account_id: string;
  assessment_id: string | null;
  control_id: string | null;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  resource_type: string;
  resource_id: string;
  region: string | null;
  evidence: string | null;
  business_risk: string | null;
  recommendation: string | null;
  owner_id: string | null;
  status: FindingStatus;
  due_date: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbFindingComment {
  id: string;
  finding_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface DbRemediation {
  id: string;
  finding_id: string;
  owner_id: string | null;
  title: string;
  description: string | null;
  status: RemediationStatus;
  progress: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAutomation {
  id: string;
  name: string;
  description: string;
  category: string;
  status: AutomationStatus;
  last_execution_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAutomationExecution {
  id: string;
  automation_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at: string | null;
  findings_generated: number;
  output: string | null;
  created_at: string;
}

export interface DbReport {
  id: string;
  organization_id: string;
  name: string;
  report_type: string;
  period_start: string;
  period_end: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  previous_value: string | null;
  new_value: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
