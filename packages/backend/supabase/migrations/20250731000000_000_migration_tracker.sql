-- Migration: 000_migration_tracker.sql
-- Description: Migration tracking table for version control
-- Created: 2025-07-30
-- Create migration tracking table
CREATE TABLE IF NOT EXISTS public.migrations (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64) NOT NULL,
  execution_time_ms INTEGER
);


-- Insert this migration as applied
INSERT INTO
  public.migrations (migration_name, checksum, execution_time_ms)
VALUES
  ('000_migration_tracker', 'initial', 0)
ON CONFLICT (migration_name) DO NOTHING;
