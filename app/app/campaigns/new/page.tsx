import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "New Campaign | Admin Panel",
  description: "Create a new campaign",
};

export default function NewCampaignPage() {
  return (
    <>
      <DashboardBreadcrumb title="New Campaign" text="Campaigns / New" />

      <div className="mb-6">
        <Link href="/app/campaigns" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create New Campaign</h1>
        
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input id="name" placeholder="Enter campaign name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" placeholder="Enter campaign description" />
          </div>

          <div className="flex gap-4">
            <Button type="submit">Create Campaign</Button>
            <Link href="/app/campaigns">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
