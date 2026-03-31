import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  ClipboardCheck,
  BarChart3,
  Target,
  MessageSquare,
  LayoutDashboard,
  RefreshCw,
  Zap,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Building2,
  GraduationCap,
  UsersRound,
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
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              AI Literacy Assessment Platform
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Measure how well your team{' '}
              <span className="text-primary">actually uses AI</span>
            </h1>
            
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              ScorePrompt helps companies assess employee prompt-writing skills,
              identify weak spots, and track AI literacy over time — with
              structured scoring and actionable insights.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/auth/register">
                <Button size="lg" className="text-base px-8">
                  Try free
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="text-base px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  View pricing
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-6">
              {[
                '5 practical scenarios',
                'Individual feedback',
                'Team insights',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl" />
            <Card className="relative shadow-2xl border-white/10 bg-white">
              <CardHeader className="border-b border-neutral-100">
                <CardTitle className="text-lg text-heading">AI literacy overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Invited', value: '42', icon: Users, color: 'text-slate-600' },
                    { label: 'Completed', value: '36', icon: CheckCircle, color: 'text-green-600' },
                    { label: 'Completion', value: '86%', icon: TrendingUp, color: 'text-primary' },
                    { label: 'Avg. score', value: '68', icon: Target, color: 'text-primary' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                        {stat.label}
                      </div>
                      <div className="text-2xl font-bold text-heading">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-5">
                  <div className="text-sm font-semibold text-heading mb-3">Skill breakdown</div>
                  {[
                    { label: 'Clarity', value: 74 },
                    { label: 'Context', value: 61 },
                    { label: 'Constraints', value: 58 },
                    { label: 'Output format', value: 72 },
                    { label: 'Verification', value: 55 },
                  ].map((skill) => (
                    <div key={skill.label} className="mb-2.5">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">{skill.label}</span>
                        <span className="font-medium text-heading">{skill.value}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold text-amber-800">Top insight:</span>{' '}
                      <span className="text-amber-700">
                        Prompts lack constraints and output format
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Invite your team',
      description:
        'Add employee emails and launch an assessment campaign in minutes.',
      icon: Users,
    },
    {
      number: '2',
      title: 'Employees complete 5 prompt tasks',
      description:
        'Each employee responds to practical, universal AI prompting scenarios through a simple guided flow.',
      icon: ClipboardCheck,
    },
    {
      number: '3',
      title: 'Get scored results and company insights',
      description:
        'ScorePrompt evaluates responses, generates individual feedback, and shows team-level patterns in one dashboard.',
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">How it works</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Three simple steps to measure and improve your team's AI literacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < 2 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <Card className="text-center border-2 border-transparent hover:border-primary/20 transition-colors">
                <CardContent className="pt-8 pb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-5">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-3">
                    Step {step.number}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">{step.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatCompaniesGetSection() {
  const features = [
    {
      title: 'Clear AI literacy baseline',
      description:
        'See where your team really stands before investing further in training or rollout.',
      icon: Target,
    },
    {
      title: 'Employee-level scoring',
      description:
        'Get a structured score for each employee across key prompting criteria.',
      icon: Users,
    },
    {
      title: 'Actionable feedback',
      description:
        'Each employee receives feedback, weaknesses, and a better version of their prompt.',
      icon: MessageSquare,
    },
    {
      title: 'Management dashboard',
      description:
        'Track participation, average score, weak areas, and repeated mistakes across the company.',
      icon: LayoutDashboard,
    },
    {
      title: 'Repeatable assessment cycles',
      description:
        'Run follow-up assessments later and measure whether skills are actually improving.',
      icon: RefreshCw,
    },
    {
      title: 'Simple rollout',
      description:
        'No complex setup, no employee accounts, no training portal to manage.',
      icon: Zap,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">What companies get</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Everything you need to understand and improve AI adoption in your
            organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="group hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary/10">
              <CardContent className="pt-8 pb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-heading dark:text-white">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatIsAssessedSection() {
  const scenarios = [
    {
      title: 'Summarization',
      description:
        'Write a prompt that asks AI to summarize a long document into 5 key points for a busy manager.',
    },
    {
      title: 'Email drafting',
      description:
        'Write a prompt for drafting a professional follow-up email to a client who has not sent required information.',
    },
    {
      title: 'Action list extraction',
      description:
        'Write a prompt that turns messy meeting notes into a structured action list with owners and deadlines.',
    },
    {
      title: 'Comparison',
      description:
        'Write a prompt that compares two options and returns pros, cons, risks, and a recommendation.',
    },
    {
      title: 'Text improvement',
      description:
        'Write a prompt that improves a rough draft so it becomes clearer, shorter, and more professional.',
    },
  ];

  const criteria = [
    { label: 'Clarity', description: 'Is the goal clear and specific?' },
    {
      label: 'Context',
      description: 'Does the prompt provide enough relevant background?',
    },
    {
      label: 'Constraints',
      description: 'Does it define rules, boundaries, or expectations?',
    },
    {
      label: 'Output format',
      description: 'Does it specify how the answer should be structured?',
    },
    {
      label: 'Verification mindset',
      description:
        'Does it show awareness of checking, validating, or improving the output?',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Assessment Content
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">What ScorePrompt evaluates</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Five practical prompt scenarios and a consistent rubric to assess
            how effectively employees instruct AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {scenarios.map((scenario, index) => (
            <Card key={scenario.title} className="group hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/10">
              <CardContent className="pt-6 pb-6">
                <Badge className="mb-4 bg-slate-100 text-slate-700 hover:bg-slate-100">
                  Scenario {index + 1}
                </Badge>
                <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">{scenario.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {scenario.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto shadow-lg border-2 border-primary/10">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl text-heading">Rubric criteria</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {criteria.map((criterion) => (
                <div
                  key={criterion.label}
                  className="flex items-start gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800 last:border-0 last:pb-0"
                >
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-secondary mt-1.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-heading dark:text-white">{criterion.label}</div>
                    <div className="text-neutral-600 dark:text-neutral-400">
                      {criterion.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function WhyThisMattersSection() {
  const audiences = [
    {
      title: 'For leadership',
      description:
        'Understand whether AI adoption is actually happening in a useful, measurable way.',
      icon: Building2,
    },
    {
      title: 'For HR and L&D',
      description:
        'Identify skill gaps, repeated weaknesses, and where coaching should focus next.',
      icon: GraduationCap,
    },
    {
      title: 'For teams',
      description:
        'Give employees concrete feedback on how to write better prompts and get better outputs.',
      icon: UsersRound,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Who It's For
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">Why companies use ScorePrompt</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience) => (
            <Card key={audience.title} className="text-center group hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/10">
              <CardContent className="pt-10 pb-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <audience.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-heading dark:text-white">{audience.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {audience.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreviewSection() {
  const weaknesses = [
    'Missing output format',
    'Prompts too vague',
    'Weak context',
    'No validation step',
  ];

  const participants = [
    { email: 'ana@company.com', score: 74, band: 'Functional' },
    { email: 'ivan@company.com', score: 59, band: 'Basic' },
    { email: 'sara@company.com', score: 83, band: 'Strong' },
    { email: 'marko@company.com', score: 47, band: 'At Risk' },
  ];

  function getBandVariant(band: string) {
    switch (band) {
      case 'Strong':
        return 'success';
      case 'Functional':
        return 'info';
      case 'Basic':
        return 'warning';
      case 'At Risk':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  return (
    <section className="py-20 md:py-28 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
            Dashboard Preview
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading dark:text-white">
            Built for fast management insight
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
            Not just scores — ScorePrompt highlights participation, weak areas,
            repeated mistakes, and where improvement should happen next.
          </p>
        </div>

        <Card className="shadow-2xl max-w-4xl mx-auto border-2 border-primary/10">
          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-3xl font-bold text-primary">86%</div>
                <div className="text-sm text-slate-500">Completion rate</div>
              </div>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-3xl font-bold text-heading">68</div>
                <div className="text-sm text-slate-500">Average score</div>
              </div>
              <div className="p-5 rounded-xl bg-green-50 border border-green-100 text-center">
                <div className="text-xl font-bold text-green-600">Clarity</div>
                <div className="text-sm text-slate-500">Strongest area</div>
              </div>
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <div className="text-xl font-bold text-amber-600">Verification</div>
                <div className="text-sm text-slate-500">Weakest area</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-heading">Repeated weaknesses</h4>
                <div className="space-y-3">
                  {weaknesses.map((weakness) => (
                    <div
                      key={weakness}
                      className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-sm text-amber-800">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-heading">Recent results</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="text-xs font-semibold">Employee</TableHead>
                        <TableHead className="text-xs font-semibold">Score</TableHead>
                        <TableHead className="text-xs font-semibold">Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p) => (
                        <TableRow key={p.email}>
                          <TableCell className="text-sm">{p.email}</TableCell>
                          <TableCell className="text-sm font-semibold text-heading">
                            {p.score}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getBandVariant(p.band)} className="text-xs">
                              {p.band}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'Does every employee need an account?',
      answer:
        'No. Employees access the assessment through a secure email link. No separate employee login is required in the MVP flow.',
    },
    {
      question: 'Is this a training platform?',
      answer:
        'No. ScorePrompt is an assessment and feedback tool, not a course platform or LMS.',
    },
    {
      question: 'Are the scenarios specific to one profession?',
      answer:
        'No. The MVP uses universal work scenarios designed to evaluate general prompt-writing quality across knowledge-worker teams.',
    },
    {
      question: 'What does the company receive after the assessment?',
      answer:
        'Companies get employee-level results, aggregated team insights, and a management-friendly overview of common weaknesses and capability gaps.',
    },
    {
      question: 'Can we run this again later?',
      answer:
        'Yes. ScorePrompt is designed to support repeat assessment cycles so companies can measure progress over time.',
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-slate-50 dark:bg-neutral-900">
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
          See how strong your team's AI prompting really is
        </h2>
        <p className="text-slate-300 mb-10 max-w-xl mx-auto text-lg">
          Launch a pilot, assess your team, and get a clear baseline of current
          AI literacy across your company.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/auth/register">
            <Button size="lg" className="text-base px-8">Try free</Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="text-base px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
              View pricing
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
              href="/pricing"
              className="text-sm text-slate-600 dark:text-neutral-400 hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 dark:text-neutral-400 hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Try free</Button>
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <WhatCompaniesGetSection />
        <WhatIsAssessedSection />
        <WhyThisMattersSection />
        <DashboardPreviewSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
