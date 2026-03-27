-- Migration: Create employees, campaigns, and campaign_participants tables
-- Run this in Supabase SQL Editor after 001_organizations_admin_profiles.sql

-- ============================================================================
-- EMPLOYEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, email)
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can only see employees in their organization
CREATE POLICY "Users can view own org employees" ON employees
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own org employees" ON employees
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own org employees" ON employees
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can only see campaigns in their organization
CREATE POLICY "Users can view own org campaigns" ON campaigns
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own org campaigns" ON campaigns
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own org campaigns" ON campaigns
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- CAMPAIGN_PARTICIPANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaign_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'started', 'completed')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(campaign_id, employee_id)
);

-- Enable RLS
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can see participants for campaigns in their organization
CREATE POLICY "Users can view own org participants" ON campaign_participants
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (
        SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert own org participants" ON campaign_participants
  FOR INSERT WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (
        SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own org participants" ON campaign_participants
  FOR UPDATE USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE organization_id IN (
        SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_employees_organization ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_employee ON campaign_participants(employee_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_token ON campaign_participants(token);
