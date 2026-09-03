import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase';
import { createAuditLog } from '@/lib/services';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Fetch app user to get org_id and name
  const { data: appUser } = await supabaseServer()
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (appUser) {
    await createAuditLog({
      organizationId: appUser.organization_id,
      userId: appUser.id,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: email,
    });
  }

  return NextResponse.json({
    session: data.session,
    user: appUser,
  });
}
