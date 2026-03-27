-- Migration: Create scenario_scores and assessment_scores tables
-- Run this in Supabase SQL Editor after 004_assessment_attempts_responses.sql

-- ============================================================================
-- SCENARIO_SCORES TABLE
-- Per-scenario scoring with rubric breakdown
-- ============================================================================
CREATE TABLE IF NOT EXISTS scenario_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  scenario_key TEXT NOT NULL CHECK (scenario_key IN ('summarization', 'email_drafting', 'action_list', 'comparison', 'text_improvement')),
  
  -- Individual criterion scores (0-20 each)
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 20),
  context_score INTEGER NOT NULL CHECK (context_score >= 0 AND context_score <= 20),
  constraints_score INTEGER NOT NULL CHECK (constraints_score >= 0 AND constraints_score <= 20),
  output_format_score INTEGER NOT NULL CHECK (output_format_score >= 0 AND output_format_score <= 20),
  verification_score INTEGER NOT NULL CHECK (verification_score >= 0 AND verification_score <= 20),
  
  -- Aggregated scenario score (0-100, sum of criterion scores)
  scenario_score INTEGER NOT NULL CHECK (scenario_score >= 0 AND scenario_score <= 100),
  
  -- Qualitative feedback (JSONB arrays)
  strengths_json JSONB NOT NULL DEFAULT '[]',
  weaknesses_json JSONB NOT NULL DEFAULT '[]',
  coaching_tips_json JSONB NOT NULL DEFAULT '[]',
  
  -- Text feedback
  improved_prompt TEXT,
  summary_feedback TEXT,
  
  -- Metadata
  rubric_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(attempt_id, scenario_key)
);

-- Enable RLS
ALTER TABLE scenario_scores ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view scores for their organization's campaigns
CREATE POLICY "Admins can view org scenario scores" ON scenario_scores
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
-- ASSESSMENT_SCORES TABLE
-- Overall assessment scoring with aggregated metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessment_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  
  -- Aggregated criterion scores across all scenarios (0-100 each, averaged)
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 100),
  context_score INTEGER NOT NULL CHECK (context_score >= 0 AND context_score <= 100),
  constraints_score INTEGER NOT NULL CHECK (constraints_score >= 0 AND constraints_score <= 100),
  output_format_score INTEGER NOT NULL CHECK (output_format_score >= 0 AND output_format_score <= 100),
  verification_score INTEGER NOT NULL CHECK (verification_score >= 0 AND verification_score <= 100),
  
  -- Final total score (0-100)
  total_score INTEGER NOT NULL CHECK (total_score >= 0 AND total_score <= 100),
  
  -- Score band classification
  score_band TEXT NOT NULL CHECK (score_band IN ('novice', 'developing', 'proficient', 'advanced')),
  
  -- Qualitative feedback (JSONB arrays)
  strengths_json JSONB NOT NULL DEFAULT '[]',
  weaknesses_json JSONB NOT NULL DEFAULT '[]',
  coaching_tips_json JSONB NOT NULL DEFAULT '[]',
  
  -- Text feedback
  summary_feedback TEXT,
  
  -- Metadata
  rubric_version TEXT NOT NULL DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(attempt_id)
);

-- Enable RLS
ALTER TABLE assessment_scores ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can view scores for their organization's campaigns
CREATE POLICY "Admins can view org assessment scores" ON assessment_scores
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
CREATE INDEX IF NOT EXISTS idx_scenario_scores_attempt ON scenario_scores(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_scores_attempt ON assessment_scores(attempt_id);

-- ============================================================================
-- NOTE: No public RLS policies for employee access
-- All employee result viewing goes through server-side token validation
-- ============================================================================
