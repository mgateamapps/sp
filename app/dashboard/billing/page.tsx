import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { getCreditBalance, getCreditTransactions } from '@/lib/queries/credits';
import { CREDIT_PACKS, formatPrice, getPricePerCredit } from '@/lib/utils/pricing';
import { formatDate } from '@/lib/utils/formatting';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Zap, TrendingDown, ShoppingCart, AlertTriangle } from 'lucide-react';
import BuyCreditsButton from './buy-credits-button';

export const metadata: Metadata = {
  title: 'Billing | ScorePrompt',
  description: 'View your credit balance and purchase history',
};

export default async function BillingPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) redirect('/auth/login');

  const [balance, transactions] = await Promise.all([
    getCreditBalance(admin.organization_id),
    getCreditTransactions(admin.organization_id, 50),
  ]);

  const isLow = balance > 0 && balance < 20;
  const isNegative = balance < 0;

  return (
    <>
      {/* Credit balance header */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isNegative
                ? 'bg-red-100 dark:bg-red-900/30'
                : isLow
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-primary/10'
            }`}>
              {isNegative || isLow ? (
                <AlertTriangle className={`w-6 h-6 ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
              ) : (
                <Zap className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Credit balance</p>
              <p className={`text-3xl font-bold ${
                isNegative
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-neutral-900 dark:text-white'
              }`}>
                {balance} credits
              </p>
              {isNegative && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">
                  Balance is negative — top up to cover future assessments.
                </p>
              )}
              {isLow && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                  Running low — consider topping up soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy credit packs */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-3">Buy credits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                pack.highlighted
                  ? 'border-primary bg-primary/5 dark:bg-primary/10'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{pack.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{pack.description}</p>
                </div>
                {pack.highlighted && (
                  <span className="text-xs font-medium bg-primary text-white px-2 py-0.5 rounded-full shrink-0 ml-2">
                    Popular
                  </span>
                )}
              </div>
              <div>
                <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(pack.price_cents)}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-1">
                  / {pack.credits} credits
                </span>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {formatPrice(Math.round(getPricePerCredit(pack)))} per assessment
                </p>
              </div>
              <BuyCreditsButton packId={pack.id} label={`Buy ${pack.credits} credits`} />
            </div>
          ))}
        </div>
        <p className="text-sm text-neutral-400 mt-3">
          1 credit = 1 employee who completes an assessment. Credits never expire. Need more? <a href="mailto:hello@scoreprompt.com" className="text-primary hover:underline">Contact us</a> for enterprise pricing.
        </p>
      </div>

      {/* Transaction history */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Transaction history</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="font-medium text-neutral-700 dark:text-neutral-300">No transactions yet</p>
            <p className="text-sm text-neutral-400 mt-1">Purchase credits to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.amount > 0
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-neutral-100 dark:bg-neutral-800'
                  }`}>
                    {tx.amount > 0 ? (
                      <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {tx.description ?? (tx.amount > 0 ? 'Credit purchase' : 'Assessment completed')}
                    </p>
                    <p className="text-xs text-neutral-400">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${
                  tx.amount > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} cr
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
