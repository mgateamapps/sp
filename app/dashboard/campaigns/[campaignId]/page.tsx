import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { ScoreBadge } from "@/components/ui/score-badge";
import { SearchableContent } from "@/components/ui/searchable-content";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import {
  getCampaignCriteriaMetrics,
  getCampaignParticipantsPaginated,
  getCampaignScenarioBreakdown,
  getCampaignWithStats,
} from "@/lib/queries/campaigns";
import { getCampaignComparison, getTopCoachingThemes } from "@/lib/queries/dashboard";
import { getCreditBalance } from "@/lib/queries/credits";
import {
  formatBandLabel,
  formatDate,
  formatDateTime,
  getBandVariant,
  getParticipantStatusBadge,
  getStatusBadgeVariant,
} from "@/lib/utils/formatting";
import { CampaignExportPanel } from "./campaign-export-panel";
import { CampaignDetailTabs } from "./campaign-detail-tabs";
import { ParticipantRowActions } from "./participant-row-actions";
import { SendInvitesButton } from "./send-invites-button";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Lightbulb,
  Mail,
  Tag,
  Target,
  TrendingDown,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Campaign | ScorePrompt",
  description: "Review campaign progress, participant results, and analysis",
};

const PAGE_SIZE = 50;

const DOMAIN_LABELS: Record<string, string> = {
  marketing: "Marketing",
  sales: "Sales",
  support: "Support",
  product: "Product",
  engineering: "Engineering",
  hr: "HR",
  operations: "Operations",
  finance: "Finance",
  consulting: "Consulting",
  management: "Management",
  other: "Other",
};

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    band?: string;
    weakest?: string;
    tab?: "overview" | "participants" | "analysis" | "export";
  }>;
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default async function CampaignDetailPage({
  params,
  searchParams,
}: CampaignPageProps) {
  const { campaignId } = await params;
  const {
    page: pageParam,
    search = "",
    status = "",
    band = "",
    weakest = "",
    tab = "overview",
  } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect("/auth/login");
  }

  const campaign = await getCampaignWithStats(campaignId);
  if (!campaign || campaign.organization_id !== admin.organization_id) {
    notFound();
  }

  const [
    { participants, total: participantsTotal },
    creditBalance,
    scenarioBreakdown,
    coachingThemes,
    criteriaMetrics,
    comparisonData,
  ] = await Promise.all([
    getCampaignParticipantsPaginated(campaignId, {
      page,
      pageSize: PAGE_SIZE,
      search,
      status,
      band,
      weakest,
    }),
    getCreditBalance(admin.organization_id),
    getCampaignScenarioBreakdown(campaignId),
    getTopCoachingThemes(admin.organization_id, campaignId, 6),
    getCampaignCriteriaMetrics(campaignId),
    getCampaignComparison(admin.organization_id),
  ]);

  const completionRate =
    campaign.participant_count > 0
      ? Math.round((campaign.completed_count / campaign.participant_count) * 100)
      : 0;
  const unopenedCount = Math.max(0, campaign.participant_count - campaign.opened_count);
  const startedIncompleteCount = Math.max(0, campaign.started_count - campaign.completed_count);

  const previousCampaign = comparisonData
    .find((item) => item.id === campaign.id)
    ? (() => {
        const index = comparisonData.findIndex((item) => item.id === campaign.id);
        return index > 0 ? comparisonData[index - 1] : null;
      })()
    : null;

  const avgDelta =
    previousCampaign?.averageScore !== null && campaign.average_score !== null
      ? campaign.average_score - previousCampaign.averageScore
      : null;

  const weakestCriteria = (criteriaMetrics?.criteria ?? [])
    .slice()
    .sort((a, b) => a.average - b.average)
    .slice(0, 3);
  const repeatedWeaknesses = (criteriaMetrics?.weakestCounts ?? []).slice(0, 4);
  const hardestScenario = scenarioBreakdown[0];

  const recommendedActions: string[] = [];
  if (unopenedCount > 0) {
    recommendedActions.push(`Resend invites to ${unopenedCount} unopened participants.`);
  }
  if (startedIncompleteCount > 0) {
    recommendedActions.push(`Follow up with ${startedIncompleteCount} started but incomplete participants.`);
  }
  recommendedActions.push("Focus coaching on constraints and output format.");
  recommendedActions.push("Re-run this assessment in 30 days to measure progress.");

  const paginationSearchParams: Record<string, string> = {};
  if (search) paginationSearchParams.search = search;
  if (status) paginationSearchParams.status = status;
  if (band) paginationSearchParams.band = band;
  if (weakest) paginationSearchParams.weakest = weakest;
  paginationSearchParams.tab = "participants";

  let deadlineWarning: "expired" | "soon" | null = null;
  if (campaign.deadline) {
    const now = new Date();
    const deadline = new Date(campaign.deadline);
    const diffDays = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) deadlineWarning = "expired";
    else if (diffDays <= 7) deadlineWarning = "soon";
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/app/campaigns"
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge variant={getStatusBadgeVariant(campaign.status)}>
                {formatStatusLabel(campaign.status)}
              </Badge>
              {campaign.domain && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {DOMAIN_LABELS[campaign.domain] ?? campaign.domain}
                </Badge>
              )}
            </div>
            {campaign.description && (
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">{campaign.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(campaign.created_at)}
              </span>
              {campaign.deadline && (
                <span
                  className={`flex items-center gap-1 ${
                    deadlineWarning === "expired"
                      ? "text-red-600 dark:text-red-400 font-medium"
                      : deadlineWarning === "soon"
                      ? "text-amber-600 dark:text-amber-400 font-medium"
                      : ""
                  }`}
                >
                  {deadlineWarning ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  Deadline: {formatDate(campaign.deadline)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <SendInvitesButton
              campaignId={campaignId}
              pendingCount={unopenedCount}
              creditBalance={creditBalance}
            />
            <Link href={`/api/campaigns/${campaignId}/export`}>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1.5" />
                Export
              </Button>
            </Link>
            <Button variant="outline" size="sm" disabled>
              Edit Campaign
            </Button>
            <Button variant="outline" size="sm" disabled>
              Archive
            </Button>
          </div>
        </div>
      </div>

      <CampaignDetailTabs campaignId={campaignId} activeTab={tab} />

      {tab === "overview" && (
        <>
          <h2 className="text-lg font-semibold mb-3">Campaign Progress</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-500">Invited</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{campaign.participant_count}</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-500">Opened</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{campaign.opened_count}</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-500">Started</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{campaign.started_count}</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-500">Completed</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{campaign.completed_count}</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-500">Completion Rate</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{completionRate}%</span></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-neutral-500">Average Score</CardTitle></CardHeader><CardContent><span className="text-2xl font-bold">{campaign.average_score ?? "—"}</span></CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Score Distribution</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {campaign.score_distribution.map((band) => {
                  const percent =
                    campaign.completed_count > 0
                      ? Math.round((band.count / campaign.completed_count) * 100)
                      : 0;
                  return (
                    <div key={band.band} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-neutral-500">{formatBandLabel(band.band)}</span>
                      <div className="h-2 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-xs text-neutral-500 w-14 text-right">{band.count} ({percent}%)</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Weakest Criteria</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {weakestCriteria.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    No completed assessments yet. Results will appear here once participants start completing the campaign.
                  </p>
                ) : (
                  weakestCriteria.map((criterion) => (
                    <div key={criterion.key} className="flex items-center justify-between text-sm">
                      <span>{criterion.label}</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{criterion.average}/100</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Repeated Weaknesses</CardTitle></CardHeader>
              <CardContent>
                {repeatedWeaknesses.length === 0 ? (
                  <p className="text-sm text-neutral-500">No repeated weakness patterns yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {repeatedWeaknesses.map((item) => (
                      <li key={item.key} className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="text-neutral-500">{item.count} participant{item.count === 1 ? "" : "s"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Scenario Performance</CardTitle></CardHeader>
              <CardContent>
                {hardestScenario ? (
                  <div className="text-sm space-y-2">
                    <p><span className="text-neutral-500">Hardest scenario:</span> <span className="font-medium">{hardestScenario.scenarioTitle}</span></p>
                    <p><span className="text-neutral-500">Average score:</span> <span className="font-medium">{hardestScenario.averageScore}/100</span></p>
                    <p><span className="text-neutral-500">Hardest criterion:</span> <span className="font-medium">{hardestScenario.hardestCriterion}</span></p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">No scenario performance data yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader><CardTitle className="text-base">Recommended Actions</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendedActions.map((action) => (
                  <li key={action} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "participants" && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <SearchableContent
            placeholder="Search Participants"
            header={
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-semibold shrink-0">Participants</h2>
                <p className="text-sm text-neutral-500">{participantsTotal} participants</p>
                <Button size="sm" variant="outline" disabled>Resend Unopened</Button>
                <Button size="sm" variant="outline" disabled>Export Selected</Button>
                <FilterSelect
                  param="status"
                  placeholder="Status"
                  options={[
                    { value: "invited", label: "Invited" },
                    { value: "opened", label: "Opened" },
                    { value: "started", label: "Started" },
                    { value: "completed", label: "Completed" },
                  ]}
                />
                <FilterSelect
                  param="band"
                  placeholder="Score Band"
                  options={[
                    { value: "at_risk", label: "At Risk" },
                    { value: "basic", label: "Basic" },
                    { value: "functional", label: "Functional" },
                    { value: "strong", label: "Strong" },
                    { value: "expert", label: "Expert" },
                  ]}
                />
                <FilterSelect
                  param="weakest"
                  placeholder="Weakest Criterion"
                  options={[
                    { value: "clarity", label: "Clarity" },
                    { value: "context", label: "Context" },
                    { value: "constraints", label: "Constraints" },
                    { value: "output_format", label: "Output Format" },
                    { value: "verification", label: "Verification" },
                  ]}
                />
              </div>
            }
          >
            {participantsTotal === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="font-medium">No participants found</p>
                <p className="text-sm mt-1">Try adjusting your filters or invite more participants.</p>
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-4 font-medium">Participant</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-left py-3 px-4 font-medium">Opened</th>
                      <th className="text-left py-3 px-4 font-medium">Completed</th>
                      <th className="text-left py-3 px-4 font-medium">Score</th>
                      <th className="text-left py-3 px-4 font-medium">Score Band</th>
                      <th className="text-left py-3 px-4 font-medium">Weakest Criterion</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                        <td className="py-3 px-4">
                          <div className="font-medium">{participant.employee?.full_name || "—"}</div>
                          <div className="text-neutral-500">{participant.employee?.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={getParticipantStatusBadge(participant.status)}>
                            {formatStatusLabel(participant.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                          {formatDateTime(participant.started_at)}
                        </td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                          {formatDateTime(participant.completed_at)}
                        </td>
                        <td className="py-3 px-4">
                          {participant.score ? <ScoreBadge score={participant.score.total_score} /> : "—"}
                        </td>
                        <td className="py-3 px-4">
                          {participant.score ? (
                            <Badge variant={getBandVariant(participant.score.score_band)}>
                              {formatBandLabel(participant.score.score_band)}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {participant.weakest_criterion ? (
                            <span>
                              {participant.weakest_criterion}
                              {participant.weakest_criterion_score !== null &&
                              participant.weakest_criterion_score !== undefined ? (
                                <span className="text-neutral-400 text-xs"> ({participant.weakest_criterion_score}/20)</span>
                              ) : null}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <ParticipantRowActions
                            campaignId={campaignId}
                            participantId={participant.id}
                            canResend={participant.status !== "completed"}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  page={page}
                  total={participantsTotal}
                  pageSize={PAGE_SIZE}
                  basePath={`/app/campaigns/${campaignId}`}
                  searchParams={paginationSearchParams}
                />
              </>
            )}
          </SearchableContent>
        </div>
      )}

      {tab === "analysis" && (
        <>
          <h2 className="text-lg font-semibold mb-3">Campaign Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Criteria Breakdown</CardTitle>
                <p className="text-sm text-neutral-500">
                  See which scoring criteria are holding the team back.
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {(criteriaMetrics?.criteria ?? []).map((criterion) => (
                  <div key={criterion.key} className="flex items-center gap-3">
                    <span className="w-28 text-sm">{criterion.label}</span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${criterion.average}%` }} />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{criterion.average}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Common Mistake Patterns</CardTitle>
                <p className="text-sm text-neutral-500">
                  Review repeated prompt issues across completed assessments.
                </p>
              </CardHeader>
              <CardContent>
                {repeatedWeaknesses.length === 0 ? (
                  <p className="text-sm text-neutral-500">No common patterns available yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {repeatedWeaknesses.map((weakness) => (
                      <li key={weakness.key} className="text-sm flex justify-between">
                        <span>{weakness.label}</span>
                        <span className="text-neutral-500">{weakness.count}x weakest</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coaching Priorities</CardTitle>
                <p className="text-sm text-neutral-500">
                  Identify the most useful coaching focus for the next cycle.
                </p>
              </CardHeader>
              <CardContent>
                {coachingThemes.length === 0 ? (
                  <p className="text-sm text-neutral-500">No coaching priorities yet.</p>
                ) : (
                  <ol className="space-y-2">
                    {coachingThemes.map((theme, i) => (
                      <li key={`${theme.tip}-${i}`} className="text-sm flex gap-2">
                        <span className="text-primary font-semibold">{i + 1}.</span>
                        <span>{theme.tip} <span className="text-neutral-400">({theme.count}x)</span></span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Compare to Previous Campaign</CardTitle></CardHeader>
              <CardContent>
                {!previousCampaign ? (
                  <p className="text-sm text-neutral-500">No previous campaign found for comparison.</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p>Previous campaign: <span className="font-medium">{previousCampaign.name}</span></p>
                    <p>Previous avg score: <span className="font-medium">{previousCampaign.averageScore ?? "—"}</span></p>
                    <p>Current avg score: <span className="font-medium">{campaign.average_score ?? "—"}</span></p>
                    <p>
                      Delta:{" "}
                      <span
                        className={`font-medium ${
                          avgDelta === null
                            ? ""
                            : avgDelta > 0
                            ? "text-green-600 dark:text-green-400"
                            : avgDelta < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-neutral-500"
                        }`}
                      >
                        {avgDelta === null ? "—" : `${avgDelta > 0 ? "+" : ""}${avgDelta}`}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                Scenario Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scenarioBreakdown.length === 0 ? (
                <p className="text-sm text-neutral-500">No scenario analysis data yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                        <th className="text-left py-2 pr-4 font-medium">Scenario</th>
                        <th className="text-right py-2 px-4 font-medium">Avg score</th>
                        <th className="text-left py-2 px-4 font-medium">Hardest criterion</th>
                        <th className="text-right py-2 pl-4 font-medium">Completed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarioBreakdown.map((scenario) => (
                        <tr key={scenario.scenarioKey} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                          <td className="py-3 pr-4 font-medium">{scenario.scenarioTitle}</td>
                          <td className="py-3 px-4 text-right">{scenario.averageScore}/100</td>
                          <td className="py-3 px-4">
                            {scenario.hardestCriterion}{" "}
                            <span className="text-neutral-400 text-xs">({scenario.hardestCriterionAvg}/20)</span>
                          </td>
                          <td className="py-3 pl-4 text-right text-neutral-500">{scenario.completedCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "export" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Export Report</CardTitle>
            <p className="text-sm text-neutral-500">
              Choose what to include in your campaign export.
            </p>
          </CardHeader>
          <CardContent>
            <CampaignExportPanel campaignId={campaignId} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
