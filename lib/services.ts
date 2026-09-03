import { supabaseServer } from '@/lib/supabase';
import type { DbUser, DbFinding, DbAssessment, DbAwsAccount, DbControl, Severity, FindingStatus } from '@/lib/db-types';

const sb = () => supabaseServer();

// ─── Health Score Calculation ─────────────────────────────────────────────

export async function calculateHealthScores(orgId: string) {
  const { data: accounts } = await sb()
    .from('aws_accounts')
    .select('id')
    .eq('organization_id', orgId);

  if (!accounts || accounts.length === 0) return [];

  const accountIds = accounts.map((a) => a.id);

  const { data: assessments } = await sb()
    .from('assessments')
    .select('aws_account_id, score, status, category')
    .in('aws_account_id', accountIds)
    .eq('status', 'COMPLETED');

  const results: Record<string, { overall: number; categories: Record<string, number> }> = {};

  for (const acc of accounts) {
    const accAssessments = (assessments || []).filter((a) => a.aws_account_id === acc.id);
    if (accAssessments.length === 0) {
      results[acc.id] = { overall: 0, categories: {} };
      continue;
    }
    const byCategory: Record<string, number[]> = {};
    for (const a of accAssessments) {
      if (!byCategory[a.category]) byCategory[a.category] = [];
      byCategory[a.category].push(a.score);
    }
    const categories: Record<string, number> = {};
    for (const [cat, scores] of Object.entries(byCategory)) {
      categories[cat] = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    }
    const overall = Math.round(Object.values(categories).reduce((s, v) => s + v, 0) / Object.keys(categories).length);
    results[acc.id] = { overall, categories };
  }

  return results;
}

export async function calculateDashboardMetrics(orgId: string) {
  const { data: accounts } = await sb()
    .from('aws_accounts')
    .select('id, name, environment, health_score')
    .eq('organization_id', orgId);

  if (!accounts || accounts.length === 0) {
    return {
      overallHealthScore: 0,
      categoryScores: [],
      criticalFindings: 0,
      highFindings: 0,
      openFindings: 0,
      resolvedFindings: 0,
      automationCoverage: 0,
      totalFindings: 0,
      accounts: [],
      riskDistribution: [],
      trends: [],
    };
  }

  const accountIds = accounts.map((a) => a.id);

  // Fetch findings
  const { data: findings } = await sb()
    .from('findings')
    .select('severity, status, category, created_at')
    .in('aws_account_id', accountIds);

  // Fetch assessments for category scores
  const { data: assessments } = await sb()
    .from('assessments')
    .select('aws_account_id, score, category, status, created_at')
    .in('aws_account_id', accountIds)
    .eq('status', 'COMPLETED')
    .order('created_at', { ascending: false });

  // Fetch automations
  const { data: automations } = await sb()
    .from('automations')
    .select('id, status, category');

  // Calculate category scores
  const byCategory: Record<string, number[]> = {};
  for (const a of assessments || []) {
    if (!byCategory[a.category]) byCategory[a.category] = [];
    byCategory[a.category].push(a.score);
  }
  const categoryScores = Object.entries(byCategory).map(([name, scores]) => ({
    name,
    score: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
  }));

  // Overall health score = average of category scores
  const overallHealthScore = categoryScores.length > 0
    ? Math.round(categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length)
    : 0;

  // Finding counts
  const criticalFindings = (findings || []).filter((f) => f.severity === 'CRITICAL').length;
  const highFindings = (findings || []).filter((f) => f.severity === 'HIGH').length;
  const openFindings = (findings || []).filter((f) =>
    ['OPEN', 'INVESTIGATING', 'PLANNED', 'IN_PROGRESS', 'VALIDATION'].includes(f.status)
  ).length;
  const resolvedFindings = (findings || []).filter((f) => f.status === 'RESOLVED').length;

  // Risk distribution
  const riskDistribution = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Severity[]).map((sev) => ({
    name: sev.charAt(0) + sev.slice(1).toLowerCase(),
    value: (findings || []).filter((f) => f.severity === sev).length,
    severity: sev,
  }));

  // Automation coverage
  const totalAutomations = automations?.length || 0;
  const activeAutomations = (automations || []).filter((a) => a.status === 'ACTIVE').length;
  const automationCoverage = totalAutomations > 0
    ? Math.round((activeAutomations / totalAutomations) * 100)
    : 0;

  // Build trends from assessment created_at (monthly aggregation)
  const monthMap: Record<string, { scores: number[] }> = {};
  for (const a of assessments || []) {
    const month = a.created_at?.substring(0, 7);
    if (!month) continue;
    if (!monthMap[month]) monthMap[month] = { scores: [] };
    monthMap[month].scores.push(a.score);
  }
  const trends = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      score: Math.round(data.scores.reduce((s, v) => s + v, 0) / data.scores.length),
    }));

  return {
    overallHealthScore,
    categoryScores,
    criticalFindings,
    highFindings,
    openFindings,
    resolvedFindings,
    automationCoverage,
    totalFindings: findings?.length || 0,
    accounts: accounts.map((a) => ({ id: a.id, name: a.name, environment: a.environment, healthScore: a.health_score })),
    riskDistribution,
    trends,
  };
}

