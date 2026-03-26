import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { CreditCard, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Billing | Admin Panel",
  description: "Manage your billing and subscription",
};

export default function BillingPage() {
  return (
    <>
      <DashboardBreadcrumb title="Billing" text="Billing" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <div>
                <h3 className="font-semibold">Free Plan</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Basic features included</p>
              </div>
              <Button>Upgrade</Button>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <CreditCard className="w-8 h-8 text-neutral-400" />
              <div>
                <p className="text-neutral-600 dark:text-neutral-400">No payment method on file</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4">Add Payment Method</Button>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Billing History</h2>
            <p className="text-neutral-600 dark:text-neutral-400">No billing history available.</p>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h3 className="font-semibold mb-4">Plan Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                5 campaigns
              </li>
              <li className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                50 employees
              </li>
              <li className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Basic analytics
              </li>
              <li className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                Email support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
