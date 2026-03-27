'use client';

import { Button } from "@/components/ui/button";
import { sendCampaignInvites } from "@/lib/actions/invites";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SendInvitesButtonProps {
  campaignId: string;
  pendingCount: number;
}

export function SendInvitesButton({ campaignId, pendingCount }: SendInvitesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSendInvites() {
    if (pendingCount === 0) {
      toast.error('No pending invites to send');
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendCampaignInvites(campaignId);

      if (result.success) {
        if (result.sent > 0) {
          toast.success(`Successfully sent ${result.sent} invite${result.sent > 1 ? 's' : ''}`);
        }
        if (result.failed > 0) {
          toast.error(`Failed to send ${result.failed} invite${result.failed > 1 ? 's' : ''}`);
        }
        if (result.sent === 0 && result.failed === 0) {
          toast.success(result.error || 'No new invites to send');
        }
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to send invites');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleSendInvites} 
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
          Send Invites {pendingCount > 0 && `(${pendingCount})`}
        </>
      )}
    </Button>
  );
}
