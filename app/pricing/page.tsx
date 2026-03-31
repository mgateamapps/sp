'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ChevronDown,
  CheckCircle,
  Users,
  BarChart3,
  MessageSquare,
  LayoutDashboard,
  RefreshCw,
  Mail,
  FileText,
  Zap,
  Target,
  TrendingUp,
  XCircle,
  Sparkles,
} from 'lucide-react';

function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/assets/images/logo_wide.png"
            alt="ScorePrompt"
            width={180}
            height={40}
            priority
          />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-neutral-900 dark:text-white font-medium"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            Login
          </Link>
          <Link href="/auth/register">
            <Button size="sm">Try free</Button>
          </Link>
        </nav>
        <div className="md:hidden">
          <Link href="/auth/register">
            <Button size="sm">Try free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full mb-6">
          Simple & Transparent Pricing
        </span>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Choose the right plan for your team
        </h1>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Start free with a personal test, or pay per employee for team assessments.
          Simple per-seat pricing, no hidden fees.
        </p>
      </div>
    </section>
  );
}

function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: 'Test',
      badge: null,
      monthlyPrice: 'Free',
      annualPrice: 'Free',
      priceDetail: 'try it yourself first',
      annualPriceDetail: 'try it yourself first',
      description:
        'Try out the assessment yourself. See the scenarios, experience the flow, and understand what your team would go through.',
      features: [
        '1 user (yourself)',
        'All 5 assessment scenarios',
        'Personal feedback report',
        'See how scoring works',
      ],
      cta: 'Try for free',
      ctaLink: '/auth/register',
      ctaVariant: 'outline' as const,
      highlighted: false,
    },
    {
      name: 'Team',
      badge: 'Most Popular',
      monthlyPrice: '$2',
      annualPrice: '$6',
      priceDetail: 'per employee / campaign',
      annualPriceDetail: 'per employee / year',
      description:
        'For companies up to 50 employees. Get a complete AI literacy baseline with individual feedback and company-wide insights.',
      features: [
        'Up to 50 employees',
        ...(isAnnual ? ['4 campaigns per year', 'Pay for 3, get 1 free'] : ['Unlimited campaigns']),
        'Individual employee feedback',
        'Company dashboard',
        'Weakness analysis',
        'Email support',
      ],
      cta: isAnnual ? 'Start annual plan' : 'Start now',
      ctaLink: '/auth/register',
      ctaVariant: 'default' as const,
      highlighted: true,
    },
    {
      name: 'Enterprise',
      badge: null,
      monthlyPrice: '$1.50',
      annualPrice: '$4.50',
      priceDetail: 'per employee / campaign',
      annualPriceDetail: 'per employee / year',
      description:
        'For larger organizations with 50+ employees. Better rates, custom onboarding, dedicated support, and advanced reporting.',
      features: [
        'Unlimited employees',
        ...(isAnnual ? ['4 campaigns per year', 'Pay for 3, get 1 free'] : ['Unlimited campaigns']),
        'Priority support',
        'Custom onboarding',
        'Advanced analytics',
        'API access',
        'SSO integration',
      ],
      cta: isAnnual ? 'Start annual plan' : 'Get started',
      ctaLink: '/auth/register',
      ctaVariant: 'outline' as const,
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-neutral-950 -mt-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className={`text-sm font-medium ${isAnnual ? 'text-neutral-900 dark:text-white' : 'text-neutral-500'}`}>
            Annual
          </span>
          {isAnnual && (
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Sparkles className="w-3 h-3 mr-1" />
              Save 25%
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? 'border-2 border-primary shadow-2xl relative scale-105 bg-white'
                  : 'border-2 border-slate-200 dark:border-neutral-800 hover:border-primary/30 transition-colors'
              }
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-heading">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-heading">
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {isAnnual ? plan.annualPriceDetail : plan.priceDetail}
                </div>
                {isAnnual && plan.name !== 'Test' && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      4 assessments included
                    </Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-600 dark:text-neutral-400 mb-6 text-center">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink} className="block">
                  <Button 
                    variant={plan.ctaVariant} 
                    className={`w-full ${plan.highlighted ? 'py-6 text-base' : ''}`}
                    size={plan.highlighted ? 'lg' : 'default'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-slate-500 mt-12 max-w-2xl mx-auto">
          {isAnnual 
            ? 'Annual plans include 4 assessments per year (pay for 3, get 1 free). Additional campaigns billed at standard rates.'
            : 'All plans include the same 5 practical assessment scenarios and structured scoring rubric. Pay only for active employees assessed.'
          }
        </p>
      </div>
    </section>
  );
}

function WhatsIncludedSection() {
  const features = [
    {
      title: '5 practical prompt scenarios',
      icon: FileText,
    },
    {
      title: 'Structured scoring rubric',
      icon: Target,
    },
    {
      title: 'Individual employee feedback',
      icon: MessageSquare,
    },
    {
      title: 'Company-wide results dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Weakness and pattern visibility',
      icon: BarChart3,
    },
    {
      title: 'Repeatable assessment cycles',
      icon: RefreshCw,
    },
    {
      title: 'Management-friendly summary',
      icon: Users,
    },
    {
      title: 'Fast setup through email invites',
      icon: Mail,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Included in All Plans
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">What every plan includes</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/10">
              <CardContent className="pt-8 pb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="font-medium text-heading dark:text-white">{feature.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'What is included in the free Test plan?',
      answer:
        'The Test plan lets you personally experience the full assessment flow - all 5 scenarios and your personal feedback report. It\'s designed to help you understand what your team would go through before committing.',
    },
    {
      question: 'How does annual billing work?',
      answer:
        'With annual billing, you pay upfront for the year and get 4 assessment campaigns included. You pay for 3 campaigns but get 4 - that\'s a 25% savings. If you need more than 4 campaigns in a year, additional ones are billed at standard rates.',
    },
    {
      question: 'Do employees need accounts?',
      answer:
        'No. Employees complete the assessment through a secure email link. No separate employee login is required.',
    },
    {
      question: 'Can we switch between monthly and annual?',
      answer:
        'Yes. You can upgrade to annual billing at any time to start saving. If you\'re on annual and want to switch to monthly, you can do so at the end of your billing period.',
    },
    {
      question: 'What happens if we have more than 50 employees?',
      answer:
        'The Enterprise plan supports unlimited employees with better per-employee rates. Both monthly and annual billing options are available.',
    },
    {
      question: 'Is this a training platform?',
      answer:
        'No. ScorePrompt is designed as an assessment and feedback tool, not a course platform or LMS. We help you measure capability, not train skills.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">Frequently asked questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Collapsible>
      <Card>
        <CollapsibleTrigger className="w-full">
          <CardContent className="py-4 flex items-center justify-between cursor-pointer">
            <span className="font-medium text-left">{question}</span>
            <ChevronDown className="w-5 h-5 text-neutral-500 transition-transform [[data-state=open]_&]:rotate-180" />
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-4">
              {answer}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function FinalCTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full mb-6">
          Get Started Today
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
          Ready to measure your team&apos;s AI skills?
        </h2>
        <p className="text-slate-300 mb-10 max-w-xl mx-auto text-lg">
          Start with a free personal test, or jump right into assessing your whole team.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="text-base px-8">Try free test</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg" className="text-base px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              Start Team plan
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Image
              src="/assets/images/logo_wide.png"
              alt="ScorePrompt"
              width={150}
              height={35}
              className="mb-2"
            />
            <div className="text-sm text-slate-500">
              AI literacy assessment for teams
            </div>
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-slate-600 dark:text-neutral-400 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 dark:text-neutral-400 hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-neutral-800 mt-8 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} ScorePrompt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />
      <main>
        <HeroSection />
        <PricingSection />
        <WhatsIncludedSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
