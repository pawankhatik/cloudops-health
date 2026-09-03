import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, notFound, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data: assessment } = await supabaseServer()
    .from('assessments')
    .select('*, aws_accounts!inner(name, environment, organization_id)')
    .eq('id', params.id)
    .eq('aws_accounts.organization_id', user.organization_id)
    .maybeSingle();

  if (!assessment) return notFound('Assessment not found');

  const { data: controls } = await supabaseServer()
    .from('assessment_controls')
    .select('*, controls(*)')
    .eq('assessment_id', params.id);

  const { data: findings } = await supabaseServer()
    .from('findings')
    .select('*')
    .eq('assessment_id', params.id);

  return ok({ ...assessment, assessment_controls: controls || [], findings: findings || [] });
}
