'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendCampaignInvites } from "@/lib/actions/invites";
import type { CampaignWithStats } from "@/lib/queries/campaigns";
import { formatDate, getStatusBadgeVariant } from "@/lib/utils/formatting";
import { Download, Eye, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import toast from "react-hot-toast";

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function CampaignRowActions({ campaignId }: { campaignId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      const result = await sendCampaignInvites(campaignId);
      if (!result.success) {
        toast.error(result.error ?? "Could not resend invites");
        return;
      }
      if (result.sent > 0) {
        toast.success(`Resent ${result.sent} invite${result.sent === 1 ? "" : "s"}`);
      } else {
        toast("No pending unsent invites", { icon: "ℹ️" });
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Link href={`/app/campaigns/${campaignId}`}>
        <Button size="sm" variant="ghost">
          <Eye className="w-3.5 h-3.5 mr-1" />
          View Campaign
        </Button>
      </Link>
      <Button size="sm" variant="ghost" onClick={handleResend} disabled={isPending}>
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5 mr-1" />
        )}
        Resend Invites
      </Button>
      <Link href={`/api/campaigns/${campaignId}/export`}>
        <Button size="sm" variant="ghost">
          <Download className="w-3.5 h-3.5 mr-1" />
          Export
        </Button>
      </Link>
    </div>
  );
}

export default function CampaignsTable({ campaigns }: { campaigns: CampaignWithStats[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-center">Invited</TableHead>
          <TableHead className="text-center">Opened</TableHead>
          <TableHead className="text-center">Completed</TableHead>
          <TableHead className="text-center">Completion</TableHead>
          <TableHead className="text-center">Avg Score</TableHead>
          <TableHead>Weakest Area</TableHead>
          <TableHead>Deadline</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.map((campaign) => {
          const completionRate = campaign.participant_count > 0
            ? Math.round((campaign.completed_count / campaign.participant_count) * 100)
            : 0;

          return (
            <TableRow key={campaign.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <TableCell>
                <div className="font-medium">{campaign.name}</div>
                {campaign.description && (
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                    {campaign.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(campaign.status)}>
                  {formatStatusLabel(campaign.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{campaign.participant_count}</TableCell>
              <TableCell className="text-center">{campaign.opened_count}</TableCell>
              <TableCell className="text-center">{campaign.completed_count}</TableCell>
              <TableCell className="text-center">{completionRate}%</TableCell>
              <TableCell className="text-center">
                {campaign.average_score !== null ? campaign.average_score : "—"}
              </TableCell>
              <TableCell className="text-neutral-600 dark:text-neutral-400">
                {campaign.weakest_area ? (
                  <span>
                    {campaign.weakest_area}
                    {campaign.weakest_area_score !== null &&
                    campaign.weakest_area_score !== undefined ? (
                      <span className="text-xs text-neutral-400"> ({campaign.weakest_area_score}/100)</span>
                    ) : null}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-neutral-600 dark:text-neutral-400">
                {formatDate(campaign.deadline)}
              </TableCell>
              <TableCell className="text-right">
                <CampaignRowActions campaignId={campaign.id} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
