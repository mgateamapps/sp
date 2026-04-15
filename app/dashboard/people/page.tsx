import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { redirect } from "next/navigation";
import { getBandVariant, formatBandLabel } from "@/lib/utils/formatting";
import {
  getTopPerformers,
  getNeedsAttention,
  getEmployeeProgressHistory,
} from "@/lib/queries/dashboard";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  Trophy,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "People | ScorePrompt",
  description: "Employee performance, top performers and coaching priorities",
};

export default async function PeoplePage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const [topPerformers, needsAttention, employeeProgress] = await Promise.all([
    getTopPerformers(admin.organization_id, 10),
    getNeedsAttention(admin.organization_id, 20),
    getEmployeeProgressHistory(admin.organization_id, 15),
  ]);

  const hasData = topPerformers.length > 0 || needsAttention.length > 0 || employeeProgress.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-center">No employee data yet</h2>
        <p className="text-neutral-500 text-center max-w-sm">
          Complete some assessments to see employee performance, progress, and coaching priorities here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Needs Attention + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Needs Attention
              {needsAttention.length > 0 && (
                <span className="ml-auto text-xs font-normal text-neutral-500">
                  {needsAttention.length} employee{needsAttention.length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {needsAttention.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                No employees in at-risk or basic range
              </div>
            ) : (
              <div className="space-y-2">
                {needsAttention.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-start gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{emp.employeeEmail}</p>
                        <Link
                          href={`/dashboard/campaigns/${emp.campaignId}/employees/${emp.participantId}`}
                          className="shrink-0 text-neutral-400 hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{emp.campaignName}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Weakest:{" "}
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {emp.weakestCriterion} ({emp.weakestScore}/20)
                        </span>
                        {" · "}
                        <span className="text-amber-600 dark:text-amber-400">
                          {emp.secondWeakestCriterion}
                        </span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-red-600 dark:text-red-400">{emp.score}</p>
                      <Badge variant={getBandVariant(emp.scoreBand)} className="text-xs">
                        {formatBandLabel(emp.scoreBand)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <p className="text-neutral-500 text-sm">No completed assessments yet</p>
            ) : (
              <div className="space-y-2">
                {topPerformers.map((performer) => (
                  <div
                    key={performer.id}
                    className="flex items-center gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      performer.rank === 1
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : performer.rank === 2
                        ? "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300"
                        : performer.rank === 3
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    }`}>
                      {performer.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{performer.employeeEmail}</p>
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
      </div>

      {/* Employee Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Employee Progress
            <span className="ml-auto text-xs font-normal text-neutral-400">
              employees with multiple assessments
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeeProgress.length === 0 ? (
            <p className="text-neutral-500 text-sm">
              No employees with multiple assessments yet
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {employeeProgress.map((employee) => {
                const lastScore = employee.assessments[employee.assessments.length - 1]?.score;
                return (
                  <div
                    key={employee.employeeEmail}
                    className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium truncate max-w-[150px]">
                        {employee.employeeEmail}
                      </p>
                      <Badge
                        variant={employee.improvement > 0 ? "success" : employee.improvement < 0 ? "danger" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {employee.improvement > 0 ? "+" : ""}{employee.improvement} pts
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
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
                      {lastScore !== undefined && (
                        <span className="text-xs text-neutral-400 shrink-0 ml-2">
                          latest: <span className="font-semibold text-neutral-600 dark:text-neutral-300">{lastScore}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
