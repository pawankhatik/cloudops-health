import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const severity = searchParams.get('severity');
  const enabled = searchParams.get('enabled');

  let query = supabaseServer()
    .from('controls')
    .select('*')
    .order('category', { ascending: true })
    .order('control_id', { ascending: true });

  if (category && category !== 'all') query = query.eq('category', category);
  if (severity && severity !== 'all') query = query.eq('severity', severity);
  if (enabled !== null && enabled !== undefined && enabled !== 'all') {
    query = query.eq('enabled', enabled === 'true');
  }

  const { data, error } = await query;
  if (error) return serverError('Failed to load controls');
  return ok(data);
}
