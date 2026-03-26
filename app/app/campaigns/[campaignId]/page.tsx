import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Campaign Details | Admin Panel",
  description: "View campaign details and employees",
};

interface CampaignPageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignPageProps) {
  const { campaignId } = await params;

  return (
    <>
      <DashboardBreadcrumb title="Campaign Details" text={`Campaigns / ${campaignId}`} />

      <div className="mb-6">
        <Link href="/app/campaigns" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Campaign: {campaignId}</h1>
            <p className="text-neutral-600 dark:text-neutral-400">Campaign description will appear here.</p>
          </div>
          <Button variant="outline">Edit Campaign</Button>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Employees
          </h2>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            No employees in this campaign yet.
          </p>
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add First Employee
          </Button>
        </div>
      </div>
    </>
  );
}
