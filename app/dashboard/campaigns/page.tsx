import { Button } from "@/components/ui/button";
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
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CampaignsPage({ searchParams }: CampaignsPageProps) {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const { page: pageParam, search = '' } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const { campaigns, total } = await getCampaignsForOrganization(admin.organization_id, {
    page,
    pageSize: PAGE_SIZE,
    search,
  });

  const isEmpty = total === 0 && !search;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              No campaigns yet. Create your first campaign to start assessing your team.
            </p>
            <Link href="/dashboard/campaigns/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <SearchableContent
            placeholder="Search campaigns..."
            header={
              <p className="text-sm text-neutral-500 shrink-0">
                {total} campaign{total !== 1 ? 's' : ''}
              </p>
            }
          >
            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                No campaigns match &ldquo;{search}&rdquo;.
              </div>
            ) : (
              <>
                <CampaignsTable campaigns={campaigns} />
                <Pagination
                  page={page}
                  total={total}
                  pageSize={PAGE_SIZE}
                  basePath="/dashboard/campaigns"
                  searchParams={search ? { search } : {}}
                />
              </>
            )}
          </SearchableContent>
        </div>
      )}
    </>
  );
}
