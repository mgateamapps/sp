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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { SearchableContent } from "@/components/ui/searchable-content";
import { ScoreBadge } from "@/components/ui/score-badge";
import { formatDate, formatDateTime, getStatusBadgeVariant, getParticipantStatusBadge } from "@/lib/utils/formatting";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import {
  getCampaignWithStats,
  getCampaignParticipantsPaginated,
  getCampaignScenarioBreakdown,
} from "@/lib/queries/campaigns";
import { getTopCoachingThemes } from "@/lib/queries/dashboard";
import { getCreditBalance } from "@/lib/queries/credits";
import { SendInvitesButton } from "./send-invites-button";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Users,
  CheckCircle,
  Clock,
  Eye,
  ExternalLink,
  Target,
  TrendingDown,
  Lightbulb,
  Download,
  AlertCircle,
  Tag,
} from "lucide-react";
import { redirect, notFound } from "next/navigation";
import type { ScoreBand } from "@/types";
import { FilterSelect } from "@/components/ui/filter-select";

const BAND_CONFIG: Record<ScoreBand, { label: string; colorClass: string }> = {
  expert:     { label: 'Expert',     colorClass: 'bg-green-500' },
  strong:     { label: 'Strong',     colorClass: 'bg-teal-500' },
  functional: { label: 'Functional', colorClass: 'bg-blue-500' },
  basic:      { label: 'Basic',      colorClass: 'bg-amber-500' },
  at_risk:    { label: 'At Risk',    colorClass: 'bg-red-500' },
};

export const metadata: Metadata = {
  title: "Campaign Details | ScorePrompt",
  description: "View campaign details and participants",
};

const PAGE_SIZE = 50;

const DOMAIN_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  sales: 'Sales',
  support: 'Support',
  product: 'Product',
  engineering: 'Engineering',
  hr: 'HR',
  operations: 'Operations',
  finance: 'Finance',
  consulting: 'Consulting',
  management: 'Management',
  other: 'Other',
};

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ page?: string; search?: string; status?: string; band?: string }>;
}


