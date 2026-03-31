import { createClient } from '@/lib/supabase/server';
import { MockScorer } from './mock-scorer';
import { OpenAIScorer } from './openai-scorer';
import { RUBRIC_VERSION } from './types';
import type { Scorer, ScoringInput } from './types';

function createScorer(): Scorer {
  if (process.env.OPENAI_API_KEY) {
    try {
      return new OpenAIScorer();
    } catch (e) {
      console.warn('Failed to initialize OpenAI scorer, falling back to mock:', e);
      return new MockScorer();
    }
  }
  return new MockScorer();
}

const scorer: Scorer = createScorer();

export interface ScoreAttemptResult {
  success: boolean;
  error: string | null;
  already_scored: boolean;
}

export async function scoreAttempt(
  attemptId: string
): Promise<ScoreAttemptResult> {
  const supabase = await createClient();

  const { data: attempt, error: attemptError } = await supabase
    .from('assessment_attempts')
    .select('id, status, campaign_participant_id')
    .eq('id', attemptId)
    .single();

  if (attemptError || !attempt) {
    return {
      success: false,
      error: 'Attempt not found',
      already_scored: false,
    };
  }

  if (attempt.status === 'scored') {
    return {
      success: true,
      error: null,
      already_scored: true,
    };
  }

  if (attempt.status !== 'submitted') {
    return {
      success: false,
      error: `Cannot score attempt with status: ${attempt.status}`,
      already_scored: false,
    };
  }

  const { data: existingScore } = await supabase
    .from('assessment_scores')
    .select('id')
    .eq('attempt_id', attemptId)
    .single();

  if (existingScore) {
    await supabase
      .from('assessment_attempts')
      .update({
        status: 'scored',
        scored_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    return {
      success: true,
      error: null,
      already_scored: true,
    };
  }

  const { data: responses, error: responsesError } = await supabase
    .from('assessment_responses')
    .select('scenario_key, response_text')
    .eq('attempt_id', attemptId);

  if (responsesError || !responses || responses.length === 0) {
    return {
      success: false,
      error: 'No responses found for attempt',
      already_scored: false,
    };
  }

  const scoringInput: ScoringInput = {
    attempt_id: attemptId,
    responses: responses.map((r) => ({
      scenario_key: r.scenario_key,
      response_text: r.response_text,
    })),
  };

  let scoringOutput;
  try {
    scoringOutput = await scorer.score(scoringInput);
  } catch (err) {
    console.error('Scoring failed:', err);
    await supabase
      .from('assessment_attempts')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attemptId);

    return {
      success: false,
      error: 'Scoring process failed',
      already_scored: false,
    };
  }

  for (const scenarioScore of scoringOutput.scenario_scores) {
    const { error: insertError } = await supabase
      .from('scenario_scores')
      .upsert(
        {
          attempt_id: attemptId,
          scenario_key: scenarioScore.scenario_key,
          clarity_score: scenarioScore.clarity_score,
          context_score: scenarioScore.context_score,
          constraints_score: scenarioScore.constraints_score,
          output_format_score: scenarioScore.output_format_score,
          verification_score: scenarioScore.verification_score,
          scenario_score: scenarioScore.scenario_score,
          strengths_json: scenarioScore.strengths,
          weaknesses_json: scenarioScore.weaknesses,
          coaching_tips_json: scenarioScore.coaching_tips,
          improved_prompt: scenarioScore.improved_prompt,
          summary_feedback: scenarioScore.summary_feedback,
          rubric_version: RUBRIC_VERSION,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'attempt_id,scenario_key' }
      );

    if (insertError) {
      console.error('Failed to insert scenario score:', insertError);
    }
  }

  const assessmentScore = scoringOutput.assessment_score;
  const { error: assessmentInsertError } = await supabase
    .from('assessment_scores')
    .upsert(
      {
        attempt_id: attemptId,
        clarity_score: assessmentScore.clarity_score,
        context_score: assessmentScore.context_score,
        constraints_score: assessmentScore.constraints_score,
        output_format_score: assessmentScore.output_format_score,
        verification_score: assessmentScore.verification_score,
        total_score: assessmentScore.total_score,
        score_band: assessmentScore.score_band,
        strengths_json: assessmentScore.strengths,
        weaknesses_json: assessmentScore.weaknesses,
        coaching_tips_json: assessmentScore.coaching_tips,
        summary_feedback: assessmentScore.summary_feedback,
        rubric_version: RUBRIC_VERSION,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'attempt_id' }
    );

  if (assessmentInsertError) {
    console.error('Failed to insert assessment score:', assessmentInsertError);
    return {
      success: false,
      error: 'Failed to save assessment score',
      already_scored: false,
    };
  }

  const { error: updateAttemptError } = await supabase
    .from('assessment_attempts')
    .update({
      status: 'scored',
      scored_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', attemptId);

  if (updateAttemptError) {
    console.error('Failed to update attempt status:', updateAttemptError);
  }

  return {
    success: true,
    error: null,
    already_scored: false,
  };
}
