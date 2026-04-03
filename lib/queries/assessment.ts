import { createAdminClient } from '@/lib/supabase/admin';
import type { AssessmentAttempt, AssessmentResponse, ScenarioKey } from '@/types';

export interface AttemptWithResponses extends AssessmentAttempt {
  responses: Record<ScenarioKey, string>;
}

export async function getAttemptByParticipantId(
  participantId: string
): Promise<AssessmentAttempt | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('campaign_participant_id', participantId)
    .single();

  if (error || !data) return null;

  return data as AssessmentAttempt;
}

export async function getAttemptWithResponses(
  participantId: string
): Promise<AttemptWithResponses | null> {
  const supabase = createAdminClient();

  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('campaign_participant_id', participantId)
    .single();

  if (attemptError || !attempt) return null;

  const { data: responsesData } = await supabase
    .from('assessment_responses')
    .select('scenario_key, response_text')
    .eq('attempt_id', attempt.id);

  const responses: Record<string, string> = {};
  if (responsesData) {
    for (const r of responsesData) {
      responses[r.scenario_key] = r.response_text;
    }
  }

  return {
    ...attempt,
    responses: responses as Record<ScenarioKey, string>,
  } as AttemptWithResponses;
}

export async function getResponsesForAttempt(
  attemptId: string
): Promise<AssessmentResponse[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('attempt_id', attemptId);

  if (error || !data) return [];

  return data as AssessmentResponse[];
}
