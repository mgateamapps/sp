'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { sendCampaignInvites } from "@/lib/actions/invites";
import { calculateCampaignPrice, formatPrice, getPriceBreakdown, PRICING } from "@/lib/utils/pricing";
import { Loader2, Send, CreditCard, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SubscriptionInfo {
  hasSubscription: boolean;
  planType?: string;
  campaignsUsed?: number;
  campaignsLimit?: number;
  remainingCampaigns?: number;
}

interface SendInvitesButtonProps {
  campaignId: string;
  pendingCount: number;
  isPaid?: boolean;
}

export function SendInvitesButton({ campaignId, pendingCount, isPaid = false }: SendInvitesButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({ hasSubscription: false });
  const router = useRouter();

  const priceBreakdown = getPriceBreakdown(pendingCount);
  const totalPrice = calculateCampaignPrice(pendingCount);

  // Check subscription status on mount
  useEffect(() => {
    async function checkSubscription() {
      try {
        const response = await fetch('/api/stripe/checkout');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionInfo(data);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    }
    if (!isPaid) {
      checkSubscription();
    }
  }, [isPaid]);

  async function handleUseSubscription() {
    if (pendingCount === 0) {
      toast.error('No pending invites to send');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          employeeCount: pendingCount,
          useSubscription: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to use subscription credit');
      }

      if (data.usedSubscription) {
        toast.success(`Campaign activated! ${data.remainingCampaigns} campaigns remaining in your plan.`);
        setShowPaymentDialog(false);
        
        // Now send the invites
        const result = await sendCampaignInvites(campaignId);
        if (result.success && result.sent > 0) {
          toast.success(`Sent ${result.sent} invite${result.sent > 1 ? 's' : ''}`);
        }
        
        router.refresh();
      }
    } catch (error) {
      console.error('Subscription use error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to use subscription');
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePayAndSend() {
    if (pendingCount === 0) {
      toast.error('No pending invites to send');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          employeeCount: pendingCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      setIsLoading(false);
    }
  }

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

  // If already paid, just send invites directly
  if (isPaid) {
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

  const hasRemainingCampaigns = subscriptionInfo.hasSubscription && 
    subscriptionInfo.remainingCampaigns !== undefined && 
    subscriptionInfo.remainingCampaigns > 0;

  // Not paid - show payment dialog
  return (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogTrigger asChild>
        <Button disabled={pendingCount === 0}>
          {hasRemainingCampaigns ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Send Invites {pendingCount > 0 && `(${pendingCount})`}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay & Send Invites {pendingCount > 0 && `(${pendingCount})`}
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {hasRemainingCampaigns ? 'Use Subscription Credit' : 'Confirm Payment'}
          </DialogTitle>
          <DialogDescription>
            {hasRemainingCampaigns
              ? `You have ${subscriptionInfo.remainingCampaigns} campaign${subscriptionInfo.remainingCampaigns === 1 ? '' : 's'} remaining in your annual plan.`
              : 'Review the pricing before sending assessment invites.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {hasRemainingCampaigns ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                Included in your plan
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">
                This campaign will be covered by your annual subscription.
                {subscriptionInfo.remainingCampaigns && subscriptionInfo.remainingCampaigns > 1 && (
                  <> You&apos;ll have {subscriptionInfo.remainingCampaigns - 1} campaign{subscriptionInfo.remainingCampaigns - 1 === 1 ? '' : 's'} remaining after this.</>
                )}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-2">
                {priceBreakdown.tier1Count > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>
                      {priceBreakdown.tier1Count} employee{priceBreakdown.tier1Count > 1 ? 's' : ''} × {formatPrice(PRICING.TIER_1_RATE_CENTS)}
                    </span>
                    <span>{formatPrice(priceBreakdown.tier1Total)}</span>
                  </div>
                )}
                {priceBreakdown.tier2Count > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>
                      {priceBreakdown.tier2Count} employee{priceBreakdown.tier2Count > 1 ? 's' : ''} × {formatPrice(PRICING.TIER_2_RATE_CENTS)}
                    </span>
                    <span>{formatPrice(priceBreakdown.tier2Total)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-neutral-500">
                You can request a partial refund for employees who haven&apos;t started their assessment.
              </p>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
            Cancel
          </Button>
          {hasRemainingCampaigns ? (
            <Button onClick={handleUseSubscription} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Subscription
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handlePayAndSend} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay {formatPrice(totalPrice)}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
