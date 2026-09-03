import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, notFound, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';
import { runAutomation } from '@/lib/services';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data: automation } = await supabaseServer()
    .from('automations')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!automation) return notFound('Automation not found');

  const { data: executions } = await supabaseServer()
    .from('automation_executions')
    .select('*')
    .eq('automation_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return ok({ ...automation, executions: executions || [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { error, data } = await runAutomation(params.id, user);
  if (error) return serverError(error);
  return ok(data);
}
