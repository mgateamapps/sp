import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import { getCampaignsForOrganization } from "@/lib/queries/campaigns";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaigns | ScorePrompt",
  description: "Manage your assessment campaigns",
};

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case 'active':
      return 'default';
    case 'closed':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function CampaignsPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const campaigns = await getCampaignsForOrganization(admin.organization_id);

  return (
    <>
      <DashboardBreadcrumb title="Campaigns" text="Campaigns" />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/app/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              No campaigns yet. Create your first campaign to start assessing your team.
            </p>
            <Link href="/app/campaigns/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-center">Invited</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const completionRate = campaign.participant_count > 0
                  ? Math.round((campaign.completed_count / campaign.participant_count) * 100)
                  : 0;

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link 
                        href={`/app/campaigns/${campaign.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {campaign.name}
                      </Link>
                      {campaign.description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                          {campaign.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400">
                      {formatDate(campaign.deadline)}
                    </TableCell>
                    <TableCell className="text-center">
                      {campaign.participant_count}
                    </TableCell>
                    <TableCell className="text-center">
                      {campaign.completed_count}
                    </TableCell>
                    <TableCell className="text-center">
                      {completionRate}%
                    </TableCell>
                    <TableCell className="text-neutral-600 dark:text-neutral-400">
                      {formatDate(campaign.created_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
