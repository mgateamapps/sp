import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { NewCampaignForm } from "./new-campaign-form";

export const metadata: Metadata = {
  title: "New Campaign | ScorePrompt",
  description: "Create a new assessment campaign",
};

export default async function NewCampaignPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  return (
    <>
      <DashboardBreadcrumb title="New Campaign" text="Campaigns / New" />

      <div className="mb-6">
        <Link href="/dashboard/campaigns" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
        <NewCampaignForm />
      </div>
    </>
  );
}
