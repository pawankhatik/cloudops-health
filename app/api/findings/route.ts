import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const accountId = searchParams.get('account_id');
  const ownerId = searchParams.get('owner_id');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'created_at:desc';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('page_size') || '12');

  let query = supabaseServer()
    .from('findings')
    .select('*, aws_accounts!inner(organization_id, name, environment), users(name)', { count: 'exact' })
    .eq('aws_accounts.organization_id', user.organization_id);

  if (severity && severity !== 'all') {
    const sevMap: Record<string, string> = { Critical: 'CRITICAL', High: 'HIGH', Medium: 'MEDIUM', Low: 'LOW' };
    query = query.eq('severity', sevMap[severity] || severity);
  }
  if (status && status !== 'all') {
    const statusMap: Record<string, string> = {
      'Open': 'OPEN', 'Investigating': 'INVESTIGATING', 'Planned': 'PLANNED',
      'In Progress': 'IN_PROGRESS', 'Validation': 'VALIDATION', 'Resolved': 'RESOLVED',
      'Accepted Risk': 'ACCEPTED_RISK', 'False Positive': 'FALSE_POSITIVE',
    };
    query = query.eq('status', statusMap[status] || status);
  }
  if (category && category !== 'all') query = query.eq('category', category);
  if (accountId && accountId !== 'all') query = query.eq('aws_account_id', accountId);
  if (ownerId && ownerId !== 'all') query = query.eq('owner_id', ownerId);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,finding_id.ilike.%${search}%`);

  const [sortField, sortDir] = sort.split(':');
  const dir = sortDir === 'asc' ? { ascending: true } : { ascending: false };
  query = query.order(sortField, dir);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return serverError('Failed to load findings');

  return ok({
    items: data || [],
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  });
}
