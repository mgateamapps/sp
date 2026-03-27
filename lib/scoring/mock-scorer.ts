import { SCENARIOS, getScoreBand } from '@/lib/constants/assessment';
import type { ScenarioKey } from '@/types';
import type {
  Scorer,
  ScoringInput,
  ScoringOutput,
  ScenarioScoringResult,
  AssessmentScoringResult,
  CRITERION_MAX_SCORE,
} from './types';

const MAX_CRITERION = 20;

const CLARITY_SIGNALS = [
  'please',
  'i need',
  'i want',
  'create',
  'write',
  'generate',
  'help me',
  'can you',
  'would you',
];

const CONTEXT_SIGNALS = [
  'background',
  'context',
  'situation',
  'scenario',
  'for example',
  'such as',
  'because',
  'since',
  'given that',
  'considering',
];

const CONSTRAINTS_SIGNALS = [
  'must',
  'should',
  'limit',
  'maximum',
  'minimum',
  'no more than',
  'at least',
  'only',
  'do not',
  'avoid',
  'ensure',
  'make sure',
];

const OUTPUT_FORMAT_SIGNALS = [
  'format',
  'structure',
  'bullet',
  'list',
  'table',
  'paragraph',
  'section',
  'heading',
  'numbered',
  'step by step',
  'steps',
];

const VERIFICATION_SIGNALS = [
  'verify',
  'check',
  'confirm',
  'validate',
  'review',
  'double-check',
  'accuracy',
  'correct',
  'ensure',
  'quality',
];

function countSignals(text: string, signals: string[]): number {
  const lowerText = text.toLowerCase();
  return signals.filter((signal) => lowerText.includes(signal)).length;
}

function calculateCriterionScore(
  text: string,
  signals: string[],
  lengthFactor: number
): number {
  const signalCount = countSignals(text, signals);
  const signalScore = Math.min(signalCount * 3, 12);
  const lengthScore = Math.min(lengthFactor * 8, 8);
  return Math.min(signalScore + lengthScore, MAX_CRITERION);
}

function getLengthFactor(text: string): number {
  const length = text.trim().length;
  if (length < 20) return 0.2;
  if (length < 50) return 0.4;
  if (length < 100) return 0.6;
  if (length < 200) return 0.8;
  return 1.0;
}

function generateStrengths(scores: {
  clarity: number;
  context: number;
  constraints: number;
  output_format: number;
  verification: number;
}): string[] {
  const strengths: string[] = [];

  if (scores.clarity >= 14) {
    strengths.push('Clear and direct communication of the task');
  }
  if (scores.context >= 14) {
    strengths.push('Good use of background context');
  }
  if (scores.constraints >= 14) {
    strengths.push('Well-defined constraints and requirements');
  }
  if (scores.output_format >= 14) {
    strengths.push('Clear output format specification');
  }
  if (scores.verification >= 14) {
    strengths.push('Includes verification or quality criteria');
  }

  if (strengths.length === 0) {
    strengths.push('Attempted to address the task');
  }

  return strengths;
}

function generateWeaknesses(scores: {
  clarity: number;
  context: number;
  constraints: number;
  output_format: number;
  verification: number;
}): string[] {
  const weaknesses: string[] = [];

  if (scores.clarity < 10) {
    weaknesses.push('Could be clearer about the desired outcome');
  }
  if (scores.context < 10) {
    weaknesses.push('Missing relevant background information');
  }
  if (scores.constraints < 10) {
    weaknesses.push('Lacks specific constraints or boundaries');
  }
  if (scores.output_format < 10) {
    weaknesses.push('Output format not clearly specified');
  }
  if (scores.verification < 10) {
    weaknesses.push('No verification or quality criteria included');
  }

  return weaknesses;
}

