-- Migration: Create assessment_attempts and assessment_responses tables
-- Run this in Supabase SQL Editor after 003_invite_tokens.sql

-- ============================================================================
-- ASSESSMENT_ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_participant_id UUID NOT NULL REFERENCES campaign_participants(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'scored', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  scored_at TIMESTAMPTZ,
  UNIQUE(campaign_participant_id)
);

-- Enable RLS
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view attempts for their organization's campaigns
CREATE POLICY "Admins can view org attempts" ON assessment_attempts
  FOR SELECT USING (
    campaign_participant_id IN (
      SELECT cp.id FROM campaign_participants cp
      JOIN campaigns c ON cp.campaign_id = c.id
      WHERE c.organization_id IN (
        SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- ASSESSMENT_RESPONSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  scenario_key TEXT NOT NULL CHECK (scenario_key IN ('summarization', 'email_drafting', 'action_list', 'comparison', 'text_improvement')),
  response_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attempt_id, scenario_key)
);

-- Enable RLS
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view responses for their organization's campaigns
CREATE POLICY "Admins can view org responses" ON assessment_responses
  FOR SELECT USING (
    attempt_id IN (
      SELECT aa.id FROM assessment_attempts aa
      JOIN campaign_participants cp ON aa.campaign_participant_id = cp.id
      JOIN campaigns c ON cp.campaign_id = c.id
      WHERE c.organization_id IN (
        SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_participant ON assessment_attempts(campaign_participant_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_attempt ON assessment_responses(attempt_id);

-- ============================================================================
-- NOTE: No public RLS policies for employee access
-- All employee operations go through server-side actions with service role
-- ============================================================================
