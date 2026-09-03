import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, notFound, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';
import { updateRemediation } from '@/lib/services';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseServer()
    .from('remediations')
    .select('*, findings!inner(title, severity, finding_id, aws_accounts!inner(organization_id)), users(name)')
    .eq('id', params.id)
    .maybeSingle();

  if (error || !data) return notFound('Remediation not found');
  return ok(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { error, data } = await updateRemediation(params.id, body, user);
  if (error) return serverError(error);
  return ok(data);
}
