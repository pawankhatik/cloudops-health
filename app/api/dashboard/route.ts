import { NextRequest } from 'next/server';
import { getApiUser, unauthorized, ok, serverError } from '@/lib/api-utils';
import { supabaseServer } from '@/lib/supabase';
import { calculateDashboardMetrics } from '@/lib/services';

export async function GET(req: NextRequest) {
  const user = await getApiUser(req);
  if (!user) return unauthorized();

  try {
    const metrics = await calculateDashboardMetrics(user.organization_id);
    return ok(metrics);
  } catch (e) {
    return serverError('Failed to load dashboard data');
  }
}
