import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentOrganization } from "@/lib/queries/admin";
import {
  getDashboardStats,
  getSkillBreakdown,
  getScoreDistribution,
  getRecentCompletions,
  getCommonWeaknesses,
  getTopPerformers,
  getCampaignComparison,
  getEmployeeProgressHistory,
  getScoreTrend,
} from "@/lib/queries/dashboard";
import SkillsBreakdownChart from "@/components/dashboard/skills-breakdown-chart";
import ScoreDistributionChart from "@/components/dashboard/score-distribution-chart";
import CompletionRateChart from "@/components/dashboard/completion-rate-chart";
import ScoreTrendChart from "@/components/dashboard/score-trend-chart";
import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Trophy,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import type { ScoreBand } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard | ScorePrompt",
  description: "Overview of your team's AI literacy assessments",
};

function getBandVariant(band: ScoreBand) {
  switch (band) {
    case "expert":
      return "success";
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
    case "at_risk":
      return "At Risk";
    case "basic":
      return "Basic";
    case "functional":
      return "Functional";
    case "strong":
      return "Strong";
    case "expert":
      return "Expert";
    default:
      return band;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function AppDashboardPage() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return (
      <>
        <DashboardBreadcrumb title="Dashboard" text="Dashboard" />
        <div className="text-center py-12">
          <p className="text-neutral-500">Unable to load dashboard data.</p>
        </div>
      </>
    );
  }

  const [
    stats,
    skillBreakdown,
    scoreDistribution,
    recentCompletions,
    weaknesses,
    topPerformers,
    campaignComparison,
    employeeProgress,
    scoreTrend,
  ] = await Promise.all([
    getDashboardStats(organization.id),
    getSkillBreakdown(organization.id),
    getScoreDistribution(organization.id),
    getRecentCompletions(organization.id, 5),
    getCommonWeaknesses(organization.id),
    getTopPerformers(organization.id, 5),
    getCampaignComparison(organization.id),
    getEmployeeProgressHistory(organization.id, 5),
    getScoreTrend(organization.id),
  ]);

  const hasData = stats.totalCampaigns > 0;
  const hasScores = stats.averageScore !== null;

  if (!hasData) {
    return (
      <>
        <DashboardBreadcrumb title="Dashboard" text="Dashboard" />
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Welcome to ScorePrompt</h2>
          <p className="text-neutral-500 text-center max-w-md mb-6">
            Create your first assessment campaign to start measuring your team's
            AI literacy and see insights here.
          </p>
          <Link href="/dashboard/campaigns/new">
            <Button>
              Create first campaign
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardBreadcrumb title="Dashboard" text="Dashboard" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Total Campaigns
                </p>
                <p className="text-3xl font-bold mt-1">{stats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Total Employees
                </p>
                <p className="text-3xl font-bold mt-1">{stats.totalEmployees}</p>
                {stats.pendingAssessments > 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    {stats.pendingAssessments} pending
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Average Score
                </p>
                <p className="text-3xl font-bold mt-1">
                  {hasScores ? `${stats.averageScore}/100` : "—"}
                </p>
                {hasScores && (
                  <p className="text-xs text-neutral-500 mt-1">
                    across all completed
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">
                  Completed This Month
                </p>
                <p className="text-3xl font-bold mt-1">
                  {stats.completedThisMonth}
                </p>
                {stats.totalEmployees > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    {stats.completionRate}% total rate
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend Chart - Full Width */}
      {scoreTrend.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChart className="w-5 h-5 text-primary" />
              Score Trend Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={scoreTrend} />
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
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

      {/* Campaign Comparison & Employee Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Campaign Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Campaign Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            {campaignComparison.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                No campaigns yet
              </p>
            ) : (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Campaign</TableHead>
                      <TableHead className="text-xs text-right">Avg Score</TableHead>
                      <TableHead className="text-xs text-right">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignComparison.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="text-xs font-medium truncate max-w-[120px]">
                          {campaign.name}
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <div className="flex items-center justify-end gap-1">
                            {campaign.averageScore !== null ? (
                              <>
                                <span className="font-semibold">{campaign.averageScore}</span>
                                {campaign.trend === "up" && (
                                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                                )}
                                {campaign.trend === "down" && (
                                  <ArrowDownRight className="w-3 h-3 text-red-500" />
                                )}
                                {campaign.trend === "same" && (
                                  <Minus className="w-3 h-3 text-neutral-400" />
                                )}
                              </>
                            ) : (
                              <span className="text-neutral-400">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <span className="font-medium">{campaign.completedCount}</span>
                          <span className="text-neutral-400">/{campaign.totalCount}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Employee Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employeeProgress.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                No employees with multiple assessments yet
              </p>
            ) : (
              <div className="space-y-3">
                {employeeProgress.map((employee) => (
                  <div
                    key={employee.employeeEmail}
                    className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate max-w-[180px]">
                        {employee.employeeEmail}
                      </p>
                      <Badge
                        variant={employee.improvement > 0 ? "success" : employee.improvement < 0 ? "danger" : "secondary"}
                        className="text-xs"
                      >
                        {employee.improvement > 0 ? "+" : ""}{employee.improvement} pts
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-neutral-500 overflow-x-auto">
                      {employee.assessments.map((assessment, idx) => (
                        <span key={idx} className="flex items-center whitespace-nowrap">
                          {idx > 0 && <span className="mx-1">→</span>}
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                            {assessment.score}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Middle Row - Top Performers & Areas to Improve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Performers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <Link href="/dashboard/campaigns">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                No completed assessments yet
              </p>
            ) : (
              <div className="space-y-2">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        performer.rank === 1
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : performer.rank === 2
                          ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                          : performer.rank === 3
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                      }`}
                    >
                      {performer.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {performer.employeeEmail}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {performer.campaignName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{performer.score}</p>
                      <Badge
                        variant={getBandVariant(performer.scoreBand)}
                        className="text-xs"
                      >
                        {formatBandLabel(performer.scoreBand)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Common Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                No data available yet
              </p>
            ) : (
              <div className="space-y-3">
                {weaknesses.slice(0, 5).map((weakness) => (
                  <div
                    key={weakness.criterion}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  >
                    <span className="font-medium">{weakness.label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        weakness.averageScore < 50
                          ? "text-red-600"
                          : weakness.averageScore < 70
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {weakness.averageScore}/100
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - Completion Rate & Recent Completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
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

        {/* Recent Completions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Completions</CardTitle>
            <Link href="/dashboard/campaigns">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentCompletions.length === 0 ? (
              <p className="text-neutral-500 text-sm">
                No completed assessments yet
              </p>
            ) : (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Employee</TableHead>
                      <TableHead className="text-xs">Score</TableHead>
                      <TableHead className="text-xs">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCompletions.map((completion) => (
                      <TableRow key={completion.id}>
                        <TableCell className="text-xs truncate max-w-[120px]">
                          {completion.employeeEmail}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {completion.score}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getBandVariant(completion.scoreBand)}
                            className="text-xs"
                          >
                            {formatBandLabel(completion.scoreBand)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
