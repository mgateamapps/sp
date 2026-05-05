'use client';

import { Button } from "@/components/ui/button";
import { resendInviteToParticipant } from "@/lib/actions/invites";
import { ExternalLink, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import toast from "react-hot-toast";

interface ParticipantRowActionsProps {
  campaignId: string;
  participantId: string;
  canResend: boolean;
}

export function ParticipantRowActions({
  campaignId,
  participantId,
  canResend,
}: ParticipantRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      const result = await resendInviteToParticipant(campaignId, participantId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to resend invite");
        return;
      }
      toast.success("Invite resent");
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={`/app/campaigns/${campaignId}/employees/${participantId}`}>
        <Button variant="ghost" size="sm">
          View Result
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
      </Link>
      <Button variant="ghost" size="sm" disabled={!canResend || isPending} onClick={handleResend}>
        {isPending ? (
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ) : (
          <Send className="w-3 h-3 mr-1" />
        )}
        Resend Invite
      </Button>
    </div>
  );
}
