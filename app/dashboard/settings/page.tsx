import { getAdminWithOrganization } from "@/lib/queries/admin";
import { getTrialStatus } from "@/lib/queries/credits";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { OrganizationForm } from "./organization-form";
import { InviteEmailForm } from "./invite-email-form";
import Link from "next/link";
import { Zap, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | ScorePrompt",
  description: "Manage your account and organization settings",
};

export default async function SettingsPage() {
  const data = await getAdminWithOrganization();
  if (!data) redirect('/auth/login');

  const { admin, organization } = data;
  const trial = await getTrialStatus(admin.organization_id);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Free trial assessments banner */}
      {trial.granted && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                  Free trial assessments
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {trial.remaining > 0
                    ? `${trial.remaining} of ${trial.total} trial assessments remaining — try the product before buying.`
                    : `All ${trial.total} trial assessments used. Buy more to keep assessing.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              {/* Progress bar */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-32 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.round(((trial.total - trial.remaining) / trial.total) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-400">
                  {trial.total - trial.remaining}/{trial.total}
                </span>
              </div>
              <Link
                href="/app/billing"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Buy Assessments
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Profile</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Update your account details.</p>
          </div>
          <div className="p-6">
            <ProfileForm
              fullName={admin.full_name}
              email={admin.email}
            />
          </div>
        </div>

        {/* Organization */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Organization</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Set company-level defaults.</p>
          </div>
          <div className="p-6">
            <OrganizationForm
              name={organization.name}
              logoUrl={organization.logo_url}
            />
          </div>
        </div>

        {/* Invite email */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Invite Defaults</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Changes here apply to future invites only.</p>
          </div>
          <div className="p-6">
            <InviteEmailForm
              inviteMessage={organization.invite_message}
              inviteReplyTo={organization.invite_reply_to}
            />
          </div>
        </div>
      </div>
    </>
  );
}
