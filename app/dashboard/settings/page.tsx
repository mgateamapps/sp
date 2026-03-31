import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Admin Panel",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return (
    <>
      <DashboardBreadcrumb title="Settings" text="Settings" />

      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
            <Button>Save Changes</Button>
          </form>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Company Settings</h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="Your company" />
            </div>
            <Button>Save Changes</Button>
          </form>
        </div>

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Configure your notification preferences.
          </p>
          <Button variant="outline">Manage Notifications</Button>
        </div>
      </div>
    </>
  );
}
