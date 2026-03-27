import type { ScenarioKey, ScoreBand } from '@/types';

export const RUBRIC_VERSION = '1.0';
export const CRITERION_MAX_SCORE = 20;
export const SCENARIO_MAX_SCORE = 100;
export const TOTAL_MAX_SCORE = 100;

export interface CriterionScores {
  clarity: number;
  context: number;
  constraints: number;
  output_format: number;
  verification: number;
}

export interface ScenarioScoringResult {
  scenario_key: ScenarioKey;
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  scenario_score: number;
  strengths: string[];
  weaknesses: string[];
  coaching_tips: string[];
  improved_prompt: string;
  summary_feedback: string;
}

export interface AssessmentScoringResult {
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  total_score: number;
  score_band: ScoreBand;
  strengths: string[];
  weaknesses: string[];
  coaching_tips: string[];
  summary_feedback: string;
}

export interface ScoringInput {
  attempt_id: string;
  responses: Array<{
    scenario_key: ScenarioKey;
    response_text: string;
  }>;
}

export interface ScoringOutput {
  scenario_scores: ScenarioScoringResult[];
  assessment_score: AssessmentScoringResult;
}

export interface Scorer {
  score(input: ScoringInput): Promise<ScoringOutput>;
}
