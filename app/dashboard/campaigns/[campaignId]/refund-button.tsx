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
import { calculateRefundAmount, formatPrice } from "@/lib/utils/pricing";
import { Loader2, RefreshCcw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface RefundButtonProps {
  campaignId: string;
  originalEmployeeCount: number;
  eligibleForRefundCount: number;
}

export function RefundButton({ 
  campaignId, 
  originalEmployeeCount, 
  eligibleForRefundCount 
}: RefundButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const refundAmount = calculateRefundAmount(originalEmployeeCount, eligibleForRefundCount);

  async function handleRefund() {
    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process refund');
      }

      toast.success(`Refund of ${formatPrice(data.refundAmountCents)} processed for ${data.eligibleEmployeeCount} employee(s)`);
      setShowDialog(false);
      router.refresh();
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process refund');
    } finally {
      setIsLoading(false);
    }
  }

  if (eligibleForRefundCount === 0) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Request Refund
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Partial Refund</DialogTitle>
          <DialogDescription>
            Refund for employees who haven&apos;t started their assessment.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Employees eligible for refund</span>
              <span className="font-medium">{eligibleForRefundCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Employees who started</span>
              <span className="font-medium">{originalEmployeeCount - eligibleForRefundCount}</span>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Refund Amount</span>
                <span className="text-green-600">{formatPrice(refundAmount)}</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-neutral-500">
            This will refund the cost for employees who haven&apos;t opened their assessment link yet. 
            The refund will be processed to the original payment method.
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Confirm Refund
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
