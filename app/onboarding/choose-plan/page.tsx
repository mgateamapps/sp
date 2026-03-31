'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  Sparkles,
  Gift,
  Calendar,
  Zap,
  Users,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { formatPrice, PRICING, ANNUAL_PRICING } from '@/lib/utils/pricing';

export default function ChoosePlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'annual' | null>(null);
  const [employeeCount, setEmployeeCount] = useState<number>(10);
  const [planType, setPlanType] = useState<'team' | 'enterprise'>('team');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isEnterprise = employeeCount > 50;
  const effectivePlanType = isEnterprise ? 'enterprise' : 'team';
  const annualRate = effectivePlanType === 'team' 
    ? ANNUAL_PRICING.TEAM_RATE_CENTS 
    : ANNUAL_PRICING.ENTERPRISE_RATE_CENTS;
  const annualTotal = employeeCount * annualRate;

  async function handleContinue() {
    if (selectedPlan === 'free') {
      router.push('/dashboard');
      return;
    }

    if (selectedPlan === 'monthly') {
      router.push('/dashboard');
      return;
    }

    if (selectedPlan === 'annual') {
      if (employeeCount < 1) {
        toast.error('Please enter a valid number of employees');
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch('/api/stripe/subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planType: effectivePlanType === 'team' ? 'team_annual' : 'enterprise_annual',
            employeeCount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create subscription');
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } catch (error) {
        console.error('Subscription error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to start subscription');
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center">
          <Image
            src="/assets/images/logo_wide.png"
            alt="ScorePrompt"
            width={150}
            height={35}
            priority
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Welcome */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-heading mb-3">
            Welcome to ScorePrompt!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Choose how you want to assess your team&apos;s AI skills
          </p>
        </div>

        {/* Plan Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Free Plan */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'free' 
                ? 'border-2 border-primary shadow-lg' 
                : 'border-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
            onClick={() => setSelectedPlan('free')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Free Test</CardTitle>
              <p className="text-sm text-neutral-500">Try it yourself first</p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>1 user (yourself)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All 5 scenarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Personal feedback</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === 'monthly' 
                ? 'border-2 border-primary shadow-lg' 
                : 'border-2 border-transparent hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pay Per Campaign</CardTitle>
              <p className="text-sm text-neutral-500">Flexible, no commitment</p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{formatPrice(PRICING.TIER_1_RATE_CENTS)}</div>
              <p className="text-sm text-neutral-500 mb-4">per employee / campaign</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Unlimited campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Pay as you go</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Full dashboard</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card 
            className={`cursor-pointer transition-all relative ${
              selectedPlan === 'annual' 
                ? 'border-2 border-green-500 shadow-lg shadow-green-500/20' 
                : 'border-2 border-transparent hover:border-green-300 dark:hover:border-green-700'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-green-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Save 25%
              </Badge>
            </div>
            <CardHeader className="pb-2 pt-6">
              <CardTitle className="text-lg">Annual Plan</CardTitle>
              <p className="text-sm text-neutral-500">Best value for teams</p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{formatPrice(ANNUAL_PRICING.TEAM_RATE_CENTS)}</div>
              <p className="text-sm text-neutral-500 mb-4">per employee / year</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span>4 campaigns included</span>
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span>Pay for 3, get 1 free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Annual Plan Configuration */}
        {selectedPlan === 'annual' && (
          <Card className="mb-8 border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="flex-1">
                  <Label htmlFor="employeeCount" className="text-base font-medium mb-2 block">
                    How many employees will you assess?
                  </Label>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-neutral-400" />
                    <Input
                      id="employeeCount"
                      type="number"
                      min={1}
                      max={1000}
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-32 text-lg font-medium"
                    />
                    <span className="text-neutral-500">employees</span>
                  </div>
                  {isEnterprise && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                      Enterprise pricing applied (50+ employees): {formatPrice(ANNUAL_PRICING.ENTERPRISE_RATE_CENTS)}/employee
                    </p>
                  )}
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 min-w-[200px]">
                  <p className="text-sm text-neutral-500 mb-1">Annual Total</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatPrice(annualTotal)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {employeeCount} × {formatPrice(annualRate)} = {formatPrice(annualTotal)}/year
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/50 dark:bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <span className="font-medium">Included:</span> 4 assessment campaigns per year. 
                  Need more? Additional campaigns at standard per-employee rates.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedPlan || isLoading}
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
                {selectedPlan === 'annual' ? 'Continue to Payment' : 'Continue to Dashboard'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip link */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Not sure yet?{' '}
          <Link href="/dashboard" className="text-primary hover:underline">
            Skip and decide later
          </Link>
        </p>
      </main>
    </div>
  );
}
