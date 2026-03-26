import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Campaigns | Admin Panel",
  description: "Manage your campaigns",
};

export default function CampaignsPage() {
  return (
    <>
      <DashboardBreadcrumb title="Campaigns" text="Campaigns" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/app/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            No campaigns yet. Create your first campaign to get started.
          </p>
          <Link href="/app/campaigns/new">
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
