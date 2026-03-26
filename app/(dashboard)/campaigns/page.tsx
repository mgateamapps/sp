import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns | Dashboard",
  description: "Manage your campaigns",
};

export default function CampaignsPage() {
  return (
    <>
      <DashboardBreadcrumb title="Campaigns" text="Campaigns" />

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your campaigns will be displayed here.
        </p>
      </div>
    </>
  );
}
