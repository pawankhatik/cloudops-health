import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseServer()
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return serverError('Failed to load notifications');
  return ok(data);
}

export async function PATCH(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { id, read } = body;

  const { data, error } = await supabaseServer()
    .from('notifications')
    .update({ read })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle();

  if (error) return serverError(error.message);
  return ok(data);
}
