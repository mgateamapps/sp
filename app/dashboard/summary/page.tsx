import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentOrganization } from "@/lib/queries/admin";
import {
  getDashboardStats,
  getSkillBreakdown,
  getScoreDistribution,
  getCampaignComparison,
  getTopPerformers,
  getCommonWeaknesses,
  getRecentCompletions,
} from "@/lib/queries/dashboard";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Target,
  CheckCircle,
  Clock,
  Trophy,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScoreBand } from "@/types";

export const metadata: Metadata = {
  title: "Summary | ScorePrompt",
  description: "Full organization assessment summary",
};

function getBandVariant(band: ScoreBand) {
  switch (band) {
    case "expert":
    case "strong":
      return "success";
    case "functional":
      return "info";
    case "basic":
      return "warning";
    case "at_risk":
      return "danger";
    default:
      return "secondary";
  }
}

function formatBandLabel(band: ScoreBand): string {
  switch (band) {
    case "at_risk": return "At Risk";
    case "basic": return "Basic";
    case "functional": return "Functional";
    case "strong": return "Strong";
    case "expert": return "Expert";
    default: return band;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ScoreBar({ value, max = 100, colorClass }: { value: number; max?: number; colorClass: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-10 text-right">{value}</span>
    </div>
  );
}

function BandBar({ count, total, colorClass }: { count: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-neutral-500 w-16 text-right">{count} ({pct}%)</span>
    </div>
  );
}

export default async function SummaryPage() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">Unable to load summary data.</p>
      </div>
    );
  }

  const [
    stats,
    skillBreakdown,
    scoreDistribution,
    campaignComparison,
    topPerformers,
    weaknesses,
    recentCompletions,
  ] = await Promise.all([
    getDashboardStats(organization.id),
    getSkillBreakdown(organization.id),
    getScoreDistribution(organization.id),
    getCampaignComparison(organization.id),
    getTopPerformers(organization.id, 10),
    getCommonWeaknesses(organization.id),
    getRecentCompletions(organization.id, 50),
  ]);

  const hasData = stats.totalCampaigns > 0;
  const hasScores = stats.averageScore !== null;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No data yet</h2>
        <p className="text-neutral-500 text-center max-w-sm mb-6">
          Create a campaign and complete some assessments to see your organization summary.
        </p>
        <Link href="/dashboard/campaigns/new">
          <Button size="lg">
            Create campaign
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  const totalScored = scoreDistribution.atRisk + scoreDistribution.basic +
    scoreDistribution.functional + scoreDistribution.strong + scoreDistribution.expert;

  const atRiskEmployees = recentCompletions.filter(
    (c) => c.scoreBand === "at_risk" || c.scoreBand === "basic"
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Summary</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Generated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* ── Section 1: Key Metrics ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Campaigns</p>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Invited</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Completed</p>
                <p className="text-2xl font-bold">{totalScored}</p>
                <p className="text-xs text-neutral-400">{stats.completionRate}% rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-500">Avg Score</p>
                <p className="text-2xl font-bold">{hasScores ? stats.averageScore : "—"}</p>
                {hasScores && <p className="text-xs text-neutral-400">out of 100</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 2: Score Distribution + Skills ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score band distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Score Band Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalScored === 0 ? (
              <p className="text-sm text-neutral-500">No scored assessments yet</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Expert (85–100)</span>
                  </div>
                  <BandBar count={scoreDistribution.expert} total={totalScored} colorClass="bg-green-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-teal-700 dark:text-teal-400">Strong (70–84)</span>
                  </div>
                  <BandBar count={scoreDistribution.strong} total={totalScored} colorClass="bg-teal-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Functional (50–69)</span>
                  </div>
                  <BandBar count={scoreDistribution.functional} total={totalScored} colorClass="bg-blue-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Basic (30–49)</span>
                  </div>
                  <BandBar count={scoreDistribution.basic} total={totalScored} colorClass="bg-amber-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-red-700 dark:text-red-400">At Risk (&lt;30)</span>
                  </div>
                  <BandBar count={scoreDistribution.atRisk} total={totalScored} colorClass="bg-red-500" />
                </div>
                <p className="text-xs text-neutral-400 pt-1">{totalScored} scored assessments total</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Average Skills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!skillBreakdown ? (
              <p className="text-sm text-neutral-500">No scored assessments yet</p>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Clarity", value: skillBreakdown.clarity },
                  { label: "Context", value: skillBreakdown.context },
                  { label: "Constraints", value: skillBreakdown.constraints },
                  { label: "Output Format", value: skillBreakdown.outputFormat },
                  { label: "Verification", value: skillBreakdown.verification },
                ].map((skill) => (
                  <div key={skill.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{skill.label}</span>
                      <span className={`text-xs font-semibold ${
                        skill.value >= 70 ? "text-green-600" :
                        skill.value >= 50 ? "text-amber-600" :
                        "text-red-600"
                      }`}>
                        {skill.value >= 70 ? "Good" : skill.value >= 50 ? "Needs work" : "Weak"}
                      </span>
                    </div>
                    <ScoreBar
                      value={skill.value}
                      colorClass={
                        skill.value >= 70 ? "bg-green-500" :
                        skill.value >= 50 ? "bg-amber-500" :
                        "bg-red-500"
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Section 3: Campaign Breakdown ── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Campaign Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaignComparison.length === 0 ? (
            <p className="text-sm text-neutral-500">No campaigns yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-2 pr-4 font-medium text-neutral-500">Campaign</th>
                    <th className="text-right py-2 px-4 font-medium text-neutral-500">Invited</th>
                    <th className="text-right py-2 px-4 font-medium text-neutral-500">Completed</th>
                    <th className="text-right py-2 px-4 font-medium text-neutral-500">Rate</th>
                    <th className="text-right py-2 px-4 font-medium text-neutral-500">Avg Score</th>
                    <th className="text-right py-2 pl-4 font-medium text-neutral-500">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignComparison.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/dashboard/campaigns/${campaign.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {campaign.name}
                        </Link>
                        <p className="text-xs text-neutral-400">{formatDate(campaign.createdAt)}</p>
                      </td>
                      <td className="text-right py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {campaign.totalCount}
                      </td>
                      <td className="text-right py-3 px-4 font-medium">
                        {campaign.completedCount}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={`font-semibold ${
                          campaign.completionRate >= 75 ? "text-green-600" :
                          campaign.completionRate >= 40 ? "text-amber-600" :
                          "text-red-600"
                        }`}>
                          {campaign.completionRate}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {campaign.averageScore !== null ? campaign.averageScore : <span className="text-neutral-400">—</span>}
                      </td>
                      <td className="text-right py-3 pl-4">
                        {campaign.trend === "up" && <ArrowUpRight className="w-4 h-4 text-green-500 ml-auto" />}
                        {campaign.trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500 ml-auto" />}
                        {campaign.trend === "same" && <Minus className="w-4 h-4 text-neutral-400 ml-auto" />}
                        {campaign.trend === null && <span className="text-neutral-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Section 4: Top performers + Needs Attention ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-sm text-neutral-500">No completed assessments yet</p>
            ) : (
              <div className="space-y-2">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      performer.rank === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      performer.rank === 2 ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300" :
                      performer.rank === 3 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    }`}>
                      {performer.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{performer.employeeEmail}</p>
                      <p className="text-xs text-neutral-400 truncate">{performer.campaignName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">{performer.score}</p>
                      <Badge variant={getBandVariant(performer.scoreBand)} className="text-xs">
                        {formatBandLabel(performer.scoreBand)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Needs Attention
              {atRiskEmployees.length > 0 && (
                <span className="ml-auto text-xs font-normal text-neutral-500">
                  {atRiskEmployees.length} employee{atRiskEmployees.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atRiskEmployees.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                No employees in at-risk or basic range
              </div>
            ) : (
              <div className="space-y-2">
                {atRiskEmployees.slice(0, 10).map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{emp.employeeEmail}</p>
                      <p className="text-xs text-neutral-400 truncate">{emp.campaignName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-red-600 dark:text-red-400">{emp.score}</p>
                      <Badge variant={getBandVariant(emp.scoreBand)} className="text-xs">
                        {formatBandLabel(emp.scoreBand)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {atRiskEmployees.length > 10 && (
                  <p className="text-xs text-neutral-400 pt-1">
                    +{atRiskEmployees.length - 10} more — check individual campaigns for full list
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
