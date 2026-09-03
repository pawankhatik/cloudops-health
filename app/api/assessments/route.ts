import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('account_id');
  const status = searchParams.get('status');
  const category = searchParams.get('category');

  let query = supabaseServer()
    .from('assessments')
    .select('*, aws_accounts!inner(name, environment, organization_id)')
    .eq('aws_accounts.organization_id', user.organization_id)
    .order('created_at', { ascending: false });

  if (accountId && accountId !== 'all') query = query.eq('aws_account_id', accountId);
  if (status && status !== 'all') query = query.eq('status', status);
  if (category && category !== 'all') query = query.eq('category', category);

  const { data, error } = await query;
  if (error) return serverError('Failed to load assessments');
  return ok(data);
}

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { aws_account_id, name, category } = body;

  if (!aws_account_id || !name || !category) {
    return serverError('Missing required fields');
  }

  const { createAssessment } = await import('@/lib/services');
  const { data, error } = await createAssessment({
    awsAccountId: aws_account_id,
    name,
    category,
    createdBy: user.id,
    orgId: user.organization_id,
  });

  if (error) return serverError(error);
  return ok(data);
}
