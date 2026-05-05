import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterSelect } from "@/components/ui/filter-select";
import { Pagination } from "@/components/ui/pagination";
import { SearchableContent } from "@/components/ui/searchable-content";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { getCampaignsForOrganization } from "@/lib/queries/campaigns";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import CampaignsTable from "./campaigns-table";

export const metadata: Metadata = {
  title: "Campaigns | ScorePrompt",
  description: "Manage your assessment campaigns",
};

const PAGE_SIZE = 20;

interface CampaignsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    domain?: string;
    date?: string;
  }>;
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const {
    page: pageParam,
    search = '',
    status = '',
    domain = '',
    date = '',
  } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const { campaigns, total } = await getCampaignsForOrganization(admin.organization_id, {
    page,
    pageSize: PAGE_SIZE,
    search,
    status,
    domain,
    date,
  });

  const isEmpty = total === 0 && !search && !status && !domain && !date;
  const hasActiveFilters = Boolean(search || status || domain || date);

  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "active").length;
  const pendingParticipants = campaigns.reduce(
    (sum, campaign) => sum + Math.max(0, campaign.participant_count - campaign.completed_count),
    0
  );
  const invitedTotal = campaigns.reduce((sum, campaign) => sum + campaign.participant_count, 0);
  const completedTotal = campaigns.reduce((sum, campaign) => sum + campaign.completed_count, 0);
  const avgCompletionRate =
    invitedTotal > 0 ? Math.round((completedTotal / invitedTotal) * 100) : 0;
  const weightedScore = campaigns.reduce(
    (sum, campaign) =>
      sum +
      (campaign.average_score !== null
        ? campaign.average_score * campaign.completed_count
        : 0),
    0
  );
  const avgScoreAcrossCompleted =
    completedTotal > 0 ? Math.round(weightedScore / completedTotal) : null;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Launch, monitor, and review team assessments.
          </p>
        </div>
        <Link href="/app/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Active Campaigns</p>
            <p className="text-2xl font-semibold mt-1">{activeCampaigns}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Pending Participants</p>
            <p className="text-2xl font-semibold mt-1">{pendingParticipants}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Average Completion</p>
            <p className="text-2xl font-semibold mt-1">{avgCompletionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Average Score</p>
            <p className="text-2xl font-semibold mt-1">
              {avgScoreAcrossCompleted !== null ? `${avgScoreAcrossCompleted}/100` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-lg font-semibold mb-2">No campaigns yet</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Create your first campaign to invite participants and start measuring prompt performance.
            </p>
            <Link href="/app/campaigns/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <SearchableContent
            placeholder="Search campaigns..."
            header={
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-neutral-500 shrink-0">
                  {total} campaign{total !== 1 ? 's' : ''}
                </p>
                <FilterSelect
                  param="status"
                  placeholder="All statuses"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "active", label: "Active" },
                    { value: "completed", label: "Completed" },
                    { value: "archived", label: "Archived" },
                  ]}
                />
                <FilterSelect
                  param="domain"
                  placeholder="All teams"
                  options={[
                    { value: "marketing", label: "Marketing" },
                    { value: "sales", label: "Sales" },
                    { value: "support", label: "Support" },
                    { value: "product", label: "Product" },
                    { value: "engineering", label: "Engineering" },
                    { value: "hr", label: "HR" },
                    { value: "operations", label: "Operations" },
                    { value: "finance", label: "Finance" },
                    { value: "consulting", label: "Consulting" },
                    { value: "management", label: "Management" },
                    { value: "other", label: "Other" },
                  ]}
                />
                <FilterSelect
                  param="date"
                  placeholder="All dates"
                  options={[
                    { value: "30d", label: "Last 30 days" },
                    { value: "90d", label: "Last 90 days" },
                    { value: "365d", label: "Last year" },
                  ]}
                />
              </div>
            }
          >
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                {hasActiveFilters
                  ? "No campaigns match the selected filters."
                  : `No campaigns match “${search}”.`}
              </div>
            ) : (
              <>
                <CampaignsTable campaigns={campaigns} />
                <Pagination
                  page={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  basePath="/app/campaigns"
                  searchParams={{
                    ...(search ? { search } : {}),
                    ...(status ? { status } : {}),
                    ...(domain ? { domain } : {}),
                    ...(date ? { date } : {}),
                  }}
                />
              </>
            )}
          </SearchableContent>
        </div>
      )}
    </>
  );
}
