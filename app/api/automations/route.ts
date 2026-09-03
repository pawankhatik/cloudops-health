import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseServer()
    .from('automations')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return serverError('Failed to load automations');
  return ok(data);
}