function generateCoachingTips(
  scenarioKey: ScenarioKey,
  scores: {
    clarity: number;
    context: number;
    constraints: number;
    output_format: number;
    verification: number;
  }
): string[] {
  const tips: string[] = [];

  const lowestCriterion = Object.entries(scores).sort(
    ([, a], [, b]) => a - b
  )[0][0];

  switch (lowestCriterion) {
    case 'clarity':
      tips.push(
        'Start your prompt with a clear action verb like "Write", "Create", or "Analyze"'
      );
      break;
    case 'context':
      tips.push(
        'Add relevant background information to help the AI understand the situation'
      );
      break;
    case 'constraints':
      tips.push(
        'Specify limitations such as length, tone, or what to avoid'
      );
      break;
    case 'output_format':
      tips.push(
        'Define the expected format: bullet points, paragraphs, table, etc.'
      );
      break;
    case 'verification':
      tips.push(
        'Include criteria for how to verify the output quality'
      );
      break;
  }

  const scenario = SCENARIOS.find((s) => s.key === scenarioKey);
  if (scenario) {
    tips.push(`For ${scenario.title.toLowerCase()} tasks, be specific about what makes a good result`);
  }

  return tips;
}

function generateImprovedPrompt(
  scenarioKey: ScenarioKey,
  originalText: string
): string {
  const scenario = SCENARIOS.find((s) => s.key === scenarioKey);
  if (!scenario) return originalText;

  const improvedPrompts: Record<ScenarioKey, string> = {
    summarization: `Please summarize the following document in 3-5 bullet points. Focus on the main ideas and key takeaways. Keep each point concise (1-2 sentences). Ensure the summary captures the document's purpose and conclusions.`,
    email_drafting: `Write a professional email with the following structure: clear subject line suggestion, greeting, main message (2-3 paragraphs), and appropriate sign-off. Maintain a professional but friendly tone. Keep it under 200 words.`,
    action_list: `Extract all action items from the following meeting notes. For each action item, include: the task description, responsible person (if mentioned), and deadline (if mentioned). Format as a numbered list. Flag any urgent items.`,
    comparison: `Create a comparison of the two options below. Use a table format with criteria in rows and options in columns. Include: key features, pros, cons, and a final recommendation with reasoning.`,
    text_improvement: `Improve the following text for clarity and professionalism. Maintain the original meaning but: fix any grammar issues, improve sentence flow, use more precise vocabulary, and ensure consistent tone. Explain the key changes made.`,
  };

  return improvedPrompts[scenarioKey];
}

function generateScenarioSummary(
  scenarioKey: ScenarioKey,
  totalScore: number
): string {
  const scenario = SCENARIOS.find((s) => s.key === scenarioKey);
  const scenarioName = scenario?.title || scenarioKey;

  if (totalScore >= 80) {
    return `Excellent prompt for ${scenarioName}. You demonstrated strong prompt engineering skills with clear communication and well-defined expectations.`;
  }
  if (totalScore >= 60) {
    return `Good prompt for ${scenarioName}. Your prompt covers the basics well, with room for improvement in specificity and structure.`;
  }
  if (totalScore >= 40) {
    return `Developing prompt for ${scenarioName}. Consider adding more context, constraints, and output format specifications.`;
  }
  return `Basic prompt for ${scenarioName}. Focus on being more specific about what you need and how you want the output formatted.`;
}

function scoreScenario(
  scenarioKey: ScenarioKey,
  responseText: string
): ScenarioScoringResult {
  const text = responseText.trim();
  const lengthFactor = getLengthFactor(text);

  const clarity_score = calculateCriterionScore(
    text,
    CLARITY_SIGNALS,
    lengthFactor
  );
  const context_score = calculateCriterionScore(
    text,
    CONTEXT_SIGNALS,
    lengthFactor
  );
  const constraints_score = calculateCriterionScore(
    text,
    CONSTRAINTS_SIGNALS,
    lengthFactor
  );
  const output_format_score = calculateCriterionScore(
    text,
    OUTPUT_FORMAT_SIGNALS,
    lengthFactor
  );
  const verification_score = calculateCriterionScore(
    text,
    VERIFICATION_SIGNALS,
    lengthFactor
  );

  const scenario_score =
    clarity_score +
    context_score +
    constraints_score +
    output_format_score +
    verification_score;

  const scores = {
    clarity: clarity_score,
    context: context_score,
    constraints: constraints_score,
    output_format: output_format_score,
    verification: verification_score,
  };

  return {
    scenario_key: scenarioKey,
    clarity_score,
    context_score,
    constraints_score,
    output_format_score,
    verification_score,
    scenario_score,
    strengths: generateStrengths(scores),
    weaknesses: generateWeaknesses(scores),
    coaching_tips: generateCoachingTips(scenarioKey, scores),
    improved_prompt: generateImprovedPrompt(scenarioKey, text),
    summary_feedback: generateScenarioSummary(scenarioKey, scenario_score),
  };
}

