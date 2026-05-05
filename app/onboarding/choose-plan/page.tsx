'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CheckCircle, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { CREDIT_PACKS, formatPrice, getPricePerCredit } from '@/lib/utils/pricing';

export default function ChoosePlanPage() {
  const [selectedPackId, setSelectedPackId] = useState<string | 'free' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleContinue() {
    if (selectedPackId === 'free' || !selectedPackId) {
      router.push('/app/campaigns');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'credit_pack', packId: selectedPackId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
          <Image src="/assets/images/logo_wide.png" alt="ScorePrompt" width={150} height={35} priority />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-heading mb-3">Welcome to ScorePrompt!</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Choose how you want to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Free option */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedPackId === 'free'
                ? 'border-2 border-primary shadow-lg'
                : 'border-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
            onClick={() => setSelectedPackId('free')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Free test</CardTitle>
              <p className="text-sm text-neutral-500">Try it yourself first</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-3">$0</div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span>1 user (yourself)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span>All 5 scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <span>Personal feedback</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Credit packs */}
          {CREDIT_PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={`cursor-pointer transition-all relative ${
                selectedPackId === pack.id
                  ? 'border-2 border-primary shadow-lg'
                  : pack.highlighted
                  ? 'border-2 border-primary/40 hover:border-primary'
                  : 'border-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
              onClick={() => setSelectedPackId(pack.id)}
            >
              {pack.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white text-xs px-2.5 py-0.5">
                    <Zap className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-base">{pack.name}</CardTitle>
                <p className="text-sm text-neutral-500">{pack.description}</p>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-0.5">{formatPrice(pack.price_cents)}</div>
                <p className="text-xs text-neutral-500 mb-3">{pack.credits} assessments · {formatPrice(Math.round(getPricePerCredit(pack)))} each</p>
                <ul className="space-y-1.5 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>No expiry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Unlimited campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Pay for completions only</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedPackId || isLoading}
            onClick={handleContinue}
            className="px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {selectedPackId === 'free' || !selectedPackId
                  ? 'Continue to Campaigns'
                  : 'Continue to Payment'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Not sure yet?{' '}
          <Link href="/app/campaigns" className="text-primary hover:underline">
            Skip and buy assessments later
          </Link>
        </p>
      </main>
    </div>
  );
}
