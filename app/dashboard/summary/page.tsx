import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Summary | Admin Panel",
  description: "View your summary and analytics",
};

export default function SummaryPage() {
  return (
    <>
      <DashboardBreadcrumb title="Summary" text="Summary" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Assessments</h3>
          <p className="text-3xl font-bold mt-2">0</p>
          <p className="text-sm text-neutral-500 mt-1">All time</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2">0%</p>
          <p className="text-sm text-neutral-500 mt-1">Last 30 days</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Average Score</h3>
          <p className="text-3xl font-bold mt-2">-</p>
          <p className="text-sm text-neutral-500 mt-1">All assessments</p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold mb-4">Analytics Overview</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Detailed analytics and reports will be displayed here.
        </p>
      </div>
    </>
  );
}
