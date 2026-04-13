import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
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

export default async function CampaignsPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const campaigns = await getCampaignsForOrganization(admin.organization_id);

  return (
    <>
      <DashboardBreadcrumb title="Campaigns" text="Campaigns" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/dashboard/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
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
          <CampaignsTable campaigns={campaigns} />
        </div>
      )}
    </>
  );
}
