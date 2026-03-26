import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Summary | Dashboard",
  description: "View your summary and analytics",
};

export default function SummaryPage() {
  return (
    <>
      <DashboardBreadcrumb title="Summary" text="Summary" />

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Your summary and analytics will be displayed here.
        </p>
      </div>
    </>
  );
}
