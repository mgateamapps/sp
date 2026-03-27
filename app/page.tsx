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
        <Link href="/" className="text-xl font-bold text-primary">
          ScorePrompt
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
              Measure how well your team actually uses AI
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
              ScorePrompt helps companies assess employee prompt-writing skills,
              identify weak spots, and track AI literacy over time — with
              structured scoring, individual feedback, and a clear management
              dashboard.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Link href="/auth/register">
                <Button size="lg">Start pilot</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg">
                  Book demo
                </Button>
              </Link>
            </div>

            <div className="space-y-2">
              {[
                '5 practical assessment scenarios',
                'Individual feedback for each employee',
                'Company-wide results and skill visibility',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Card className="shadow-lg">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800">
                <CardTitle className="text-lg">AI literacy overview</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Invited', value: '42', icon: Users },
                    { label: 'Completed', value: '36', icon: CheckCircle },
                    { label: 'Completion rate', value: '86%', icon: TrendingUp },
                    { label: 'Avg. score', value: '68/100', icon: Target },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800"
                    >
                      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                        <stat.icon className="w-3 h-3" />
                        {stat.label}
                      </div>
                      <div className="text-xl font-semibold">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <div className="text-sm font-medium mb-3">Skill breakdown</div>
                  {[
                    { label: 'Clarity', value: 74 },
                    { label: 'Context', value: 61 },
                    { label: 'Constraints', value: 58 },
                    { label: 'Output format', value: 72 },
                    { label: 'Verification', value: 55 },
                  ].map((skill) => (
                    <div key={skill.label} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          {skill.label}
                        </span>
                        <span>{skill.value}</span>
                      </div>
                      <div className="h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium text-amber-800 dark:text-amber-200">
                        Top insight:
                      </span>{' '}
                      <span className="text-amber-700 dark:text-amber-300">
                        Most common weakness: prompts lack constraints and output
                        format instructions
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
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Three simple steps to measure and improve your team's AI literacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="text-center">
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm font-medium text-primary mb-2">
                  Step {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {step.description}
                </p>
              </CardContent>
            </Card>
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
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What companies get</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Everything you need to understand and improve AI adoption in your
            organization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What ScorePrompt evaluates</h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            ScorePrompt uses five practical prompt scenarios and a consistent
            rubric to assess how effectively employees instruct AI tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {scenarios.map((scenario, index) => (
            <Card key={scenario.title}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    Scenario {index + 1}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{scenario.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {scenario.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Rubric criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criteria.map((criterion) => (
                <div
                  key={criterion.label}
                  className="flex items-start gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0"
                >
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <div className="font-medium">{criterion.label}</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
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
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why companies use ScorePrompt</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {audiences.map((audience) => (
            <Card key={audience.title} className="text-center">
              <CardContent className="pt-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <audience.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{audience.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
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
    <section className="py-16 md:py-24 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            A dashboard built for fast management insight
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Not just scores — ScorePrompt highlights participation, weak areas,
            repeated mistakes, and where improvement should happen next.
          </p>
        </div>

        <Card className="shadow-lg max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-center">
                <div className="text-2xl font-bold text-primary">86%</div>
                <div className="text-xs text-neutral-500">Completion rate</div>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-center">
                <div className="text-2xl font-bold">68/100</div>
                <div className="text-xs text-neutral-500">Average score</div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <div className="text-2xl font-bold text-green-600">Clarity</div>
                <div className="text-xs text-neutral-500">Strongest area</div>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                <div className="text-2xl font-bold text-amber-600">Verification</div>
                <div className="text-xs text-neutral-500">Weakest area</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Repeated weaknesses</h4>
                <div className="space-y-2">
                  {weaknesses.map((weakness) => (
                    <div
                      key={weakness}
                      className="flex items-center gap-2 p-2 rounded bg-neutral-50 dark:bg-neutral-800"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Recent results</h4>
                <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Employee</TableHead>
                        <TableHead className="text-xs">Score</TableHead>
                        <TableHead className="text-xs">Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.map((p) => (
                        <TableRow key={p.email}>
                          <TableCell className="text-xs">{p.email}</TableCell>
                          <TableCell className="text-xs font-medium">
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
    <section className="py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900">
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
          See how strong your team's AI prompting really is
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xl mx-auto">
          Launch a pilot, assess your team, and get a clear baseline of current
          AI literacy across your company.
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
            <div className="text-xl font-bold text-primary mb-1">ScorePrompt</div>
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
