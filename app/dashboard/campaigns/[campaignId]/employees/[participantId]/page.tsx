import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { getParticipantById } from '@/lib/queries/campaigns';
import { getFullAssessmentResultByParticipantId } from '@/lib/queries/scoring';
import { getScenario, getScoreBand } from '@/lib/constants/assessment';
import { ScoreBadge } from '@/components/ui/score-badge';
import { PrintButton } from '@/components/ui/print-button';
import { formatDateTime } from '@/lib/utils/formatting';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Trophy,
  Target,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Participant Result | ScorePrompt',
  description: 'Review participant assessment results and improvement areas',
};

interface EmployeeResultPageProps {
  params: Promise<{ campaignId: string; participantId: string }>;
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function CriterionBar({
  label,
  score,
  max = 20,
}: {
  label: string;
  score: number;
  max?: number;
}) {
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

export default async function EmployeeResultPage({
  params,
}: EmployeeResultPageProps) {
  const { campaignId, participantId } = await params;

  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const participant = await getParticipantById(participantId);
  if (!participant) {
    notFound();
  }

  if (participant.campaign.organization_id !== admin.organization_id) {
    notFound();
  }

  if (participant.campaign_id !== campaignId) {
    notFound();
  }

  const result = await getFullAssessmentResultByParticipantId(participantId);

  const band = result ? getScoreBand(result.assessment_score.total_score) : null;
  const responseMap = result
    ? new Map(result.responses.map((r) => [r.scenario_key, r.response_text]))
    : new Map();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/app/campaigns/${campaignId}?tab=participants`}
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Link>
        {result && <PrintButton />}
      </div>

      {/* Participant Header */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <User className="w-6 h-6 text-neutral-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {participant.employee.full_name || participant.employee.email}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">{participant.employee.email}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {participant.campaign.name}
              </span>
              {participant.completed_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Completed {formatDateTime(participant.completed_at)}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              This page explains how the participant performed across the assessment.
            </p>
          </div>
          <Badge
            variant={participant.status === 'completed' ? 'default' : 'secondary'}
          >
            {formatStatusLabel(participant.status)}
          </Badge>
        </div>
      </div>

      {!result ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-lg font-semibold mb-2">No Results Yet</h2>
            <p className="text-neutral-600 dark:text-neutral-400">
              This participant has not completed or submitted their assessment yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Total Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary">
                    {result.assessment_score.total_score}
                  </div>
                  <div className="text-neutral-500">out of 100</div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Score Band</p>
                  <Badge variant="default" className="text-lg px-4 py-1">
                    {band?.label}
                  </Badge>
                  <p className="text-sm text-neutral-500 mt-1">
                    {band?.description}
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-500 mb-3">Criteria Breakdown</p>
              <div className="space-y-3">
                <CriterionBar
                  label="Clarity"
                  score={result.assessment_score.clarity_score}
                />
                <CriterionBar
                  label="Context"
                  score={result.assessment_score.context_score}
                />
                <CriterionBar
                  label="Constraints"
                  score={result.assessment_score.constraints_score}
                />
                <CriterionBar
                  label="Output Format"
                  score={result.assessment_score.output_format_score}
                />
                <CriterionBar
                  label="Verification"
                  score={result.assessment_score.verification_score}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Feedback */}
          {result.assessment_score.summary_feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Summary Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {result.assessment_score.summary_feedback}
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
                  {result.assessment_score.strengths_json.map((strength, i) => (
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
                  Next Improvement Focus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.assessment_score.weaknesses_json.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-1">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {result.assessment_score.coaching_tips_json.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Coaching Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.assessment_score.coaching_tips_json.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Scenario Breakdown */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Scenario Results</h2>
            <p className="text-sm text-neutral-500">
              Use the breakdown below to review strengths and next improvement areas.
            </p>

            {result.scenario_scores.map((scenarioScore) => {
              const scenario = getScenario(scenarioScore.scenario_key);
              const userResponse =
                responseMap.get(scenarioScore.scenario_key) || '';

              return (
                <Card key={scenarioScore.scenario_key} className="scenario-card">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {scenario?.title || scenarioScore.scenario_key}
                        </CardTitle>
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
                      <h4 className="text-sm font-medium mb-2">
                        Prompt Used
                      </h4>
                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm">
                        {userResponse || 'No response provided'}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div>
                        <div className="text-neutral-500">Clarity</div>
                        <div className="font-semibold">
                          {scenarioScore.clarity_score}/20
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Context</div>
                        <div className="font-semibold">
                          {scenarioScore.context_score}/20
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Constraints</div>
                        <div className="font-semibold">
                          {scenarioScore.constraints_score}/20
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Output Format</div>
                        <div className="font-semibold">
                          {scenarioScore.output_format_score}/20
                        </div>
                      </div>
                      <div>
                        <div className="text-neutral-500">Verification</div>
                        <div className="font-semibold">
                          {scenarioScore.verification_score}/20
                        </div>
                      </div>
                    </div>

                    {/* Summary Feedback */}
                    {scenarioScore.summary_feedback && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {scenarioScore.summary_feedback}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium mb-1">Strengths</p>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          {scenarioScore.strengths_json.map((item, idx) => (
                            <li key={idx}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Weaknesses</p>
                        <ul className="space-y-1 text-neutral-600 dark:text-neutral-400">
                          {scenarioScore.weaknesses_json.map((item, idx) => (
                            <li key={idx}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Improved Prompt */}
                    {scenarioScore.improved_prompt && (
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Improved Prompt
                        </h5>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                          {scenarioScore.improved_prompt}
                        </div>
                      </div>
                    )}

                    {scenarioScore.coaching_tips_json.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Coaching Tips
                        </h5>
                        <ul className="space-y-2 text-sm">
                          {scenarioScore.coaching_tips_json.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              {tip}
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
        </div>
      )}
    </>
  );
}
