/*
# CloudOps Health — Core Schema (Part 1: Organizations, Users, AWS Accounts, Regions)

## Purpose
Creates the foundational tables for the CloudOps Health platform.

## Tables Created
1. organizations — Top-level tenant entity
2. users — Application users linked to auth.users
3. aws_accounts — AWS account metadata only, NO credentials
4. aws_regions — Regions enabled per AWS account

## Security
- RLS enabled on all tables
- Policies added after all tables exist to avoid circular references

## Notes
- Uses gen_random_uuid() for primary keys
- All foreign keys use ON DELETE CASCADE for child tables
*/

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users (application users, linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN', 'DEVOPS_ENGINEER', 'SECURITY_ENGINEER', 'VIEWER')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED', 'PENDING')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- AWS Accounts (metadata only — NO credentials)
CREATE TABLE IF NOT EXISTS aws_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  account_id text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('Production', 'Staging', 'Development', 'Test')),
  status text NOT NULL DEFAULT 'Connected' CHECK (status IN ('Connected', 'Disconnected', 'Pending')),
  primary_region text NOT NULL DEFAULT 'us-east-1',
  health_score integer NOT NULL DEFAULT 0,
  last_assessment_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aws_accounts_organization_id ON aws_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_aws_accounts_environment ON aws_accounts(environment);
CREATE INDEX IF NOT EXISTS idx_aws_accounts_status ON aws_accounts(status);

-- AWS Regions
CREATE TABLE IF NOT EXISTS aws_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aws_account_id uuid NOT NULL REFERENCES aws_accounts(id) ON DELETE CASCADE,
  region_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aws_regions_account_id ON aws_regions(aws_account_id);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE aws_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aws_regions ENABLE ROW LEVEL SECURITY;

-- Organizations policies
DROP POLICY IF EXISTS "org_select_authenticated" ON organizations;
CREATE POLICY "org_select_authenticated" ON organizations
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "org_update_admin" ON organizations;
CREATE POLICY "org_update_admin" ON organizations
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

-- Users policies
DROP POLICY IF EXISTS "users_select_own_org" ON users;
CREATE POLICY "users_select_own_org" ON users
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM users u WHERE u.id = auth.uid()));

DROP POLICY IF EXISTS "users_insert_admin" ON users;
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')));

-- AWS Accounts policies
DROP POLICY IF EXISTS "aws_accounts_select_own_org" ON aws_accounts;
CREATE POLICY "aws_accounts_select_own_org" ON aws_accounts
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid()));

DROP POLICY IF EXISTS "aws_accounts_insert_admin" ON aws_accounts;
CREATE POLICY "aws_accounts_insert_admin" ON aws_accounts
  FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN'))
  );

DROP POLICY IF EXISTS "aws_accounts_update_admin" ON aws_accounts;
CREATE POLICY "aws_accounts_update_admin" ON aws_accounts
  FOR UPDATE TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN'))
  )
  WITH CHECK (
    organization_id = (SELECT organization_id FROM users WHERE users.id = auth.uid())
    AND EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN'))
  );

-- AWS Regions policies
DROP POLICY IF EXISTS "aws_regions_select_own_org" ON aws_regions;
CREATE POLICY "aws_regions_select_own_org" ON aws_regions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = aws_regions.aws_account_id AND u.id = auth.uid()
  ));

DROP POLICY IF EXISTS "aws_regions_insert_admin" ON aws_regions;
CREATE POLICY "aws_regions_insert_admin" ON aws_regions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = aws_regions.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')
  ));

DROP POLICY IF EXISTS "aws_regions_update_admin" ON aws_regions;
CREATE POLICY "aws_regions_update_admin" ON aws_regions
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = aws_regions.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = aws_regions.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')
  ));

DROP POLICY IF EXISTS "aws_regions_delete_admin" ON aws_regions;
CREATE POLICY "aws_regions_delete_admin" ON aws_regions
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM aws_accounts a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = aws_regions.aws_account_id AND u.id = auth.uid()
    AND u.role IN ('SUPER_ADMIN', 'PLATFORM_ADMIN')
  ));
