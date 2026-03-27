-- Migration: Add secure token hashing and opened_at tracking
-- Run this in Supabase SQL Editor after 002_employees_campaigns_participants.sql

-- ============================================================================
-- ADD NEW COLUMNS TO CAMPAIGN_PARTICIPANTS
-- ============================================================================

-- Add token_hash column for secure token storage
-- Raw token is only sent in email, hash is stored in DB
ALTER TABLE campaign_participants 
ADD COLUMN IF NOT EXISTS token_hash TEXT;

-- Add opened_at for tracking when employee first opens the invite
ALTER TABLE campaign_participants 
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;

-- ============================================================================
-- UPDATE STATUS CHECK CONSTRAINT
-- ============================================================================

-- Drop existing constraint and add new one with 'opened' status
ALTER TABLE campaign_participants 
DROP CONSTRAINT IF EXISTS campaign_participants_status_check;

ALTER TABLE campaign_participants 
ADD CONSTRAINT campaign_participants_status_check 
CHECK (status IN ('invited', 'opened', 'started', 'completed'));

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Index for token_hash lookups (used in invite validation)
CREATE INDEX IF NOT EXISTS idx_campaign_participants_token_hash 
ON campaign_participants(token_hash);

-- ============================================================================
-- NOTE: No public RLS policy added
-- Token validation happens server-side through application logic
-- using service role, not direct browser access
-- ============================================================================
