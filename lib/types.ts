// Core domain types for CloudOps Health

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type Environment = 'Production' | 'Staging' | 'Development' | 'Test';
export type FindingStatus =
  | 'Open'
  | 'Investigating'
  | 'Planned'
  | 'In Progress'
  | 'Resolved'
  | 'Accepted Risk'
  | 'False Positive';
export type AssessmentStatus = 'Scheduled' | 'Running' | 'Completed' | 'Failed';
export type ControlResult = 'Pass' | 'Fail' | 'Warning';
export type BusinessImpact =
  | 'Availability Risk'
  | 'Security Risk'
  | 'Compliance Risk'
  | 'Data Risk'
  | 'Operational Risk'
  | 'Financial Risk';
export type RemediationStage =
  | 'Backlog'
  | 'Planned'
  | 'In Progress'
  | 'Validation'
  | 'Resolved';
export type AutomationStatus = 'Active' | 'Planned' | 'Disabled';
export type Role =
  | 'Super Admin'
  | 'Platform Admin'
  | 'DevOps Engineer'
  | 'Security Engineer'
  | 'Viewer';

export type Category =
  | 'Reliability'
  | 'Security'
  | 'EKS'
  | 'Networking'
  | 'IAM'
  | 'S3'
  | 'Compute'
  | 'Database'
  | 'Observability'
  | 'Backup'
  | 'Governance'
  | 'Automation';

export interface Organization {
  id: string;
  name: string;
  defaultRegion: string;
  defaultEnvironment: Environment;
}

export interface AwsAccount {
  id: string;
  name: string;
  accountId: string;
  environment: Environment;
  regions: string[];
  healthScore: number;
  lastAssessment: string;
  findingsCount: number;
  resourcesCount: number;
  status: 'Connected' | 'Disconnected' | 'Pending';
  owner: string;
}

export interface AssessmentControl {
  controlId: string;
  name: string;
  result: ControlResult;
  severity: Severity | null;
  description: string;
  whyItMatters: string;
  evidence: string;
  recommendation: string;
  findingId?: string;
}

export interface Assessment {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  environment: Environment;
  category: Category;
  score: number;
  findingsCount: number;
  startedAt: string;
  completedAt: string;
  status: AssessmentStatus;
  controls: AssessmentControl[];
}

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  accountId: string;
  accountName: string;
  environment: Environment;
  resource: string;
  owner: string;
  status: FindingStatus;
  dueDate: string;
  createdAt: string;
  description: string;
  businessRisk: string;
  businessImpact: BusinessImpact;
  evidence: string;
  recommendation: string;
  remediationStage?: RemediationStage;
  remediationProgress?: number;
  comments: FindingComment[];
}

export interface FindingComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Control {
  id: string;
  name: string;
  category: Category;
  description: string;
  severity: Severity | null;
  framework: string;
  status: 'Active' | 'Draft' | 'Deprecated';
}

export interface Remediation {
  findingId: string;
  findingTitle: string;
  owner: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  dueDate: string;
  stage: RemediationStage;
  progress: number;
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  category: Category;
  status: AutomationStatus;
  schedule: string;
  lastRun?: string;
  findingsGenerated: number;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  automationName: string;
  status: 'Started' | 'Running' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
  findingsGenerated: number;
}

export interface Report {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  healthScore: number;
  previousHealthScore: number;
  findingsResolved: number;
  highPriorityRemaining: number;
  automationsIdentified: number;
  summary: string;
}

export interface AuditLogEntry {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'info' | 'warning' | 'success';
  timestamp: string;
  read: boolean;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'finding_created'
    | 'finding_assigned'
    | 'finding_resolved'
    | 'assessment_completed'
    | 'control_failed'
    | 'automation_executed'
    | 'report_generated';
  description: string;
  timestamp: string;
  user: string;
}

export interface HealthCategory {
  name: string;
  score: number;
}

export interface HealthTrendPoint {
  month: string;
  score: number;
  reliability: number;
  security: number;
  governance: number;
  observability: number;
  backup: number;
  automation: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}
