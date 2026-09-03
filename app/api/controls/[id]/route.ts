import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, notFound, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseServer()
    .from('controls')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !data) return notFound('Control not found');

  const { data: assessmentControls } = await supabaseServer()
    .from('assessment_controls')
    .select('*, assessments(name, status, created_at)')
    .eq('control_id', params.id)
    .order('evaluated_at', { ascending: false })
    .limit(20);

  return ok({ ...data, assessmentControls: assessmentControls || [] });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.enabled !== undefined) updates.enabled = body.enabled;
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.remediation_guidance !== undefined) updates.remediation_guidance = body.remediation_guidance;

  const { data, error } = await supabaseServer()
    .from('controls')
    .update(updates)
    .eq('id', params.id)
    .select('*')
    .maybeSingle();

  if (error) return serverError(error.message);

  const { createAuditLog } = await import('@/lib/services');
  await createAuditLog({
    organizationId: user.organization_id,
    userId: user.id,
    action: 'CONTROL_UPDATED',
    entityType: 'CONTROL',
    entityId: params.id,
    newValue: JSON.stringify(updates),
  });

  return ok(data);
}
