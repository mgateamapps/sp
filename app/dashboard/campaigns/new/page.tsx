import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Mail, BarChart3 } from "lucide-react";
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8">
          <h1 className="text-2xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">Fill in the details below to launch a new AI literacy assessment.</p>
          <NewCampaignForm />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-4">How it works</h2>
            <div className="space-y-5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Invites sent automatically</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Each employee receives a unique assessment link by email.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">No employee account needed</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Employees complete the assessment directly from their email link.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Results appear in real time</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Scores and insights update as employees complete the assessment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Tips</h2>
            <ul className="space-y-2 text-sm text-neutral-500 dark:text-neutral-400">
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> Use a clear name so you can identify the campaign later (e.g. "Q2 2025 – Engineering").</li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> Set a deadline to increase completion rates.</li>
              <li className="flex gap-2"><span className="text-primary font-bold">·</span> You can add more employees after creating the campaign.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
