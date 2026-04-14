import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { CREDIT_PACKS, formatPrice, getPricePerCredit } from '@/lib/utils/pricing';
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
  Target,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing | ScorePrompt',
  description:
    "Start with a pilot, assess your team's AI prompting capability, and get structured results. Simple pricing for companies serious about AI literacy.",
};

function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
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
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Login
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Try free</Button>
              </Link>
            </>
          )}
        </nav>
        <div className="md:hidden">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button size="sm">Try free</Button>
            </Link>
          )}
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
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-neutral-950 -mt-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Free trial card */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-700 p-8 mb-12 text-center max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-heading dark:text-white">Try it yourself first</h3>
          <p className="text-slate-500 dark:text-neutral-400 mb-6">
            Take the full 5-scenario assessment yourself for free. See exactly what your employees will experience and how scoring works — before buying anything.
          </p>
          <Link href="/auth/register">
            <Button variant="outline" size="lg">Start free assessment</Button>
          </Link>
        </div>

        {/* Credit packs */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-heading dark:text-white mb-3">Credit packs for teams</h2>
          <p className="text-slate-500 dark:text-neutral-400 max-w-2xl mx-auto">
            Buy credits upfront. 1 credit = 1 employee who <strong>completes</strong> an assessment.
            Credits never expire. No subscriptions, no refund complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {CREDIT_PACKS.map((pack) => (
            <Card
              key={pack.id}
              className={
                pack.highlighted
                  ? 'border-2 border-primary shadow-2xl relative bg-white dark:bg-neutral-900'
                  : 'border-2 border-slate-200 dark:border-neutral-800 hover:border-primary/30 transition-colors bg-white dark:bg-neutral-900'
              }
            >
              {pack.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pt-8 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-heading dark:text-white">{pack.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-heading dark:text-white">{formatPrice(pack.price_cents)}</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">{pack.credits} credits</div>
                <div className="text-xs text-slate-400 mt-0.5">{formatPrice(Math.round(getPricePerCredit(pack)))} per assessment</div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-600 dark:text-neutral-400 mb-6 text-center text-sm">
                  {pack.description}
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">No expiry</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Unlimited campaigns</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">Only pay for completions</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block">
                  <Button
                    variant={pack.highlighted ? 'default' : 'outline'}
                    className="w-full"
                    size={pack.highlighted ? 'lg' : 'default'}
                  >
                    Get started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm">
          Need more than 500 credits?{' '}
          <a href="mailto:hello@scoreprompt.com" className="text-primary hover:underline">Contact us</a>{' '}
          for enterprise pricing.
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
      question: 'How does the annual plan work?',
      answer:
        'With an annual plan, you pay upfront for the year and get 4 assessment campaigns included. You pay for 3 campaigns but get 4 — that\'s a 25% savings. If you need more than 4 campaigns in a year, additional ones are billed at standard per-campaign rates.',
    },
    {
      question: 'Do employees need accounts?',
      answer:
        'No. Employees complete the assessment through a secure email link. No separate employee login is required.',
    },
    {
      question: 'Can we switch from monthly to annual?',
      answer:
        'Yes! You can upgrade to an annual plan at any time to start saving. Your existing data and campaigns will be preserved.',
    },
    {
      question: 'What happens if we have more than 50 employees?',
      answer:
        'Use the Enterprise plan which supports unlimited employees at a lower per-employee rate. Both pay-per-campaign and annual options are available.',
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

export default async function PricingPage() {
  const admin = await getCurrentAdminProfile();
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header isLoggedIn={admin !== null} />
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
