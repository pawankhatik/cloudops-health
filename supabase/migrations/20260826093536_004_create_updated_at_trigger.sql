/*
# CloudOps Health — Auto-update trigger for updated_at columns

## Purpose
Creates a reusable trigger function that automatically updates the `updated_at` column
whenever a row is modified. Applies this trigger to all tables that have an `updated_at` column.

## Tables affected
- organizations
- users
- aws_accounts
- controls
- assessments
- findings
- finding_comments
- remediations
- automations
- automation_executions
- reports
- notifications
*/

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at' AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t);
  END LOOP;
END $$;
