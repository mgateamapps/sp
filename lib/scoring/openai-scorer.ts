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

const SYSTEM_PROMPT = `You are an expert evaluator assessing professional AI prompting skills. The user has been given a complex, real-world business scenario with specific data, stakeholders, and constraints. Their task was to write a prompt that would instruct an AI assistant to solve that scenario effectively.

CRITICAL EVALUATION PRINCIPLES:
- A prompt that merely restates or paraphrases the scenario instruction earns LOW scores (0-8 per criterion). Simply copying the task description is not prompting skill.
- A strong prompt adds structure, assigns a role to the AI, specifies the exact output format, and articulates constraints beyond what was given.
- An excellent prompt demonstrates understanding of what separates generic AI output from precise, actionable, professional-grade output.
- Your feedback MUST reference specific elements of the user's actual prompt (quote or paraphrase what they wrote). Generic feedback like "be more specific" without citing what was missing is not acceptable.
- Be a demanding but fair evaluator. Scores of 16-20 per criterion must be earned. A competent prompt that covers the basics should score 10-14. Reserve 16+ for prompts that go meaningfully beyond the obvious.

SCORING CRITERIA (each 0-20):

1. **Clarity** (0-20): Is the task stated precisely with no room for misinterpretation?
   - 0-5: The request is vague; the AI could interpret it in multiple ways
   - 6-10: Broadly clear but key aspects of the task are underspecified
   - 11-15: Clear and specific; the AI would understand what is needed
   - 16-20: Precisely defined task — the AI knows exactly what to produce, why, and for whom; no clarifying questions needed

2. **Context** (0-20): Does the prompt use the scenario-specific data and background to ground the AI's response?
   - 0-5: Ignores or barely references the scenario's specific data, metrics, or stakeholders
   - 6-10: Includes some scenario data but misses key facts that would improve output quality
   - 11-15: Uses the scenario context well; incorporates the relevant data points and situational details
   - 16-20: Masterfully incorporates all critical scenario data (numbers, names, constraints, relationships) so the AI can produce a highly tailored, non-generic response

3. **Constraints** (0-20): Are scope, limitations, and requirements explicitly defined?
   - 0-5: No meaningful constraints stated; the AI could go in any direction
   - 6-10: Some basic constraints, but critical boundaries are missing (e.g., no time horizon, no audience specified)
   - 11-15: Clear constraints that meaningfully shape and bound the output
   - 16-20: Comprehensive constraints including what to include, what to exclude, audience, length, tone, and any domain-specific requirements

4. **Output Format** (0-20): Is the expected structure, format, and depth of the response defined?
   - 0-5: No format specified; the AI could respond as a wall of text or a brief bullet list
   - 6-10: Vague format hints ("give me a list", "explain it")
   - 11-15: Clear format requirements with specified sections or structure
   - 16-20: Precisely defined output — sections with headers, priorities, length guidance, or a template — ensuring the output is immediately usable without reformatting

5. **Specificity & Actionability** (0-20): Does the prompt force the AI to produce specific, actionable output rather than generic advice?
   - 0-5: The AI could produce generic, textbook-level output that would apply to any situation
   - 6-10: Some specificity requested, but the output could still be largely generic
   - 11-15: Good specificity requirements; the output would be meaningfully tailored to the scenario
   - 16-20: Forces highly specific, immediately actionable output — e.g., exact next steps tied to the scenario's data, explicit prioritisation criteria, concrete examples drawn from the scenario's context

Respond ONLY in JSON format with this exact structure:
{
  "clarity_score": <integer 0-20>,
  "context_score": <integer 0-20>,
  "constraints_score": <integer 0-20>,
  "output_format_score": <integer 0-20>,
  "verification_score": <integer 0-20>,
  "strengths": ["<specific strength quoting or referencing what the user actually wrote>", "<specific strength>"],
  "weaknesses": ["<specific weakness explaining what was missing or weak and why it matters>", "<specific weakness>"],
  "coaching_tips": ["<concrete, actionable tip for this type of scenario>", "<concrete tip>"],
  "improved_prompt": "<a substantially better version of the user's prompt that demonstrates best-practice structure — include a role assignment, use the scenario data, specify output format, and define what actionable looks like>",
  "summary_feedback": "<2-3 sentences of specific feedback that references what the user actually wrote, what worked, and the single most important thing to improve>"
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
    // Score all scenarios in parallel — cuts total time by ~5× vs sequential
    const results = await Promise.all(
      input.responses.map(async (response) => {
        const scenario = getScenario(response.scenario_key);
        if (!scenario) return null;
        return this.scoreScenario(
          response.scenario_key,
          scenario.title,
          scenario.instruction,
          response.response_text
        );
      })
    );
    const scenarioScores = results.filter((r): r is ScenarioScoringResult => r !== null);

    const assessmentScore = await this.calculateAssessmentScore(scenarioScores);

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
    const userPrompt = `You are evaluating a user's AI prompt for the following professional scenario.

