'use client';

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CampaignWithStats } from "@/lib/queries/campaigns";
import { getStatusBadgeVariant, formatDate } from "@/lib/utils/formatting";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CampaignsTable({ campaigns }: { campaigns: CampaignWithStats[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleClick(id: string) {
    setLoadingId(id);
    router.push(`/dashboard/campaigns/${id}`);
  }

  return (
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
          const isLoading = loadingId === campaign.id;

          return (
            <TableRow
              key={campaign.id}
              className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800"
              onClick={() => !loadingId && handleClick(campaign.id)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
                  <span className="font-medium">{campaign.name}</span>
                </div>
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
  );
}
