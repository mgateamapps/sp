import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
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
import { getActiveSubscription } from "@/lib/queries/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, PRICING, ANNUAL_PRICING } from "@/lib/utils/pricing";
import type { Metadata } from "next";
import { CreditCard, Receipt, RefreshCcw, Sparkles, Calendar, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SubscriptionCard } from "./subscription-card";

export const metadata: Metadata = {
  title: "Billing | ScorePrompt",
  description: "View your payment history and subscription",
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case 'completed':
      return 'default';
    case 'partially_refunded':
      return 'secondary';
    case 'refunded':
      return 'outline';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default async function BillingPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    redirect('/auth/login');
  }

  const supabase = await createClient();

  // Fetch subscription and payments in parallel
  const [subscription, paymentsResult] = await Promise.all([
    getActiveSubscription(admin.organization_id),
    supabase
      .from('payments')
      .select(`
        id,
        campaign_id,
        amount_cents,
        employee_count,
        refund_amount_cents,
        refund_employee_count,
        status,
        created_at,
        completed_at,
        is_subscription_campaign,
        campaign:campaigns(name)
      `)
      .eq('organization_id', admin.organization_id)
      .order('created_at', { ascending: false }),
  ]);

  const payments = paymentsResult.data;

  const paymentList = (payments || []).map(p => {
    const campaignData = p.campaign as { name: string } | { name: string }[] | null;
    const campaign = Array.isArray(campaignData) ? campaignData[0] : campaignData;
    return {
      ...p,
      campaign,
    };
  });

  // Calculate totals
  const totalSpent = paymentList
    .filter(p => p.status === 'completed' || p.status === 'partially_refunded')
    .reduce((sum, p) => sum + p.amount_cents, 0);

  const totalRefunded = paymentList
    .reduce((sum, p) => sum + (p.refund_amount_cents || 0), 0);

  const totalEmployees = paymentList
    .filter(p => p.status === 'completed' || p.status === 'partially_refunded')
    .reduce((sum, p) => sum + p.employee_count, 0);

  return (
    <>
      <DashboardBreadcrumb title="Billing" text="Billing" />

      {/* Active Subscription */}
      {subscription && (
        <SubscriptionCard subscription={subscription} />
      )}

      {/* No subscription - show upgrade CTA */}
      {!subscription && (
        <div className="rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Save 25% with an annual plan</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                Get 4 campaigns per year for the price of 3. Perfect for teams running regular assessments.
              </p>
              <Link 
                href="/pricing" 
                className="text-sm font-medium text-primary hover:underline"
              >
                View annual plans →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-neutral-500">Total Spent</h3>
          </div>
          <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCcw className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-neutral-500">Total Refunded</h3>
          </div>
          <p className="text-2xl font-bold">{formatPrice(totalRefunded)}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-neutral-500">Employees Assessed</h3>
          </div>
          <p className="text-2xl font-bold">{totalEmployees}</p>
        </div>
      </div>

      {/* Pricing Info */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <h3 className="font-medium mb-1 text-sm text-neutral-500">Team (monthly)</h3>
            <p className="text-xl font-bold text-primary">{formatPrice(PRICING.TIER_1_RATE_CENTS)}</p>
            <p className="text-xs text-neutral-500">per employee / campaign</p>
          </div>
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <h3 className="font-medium mb-1 text-sm text-neutral-500">Enterprise (monthly)</h3>
            <p className="text-xl font-bold text-primary">{formatPrice(PRICING.TIER_2_RATE_CENTS)}</p>
            <p className="text-xs text-neutral-500">per employee / campaign</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h3 className="font-medium mb-1 text-sm text-green-600 dark:text-green-400">Team (annual)</h3>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatPrice(ANNUAL_PRICING.TEAM_RATE_CENTS)}</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">per employee / year</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <h3 className="font-medium mb-1 text-sm text-green-600 dark:text-green-400">Enterprise (annual)</h3>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatPrice(ANNUAL_PRICING.ENTERPRISE_RATE_CENTS)}</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">per employee / year</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold">Payment History</h2>
        </div>

        {paymentList.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-600 dark:text-neutral-400">
              No payments yet. Payments will appear here when you send campaign invites.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Refund</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentList.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-neutral-600 dark:text-neutral-400">
                    {formatDate(payment.completed_at || payment.created_at)}
                  </TableCell>
                  <TableCell>
                    {payment.campaign && payment.campaign_id ? (
                      <Link 
                        href={`/dashboard/campaigns/${payment.campaign_id}`}
                        className="text-primary hover:underline"
                      >
                        {payment.campaign.name}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{payment.employee_count}</TableCell>
                  <TableCell className="font-medium">
                    {payment.is_subscription_campaign ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Sparkles className="w-3 h-3" />
                        Included
                      </span>
                    ) : (
                      formatPrice(payment.amount_cents)
                    )}
                  </TableCell>
                  <TableCell>
                    {payment.refund_amount_cents > 0 ? (
                      <span className="text-green-600">
                        -{formatPrice(payment.refund_amount_cents)}
                      </span>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(payment.status)}>
                      {payment.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
