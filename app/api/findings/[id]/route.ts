import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, notFound, serverError, badRequest } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';
import { updateFinding, addComment, createRemediation } from '@/lib/services';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data: finding } = await supabaseServer()
    .from('findings')
    .select('*, aws_accounts!inner(organization_id, name, environment), users(name, email)')
    .eq('id', params.id)
    .eq('aws_accounts.organization_id', user.organization_id)
    .maybeSingle();

  if (!finding) return notFound('Finding not found');

  const { data: comments } = await supabaseServer()
    .from('finding_comments')
    .select('*, users(name)')
    .eq('finding_id', params.id)
    .order('created_at', { ascending: true });

  const { data: remediations } = await supabaseServer()
    .from('remediations')
    .select('*, users(name)')
    .eq('finding_id', params.id)
    .order('created_at', { ascending: true });

  const { data: auditLogs } = await supabaseServer()
    .from('audit_logs')
    .select('*')
    .eq('entity_type', 'FINDING')
    .eq('entity_id', finding.finding_id)
    .order('created_at', { ascending: false })
    .limit(20);

  return ok({
    ...finding,
    comments: comments || [],
    remediations: remediations || [],
    auditLogs: auditLogs || [],
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.status !== undefined) {
    updates.status = body.status;
  }
  if (body.severity !== undefined) {
    updates.severity = body.severity;
  }
  if (body.owner_id !== undefined) {
    updates.owner_id = body.owner_id;
  }
  if (body.due_date !== undefined) {
    updates.due_date = body.due_date;
  }

  if (Object.keys(updates).length === 0) return badRequest('No fields to update');

  const { data: existing } = await supabaseServer()
    .from('findings')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!existing) return notFound('Finding not found');

  const { data, error } = await supabaseServer()
    .from('findings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      ...(body.status === 'RESOLVED' ? { resolved_at: new Date().toISOString() } : {}),
    })
    .eq('id', params.id)
    .select('*')
    .maybeSingle();

  if (error) return serverError(error.message);

  // Create audit logs for each changed field
  for (const [field, newVal] of Object.entries(updates)) {
    const prevVal = (existing as Record<string, unknown>)[field] as string | null;
    if (prevVal !== newVal) {
      const actionMap: Record<string, string> = {
        status: 'STATUS_CHANGED',
        severity: 'SEVERITY_CHANGED',
        owner_id: 'ASSIGNED',
        due_date: 'DUE_DATE_CHANGED',
      };
      const { createAuditLog } = await import('@/lib/services');
      await createAuditLog({
        organizationId: user.organization_id,
        userId: user.id,
        action: actionMap[field] || 'FIELD_CHANGED',
        entityType: 'FINDING',
        entityId: (existing as { finding_id: string }).finding_id,
        previousValue: prevVal ? String(prevVal) : null,
        newValue: String(newVal),
      });
    }
  }

  return ok(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();

  if (body.action === 'comment') {
    const { error, data } = await addComment(params.id, user.id, body.comment, user.organization_id);
    if (error) return serverError(error);
    return ok(data);
  }

  if (body.action === 'create_reediation') {
    const { error, data } = await createRemediation({
      findingId: params.id,
      ownerId: body.owner_id || user.id,
      title: body.title,
      description: body.description,
      dueDate: body.due_date,
      orgId: user.organization_id,
      userId: user.id,
    });
    if (error) return serverError(error);
    return ok(data);
  }

  return badRequest('Unknown action');
}
