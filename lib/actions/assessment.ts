'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { validateInviteToken } from '@/lib/queries/invites';
import type { ScenarioKey, AssessmentAttempt } from '@/types';
import { SCENARIOS } from '@/lib/constants/assessment';

const REQUIRED_SCENARIOS: ScenarioKey[] = SCENARIOS.map((s) => s.key);

export async function getOrCreateAttempt(
  participantId: string
): Promise<{ attempt: AssessmentAttempt | null; error: string | null }> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('campaign_participant_id', participantId)
    .single();

  if (existing) {
    return { attempt: existing as AssessmentAttempt, error: null };
  }

  const { data: newAttempt, error: createError } = await supabase
    .from('assessment_attempts')
    .insert({
      campaign_participant_id: participantId,
      status: 'in_progress',
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating attempt:', createError);
    return { attempt: null, error: 'Failed to create assessment attempt' };
  }

  const { error: updateError } = await supabase
    .from('campaign_participants')
    .update({
      status: 'started',
      started_at: new Date().toISOString(),
    })
    .eq('id', participantId)
    .is('started_at', null);

  if (updateError) {
    console.error('Error updating participant status:', updateError);
  }

  return { attempt: newAttempt as AssessmentAttempt, error: null };
}

export async function saveResponse(
  token: string,
  attemptId: string,
  scenarioKey: ScenarioKey,
  responseText: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();
  const participant = await validateInviteToken(token);

  if (!participant) {
    return { success: false, error: 'Invalid invite token' };
  }

  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('campaign_participant_id')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt || attempt.campaign_participant_id !== participant.id) {
    return { success: false, error: 'Unauthorized attempt access' };
  }

  const { error } = await supabase.from('assessment_responses').upsert(
    {
      attempt_id: attemptId,
      scenario_key: scenarioKey,
      response_text: responseText,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'attempt_id,scenario_key',
    }
  );

  if (error) {
    console.error('Error saving response:', error);
    return { success: false, error: 'Failed to save response' };
  }

  return { success: true, error: null };
}

export async function submitAssessment(
  token: string,
  attemptId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();
  const participant = await validateInviteToken(token);

  if (!participant) {
    return { success: false, error: 'Invalid invite token' };
  }

  const { data: responses, error: fetchError } = await supabase
    .from('assessment_responses')
    .select('scenario_key, response_text')
    .eq('attempt_id', attemptId);

  if (fetchError) {
    console.error('Error fetching responses:', fetchError);
    return { success: false, error: 'Failed to validate responses' };
  }

  const answeredScenarios = new Set(
    responses
      ?.filter((r) => r.response_text && r.response_text.trim().length > 0)
      .map((r) => r.scenario_key) || []
  );

  const missingScenarios = REQUIRED_SCENARIOS.filter(
    (key) => !answeredScenarios.has(key)
  );

  if (missingScenarios.length > 0) {
    return {
      success: false,
      error: `Missing responses for: ${missingScenarios.join(', ')}`,
    };
  }

  const { data: attempt, error: attemptFetchError } = await supabase
    .from('assessment_attempts')
    .select('campaign_participant_id')
    .eq('id', attemptId)
    .single();

  if (attemptFetchError || !attempt || attempt.campaign_participant_id !== participant.id) {
    return { success: false, error: 'Failed to find attempt' };
  }

  const { error: updateAttemptError } = await supabase
    .from('assessment_attempts')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId);

  if (updateAttemptError) {
    console.error('Error updating attempt:', updateAttemptError);
    return { success: false, error: 'Failed to submit assessment' };
  }

  const { error: updateParticipantError } = await supabase
    .from('campaign_participants')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', attempt.campaign_participant_id);

  if (updateParticipantError) {
    console.error('Error updating participant:', updateParticipantError);
  }

  return { success: true, error: null };
}
