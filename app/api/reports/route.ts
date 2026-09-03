import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { data, error } = await supabaseServer()
    .from('reports')
    .select('*')
    .eq('organization_id', user.organization_id)
    .order('created_at', { ascending: false });

  if (error) return serverError('Failed to load reports');
  return ok(data);
}

export async function POST(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const name = body.name || `Monthly Report — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;

  const { generateReport } = await import('@/lib/services');
  const { error, data } = await generateReport(user.organization_id, user.id, name);
  if (error) return serverError(error);
  return ok(data);
}