SCENARIO TITLE: ${scenarioTitle}
SCENARIO CONTEXT & TASK (what the user was asked to do):
---
${scenarioInstruction}
---

THE USER'S PROMPT (what they actually wrote):
"""
${responseText}
"""

Evaluate this prompt against the 5 criteria. Remember: a prompt that just paraphrases the scenario instruction earns low scores. Look for evidence that the user added structure, role assignment, format requirements, and specificity beyond what was given.`;

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

  private async calculateAssessmentScore(
    scenarioScores: ScenarioScoringResult[]
  ): Promise<AssessmentScoringResult> {
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

    // Deduplicate and select the most representative cross-scenario insights
    const allStrengths = scenarioScores.flatMap((s) => s.strengths);
    const allWeaknesses = scenarioScores.flatMap((s) => s.weaknesses);
    const allTips = scenarioScores.flatMap((s) => s.coaching_tips);

    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
    const uniqueTips = [...new Set(allTips)].slice(0, 5);

    const summaryFeedback = await this.generateAssessmentSummary(
      scenarioScores,
      Math.round(avgClarity),
      Math.round(avgContext),
      Math.round(avgConstraints),
      Math.round(avgOutputFormat),
      Math.round(avgVerification),
      Math.round(totalScore)
    );

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

  private async generateAssessmentSummary(
    scenarioScores: ScenarioScoringResult[],
    clarityAvg: number,
    contextAvg: number,
    constraintsAvg: number,
    outputFormatAvg: number,
    specificityAvg: number,
    totalScore: number
  ): Promise<string> {
    const criteriaRanked = [
      { name: 'Clarity', score: clarityAvg },
      { name: 'Context', score: contextAvg },
      { name: 'Constraints', score: constraintsAvg },
      { name: 'Output Format', score: outputFormatAvg },
      { name: 'Specificity & Actionability', score: specificityAvg },
    ].sort((a, b) => b.score - a.score);

    const strongest = criteriaRanked[0];
    const weakest = criteriaRanked[criteriaRanked.length - 1];

    // Collect the per-scenario summary feedback to give the AI a picture of the patterns
    const scenarioPatternsText = scenarioScores
      .map((s) => `- Scenario ${s.scenario_key}: ${s.summary_feedback}`)
      .join('\n');

    const prompt = `You are writing a 3-sentence overall assessment summary for a professional who just completed a 5-scenario AI prompting assessment.

Assessment results:
- Total score: ${totalScore}/100
- Strongest criterion: ${strongest.name} (${strongest.score}/20)
- Weakest criterion: ${weakest.name} (${weakest.score}/20)
- Per-scenario patterns:
${scenarioPatternsText}

Write a 3-sentence summary that:
1. Opens with an honest, specific characterisation of their overall prompting skill level (do not use vague praise)
2. Names their most consistent strength and their most consistent weakness across scenarios, with a specific example if visible from the patterns
3. Gives one concrete, high-impact action they should take to meaningfully improve

Do not use generic phrases like "great job" or "keep practicing". Be direct and specific. Return only the 3-sentence summary, no JSON, no headers.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content?.trim() ?? this.fallbackSummary(totalScore);
    } catch {
      return this.fallbackSummary(totalScore);
    }
  }

  private fallbackSummary(totalScore: number): string {
    if (totalScore >= 80)
      return 'Your prompts demonstrate expert-level structure and precision across scenarios. You consistently leverage scenario context and define output requirements. Continue pushing for even greater specificity in how you constrain the AI\'s output.';
    if (totalScore >= 60)
      return 'You write solid prompts that clearly communicate the task, though output format and specificity requirements could be tighter. Your strongest area is contextual grounding; your prompts would benefit from more explicit structure for the expected output. Focus on defining exactly what "done" looks like for each prompt.';
    if (totalScore >= 40)
      return 'Your prompts convey the basic intent but tend to restate the scenario rather than engineer the AI\'s response. The key gap is output format — without specifying structure, the AI has too much latitude. Start every prompt by defining the exact format and sections you expect.';
    if (totalScore >= 20)
      return 'Your prompts identify the task but lack the specificity needed to produce professional-grade AI output. You are missing constraints, output format, and role assignment in most scenarios. Practise the habit of asking: "Could this prompt produce a generic answer?" — if yes, make it more specific.';
    return 'Your prompts are at an early stage and would benefit significantly from adding context, structure, and output format requirements. Start by assigning the AI a role and specifying the exact format you want. Each prompt should make it impossible for the AI to give a generic, one-size-fits-all response.';
  }
}
