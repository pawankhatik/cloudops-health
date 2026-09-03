import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseServer()
    .from('audit_logs')
    .select('*, users(name)')
    .eq('organization_id', user.organization_id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return serverError('Failed to load audit logs');
  return ok(data);
}
