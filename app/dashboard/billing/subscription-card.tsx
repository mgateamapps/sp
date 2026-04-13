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
  const usedPct = Math.round((subscription.campaigns_used / subscription.campaigns_limit) * 100);
  const periodEnd = new Date(subscription.current_period_end);
  const isCancelled = subscription.cancelled_at !== null;
  const planName = subscription.plan_type === 'team_annual' ? 'Team Annual' : 'Enterprise Annual';

  async function handleCancel() {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/stripe/subscription/cancel', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to cancel subscription');
      toast.success('Subscription will be cancelled at the end of the billing period');
      setShowCancelDialog(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-white dark:bg-neutral-900 overflow-hidden mb-6">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary" />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-neutral-900 dark:text-white">{planName}</h3>
                {isCancelled ? (
                  <Badge variant="secondary">Cancels {periodEnd.toLocaleDateString()}</Badge>
                ) : (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Up to {subscription.employee_limit} employees
              </p>
            </div>
          </div>

          {!isCancelled && (
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">Cancel plan</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Cancel subscription?
                  </DialogTitle>
                  <DialogDescription>
                    Your subscription stays active until {periodEnd.toLocaleDateString()}. After that, you'll pay per campaign at standard rates.
                    {remainingCampaigns > 0 && (
                      <span className="block mt-2 text-amber-600 dark:text-amber-400">
                        You still have {remainingCampaigns} campaign{remainingCampaigns === 1 ? '' : 's'} remaining.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep plan</Button>
                  <Button variant="destructive" onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cancelling...</> : 'Yes, cancel'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-neutral-500">Campaigns used</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">
              {subscription.campaigns_used}
              <span className="text-sm font-normal text-neutral-400"> / {subscription.campaigns_limit}</span>
            </p>
          </div>

          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-neutral-500">Remaining</span>
            </div>
            <p className="text-xl font-bold text-neutral-900 dark:text-white">{remainingCampaigns}</p>
          </div>

          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs text-neutral-500">Renews</span>
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>Campaign usage</span>
            <span>{usedPct}%</span>
          </div>
          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
