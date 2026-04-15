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
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { redirect } from "next/navigation";
import { getBandVariant, formatBandLabel } from "@/lib/utils/formatting";
import {
  getDashboardStats,
  getRecentCompletions,
  getCampaignComparison,
  getScoreTrend,
} from "@/lib/queries/dashboard";
import ScoreTrendChart from "@/components/dashboard/score-trend-chart";
import { QuickTestButton } from "@/components/dashboard/quick-test-button";
import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Target,
  Clock,
  TrendingUp,
  ArrowRight,
  BarChart3,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | ScorePrompt",
  description: "Overview of your team's AI literacy assessments",
};

export default async function AppDashboardPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const [stats, recentCompletions, campaignComparison, scoreTrend] = await Promise.all([
    getDashboardStats(admin.organization_id),
    getRecentCompletions(admin.organization_id, 5),
    getCampaignComparison(admin.organization_id),
    getScoreTrend(admin.organization_id),
  ]);

  const hasData = stats.totalCampaigns > 0;
  const hasScores = stats.averageScore !== null;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <LayoutDashboard className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">No campaigns yet</h2>
        <p className="text-neutral-500 text-center max-w-sm mb-8">
          Create your first campaign to start assessing your team's AI literacy. Results and insights will appear here automatically.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/dashboard/campaigns/new">
            <Button size="lg">
              Create your first campaign
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <QuickTestButton />
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium">Invite employees</p>
            <p className="text-xs text-neutral-500">Send assessments by email — no employee account needed.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">Get AI scores</p>
            <p className="text-xs text-neutral-500">Each prompt is scored across 5 criteria by AI in real time.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm font-medium">Track progress</p>
            <p className="text-xs text-neutral-500">Compare results across campaigns and monitor team growth.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">Total Campaigns</p>
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
                <p className="text-sm font-medium text-neutral-500">Total Employees</p>
                <p className="text-3xl font-bold mt-1">{stats.totalEmployees}</p>
                {stats.pendingAssessments > 0 && (
                  <p className="text-xs text-amber-600 mt-1">{stats.pendingAssessments} pending</p>
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
                <p className="text-sm font-medium text-neutral-500">Average Score</p>
                <p className="text-3xl font-bold mt-1">
                  {hasScores ? `${stats.averageScore}/100` : "—"}
                </p>
                {hasScores && (
                  <p className="text-xs text-neutral-500 mt-1">across all completed</p>
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
                <p className="text-sm font-medium text-neutral-500">Completed This Month</p>
                <p className="text-3xl font-bold mt-1">{stats.completedThisMonth}</p>
                {stats.totalEmployees > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">{stats.completionRate}% total rate</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend */}
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

      {/* Campaign Comparison */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Campaign Comparison
          </CardTitle>
          <Link href="/dashboard/campaigns">
            <Button variant="ghost" size="sm">
              View all
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {campaignComparison.length === 0 ? (
            <p className="text-neutral-500 text-sm">No campaigns yet</p>
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
                  {campaignComparison.map((campaign) => {
                    const rate = campaign.totalCount > 0
                      ? Math.round((campaign.completedCount / campaign.totalCount) * 100)
                      : 0;
                    return (
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
                        </td>
                        <td className="text-right py-3 px-4 text-neutral-600 dark:text-neutral-400">
                          {campaign.totalCount}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {campaign.completedCount}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-semibold ${
                            rate >= 75 ? "text-green-600" :
                            rate >= 40 ? "text-amber-600" :
                            "text-red-600"
                          }`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          {campaign.averageScore !== null
                            ? campaign.averageScore
                            : <span className="text-neutral-400">—</span>}
                        </td>
                        <td className="text-right py-3 pl-4">
                          {campaign.trend === "up" && <ArrowUpRight className="w-4 h-4 text-green-500 ml-auto" />}
                          {campaign.trend === "down" && <ArrowDownRight className="w-4 h-4 text-red-500 ml-auto" />}
                          {campaign.trend === "same" && <Minus className="w-4 h-4 text-neutral-400 ml-auto" />}
                          {campaign.trend === null && <span className="text-neutral-300 text-xs">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentCompletions.length === 0 ? (
            <p className="text-neutral-500 text-sm">No completed assessments yet</p>
          ) : (
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Employee</TableHead>
                    <TableHead className="text-xs">Campaign</TableHead>
                    <TableHead className="text-xs">Score</TableHead>
                    <TableHead className="text-xs">Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCompletions.map((completion) => (
                    <TableRow key={completion.id}>
                      <TableCell className="text-xs truncate max-w-[140px]">
                        {completion.employeeEmail}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500 truncate max-w-[120px]">
                        {completion.campaignName}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {completion.score}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBandVariant(completion.scoreBand)} className="text-xs">
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
    </>
  );
}
