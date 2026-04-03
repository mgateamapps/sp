-- Migration: Align assessment_scores.score_band constraint with app enums
-- The app uses: at_risk, basic, functional, strong, expert

ALTER TABLE assessment_scores
DROP CONSTRAINT IF EXISTS assessment_scores_score_band_check;

ALTER TABLE assessment_scores
ADD CONSTRAINT assessment_scores_score_band_check
CHECK (score_band IN ('at_risk', 'basic', 'functional', 'strong', 'expert'));