function aggregateAssessmentScore(
  scenarioScores: ScenarioScoringResult[]
): AssessmentScoringResult {
  const count = scenarioScores.length;
  if (count === 0) {
    return {
      clarity_score: 0,
      context_score: 0,
      constraints_score: 0,
      output_format_score: 0,
      verification_score: 0,
      total_score: 0,
      score_band: 'novice',
      strengths: [],
      weaknesses: [],
      coaching_tips: [],
      summary_feedback: 'No responses to evaluate.',
    };
  }

  const sumClarity = scenarioScores.reduce((s, r) => s + r.clarity_score, 0);
  const sumContext = scenarioScores.reduce((s, r) => s + r.context_score, 0);
  const sumConstraints = scenarioScores.reduce(
    (s, r) => s + r.constraints_score,
    0
  );
  const sumOutputFormat = scenarioScores.reduce(
    (s, r) => s + r.output_format_score,
    0
  );
  const sumVerification = scenarioScores.reduce(
    (s, r) => s + r.verification_score,
    0
  );

  const clarity_score = Math.round((sumClarity / count / MAX_CRITERION) * 100);
  const context_score = Math.round((sumContext / count / MAX_CRITERION) * 100);
  const constraints_score = Math.round(
    (sumConstraints / count / MAX_CRITERION) * 100
  );
  const output_format_score = Math.round(
    (sumOutputFormat / count / MAX_CRITERION) * 100
  );
  const verification_score = Math.round(
    (sumVerification / count / MAX_CRITERION) * 100
  );

  const total_score = Math.round(
    (clarity_score +
      context_score +
      constraints_score +
      output_format_score +
      verification_score) /
      5
  );

  const band = getScoreBand(total_score);

  const allStrengths = scenarioScores.flatMap((s) => s.strengths);
  const allWeaknesses = scenarioScores.flatMap((s) => s.weaknesses);
  const allTips = scenarioScores.flatMap((s) => s.coaching_tips);

  const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
  const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
  const uniqueTips = [...new Set(allTips)].slice(0, 5);

  let summary_feedback: string;
  if (total_score >= 80) {
    summary_feedback = `Excellent performance! You demonstrate advanced prompt engineering skills with a score of ${total_score}/100. Your prompts are clear, well-structured, and include appropriate context and constraints.`;
  } else if (total_score >= 60) {
    summary_feedback = `Good job! You scored ${total_score}/100, showing proficient prompt writing abilities. Focus on adding more specific constraints and verification criteria to reach the next level.`;
  } else if (total_score >= 40) {
    summary_feedback = `You're developing your prompt engineering skills with a score of ${total_score}/100. Consider being more specific about context, output format, and quality expectations.`;
  } else {
    summary_feedback = `You scored ${total_score}/100. With practice, you can significantly improve. Focus on clearly stating what you need, providing context, and specifying the desired output format.`;
  }

  return {
    clarity_score,
    context_score,
    constraints_score,
    output_format_score,
    verification_score,
    total_score,
    score_band: band.key,
    strengths: uniqueStrengths,
    weaknesses: uniqueWeaknesses,
    coaching_tips: uniqueTips,
    summary_feedback,
  };
}

export class MockScorer implements Scorer {
  async score(input: ScoringInput): Promise<ScoringOutput> {
    const scenario_scores = input.responses.map((r) =>
      scoreScenario(r.scenario_key, r.response_text)
    );

    const assessment_score = aggregateAssessmentScore(scenario_scores);

    return {
      scenario_scores,
      assessment_score,
    };
  }
}
