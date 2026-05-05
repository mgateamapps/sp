'use client';

import { Button } from "@/components/ui/button";
import { sendCampaignInvites } from "@/lib/actions/invites";
import { Loader2, Send, AlertTriangle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SendInvitesButtonProps {
  campaignId: string;
  pendingCount: number;
  creditBalance?: number;
}

export function SendInvitesButton({ campaignId, pendingCount, creditBalance }: SendInvitesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const creditsInsufficient =
    creditBalance !== undefined && creditBalance < pendingCount;

  async function handleSend() {
    if (pendingCount === 0) {
      toast.error('No unopened participants to resend.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendCampaignInvites(campaignId);

      if (result.success) {
        if (result.sent > 0) {
          toast.success(`Resent ${result.sent} invite${result.sent > 1 ? 's' : ''}`);
        }
        if (result.failed > 0) {
          toast.error(`Failed to resend ${result.failed} invite${result.failed > 1 ? 's' : ''}`);
        }
        if (result.sent === 0 && result.failed === 0) {
          toast.success(result.error || 'No unopened invites to resend');
        }
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to resend invites');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {creditsInsufficient && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            {creditBalance! <= 0
              ? 'No assessments available — '
              : `Only ${creditBalance} assessments available — `}
            <Link href="/app/billing" className="underline">
              Buy Assessments
            </Link>{' '}
            to cover all {pendingCount} invites.
          </span>
        </div>
      )}
      <Button
        onClick={handleSend}
        disabled={isLoading || pendingCount === 0}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Resend Invites {pendingCount > 0 && `(${pendingCount})`}
          </>
        )}
      </Button>
    </div>
  );
}
