import { createAdminClient } from '@/lib/supabase/admin';
import type { ScenarioKey, ScoreBand } from '@/types';

export interface ScenarioScoreRecord {
  id: string;
  attempt_id: string;
  scenario_key: ScenarioKey;
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  scenario_score: number;
  strengths_json: string[];
  weaknesses_json: string[];
  coaching_tips_json: string[];
  improved_prompt: string | null;
  summary_feedback: string | null;
  rubric_version: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentScoreRecord {
  id: string;
  attempt_id: string;
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  total_score: number;
  score_band: ScoreBand;
  strengths_json: string[];
  weaknesses_json: string[];
  coaching_tips_json: string[];
  summary_feedback: string | null;
  rubric_version: string;
  created_at: string;
  updated_at: string;
}

export interface FullAssessmentResult {
  assessment_score: AssessmentScoreRecord;
  scenario_scores: ScenarioScoreRecord[];
  responses: Array<{
    scenario_key: ScenarioKey;
    response_text: string;
  }>;
}

export async function getAssessmentScoreByAttemptId(
  attemptId: string
): Promise<AssessmentScoreRecord | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('assessment_scores')
    .select('*')
    .eq('attempt_id', attemptId)
    .single();

  if (error || !data) return null;

  return data as AssessmentScoreRecord;
}

export async function getScenarioScoresByAttemptId(
  attemptId: string
): Promise<ScenarioScoreRecord[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('scenario_scores')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data as ScenarioScoreRecord[];
}

export async function getFullAssessmentResult(
  attemptId: string
): Promise<FullAssessmentResult | null> {
  const supabase = createAdminClient();

  const { data: assessmentScore, error: scoreError } = await supabase
    .from('assessment_scores')
    .select('*')
    .eq('attempt_id', attemptId)
    .single();

  if (scoreError || !assessmentScore) return null;

  const { data: scenarioScores } = await supabase
    .from('scenario_scores')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('created_at', { ascending: true });

  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('scenario_key, response_text')
    .eq('attempt_id', attemptId);

  return {
    assessment_score: assessmentScore as AssessmentScoreRecord,
    scenario_scores: (scenarioScores || []) as ScenarioScoreRecord[],
    responses: (responses || []) as Array<{
      scenario_key: ScenarioKey;
      response_text: string;
    }>,
  };
}

export async function getAssessmentScoreByParticipantId(
  participantId: string
): Promise<AssessmentScoreRecord | null> {
  const supabase = createAdminClient();

  const { data: attempt } = await supabase
    .from('assessment_attempts')
    .select('id')
    .eq('campaign_participant_id', participantId)
    .single();

  if (!attempt) return null;

  return getAssessmentScoreByAttemptId(attempt.id);
}

export async function getFullAssessmentResultByParticipantId(
  participantId: string
): Promise<FullAssessmentResult | null> {
  const supabase = createAdminClient();

  const { data: attempt } = await supabase
    .from('assessment_attempts')
    .select('id')
    .eq('campaign_participant_id', participantId)
    .single();

  if (!attempt) return null;

  return getFullAssessmentResult(attempt.id);
}
