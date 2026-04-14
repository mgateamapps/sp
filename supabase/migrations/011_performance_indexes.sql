-- Composite index for the most common query pattern: filter participants by campaign + status
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_status
  ON campaign_participants(campaign_id, status);

-- Index for filtering assessment_attempts by status (used in all dashboard queries)
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status
  ON assessment_attempts(status);

-- Index for filtering assessment_attempts by participant + status together
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_participant_status
  ON assessment_attempts(campaign_participant_id, status);
