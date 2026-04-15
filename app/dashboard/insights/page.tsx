import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { redirect } from "next/navigation";
import {
  getDashboardStats,
  getSkillBreakdown,
  getScoreDistribution,
  getCommonWeaknesses,
  getTopCoachingThemes,
} from "@/lib/queries/dashboard";
import SkillsBreakdownChart from "@/components/dashboard/skills-breakdown-chart";
import ScoreDistributionChart from "@/components/dashboard/score-distribution-chart";
import CompletionRateChart from "@/components/dashboard/completion-rate-chart";
import type { Metadata } from "next";
import {
  BarChart3,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Insights | ScorePrompt",
  description: "Skill breakdowns, score distribution, and coaching priorities",
};

export default async function InsightsPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const [stats, skillBreakdown, scoreDistribution, weaknesses, coachingThemes] = await Promise.all([
    getDashboardStats(admin.organization_id),
    getSkillBreakdown(admin.organization_id),
    getScoreDistribution(admin.organization_id),
    getCommonWeaknesses(admin.organization_id),
    getTopCoachingThemes(admin.organization_id, undefined, 8),
  ]);

  const hasData = stats.totalCampaigns > 0 && stats.averageScore !== null;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">No insights yet</h2>
        <p className="text-neutral-500 text-center max-w-sm">
          Complete some assessments to see skill breakdowns, score distributions, and coaching priorities here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Skills Breakdown + Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Skills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SkillsBreakdownChart data={skillBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreDistributionChart data={scoreDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Areas to Improve + Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length === 0 ? (
              <p className="text-neutral-500 text-sm">No data available yet</p>
            ) : (
              <div className="space-y-3">
                {weaknesses.map((weakness) => (
                  <div
                    key={weakness.criterion}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  >
                    <span className="font-medium">{weakness.label}</span>
                    <span className={`text-sm font-semibold ${
                      weakness.averageScore < 50
                        ? "text-red-600"
                        : weakness.averageScore < 70
                        ? "text-amber-600"
                        : "text-green-600"
                    }`}>
                      {weakness.averageScore}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionRateChart
              rate={stats.completionRate}
              completed={stats.totalEmployees - stats.pendingAssessments}
              total={stats.totalEmployees}
            />
          </CardContent>
        </Card>
      </div>

      {/* Team Coaching Priorities */}
      {coachingThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Team Coaching Priorities
              <span className="ml-auto text-xs font-normal text-neutral-400">
                most common AI coaching tips across all assessments
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {coachingThemes.map((theme, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{theme.tip}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Mentioned in {theme.count} assessment{theme.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </>
  );
}
