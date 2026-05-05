import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { getCampaignsForOrganization } from "@/lib/queries/campaigns";
import {
  getCampaignComparison,
  getCommonWeaknesses,
  getDashboardStats,
  getScoreTrend,
  getSkillBreakdown,
} from "@/lib/queries/dashboard";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ScoreTrendChart from "@/components/dashboard/score-trend-chart";
import CompletionTrendChart from "@/components/dashboard/completion-trend-chart";
import { AlertTriangle, Building2, CheckCircle2, Target, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Summary | ScorePrompt",
  description: "Cross-campaign management summary for company leadership",
};

interface SummaryPageProps {
  searchParams: Promise<{ range?: string; compare?: string }>;
}

function isInRange(dateIso: string, range: string) {
  if (!range) return true;
  const created = new Date(dateIso).getTime();
  const now = Date.now();
  const days =
    range === "30d" ? 30 : range === "90d" ? 90 : range === "365d" ? 365 : 0;
  if (!days) return true;
  return created >= now - days * 24 * 60 * 60 * 1000;
}

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect("/auth/login");
  }

  const { range = "", compare = "" } = await searchParams;

  const [stats, skillBreakdown, weaknesses, scoreTrend, comparison, campaignsStats] =
    await Promise.all([
      getDashboardStats(admin.organization_id),
      getSkillBreakdown(admin.organization_id),
      getCommonWeaknesses(admin.organization_id),
      getScoreTrend(admin.organization_id),
      getCampaignComparison(admin.organization_id),
      getCampaignsForOrganization(admin.organization_id, { page: 1, pageSize: 200 }),
    ]);

  const weakestCriterion = weaknesses[0]?.label ?? "—";

  const filteredComparison = comparison.filter((c) => isInRange(c.createdAt, range));
  const filteredScoreTrend = scoreTrend.filter((point) =>
    isInRange(point.date, range)
  );

  const statsById = new Map(
    campaignsStats.campaigns.map((campaign) => [campaign.id, campaign])
  );
  const comparisonRows = filteredComparison.map((item) => {
    const enriched = statsById.get(item.id);
    return {
      ...item,
      weakestArea: enriched?.weakest_area ?? "—",
    };
  });

  const campaignsCompleted = comparisonRows.filter((c) => c.completedCount > 0).length;
  const avgScore =
    comparisonRows.length > 0
      ? Math.round(
          comparisonRows.reduce((sum, c) => sum + (c.averageScore ?? 0), 0) /
            comparisonRows.length
        )
      : stats.averageScore ?? 0;
  const avgCompletionRate =
    comparisonRows.length > 0
      ? Math.round(
          comparisonRows.reduce((sum, c) => sum + c.completionRate, 0) /
            comparisonRows.length
        )
      : stats.completionRate;

  const completionTrendData = comparisonRows.map((campaign) => ({
    label: campaign.name,
    completionRate: campaign.completionRate,
  }));

  const criteriaAverages = skillBreakdown
    ? [
        { label: "Clarity", value: skillBreakdown.clarity },
        { label: "Context", value: skillBreakdown.context },
        { label: "Constraints", value: skillBreakdown.constraints },
        { label: "Output Format", value: skillBreakdown.outputFormat },
        { label: "Verification", value: skillBreakdown.verification },
      ]
    : [];

  const repeatedWeaknesses = weaknesses.slice(0, 4);

  const recommendedActions = [
    "Standardize prompt framework training across teams.",
    "Re-test teams after targeted coaching.",
    `Focus coaching on ${weakestCriterion.toLowerCase()} and verification.`,
  ];
  if (compare === "previous") {
    recommendedActions.push(
      "Review period-over-period changes and align remediation by department."
    );
  }

  if (comparisonRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">Not enough data yet</h2>
        <p className="text-neutral-500 text-center max-w-sm">
          Complete at least one campaign to see company-wide trends.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Summary</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Review company-wide trends across campaigns.
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            Use this page to review patterns across teams and campaigns.
          </p>
          <p className="text-xs text-neutral-500">
            This view is intended for company-level reporting, not campaign operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterSelect
            param="range"
            placeholder="All time"
            options={[
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "365d", label: "Last year" },
            ]}
          />
          <FilterSelect
            param="compare"
            placeholder="No compare"
            options={[{ value: "previous", label: "Compare to previous period" }]}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-xs text-neutral-500">Campaigns Completed</p><p className="text-2xl font-semibold mt-1">{campaignsCompleted}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-neutral-500">Average Score</p><p className="text-2xl font-semibold mt-1">{avgScore}/100</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-neutral-500">Average Completion</p><p className="text-2xl font-semibold mt-1">{avgCompletionRate}%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-neutral-500">Weakest Criterion</p><p className="text-lg font-semibold mt-1">{weakestCriterion}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={filteredScoreTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Completion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompletionTrendChart data={completionTrendData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Criteria Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {criteriaAverages.length === 0 ? (
              <p className="text-neutral-500 text-sm">No criteria data available.</p>
            ) : (
              <div className="space-y-3">
                {criteriaAverages.map((criterion) => (
                  <div key={criterion.label} className="flex items-center gap-3">
                    <span className="text-sm w-28">{criterion.label}</span>
                    <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 flex-1 overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${criterion.value}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">
                      {criterion.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Repeated Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {repeatedWeaknesses.length === 0 ? (
              <p className="text-neutral-500 text-sm">No repeated weakness patterns yet.</p>
            ) : (
              <ul className="space-y-3">
                {repeatedWeaknesses.map((weakness) => (
                  <li
                    key={weakness.criterion}
                    className="flex items-center justify-between p-2 rounded-md bg-neutral-50 dark:bg-neutral-800"
                  >
                    <span className="font-medium">{weakness.label}</span>
                    <span className="text-sm text-neutral-500">{weakness.averageScore}/100</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Campaign Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                  <th className="text-left py-2 pr-4 font-medium">Campaign</th>
                  <th className="text-right py-2 px-4 font-medium">Avg score</th>
                  <th className="text-right py-2 px-4 font-medium">Completion %</th>
                  <th className="text-left py-2 pl-4 font-medium">Weakest area</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium">{campaign.name}</td>
                    <td className="py-3 px-4 text-right">
                      {campaign.averageScore !== null ? campaign.averageScore : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">{campaign.completionRate}%</td>
                    <td className="py-3 pl-4">{campaign.weakestArea}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendedActions.map((action) => (
              <li key={action} className="text-sm flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {action}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
