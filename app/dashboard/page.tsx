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
} from "@/lib/queries/dashboard";
import SkillsBreakdownChart from "@/components/dashboard/skills-breakdown-chart";
import ScoreDistributionChart from "@/components/dashboard/score-distribution-chart";
import CompletionRateChart from "@/components/dashboard/completion-rate-chart";
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

  const [stats, skillBreakdown, scoreDistribution, recentCompletions, weaknesses] =
    await Promise.all([
      getDashboardStats(organization.id),
      getSkillBreakdown(organization.id),
      getScoreDistribution(organization.id),
      getRecentCompletions(organization.id, 5),
      getCommonWeaknesses(organization.id),
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

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                {weaknesses.slice(0, 3).map((weakness) => (
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
