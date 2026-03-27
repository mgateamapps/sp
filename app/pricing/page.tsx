import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';
import type { Metadata } from 'next';
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
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | ScorePrompt',
  description:
    'Start with a pilot, assess your team's AI prompting capability, and get structured results. Simple pricing for companies serious about AI literacy.',
};

function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          ScorePrompt
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
            <Button size="sm">Start pilot</Button>
          </Link>
        </nav>
        <div className="md:hidden">
          <Link href="/auth/register">
            <Button size="sm">Start pilot</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
          Start with a clear AI literacy baseline
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
          Run a ScorePrompt pilot, assess how your team actually writes prompts,
          and get structured insight into current AI capability across the
          company.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/auth/register">
            <Button size="lg">Start pilot</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">
              Book demo
            </Button>
          </Link>
        </div>

        <p className="text-sm text-neutral-500 max-w-xl mx-auto">
          Designed for teams that want a practical, measurable view of AI
          prompting skill — without rolling out a full training platform first.
        </p>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: 'Pilot',
      badge: 'Recommended start',
      description:
        'A simple starting point for companies that want to assess current prompt-writing capability before investing further in training or AI enablement.',
      features: [
        'Up to 50 employees',
        '1 assessment campaign',
        'Individual employee feedback',
        'Company summary view',
      ],
      cta: 'Start pilot',
      ctaLink: '/auth/register',
      ctaVariant: 'default' as const,
      pricing: 'Pilot-based setup',
    },
    {
      name: 'Starter Annual',
      badge: null,
      description:
        'A lightweight recurring option for teams that want to measure capability more than once and track early improvement over time.',
      features: [
        'Up to 50 employees',
        '2 assessment cycles per year',
        'Individual feedback',
        'Company dashboard',
        'Progress visibility across cycles',
      ],
      cta: 'Talk to us',
      ctaLink: '/auth/register',
      ctaVariant: 'outline' as const,
      pricing: 'Annual plan',
    },
    {
      name: 'Growth Annual',
      badge: null,
      description:
        'For larger teams that want more frequent assessment and clearer visibility into skill development over time.',
      features: [
        'Up to 150 employees',
        '4 assessment cycles per year',
        'Individual feedback',
        'Dashboard and summary reporting',
        'Better visibility into repeated weak areas',
      ],
      cta: 'Talk to us',
      ctaLink: '/auth/register',
      ctaVariant: 'outline' as const,
      pricing: 'Custom pricing',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Simple starting point for teams
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            ScorePrompt is best introduced as a pilot or structured assessment
            cycle. The goal is to give your company a reliable baseline, clear
            weak spots, and a practical next step.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.badge
                  ? 'border-primary shadow-lg relative'
                  : 'border-neutral-200 dark:border-neutral-800'
              }
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-sm text-neutral-500 mt-1">
                  {plan.pricing}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  {plan.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink} className="block">
                  <Button variant={plan.ctaVariant} className="w-full">
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
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
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What companies get</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="pt-6 pb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-sm font-medium">{feature.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecommendedUsageSection() {
  const usages = [
    {
      title: 'Baseline assessment',
      description:
        'Run an initial campaign to understand current prompting quality across the team.',
      icon: Target,
    },
    {
      title: 'Focused improvement',
      description:
        'Use repeated weaknesses and low-scoring areas to guide coaching or internal enablement.',
      icon: TrendingUp,
    },
    {
      title: 'Retest and measure progress',
      description:
        'Run the assessment again later to see whether prompt-writing skill is actually improving.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            How teams typically use ScorePrompt
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {usages.map((usage) => (
            <Card key={usage.title}>
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <usage.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{usage.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {usage.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
          <CardContent className="py-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              Most smaller teams will get useful signal from{' '}
              <span className="font-medium text-neutral-900 dark:text-white">
                2 assessment cycles per year
              </span>
              . Teams making AI a bigger operational priority may benefit from
              running{' '}
              <span className="font-medium text-neutral-900 dark:text-white">
                4 cycles per year
              </span>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WhoThisIsForSection() {
  const goodFit = [
    'Digital teams',
    'Agencies',
    'SaaS companies',
    'Knowledge-worker teams',
    'Companies already using ChatGPT, Copilot, or similar tools',
  ];

  const lessIdeal = [
    'Very small one-person businesses',
    'Teams with no active AI usage yet',
    'Companies expecting a full LMS or training portal',
    'Organizations looking for role-specific custom scenarios in the MVP phase',
  ];

  return (
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Best fit for</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Good fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {goodFit.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-neutral-300 dark:border-neutral-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-5 h-5 text-neutral-400" />
                Less ideal fit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {lessIdeal.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                  >
                    <XCircle className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'Is this a training platform?',
      answer:
        'No. ScorePrompt is designed as an assessment and feedback tool, not a course platform or LMS.',
    },
    {
      question: 'Do employees need accounts?',
      answer:
        'No. Employees complete the assessment through a secure email link. No separate employee login is required in the MVP flow.',
    },
    {
      question: 'Can we run this more than once?',
      answer:
        'Yes. The product is designed to support repeat assessment cycles so companies can track whether prompting quality improves over time.',
    },
    {
      question: 'Are the tasks role-specific?',
      answer:
        'The MVP uses universal work scenarios designed to measure general prompting quality across knowledge-worker teams.',
    },
    {
      question: 'Do we need a large rollout to get value?',
      answer:
        'No. A pilot can already provide useful signal by showing participation, score distribution, common weaknesses, and areas that need improvement.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
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
    <section className="py-16 md:py-24 bg-primary/5 dark:bg-primary/10">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Want to see how strong your team's prompting really is?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
          Start with a pilot, get a clear baseline, and turn AI prompt quality
          into something visible and measurable.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg">Start pilot</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">
              Book demo
            </Button>
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-xl font-bold text-primary mb-1">
              ScorePrompt
            </div>
            <div className="text-sm text-neutral-500">
              AI literacy assessment for teams
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Start pilot
            </Link>
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
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
        <RecommendedUsageSection />
        <WhoThisIsForSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
