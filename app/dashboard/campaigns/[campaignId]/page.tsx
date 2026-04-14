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
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import {
  getCampaignWithStats,
  getCampaignParticipantsPaginated,
  getCampaignPayment,
} from "@/lib/queries/campaigns";
import { formatPrice } from "@/lib/utils/pricing";
import { SendInvitesButton } from "./send-invites-button";
import { RefundButton } from "./refund-button";
import { PaymentSuccessToast } from "./payment-success-toast";
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
  CreditCard,
} from "lucide-react";
import { redirect, notFound } from "next/navigation";
import type { ScoreBand } from "@/types";

export const metadata: Metadata = {
  title: "Campaign Details | ScorePrompt",
  description: "View campaign details and participants",
};

const PAGE_SIZE = 50;

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ payment?: string; page?: string; search?: string }>;
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case 'active':
      return 'default';
    case 'closed':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getParticipantStatusBadge(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case 'completed':
      return 'default';
    case 'started':
    case 'opened':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ScoreBadge({ score }: { score: number }) {
  let colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  if (score >= 80) {
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  } else if (score >= 60) {
    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  } else if (score >= 40) {
    colorClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
  }
  return (
    <span className={`px-2 py-0.5 rounded text-sm font-medium ${colorClass}`}>
      {score}
    </span>
  );
}

export default async function CampaignDetailPage({ params, searchParams }: CampaignPageProps) {
  const { campaignId } = await params;
  const { payment, page: pageParam, search = '' } = await searchParams;
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

  const [{ participants, total: participantsTotal }, paymentInfo] = await Promise.all([
    getCampaignParticipantsPaginated(campaignId, { page, pageSize: PAGE_SIZE, search }),
    getCampaignPayment(campaignId),
  ]);

  const completionRate =
    campaign.participant_count > 0
      ? Math.round((campaign.completed_count / campaign.participant_count) * 100)
      : 0;

  // For stats that need full participant counts, use the campaign stats (already fetched)
  const pendingInviteCount = 0; // updated below via a lean query
  const openedCount = campaign.started_count;
  const notStartedCount = campaign.participant_count - campaign.started_count;

  const isPaid =
    paymentInfo !== null &&
    (paymentInfo.status === 'completed' || paymentInfo.status === 'partially_refunded');

  const basePath = `/dashboard/campaigns/${campaignId}`;
  const paginationSearchParams: Record<string, string> = search ? { search } : {};
  if (payment) paginationSearchParams.payment = payment;

  return (
    <>
      {payment === 'success' && <PaymentSuccessToast />}

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
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{campaign.name}</h1>
              <Badge variant={getStatusBadgeVariant(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                {campaign.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(campaign.created_at)}
              </span>
              {campaign.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Deadline: {formatDate(campaign.deadline)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPaid && notStartedCount > 0 && paymentInfo && (
              <RefundButton
                campaignId={campaignId}
                originalEmployeeCount={paymentInfo.employee_count}
                eligibleForRefundCount={notStartedCount}
              />
            )}
            <SendInvitesButton
              campaignId={campaignId}
              pendingCount={pendingInviteCount}
              isPaid={isPaid}
            />
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {paymentInfo && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-green-500" />
              <div>
                <span className="font-medium">Payment Complete</span>
                <span className="text-neutral-500 ml-2">
                  {formatPrice(paymentInfo.amount_cents)} for {paymentInfo.employee_count}{' '}
                  employees
                </span>
              </div>
            </div>
            {paymentInfo.refund_amount_cents > 0 && (
              <Badge variant="secondary">
                Refunded: {formatPrice(paymentInfo.refund_amount_cents)} (
                {paymentInfo.refund_employee_count} employees)
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <CardTitle className="text-sm font-medium text-neutral-500">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{completionRate}%</span>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <SearchableContent
          placeholder="Search by email..."
          header={
            <h2 className="text-lg font-semibold flex items-center gap-2 shrink-0">
              <Mail className="w-5 h-5" />
              Participants
              <span className="text-sm font-normal text-neutral-500">
                ({campaign.participant_count})
              </span>
            </h2>
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