export default async function CampaignDetailPage({ params, searchParams }: CampaignPageProps) {
  const { campaignId } = await params;
  const { page: pageParam, search = '', status = '', band = '' } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const campaign = await getCampaignWithStats(campaignId);
  if (!campaign) {
    notFound();
  }

  if (campaign.organization_id !== admin.organization_id) {
    notFound();
  }

  const [{ participants, total: participantsTotal }, creditBalance, scenarioBreakdown, coachingThemes] = await Promise.all([
    getCampaignParticipantsPaginated(campaignId, { page, pageSize: PAGE_SIZE, search, status, band }),
    getCreditBalance(admin.organization_id),
    getCampaignScenarioBreakdown(campaignId),
    getTopCoachingThemes(admin.organization_id, campaignId, 5),
  ]);

  const completionRate =
    campaign.participant_count > 0
      ? Math.round((campaign.completed_count / campaign.participant_count) * 100)
      : 0;

  const openedCount = campaign.started_count;

  // Pending invite count = participants not yet emailed (no token_hash)
  const pendingInviteCount = participants.filter(
    (p) => p.status === 'invited' && !(p as { token_hash?: string }).token_hash
  ).length;

  const basePath = `/dashboard/campaigns/${campaignId}`;
  const paginationSearchParams: Record<string, string> = {};
  if (search) paginationSearchParams.search = search;
  if (status) paginationSearchParams.status = status;
  if (band) paginationSearchParams.band = band;

  // Deadline warning
  let deadlineWarning: 'expired' | 'soon' | null = null;
  if (campaign.deadline) {
    const now = new Date();
    const deadline = new Date(campaign.deadline);
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) deadlineWarning = 'expired';
    else if (diffDays <= 7) deadlineWarning = 'soon';
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href="/dashboard/campaigns"
          className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      {/* Campaign Header */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge variant={getStatusBadgeVariant(campaign.status)}>
                {campaign.status}
              </Badge>
              {campaign.domain && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {DOMAIN_LABELS[campaign.domain] ?? campaign.domain}
                </Badge>
              )}
            </div>
            {campaign.description && (
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(campaign.created_at)}
              </span>
              {campaign.deadline && (
                <span className={`flex items-center gap-1 ${
                  deadlineWarning === 'expired' ? 'text-red-600 dark:text-red-400 font-medium' :
                  deadlineWarning === 'soon' ? 'text-amber-600 dark:text-amber-400 font-medium' :
                  ''
                }`}>
                  {deadlineWarning ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  Deadline: {formatDate(campaign.deadline)}
                  {deadlineWarning === 'expired' && <Badge variant="danger" className="text-xs ml-1">Expired</Badge>}
                  {deadlineWarning === 'soon' && <Badge variant="warning" className="text-xs ml-1">Expires soon</Badge>}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {campaign.completed_count > 0 && (
              <Link href={`/api/campaigns/${campaignId}/export`}>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  Export CSV
                </Button>
              </Link>
            )}
            <SendInvitesButton
              campaignId={campaignId}
              pendingCount={campaign.participant_count}
              creditBalance={creditBalance}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Invited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-400" />
              <span className="text-2xl font-bold">{campaign.participant_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Opened</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-2xl font-bold">{openedCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">{campaign.completed_count}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{completionRate}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold">
                {campaign.average_score !== null ? campaign.average_score : '—'}
              </span>
              {campaign.average_score !== null && (
                <span className="text-sm text-neutral-400">/100</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution + Scenario Breakdown */}
      {campaign.completed_count > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaign.score_distribution.length === 0 ? (
                <p className="text-sm text-neutral-500">No scored assessments yet</p>
              ) : (
                <div className="space-y-2">
                  {campaign.score_distribution.map(({ band, count }) => {
                    const cfg = BAND_CONFIG[band];
                    const pct = campaign.completed_count > 0
                      ? Math.round((count / campaign.completed_count) * 100)
                      : 0;
                    return (
                      <div key={band} className="flex items-center gap-3">
                        <span className="text-xs text-neutral-500 w-20 shrink-0">{cfg.label}</span>
                        <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.colorClass}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500 w-12 text-right shrink-0">
                          {count > 0 ? `${count} (${pct}%)` : '0'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coaching Themes */}
          {coachingThemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Top Coaching Priorities
                  <span className="ml-auto text-xs font-normal text-neutral-400">most common across team</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {coachingThemes.map((theme, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300 leading-snug">
                        {theme.tip}
                        <span className="ml-2 text-xs text-neutral-400">({theme.count}×)</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Scenario Breakdown */}
      {scenarioBreakdown.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              Scenario Breakdown
              <span className="ml-auto text-xs font-normal text-neutral-400">sorted by difficulty (hardest first)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                    <th className="text-left py-2 pr-4 font-medium">Scenario</th>
                    <th className="text-right py-2 px-4 font-medium">Avg Score</th>
                    <th className="text-left py-2 px-4 font-medium">Hardest Criterion</th>
                    <th className="text-right py-2 pl-4 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioBreakdown.map((s) => (
                    <tr key={s.scenarioKey} className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                      <td className="py-3 pr-4 font-medium">{s.scenarioTitle}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${
                          s.averageScore >= 70 ? 'text-green-600 dark:text-green-400' :
                          s.averageScore >= 50 ? 'text-amber-600 dark:text-amber-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {s.averageScore}
                        </span>
                        <span className="text-neutral-400 text-xs">/100</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-xs text-red-700 dark:text-red-400">
                          {s.hardestCriterion}
                          <span className="text-red-400">({s.hardestCriterionAvg}/20)</span>
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right text-neutral-500">
                        {s.completedCount}/{campaign.completed_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Participants Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <SearchableContent
          placeholder="Search by email..."
          header={
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-semibold flex items-center gap-2 shrink-0">
                <Mail className="w-5 h-5" />
                Participants
                <span className="text-sm font-normal text-neutral-500">
                  ({(search || status || band) ? participantsTotal : campaign.participant_count})
                </span>
              </h2>
              <FilterSelect
                param="status"
                placeholder="All statuses"
                options={[
                  { value: 'invited', label: 'Invited' },
                  { value: 'opened', label: 'Opened' },
                  { value: 'started', label: 'Started' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
              <FilterSelect
                param="band"
                placeholder="All bands"
                options={[
                  { value: 'expert', label: 'Expert' },
                  { value: 'strong', label: 'Strong' },
                  { value: 'functional', label: 'Functional' },
                  { value: 'basic', label: 'Basic' },
                  { value: 'at_risk', label: 'At Risk' },
                ]}
              />
            </div>
          }
        >

        {campaign.participant_count === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No participants in this campaign yet.
            </p>
          </div>
        ) : participantsTotal === 0 && search ? (
          <div className="text-center py-12 text-neutral-500">
            No participants match &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.employee?.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getParticipantStatusBadge(participant.status)}>
                        {participant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {participant.score ? (
                        <ScoreBadge score={participant.score.total_score} />
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400">
                      {formatDateTime(participant.completed_at)}
                    </TableCell>
                    <TableCell>
                      {participant.score ? (
                        <Link
                          href={`/dashboard/campaigns/${campaignId}/employees/${participant.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            View
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              page={page}
              total={participantsTotal}
              pageSize={PAGE_SIZE}
              basePath={basePath}
              searchParams={paginationSearchParams}
            />
          </>
        )}
        </SearchableContent>
      </div>
    </>
  );
}
