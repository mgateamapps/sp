'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Subscription } from "@/lib/queries/subscriptions";
import { Sparkles, Calendar, Zap, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const router = useRouter();

  const remainingCampaigns = subscription.campaigns_limit - subscription.campaigns_used;
  const periodEnd = new Date(subscription.current_period_end);
  const isCancelled = subscription.cancelled_at !== null;

  async function handleCancel() {
    setIsCancelling(true);

    try {
      const response = await fetch('/api/stripe/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      toast.success('Subscription will be cancelled at the end of the billing period');
      setShowCancelDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  }

  const planName = subscription.plan_type === 'team_annual' ? 'Team Annual' : 'Enterprise Annual';

  return (
    <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{planName}</h3>
              {isCancelled ? (
                <Badge variant="secondary">Cancels {periodEnd.toLocaleDateString()}</Badge>
              ) : (
                <Badge variant="default">Active</Badge>
              )}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {subscription.employee_limit} employees • Renews {periodEnd.toLocaleDateString()}
            </p>

            {/* Campaign Usage */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <span className="font-semibold">{remainingCampaigns}</span> of {subscription.campaigns_limit} campaigns remaining
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-sm text-neutral-500">
                  Resets {periodEnd.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-64">
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(subscription.campaigns_used / subscription.campaigns_limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                {subscription.campaigns_used} used
              </p>
            </div>
          </div>
        </div>

        {!isCancelled && (
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Cancel subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Cancel subscription?
                </DialogTitle>
                <DialogDescription>
                  Your subscription will remain active until {periodEnd.toLocaleDateString()}. 
                  After that, you&apos;ll need to pay per campaign at standard rates.
                  {remainingCampaigns > 0 && (
                    <span className="block mt-2 text-amber-600 dark:text-amber-400">
                      You still have {remainingCampaigns} campaign{remainingCampaigns === 1 ? '' : 's'} remaining in your plan.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  Keep subscription
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  variant="destructive"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Yes, cancel'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
