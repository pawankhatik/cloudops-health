import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, notFound, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data: account } = await supabaseServer()
    .from('aws_accounts')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', user.organization_id)
    .maybeSingle();

  if (!account) return notFound('Account not found');

  const { data: regions } = await supabaseServer()
    .from('aws_regions')
    .select('*')
    .eq('aws_account_id', params.id);

  const { data: assessments } = await supabaseServer()
    .from('assessments')
    .select('*')
    .eq('aws_account_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: findings } = await supabaseServer()
    .from('findings')
    .select('*')
    .eq('aws_account_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return ok({ ...account, regions: regions || [], assessments: assessments || [], findings: findings || [] });
}
