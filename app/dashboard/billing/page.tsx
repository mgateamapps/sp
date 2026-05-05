import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentAdminProfile } from "@/lib/queries/admin";
import {
  getBillingPayments,
  getCreditBalance,
  getCreditTransactions,
} from "@/lib/queries/credits";
import { formatDate } from "@/lib/utils/formatting";
import { CREDIT_PACKS, formatPrice, getPricePerCredit } from "@/lib/utils/pricing";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import BuyCreditsButton from "./buy-credits-button";

export const metadata: Metadata = {
  title: "Billing | ScorePrompt",
  description: "Manage assessment usage and purchase additional packages",
};

const PACKAGE_LABELS: Record<string, string> = {
  "50": "Starter",
  "200": "Team",
  "500": "Business",
};

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "completed") return "default";
  if (status === "pending") return "secondary";
  if (status === "failed") return "destructive";
  return "outline";
}

function formatPaymentStatus(status: string) {
  return status
    .replace("_", " ")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function BillingPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) redirect("/auth/login");

  const [balance, transactions, payments] = await Promise.all([
    getCreditBalance(admin.organization_id),
    getCreditTransactions(admin.organization_id, 200),
    getBillingPayments(admin.organization_id, 50),
  ]);

  const usedAssessments = Math.abs(
    transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );
  const remainingAssessments = Math.max(0, balance);
  const availableAssessments = usedAssessments + remainingAssessments;
  const isNegative = balance < 0;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage assessment usage and purchase additional packages.
          </p>
        </div>
        <Link href="#pricing-cards">
          <Button>Buy Assessments</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Assessments Available</p>
            <p className="text-2xl font-semibold mt-1">{availableAssessments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Used</p>
            <p className="text-2xl font-semibold mt-1">{usedAssessments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-500">Remaining</p>
            <p className={`text-2xl font-semibold mt-1 ${isNegative ? "text-red-600 dark:text-red-400" : ""}`}>
              {remainingAssessments}
            </p>
          </CardContent>
        </Card>
      </div>

      {isNegative && (
        <div className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          Current usage is ahead of your remaining package. Buy assessments to cover upcoming completions.
        </div>
      )}

      <div id="pricing-cards" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                pack.highlighted
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              }`}
            >
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">{pack.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {pack.description}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {pack.id === "starter"
                    ? "Best for a first team baseline"
                    : pack.id === "team"
                    ? "Best for multiple teams or retesting"
                    : "Best for larger rollouts"}
                </p>
              </div>
              <div>
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(pack.price_cents)}
                </span>
                <div className="text-xs text-neutral-500 mt-1">
                  {formatPrice(Math.round(getPricePerCredit(pack)))} per assessment
                </div>
              </div>
              <BuyCreditsButton packId={pack.id} label="Buy Assessments" />
            </div>
          ))}
          <div className="rounded-xl border p-5 flex flex-col gap-3 border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">Enterprise</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Custom volume and support
              </p>
            </div>
            <div>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                Contact sales
              </span>
            </div>
            <a
              href="mailto:hello@scoreprompt.com"
              className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-600 px-4 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <p className="text-sm font-medium mb-2">Usage Rules</p>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
            <li>1 completed employee assessment = 1 assessment used.</li>
            <li>Invites do not consume assessments.</li>
            <li>Incomplete attempts do not consume assessments.</li>
            <li>Assessment packages do not expire.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Billing History
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="font-medium text-neutral-700 dark:text-neutral-300">No transactions yet</p>
            <p className="text-sm text-neutral-400 mt-1">Buy assessments to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 text-neutral-500">
                  <th className="text-left py-3 px-6 font-medium">Date</th>
                  <th className="text-left py-3 px-6 font-medium">Package</th>
                  <th className="text-right py-3 px-6 font-medium">Amount</th>
                  <th className="text-left py-3 px-6 font-medium">Status</th>
                  <th className="text-left py-3 px-6 font-medium">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                  >
                    <td className="py-3 px-6">{formatDate(payment.created_at)}</td>
                    <td className="py-3 px-6">
                      {PACKAGE_LABELS[String(payment.employee_count)] ?? `${payment.employee_count} assessments`}
                    </td>
                    <td className="py-3 px-6 text-right font-medium">
                      {formatPrice(payment.amount_cents)}
                    </td>
                    <td className="py-3 px-6">
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {formatPaymentStatus(payment.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-6 text-neutral-500">Not available</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
