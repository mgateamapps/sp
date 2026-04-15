import { validateInviteToken } from '@/lib/queries/invites';
import { getAttemptByParticipantId } from '@/lib/queries/assessment';
import { getFullAssessmentResult } from '@/lib/queries/scoring';
import { getScenario, RUBRIC_CRITERIA, getScoreBand } from '@/lib/constants/assessment';
import { ScoreBadge } from '@/components/ui/score-badge';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  Trophy,
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrintButton } from '@/components/ui/print-button';

export const metadata: Metadata = {
  title: 'Your Results | ScorePrompt',
  description: 'View your AI literacy assessment results',
};

interface FeedbackPageProps {
  params: Promise<{ token: string }>;
}


function CriterionBar({ label, score, max = 20 }: { label: string; score: number; max?: number }) {
  const percentage = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-neutral-500">{percentage}%</span>
      </div>
      <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { token } = await params;

  const participant = await validateInviteToken(token);

  if (!participant) {
    redirect('/invite/invalid');
  }

  const attempt = await getAttemptByParticipantId(participant.id);

  if (!attempt || attempt.status !== 'scored') {
    redirect(`/invite/${token}/processing`);
  }

  const result = await getFullAssessmentResult(attempt.id);

  if (!result) {
    redirect(`/invite/${token}/processing`);
  }

  const { assessment_score, scenario_scores, responses } = result;
  const band = getScoreBand(assessment_score.total_score);

  const responseMap = new Map(responses.map((r) => [r.scenario_key, r.response_text]));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Print button — hidden on print */}
      <div className="flex justify-end">
        <PrintButton />
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your Assessment Results</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          {participant.campaign.name}
        </p>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-primary mb-2">
              {assessment_score.total_score}
            </div>
            <div className="text-neutral-500 mb-4">out of 100</div>
            <Badge
              variant="default"
              className="text-lg px-4 py-1"
            >
              {band.label}
            </Badge>
            <p className="text-sm text-neutral-500 mt-2">{band.description}</p>
          </div>

          <div className="space-y-3">
            <CriterionBar
              label="Clarity"
              score={assessment_score.clarity_score}
            />
            <CriterionBar
              label="Context"
              score={assessment_score.context_score}
            />
            <CriterionBar
              label="Constraints"
              score={assessment_score.constraints_score}
            />
            <CriterionBar
              label="Output Format"
              score={assessment_score.output_format_score}
            />
            <CriterionBar
              label="Specificity"
              score={assessment_score.verification_score}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Feedback */}
      {assessment_score.summary_feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overall Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 dark:text-neutral-300">
              {assessment_score.summary_feedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment_score.strengths_json.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment_score.weaknesses_json.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-500 mt-1">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Coaching Tips */}
      {assessment_score.coaching_tips_json.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Coaching Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment_score.coaching_tips_json.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Scenario-by-Scenario Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Scenario Breakdown</h2>

        {scenario_scores.map((scenarioScore) => {
          const scenario = getScenario(scenarioScore.scenario_key);
          const userResponse = responseMap.get(scenarioScore.scenario_key) || '';

          return (
            <Card key={scenarioScore.scenario_key} className="scenario-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{scenario?.title || scenarioScore.scenario_key}</CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">
                      {scenario?.description}
                    </p>
                  </div>
                  <ScoreBadge score={scenarioScore.scenario_score} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User's Response */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Your Prompt:</h4>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm">
                    {userResponse || 'No response provided'}
                  </div>
                </div>

                {/* Criterion Scores */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <div className="text-neutral-500">Clarity</div>
                    <div className="font-semibold">{scenarioScore.clarity_score}/20</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Context</div>
                    <div className="font-semibold">{scenarioScore.context_score}/20</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Constraints</div>
                    <div className="font-semibold">{scenarioScore.constraints_score}/20</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Format</div>
                    <div className="font-semibold">{scenarioScore.output_format_score}/20</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Specificity</div>
                    <div className="font-semibold">{scenarioScore.verification_score}/20</div>
                  </div>
                </div>

                {/* Feedback Summary */}
                {scenarioScore.summary_feedback && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {scenarioScore.summary_feedback}
                  </p>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-green-700 dark:text-green-400 mb-1">
                      Strengths
                    </h5>
                    <ul className="space-y-1">
                      {scenarioScore.strengths_json.map((s, i) => (
                        <li key={i} className="text-neutral-600 dark:text-neutral-400">
                          • {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                      To Improve
                    </h5>
                    <ul className="space-y-1">
                      {scenarioScore.weaknesses_json.map((w, i) => (
                        <li key={i} className="text-neutral-600 dark:text-neutral-400">
                          • {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improved Prompt */}
                {scenarioScore.improved_prompt && (
                  <div>
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Improved Prompt Example
                    </h5>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                      {scenarioScore.improved_prompt}
                    </div>
                  </div>
                )}

                {/* Coaching Tips */}
                {scenarioScore.coaching_tips_json.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-1">Tips:</h5>
                    <ul className="text-sm space-y-1">
                      {scenarioScore.coaching_tips_json.map((tip, i) => (
                        <li key={i} className="text-neutral-600 dark:text-neutral-400">
                          {i + 1}. {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-neutral-500">
        <p>Thank you for completing the assessment!</p>
        <p className="mt-1">Powered by ScorePrompt</p>
      </div>
    </div>
  );
}
