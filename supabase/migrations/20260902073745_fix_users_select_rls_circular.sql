/*
# Fix circular RLS policy on users table

## Problem
The existing `users_select_own_org` SELECT policy on `public.users` contains
a self-referential subquery against the same `users` table:

  organization_id = (
    SELECT u.organization_id FROM users u WHERE u.id = auth.uid()
  )

This creates a circular dependency: to read any row from `users`, the policy
must first read `users` to resolve the subquery, but that inner read is also
gated by the same RLS policy. As a result, even an authenticated user querying
their own row gets a database error instead of data.

## Changes
1. Drop the circular `users_select_own_org` SELECT policy.
2. Create a new SELECT policy `users_select_own` that allows an authenticated
   user to read only their own row using `USING (id = auth.uid())`.

## Security
- RLS remains enabled on `public.users` — it is NOT disabled.
- The table is NOT made publicly readable; only the authenticated user's own
  row is accessible.
- INSERT and UPDATE policies on `users` are unchanged.

## Notes
1. This migration is idempotent — the DROP uses IF EXISTS.
2. No data is modified or deleted.
3. No other tables are touched.
*/

-- Drop the circular SELECT policy
DROP POLICY IF EXISTS "users_select_own_org" ON public.users;

-- Create a simple self-lookup SELECT policy
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
TO authenticated
USING (id = auth.uid());