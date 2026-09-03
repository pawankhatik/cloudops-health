import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query = supabaseServer()
    .from('remediations')
    .select('*, findings!inner(title, severity, finding_id, aws_accounts!inner(organization_id)), users(name)')
    .eq('findings.aws_accounts.organization_id', user.organization_id)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return serverError('Failed to load remediations');
  return ok(data);
}