// ─── Audit Logging ──────────────────────────────────────────────────────────

export async function createAuditLog(params: {
  organizationId: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const { error } = await sb().from('audit_logs').insert({
    organization_id: params.organizationId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    previous_value: params.previousValue ?? null,
    new_value: params.newValue ?? null,
    metadata: params.metadata ?? null,
  });
  if (error) console.error('Failed to create audit log:', error.message);
}

// ─── Finding Operations ──────────────────────────────────────────────────────

export async function updateFinding(
  findingId: string,
  updates: Partial<DbFinding>,
  user: DbUser,
  auditFields: { action: string; field: string; previousValue: string | null; newValue: string | null }
) {
  const { data: existing } = await sb()
    .from('findings')
    .select('*')
    .eq('id', findingId)
    .maybeSingle();

  if (!existing) return { error: 'Finding not found', data: null };

  const { data, error } = await sb()
    .from('findings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      ...(updates.status === 'RESOLVED' ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq('id', findingId)
    .select('*')
    .maybeSingle();

  if (error) return { error: error.message, data: null };

  await createAuditLog({
    organizationId: user.organization_id,
    userId: user.id,
    action: auditFields.action,
    entityType: 'FINDING',
    entityId: (existing as DbFinding).finding_id,
    previousValue: auditFields.previousValue,
    newValue: auditFields.newValue,
  });

  return { error: null, data: data as DbFinding };
}

export async function addComment(findingId: string, userId: string, comment: string, orgId: string) {
  const { data, error } = await sb()
    .from('finding_comments')
    .insert({
      finding_id: findingId,
      user_id: userId,
      comment,
    })
    .select('*')
    .maybeSingle();

  if (error) return { error: error.message, data: null };

  await createAuditLog({
    organizationId: orgId,
    userId,
    action: 'COMMENT_ADDED',
    entityType: 'FINDING',
    entityId: findingId,
    newValue: comment.substring(0, 200),
  });

  return { error: null, data };
}

// ─── Remediation Operations ──────────────────────────────────────────────────

export async function createRemediation(params: {
  findingId: string;
  ownerId: string;
  title: string;
  description?: string;
  dueDate?: string;
  orgId: string;
  userId: string;
}) {
  const { data, error } = await sb()
    .from('remediations')
    .insert({
      finding_id: params.findingId,
      owner_id: params.ownerId,
      title: params.title,
      description: params.description || null,
      due_date: params.dueDate || null,
      status: 'BACKLOG',
      progress: 0,
    })
    .select('*')
    .maybeSingle();

  if (error) return { error: error.message, data: null };

  await createAuditLog({
    organizationId: params.orgId,
    userId: params.userId,
    action: 'REMEDIATION_CREATED',
    entityType: 'REMEDIATION',
    entityId: data.id,
    newValue: params.title,
  });

  return { error: null, data };
}

export async function updateRemediation(
  remediationId: string,
  updates: { status?: string; progress?: number; due_date?: string; owner_id?: string },
  user: DbUser
) {
  const { data: existing } = await sb()
    .from('remediations')
    .select('*')
    .eq('id', remediationId)
    .maybeSingle();

  if (!existing) return { error: 'Remediation not found', data: null };

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.progress !== undefined) updateData.progress = updates.progress;
  if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
  if (updates.owner_id !== undefined) updateData.owner_id = updates.owner_id;
  if (updates.status === 'RESOLVED') updateData.completed_at = new Date().toISOString();

  const { data, error } = await sb()
    .from('remediations')
    .update(updateData)
    .eq('id', remediationId)
    .select('*')
    .maybeSingle();

  if (error) return { error: error.message, data: null };

  await createAuditLog({
    organizationId: user.organization_id,
    userId: user.id,
    action: 'REMEDIATION_UPDATED',
    entityType: 'REMEDIATION',
    entityId: remediationId,
    previousValue: JSON.stringify({ status: (existing as { status: string }).status, progress: (existing as { progress: number }).progress }),
    newValue: JSON.stringify(updates),
  });

  return { error: null, data };
}

// ─── Assessment Operations ───────────────────────────────────────────────────

export async function createAssessment(params: {
  awsAccountId: string;
  name: string;
  category: string;
  createdBy: string;
  orgId: string;
}) {
  const { data, error } = await sb()
    .from('assessments')
    .insert({
      aws_account_id: params.awsAccountId,
      name: params.name,
      category: params.category,
      status: 'RUNNING',
      started_at: new Date().toISOString(),
      created_by: params.createdBy,
    })
    .select('*')
    .maybeSingle();

  if (error) return { error: error.message, data: null };

  await createAuditLog({
    organizationId: params.orgId,
    userId: params.createdBy,
    action: 'ASSESSMENT_CREATED',
    entityType: 'ASSESSMENT',
    entityId: data.id,
    newValue: params.name,
  });

  return { error: null, data };
}

// ─── Automation Simulation ───────────────────────────────────────────────────

export async function runAutomation(automationId: string, user: DbUser) {
  const { data: automation } = await sb()
    .from('automations')
    .select('*')
    .eq('id', automationId)
    .maybeSingle();

  if (!automation) return { error: 'Automation not found' };

  // Create execution record as QUEUED
  const { data: execution, error: execError } = await sb()
    .from('automation_executions')
    .insert({
      automation_id: automationId,
      status: 'QUEUED',
      started_at: new Date().toISOString(),
      findings_generated: 0,
    })
    .select('*')
    .maybeSingle();

  if (execError) return { error: execError.message };

  // Simulate: update to RUNNING
  await sb().from('automation_executions').update({ status: 'RUNNING' }).eq('id', execution.id);

  // Simulate: update to COMPLETED with mock results
  const mockFindings = Math.floor(Math.random() * 3);
  const mockOutput = `Scanned resources across all connected accounts. Found ${mockFindings} new ${mockFindings === 1 ? 'finding' : 'findings'}.`;

  await sb().from('automation_executions').update({
    status: 'COMPLETED',
    completed_at: new Date().toISOString(),
    findings_generated: mockFindings,
    output: mockOutput,
  }).eq('id', execution.id);

  // Update automation's last_execution_at
  await sb().from('automations').update({
    last_execution_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', automationId);

  await createAuditLog({
    organizationId: user.organization_id,
    userId: user.id,
    action: 'AUTOMATION_EXECUTED',
    entityType: 'AUTOMATION',
    entityId: automation.name,
    newValue: mockOutput,
  });

  return { error: null, data: { executionId: execution.id, findingsGenerated: mockFindings } };
}

// ─── Report Generation ──────────────────────────────────────────────────────

export async function generateReport(orgId: string, userId: string, reportName: string) {
  const metrics = await calculateDashboardMetrics(orgId);

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { data, error } = await sb()
    .from('reports')
    .insert({
      organization_id: orgId,
      name: reportName,
      report_type: 'MONTHLY',
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      status: 'GENERATED',
      created_by: userId,
    })
    .select('*')
    .maybeSingle();

  if (error) return { error: error.message, data: null };

  await createAuditLog({
    organizationId: orgId,
    userId,
    action: 'REPORT_GENERATED',
    entityType: 'REPORT',
    entityId: reportName,
  });

  return { error: null, data: { report: data, metrics } };
}
