import type { ScenarioKey, RubricCriterion, ScoreBand } from '@/types';

// Scenario definition
export interface ScenarioDefinition {
  key: ScenarioKey;
  title: string;
  description: string;
  instruction: string;
}

// Five assessment scenarios for MVP
export const SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'summarization',
    title: 'Summarization',
    description: 'Summarize a document or text',
    instruction:
      'You will be given a document. Write a prompt that would help an AI assistant summarize it effectively.',
  },
  {
    key: 'email_drafting',
    title: 'Email Drafting',
    description: 'Draft a professional email',
    instruction:
      'You need to write a professional email. Write a prompt that would help an AI assistant draft it for you.',
  },
  {
    key: 'action_list',
    title: 'Action List Extraction',
    description: 'Extract action items from meeting notes',
    instruction:
      'You have meeting notes and need to extract action items. Write a prompt that would help an AI assistant identify and list them.',
  },
  {
    key: 'comparison',
    title: 'Comparison Analysis',
    description: 'Compare two options or alternatives',
    instruction:
      'You need to compare two options. Write a prompt that would help an AI assistant create a useful comparison.',
  },
  {
    key: 'text_improvement',
    title: 'Text Improvement',
    description: 'Improve or rewrite existing text',
    instruction:
      'You have text that needs improvement. Write a prompt that would help an AI assistant enhance it.',
  },
] as const;

// Rubric criterion definition
export interface RubricCriterionDefinition {
  key: RubricCriterion;
  label: string;
  description: string;
  weight: number;
}

// Rubric criteria for evaluating prompts
export const RUBRIC_CRITERIA: RubricCriterionDefinition[] = [
  {
    key: 'clarity',
    label: 'Clarity',
    description: 'The prompt clearly communicates what is needed',
    weight: 1,
  },
  {
    key: 'context',
    label: 'Context',
    description: 'The prompt provides relevant background information',
    weight: 1,
  },
  {
    key: 'constraints',
    label: 'Constraints',
    description: 'The prompt specifies limitations, requirements, or boundaries',
    weight: 1,
  },
  {
    key: 'output_format',
    label: 'Output Format',
    description: 'The prompt defines the expected format or structure of the response',
    weight: 1,
  },
  {
    key: 'verification',
    label: 'Verification',
    description: 'The prompt includes ways to verify or validate the output',
    weight: 1,
  },
] as const;

// Score band definition
export interface ScoreBandDefinition {
  key: ScoreBand;
  label: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
}

// Score bands for categorizing overall performance
export const SCORE_BANDS: ScoreBandDefinition[] = [
  {
    key: 'at_risk',
    label: 'At Risk',
    minPercentage: 0,
    maxPercentage: 19,
    description: 'Needs significant improvement in prompt writing',
  },
  {
    key: 'basic',
    label: 'Basic',
    minPercentage: 20,
    maxPercentage: 39,
    description: 'Just starting with AI prompt writing',
  },
  {
    key: 'functional',
    label: 'Functional',
    minPercentage: 40,
    maxPercentage: 59,
    description: 'Building foundational prompt skills',
  },
  {
    key: 'strong',
    label: 'Strong',
    minPercentage: 60,
    maxPercentage: 79,
    description: 'Competent at writing effective prompts',
  },
  {
    key: 'expert',
    label: 'Expert',
    minPercentage: 80,
    maxPercentage: 100,
    description: 'Expert-level prompt engineering skills',
  },
] as const;

// Helper: Get score band from percentage
export function getScoreBand(percentage: number): ScoreBandDefinition {
  const band = SCORE_BANDS.find(
    (b) => percentage >= b.minPercentage && percentage <= b.maxPercentage
  );
  return band ?? SCORE_BANDS[0];
}

// Helper: Get scenario by key
export function getScenario(key: ScenarioKey): ScenarioDefinition | undefined {
  return SCENARIOS.find((s) => s.key === key);
}

// Helper: Get criterion by key
export function getCriterion(key: RubricCriterion): RubricCriterionDefinition | undefined {
  return RUBRIC_CRITERIA.find((c) => c.key === key);
}

// Scoring constants
export const SCORE_MIN = 1;
export const SCORE_MAX = 4;
export const SCENARIOS_COUNT = SCENARIOS.length;
export const CRITERIA_COUNT = RUBRIC_CRITERIA.length;

// Max possible score = scenarios * criteria * max_score_per_criterion
export const MAX_TOTAL_SCORE = SCENARIOS_COUNT * CRITERIA_COUNT * SCORE_MAX;
