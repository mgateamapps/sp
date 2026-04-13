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
import { CreditCard, Receipt, RefreshCcw, Sparkles, Users, TrendingDown, ArrowUpRight } from "lucide-react";
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
    return { ...p, campaign };
  });

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

      {/* Subscription */}
      {subscription ? (
        <SubscriptionCard subscription={subscription} />
      ) : (
        <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">No active subscription</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Save 25% with an annual plan — 4 campaigns for the price of 3.
                </p>
              </div>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline shrink-0"
            >
              View plans
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Total spent</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatPrice(totalSpent)}</p>
          <p className="text-xs text-neutral-400 mt-1">{paymentList.filter(p => p.status === 'completed' || p.status === 'partially_refunded').length} payments</p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Total refunded</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{formatPrice(totalRefunded)}</p>
          <p className="text-xs text-neutral-400 mt-1">{paymentList.filter(p => (p.refund_amount_cents || 0) > 0).length} refunds</p>
        </div>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">Employees assessed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalEmployees}</p>
          <p className="text-xs text-neutral-400 mt-1">across all campaigns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment History */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Payment history</h2>
          </div>

          {paymentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="font-medium text-neutral-700 dark:text-neutral-300">No payments yet</p>
              <p className="text-sm text-neutral-400 mt-1">Payments appear here when you send campaign invites.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50 dark:bg-neutral-800/50">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Campaign</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-center">Employees</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Amount</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentList.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <TableCell className="text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                      {formatDate(payment.completed_at || payment.created_at)}
                    </TableCell>
                    <TableCell>
                      {payment.campaign && payment.campaign_id ? (
                        <Link
                          href={`/dashboard/campaigns/${payment.campaign_id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {payment.campaign.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-neutral-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">{payment.employee_count}</TableCell>
                    <TableCell>
                      {payment.is_subscription_campaign ? (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                          <Sparkles className="w-3.5 h-3.5" />
                          Included
                        </span>
                      ) : (
                        <div>
                          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {formatPrice(payment.amount_cents)}
                          </span>
                          {(payment.refund_amount_cents || 0) > 0 && (
                            <span className="block text-xs text-green-600 dark:text-green-400">
                              -{formatPrice(payment.refund_amount_cents)}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(payment.status)} className="text-xs capitalize">
                        {payment.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pricing Reference */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden self-start">
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Current rates</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-3">Pay per campaign</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Team</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatPrice(PRICING.TIER_1_RATE_CENTS)}</span>
                    <span className="text-xs text-neutral-400 block">/ employee</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Enterprise</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatPrice(PRICING.TIER_2_RATE_CENTS)}</span>
                    <span className="text-xs text-neutral-400 block">/ employee</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Annual plans</p>
                <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">Save 25%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="text-sm text-green-700 dark:text-green-300">Team</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-700 dark:text-green-300">{formatPrice(ANNUAL_PRICING.TEAM_RATE_CENTS)}</span>
                    <span className="text-xs text-green-600/70 dark:text-green-400/70 block">/ employee / year</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <span className="text-sm text-green-700 dark:text-green-300">Enterprise</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-700 dark:text-green-300">{formatPrice(ANNUAL_PRICING.ENTERPRISE_RATE_CENTS)}</span>
                    <span className="text-xs text-green-600/70 dark:text-green-400/70 block">/ employee / year</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/pricing"
              className="flex items-center justify-center gap-1.5 w-full text-sm font-medium text-primary hover:underline pt-2"
            >
              View full pricing
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
