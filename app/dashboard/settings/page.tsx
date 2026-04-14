import { getAdminWithOrganization } from "@/lib/queries/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { OrganizationForm } from "./organization-form";
import { InviteEmailForm } from "./invite-email-form";

export const metadata: Metadata = {
  title: "Settings | ScorePrompt",
  description: "Manage your account and organization settings",
};

export default async function SettingsPage() {
  const data = await getAdminWithOrganization();
  if (!data) redirect('/auth/login');

  const { admin, organization } = data;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Profile</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Your personal account details</p>
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
            <p className="text-sm text-neutral-500 mt-0.5">Your company name and logo</p>
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
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Invite email</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Customize what employees receive when invited to an assessment</p>
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
