import OpenAI from 'openai';
import { getScenario, getScoreBand } from '@/lib/constants/assessment';
import type { ScenarioKey, ScoreBand } from '@/types';
import type {
  Scorer,
  ScoringInput,
  ScoringOutput,
  ScenarioScoringResult,
  AssessmentScoringResult,
} from './types';

const MAX_CRITERION = 20;
const MAX_SCENARIO = 100;

const SYSTEM_PROMPT = `You are an expert evaluator of AI prompts. Your task is to score how well a user writes prompts for AI assistants.

For each prompt, evaluate these 5 criteria (each scored 0-20):

1. **Clarity** (0-20): How clearly does the prompt communicate what is needed?
   - 0-5: Vague, unclear request
   - 6-10: Somewhat clear but missing key details
   - 11-15: Clear request with good specificity
   - 16-20: Crystal clear, precise, unambiguous

2. **Context** (0-20): Does the prompt provide relevant background information?
   - 0-5: No context provided
   - 6-10: Minimal context
   - 11-15: Good context that helps understand the task
   - 16-20: Rich, relevant context that enables optimal response

3. **Constraints** (0-20): Does the prompt specify limitations, requirements, or boundaries?
   - 0-5: No constraints mentioned
   - 6-10: Few basic constraints
   - 11-15: Good constraints that shape the output
   - 16-20: Comprehensive, well-thought-out constraints

4. **Output Format** (0-20): Does the prompt define the expected format or structure?
   - 0-5: No format specified
   - 6-10: Vague format hints
   - 11-15: Clear format requirements
   - 16-20: Detailed, precise format specification

5. **Verification** (0-20): Does the prompt include ways to verify or validate the output?
   - 0-5: No verification criteria
   - 6-10: Implicit quality expectations
   - 11-15: Some verification methods mentioned
   - 16-20: Clear success criteria and validation steps

Respond in JSON format with this exact structure:
{
  "clarity_score": <number 0-20>,
  "context_score": <number 0-20>,
  "constraints_score": <number 0-20>,
  "output_format_score": <number 0-20>,
  "verification_score": <number 0-20>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "coaching_tips": ["<tip 1>", "<tip 2>"],
  "improved_prompt": "<a better version of the user's prompt>",
  "summary_feedback": "<2-3 sentence overall feedback>"
}`;

interface ScenarioScoreResponse {
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  strengths: string[];
  weaknesses: string[];
  coaching_tips: string[];
  improved_prompt: string;
  summary_feedback: string;
}

