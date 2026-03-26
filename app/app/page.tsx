import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Admin Panel",
  description: "Main dashboard overview",
};

export default function AppDashboardPage() {
  return (
    <>
      <DashboardBreadcrumb title="Dashboard" text="Dashboard" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Campaigns</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Active Employees</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending Assessments</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Completed This Month</h3>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          No recent activity to display.
        </p>
      </div>
    </>
  );
}