export class OpenAIScorer implements Scorer {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    this.client = new OpenAI({ apiKey });
  }

  async score(input: ScoringInput): Promise<ScoringOutput> {
    const scenarioScores: ScenarioScoringResult[] = [];

    for (const response of input.responses) {
      const scenario = getScenario(response.scenario_key);
      if (!scenario) continue;

      const scenarioScore = await this.scoreScenario(
        response.scenario_key,
        scenario.title,
        scenario.instruction,
        response.response_text
      );
      scenarioScores.push(scenarioScore);
    }

    const assessmentScore = this.calculateAssessmentScore(scenarioScores);

    return {
      scenario_scores: scenarioScores,
      assessment_score: assessmentScore,
    };
  }

  private async scoreScenario(
    scenarioKey: ScenarioKey,
    scenarioTitle: string,
    scenarioInstruction: string,
    responseText: string
  ): Promise<ScenarioScoringResult> {
    const userPrompt = `
TASK: ${scenarioTitle}
INSTRUCTION: ${scenarioInstruction}

USER'S PROMPT:
"""
${responseText}
"""

Evaluate this prompt and provide your assessment in JSON format.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed: ScenarioScoreResponse = JSON.parse(content);

      const clamp = (n: number) => Math.max(0, Math.min(MAX_CRITERION, Math.round(n)));

      const clarity = clamp(parsed.clarity_score);
      const context = clamp(parsed.context_score);
      const constraints = clamp(parsed.constraints_score);
      const outputFormat = clamp(parsed.output_format_score);
      const verification = clamp(parsed.verification_score);

      const scenarioScore = clarity + context + constraints + outputFormat + verification;

      return {
        scenario_key: scenarioKey,
        clarity_score: clarity,
        context_score: context,
        constraints_score: constraints,
        output_format_score: outputFormat,
        verification_score: verification,
        scenario_score: scenarioScore,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        coaching_tips: parsed.coaching_tips || [],
        improved_prompt: parsed.improved_prompt || '',
        summary_feedback: parsed.summary_feedback || '',
      };
    } catch (error) {
      console.error(`Error scoring scenario ${scenarioKey}:`, error);
      return this.getDefaultScenarioScore(scenarioKey);
    }
  }

  private getDefaultScenarioScore(scenarioKey: ScenarioKey): ScenarioScoringResult {
    return {
      scenario_key: scenarioKey,
      clarity_score: 10,
      context_score: 10,
      constraints_score: 10,
      output_format_score: 10,
      verification_score: 10,
      scenario_score: 50,
      strengths: ['Prompt was submitted'],
      weaknesses: ['Could not evaluate - please try again'],
      coaching_tips: ['Ensure your prompt is clear and specific'],
      improved_prompt: '',
      summary_feedback: 'Unable to fully evaluate this response.',
    };
  }

  private calculateAssessmentScore(
    scenarioScores: ScenarioScoringResult[]
  ): AssessmentScoringResult {
    if (scenarioScores.length === 0) {
      return {
        clarity_score: 0,
        context_score: 0,
        constraints_score: 0,
        output_format_score: 0,
        verification_score: 0,
        total_score: 0,
        score_band: 'at_risk' as ScoreBand,
        strengths: [],
        weaknesses: ['No responses to evaluate'],
        coaching_tips: ['Complete all scenarios for a full assessment'],
        summary_feedback: 'No responses were provided.',
      };
    }

    const avgClarity =
      scenarioScores.reduce((sum, s) => sum + s.clarity_score, 0) / scenarioScores.length;
    const avgContext =
      scenarioScores.reduce((sum, s) => sum + s.context_score, 0) / scenarioScores.length;
    const avgConstraints =
      scenarioScores.reduce((sum, s) => sum + s.constraints_score, 0) / scenarioScores.length;
    const avgOutputFormat =
      scenarioScores.reduce((sum, s) => sum + s.output_format_score, 0) / scenarioScores.length;
    const avgVerification =
      scenarioScores.reduce((sum, s) => sum + s.verification_score, 0) / scenarioScores.length;

    const totalScore =
      avgClarity + avgContext + avgConstraints + avgOutputFormat + avgVerification;
    const percentage = (totalScore / MAX_SCENARIO) * 100;
    const scoreBand = getScoreBand(percentage);

    const allStrengths = scenarioScores.flatMap((s) => s.strengths);
    const allWeaknesses = scenarioScores.flatMap((s) => s.weaknesses);
    const allTips = scenarioScores.flatMap((s) => s.coaching_tips);

    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
    const uniqueTips = [...new Set(allTips)].slice(0, 5);

    let summaryFeedback: string;
    if (percentage >= 80) {
      summaryFeedback =
        'Excellent work! You demonstrate expert-level prompt engineering skills with clear, contextual, and well-structured prompts.';
    } else if (percentage >= 60) {
      summaryFeedback =
        'Strong performance! You write effective prompts but could improve in a few areas for even better AI responses.';
    } else if (percentage >= 40) {
      summaryFeedback =
        'Good foundation! Your prompts work but would benefit from more specificity, context, and structure.';
    } else if (percentage >= 20) {
      summaryFeedback =
        'Building skills! Focus on being more specific about what you need and how you want the output formatted.';
    } else {
      summaryFeedback =
        'Getting started! Practice writing more detailed prompts with clear instructions and expected outcomes.';
    }

    return {
      clarity_score: Math.round(avgClarity),
      context_score: Math.round(avgContext),
      constraints_score: Math.round(avgConstraints),
      output_format_score: Math.round(avgOutputFormat),
      verification_score: Math.round(avgVerification),
      total_score: Math.round(totalScore),
      score_band: scoreBand.key as ScoreBand,
      strengths: uniqueStrengths,
      weaknesses: uniqueWeaknesses,
      coaching_tips: uniqueTips,
      summary_feedback: summaryFeedback,
    };
  }
}
