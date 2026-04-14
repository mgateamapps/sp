import type { CampaignDomain, ScenarioKey, RubricCriterion, ScoreBand } from '@/types';

// Scenario definition
export interface ScenarioDefinition {
  key: ScenarioKey;
  title: string;
  description: string;
  instruction: string;
}

// ============================================================================
// MARKETING SCENARIOS
// ============================================================================
const MARKETING_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'mkt_campaign_analysis',
    title: 'Campaign Performance Diagnosis',
    description: 'Diagnose a multi-channel campaign that is not converting',
    instruction:
      'Your Q3 email campaign had an 18% open rate and 2.3% click-through rate, but only a 0.4% conversion rate — far below the 1.8% target. The campaign targeted mid-market SaaS buyers (VP-level) with a 14-day nurture sequence. You have UTM data, heatmaps from the landing page, and drop-off rates at each step of the checkout funnel. Write a prompt that will help an AI diagnose where exactly the funnel is breaking down, separate correlation from causation in the data, and produce a prioritised list of specific copy, targeting, and UX changes to test — with expected impact per lever.',
  },
  {
    key: 'mkt_competitive_positioning',
    title: 'Competitive Positioning Brief',
    description: 'Develop a differentiated market position against established competitors',
    instruction:
      'Your B2B SaaS product is entering a market where three established players (each with 5+ years, strong brand recognition, and average ACVs of $60K) already exist. Your product has a 40% faster implementation time, a significantly lower price point, and better API flexibility — but zero brand awareness. Your target segment is mid-market operations teams at 200–1,000 person companies who are frustrated with the complexity of incumbent solutions. Write a prompt that will help an AI craft a positioning strategy and messaging framework: define your category framing, articulate the "why now" narrative, write three distinct value propositions for different buyer personas, and flag the competitive objections you must pre-empt in every sales conversation.',
  },
  {
    key: 'mkt_content_strategy',
    title: 'Product Launch Content Plan',
    description: 'Build a multi-channel content strategy for a B2B feature launch',
    instruction:
      'You are launching a major new enterprise feature in 6 weeks that enables real-time budget forecasting. Your ICP is VPs of Finance at 500–2,000 person companies. The sales cycle for this feature is typically 8–12 weeks, so the launch goal is pipeline generation, not immediate revenue. You have a content team of 2 writers, access to 4 customer case studies, 3 willing design partners, a $25K paid budget, and channels including LinkedIn, outbound email, your blog, and a planned webinar. Write a prompt that will help an AI build a week-by-week content calendar that sequences awareness, consideration, and urgency content — with specific asset types, channel allocations, and lead-gen hooks for each phase. Include a measurement framework tied to pipeline KPIs, not vanity metrics.',
  },
  {
    key: 'mkt_ad_copy',
    title: 'Paid Search Copy Testing',
    description: 'Generate structured A/B test variants for a high-stakes paid campaign',
    instruction:
      'You are running a Google Ads campaign targeting HR directors searching for applicant tracking software. Your current best-performing ad has a 3.2% CTR and a $140 cost-per-lead. You have three distinct value propositions to test: (1) time-to-hire reduction (saves 11 days on average), (2) hiring team collaboration features, and (3) compliance automation for GDPR and EEOC. Your conversion goal is a "Start Free Trial" click. Each variant needs to work within Google\'s 30-character headline and 90-character description limits, and must include a clear differentiator from generic competitors. Write a prompt that will help an AI generate 5 headline/description pairs per value proposition — 15 variants total — with rationale for each, structured so a non-copywriter can immediately run the test in Google Ads Editor.',
  },
  {
    key: 'mkt_persona_synthesis',
    title: 'Buyer Persona Research Synthesis',
    description: 'Synthesise qualitative and quantitative data into actionable buyer personas',
    instruction:
      'You have 40+ pages of raw materials: transcripts from 12 customer interviews, 300 NPS survey responses (with verbatims), Mixpanel behavioral data showing feature adoption patterns by company size, and 6 months of lost-deal notes from the CRM. The data is messy — interview themes are inconsistent, the survey skews toward happy customers, and the behavioral data contradicts some interview findings. You need to produce 3 actionable buyer personas for the product and marketing teams. Write a prompt that will help an AI synthesise these conflicting sources into personas that include: core jobs-to-be-done (not demographics), the specific emotional triggers that drive urgency, top 3 objections and how they think about them, and — critically — the exact language and phrases they use that should appear verbatim in marketing copy and sales scripts.',
  },
];

// ============================================================================
// SALES SCENARIOS
// ============================================================================
const SALES_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'sales_discovery_prep',
    title: 'Strategic Discovery Call Preparation',
    description: 'Prepare a high-stakes discovery call with a complex prospect',
    instruction:
      'You have a discovery call tomorrow with the VP of Finance at a 500-person manufacturing company. Their CRM data shows: a CFO change 4 months ago, they missed Q2 revenue targets by 12%, they recently expanded into two new European markets, and their LinkedIn shows the VP of Finance was promoted 6 months ago (previously Director level). You sell financial planning and analysis software. Write a prompt that will help an AI prepare a complete discovery strategy: a personalised opening that references their specific context, 6–8 high-value questions that uncover budget authority, the decision-making process, existing solution pain points, and strategic priorities — plus guidance on which signals during the call indicate this is worth pursuing vs. walking away. The output should be practical and specific enough to use as real call prep, not generic sales advice.',
  },
  {
    key: 'sales_objection',
    title: 'High-Stakes Objection Handling',
    description: 'Craft a response to a price objection that reframes value without discounting',
    instruction:
      'You are in a second meeting with a mid-market operations director. After a solid demo, they said: "We love what you\'ve built, but your pricing is 40% higher than [Competitor X] and I honestly can\'t justify that difference to my CFO — especially right now with budget pressure." You know: Competitor X has a 67% implementation failure rate in this industry (you have case study data), your platform reduces manual work by an average of 14 hours/week per team, and this prospect currently has 8 FTEs doing work your tool automates. Write a prompt that will help an AI craft a multi-part response: acknowledge the concern without becoming defensive, reframe the comparison to total cost of ownership rather than license price, build a specific business case using their own numbers, and close with a low-risk next step that moves toward the CFO conversation rather than a discount negotiation.',
  },
  {
    key: 'sales_pipeline_forecast',
    title: 'Pipeline Health & Forecast Analysis',
    description: 'Assess pipeline risk and produce a credible quarterly commit forecast',
    instruction:
      'Your CRM shows 47 open opportunities totalling $2.8M. You need to deliver a quarterly commit forecast to your VP of Sales in 48 hours. Key data points: 18 deals have had no activity in 30+ days, 6 deals have close dates that have slipped twice, your top 3 deals ($940K combined) all depend on the same budget approval process at large enterprises, and 4 deals are with companies that were just acquired by a competitor. You also have deal-level data: stage, amount, last contact date, number of stakeholders engaged, and whether economic buyers have been identified. Write a prompt that will help an AI analyse this pipeline, separate genuine commit from best-case and pipeline, flag which specific deals are at risk and why, identify 3–5 deals that could be accelerated with the right action, and produce a forecast narrative you can deliver to leadership with confidence.',
  },
  {
    key: 'sales_executive_proposal',
    title: 'C-Suite Business Case Proposal',
    description: 'Build a compelling executive proposal after a successful proof of concept',
    instruction:
      'After a 3-month proof of concept with a 1,200-person logistics company, your platform delivered measurable results: invoice processing time reduced by 67% (from 9 days to 3 days), error rate dropped from 11% to 2.4%, and the pilot team avoided hiring 2 planned FTEs. You are now presenting to the CFO and COO to secure a $280K annual contract. The CFO\'s primary concern is payback period and hidden implementation costs. The COO is worried about change management and whether the rollout will disrupt month-end close. Write a prompt that will help an AI draft a concise, executive-ready business case document: a 3-year ROI model using the PoC data, an honest implementation risk assessment with your mitigation plan, a phased rollout recommendation that minimises operational disruption, and a one-page executive summary with a clear call to action — structured so the CFO can share it internally to build consensus without you in the room.',
  },
  {
    key: 'sales_account_expansion',
    title: 'Account Expansion Strategy',
    description: 'Identify and prioritise upsell paths across a stagnant account portfolio',
    instruction:
      'You manage 12 enterprise accounts averaging $180K ARR. Three accounts have been flat for 2+ years: Account A (a media company, $210K ARR, high product usage, no exec sponsor since their CTO left), Account B (a retail company, $145K ARR, low feature adoption, has mentioned "evaluating alternatives" twice in the past year), and Account C (a logistics company, $190K ARR, heavy usage of core product but never purchased two add-on modules that would directly address a problem they complained about in QBRs). You have product usage data, open support ticket history, and QBR notes for each. Write a prompt that will help an AI analyse each account\'s specific situation, identify the highest-probability expansion path for each, define the specific trigger event or business case for each conversation, and recommend the sequence and approach — including which account to prioritise first and which, if any, is a realistic churn risk that needs a retention play instead.',
  },
];

// ============================================================================
// SUPPORT SCENARIOS
// ============================================================================
const SUPPORT_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'sup_escalation',
    title: 'Critical Account Escalation Response',
    description: 'De-escalate a high-value, publicly threatening customer complaint',
    instruction:
      'A customer paying $85K/year submitted a 600-word email at 11pm. Their integration with your platform broke during their month-end financial close. Their finance team lost 6 hours of work, had to redo calculations manually, and missed an internal reporting deadline. They are threatening to "cancel immediately" and "post a detailed review on G2 and LinkedIn." You have investigated: the root cause was a breaking change in a third-party API you depend on, your status page did not reflect the incident in real time, and their account manager had been unresponsive for 3 weeks prior. Write a prompt that will help an AI draft a response that: de-escalates the emotional intensity while being genuinely human, takes clear ownership without admitting legal liability, presents a specific and credible remediation plan with timelines, and proposes a service credit or goodwill gesture that is appropriate but not excessive — all without sounding like a template.',
  },
  {
    key: 'sup_knowledge_base',
    title: 'Self-Service Knowledge Base Article',
    description: 'Write a KB article that genuinely reduces ticket volume on a complex issue',
    instruction:
      'Your support team receives approximately 50 tickets per month about a specific problem: users with "Viewer" or "Commenter" roles cannot export data to CSV, even when the export button appears to be enabled. The root cause is a combination of three factors: role-based permissions set at the organisation level, a feature flag that must be enabled by an admin, and a legacy permission override that sometimes conflicts with the newer role system. Junior support agents handle this inconsistently — some tell users to contact their admin, others escalate unnecessarily. You want a KB article that customers can find and self-serve, AND that agents can use as a resolution script. Write a prompt that will help an AI produce a KB article that: explains the issue clearly to a non-technical user, covers all three root cause scenarios with step-by-step resolution paths, includes decision-tree logic so users can identify their specific situation, notes what admins need to do vs. what end users can do, and uses a structure and tone that reduces both re-contacts and unnecessary escalations.',
  },
  {
    key: 'sup_root_cause',
    title: 'Post-Mortem Root Cause Analysis',
    description: 'Produce a rigorous RCA for a recurring production incident',
    instruction:
      'Over 30 days your platform experienced three separate incidents where payment webhooks from Stripe silently failed — no errors were thrown, no alerts fired, and 112 customers were affected across all three incidents (some charged incorrectly, some not charged at all). You have: Datadog APM logs showing normal latency throughout each incident, Stripe event logs showing the webhooks were delivered successfully on Stripe\'s end, a timeline of when customers started reporting issues vs. when your team detected each incident, and your current monitoring and alerting configuration. Each incident was "fixed" by a manual database reconciliation job, but the underlying issue was never resolved. Write a prompt that will help an AI produce a complete post-mortem: a precise timeline, a structured 5-Why root cause analysis that goes beyond "webhook processing failed," an assessment of what monitoring and alerting gaps allowed this to recur three times, the systemic changes required to prevent recurrence (not just the immediate fix), and a clear accountability matrix for follow-through.',
  },
  {
    key: 'sup_process_doc',
    title: 'Support Triage SOP Documentation',
    description: 'Design a standardised process to fix inconsistent ticket handling across a team',
    instruction:
      'Your support team of 12 agents handles around 400 tickets per day across email, live chat, and phone. Average first-response time varies from 18 minutes to 4 hours depending on the agent. Resolution times for identical issue types vary by up to 3x between agents. Your CSAT scores for individual agents range from 68% to 94%. You have: a list of the top 20 ticket categories by volume, examples of well-handled and poorly-handled tickets for each, your current SLA commitments by customer tier, and an escalation matrix that agents consistently ignore. Write a prompt that will help an AI design a Tier-1 triage SOP that: defines a clear first-response workflow applicable to all channels, includes channel-specific guidance where it genuinely differs, specifies escalation criteria with concrete thresholds (not vague guidance), provides quality checklists that agents can use before closing a ticket, and is written in plain language that a new hire could follow on day one without a manager present.',
  },
  {
    key: 'sup_csat_analysis',
    title: 'CSAT Decline Investigation',
    description: 'Identify the root causes of a significant satisfaction score drop',
    instruction:
      'Your CSAT score dropped from 91% to 76% over 90 days. During the same period, ticket volume increased 28%, you onboarded 4 new agents, and you shipped 2 major product updates that generated a spike in configuration-related questions. You have: ticket category breakdown for the full 90-day period, average handle time and first-contact resolution rate by category and by agent, 200 verbatim comments from dissatisfied customers, and a comparison of CSAT scores by ticket category (some categories are unchanged; others have dropped dramatically). Three categories account for 70% of the CSAT decline. Write a prompt that will help an AI perform a structured analysis: identify which factors are driving the decline (new agent quality, specific issue categories, product changes, or volume overload), separate the signal from the noise in the verbatim comments, determine which of the top drivers can be addressed in the next 30 days vs. require structural changes, and produce a prioritised action plan with specific metrics to track recovery.',
  },
];

// ============================================================================
// PRODUCT SCENARIOS
// ============================================================================
const PRODUCT_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'prod_prd',
    title: 'PRD for an Ambiguous Feature Request',
    description: 'Turn 18 months of vague customer requests into a focused, scoped PRD',
    instruction:
      'Enterprise customers have been requesting "better reporting" for 18 months. You have: 30 Jira feature requests from the sales and success team (many contradict each other), a UserVoice board with 400+ upvotes spread across 12 distinct ideas, qualitative notes from 8 customer discovery calls (customers describe very different problems when asked what "better reporting" means), and 3 months of data showing that 60% of customers export raw data to Excel rather than using your built-in reports. You have one senior engineer, one designer, and 6 weeks of capacity. Write a prompt that will help an AI synthesise this messy input into a focused PRD for a single high-value reporting feature: it should identify the underlying job-to-be-done that explains all the surface-level requests, write user stories with clear acceptance criteria, define what is explicitly out of scope and why, include the hypotheses being tested and how you would measure success, and flag the open questions that need answers before engineering can start.',
  },
  {
    key: 'prod_prioritization',
    title: 'Contested Backlog Prioritisation',
    description: 'Navigate conflicting stakeholder priorities to produce a defensible sprint plan',
    instruction:
      'You have 60 items in your backlog and need to cut to a 6-week sprint scope. You have RICE scores and engineering complexity estimates for most items. Three items are creating political tension: Item A is a committed deliverable to your largest customer ($420K ARR) due in 5 weeks; Item B is a significant technical debt refactor that your engineering lead says "must happen this quarter or we will lose two senior engineers"; Item C is a feature that the CEO demoed to investors last week and expects to ship, but has no customer validation and engineering estimates 4 weeks of work. All three cannot fit in the sprint alongside the rest of the prioritised work. Write a prompt that will help an AI facilitate a structured trade-off analysis: surface the real constraints and dependencies, model the consequences of each prioritisation decision (customer impact, engineering risk, organisational trust), recommend a specific sprint plan with rationale, and produce the talking points needed to communicate the decision to each affected stakeholder without creating conflict.',
  },
  {
    key: 'prod_user_research',
    title: 'Usability Test Synthesis',
    description: 'Extract genuine design insights from contradictory user test results',
    instruction:
      'You ran 12 usability tests on a redesigned onboarding flow. Task completion data shows: Task 1 (account setup) was completed by 11/12 users, Task 2 (connecting first integration) by 8/12, Task 3 (configuring initial settings) by only 5/12. Post-test interviews give conflicting explanations: some users said step 4 was confusing, others said they were fine with step 4 but got lost earlier, and two users completed Task 3 but described very different paths through the flow. You have session recording timestamps and think-aloud transcripts. Your designer believes the problem is information architecture; your engineer believes it is copy; your CEO wants to add a product tour. Write a prompt that will help an AI synthesise these sources into a research report that: identifies the actual failure points using behavioral data (not just self-reported), distinguishes between usability problems, comprehension problems, and motivation problems, produces a prioritised list of design changes with evidence for each, and explains why the product tour suggestion does or does not address the underlying issues.',
  },
  {
    key: 'prod_metrics',
    title: 'Launch Measurement Framework',
    description: 'Define a rigorous success/failure framework for a major product change',
    instruction:
      'You are launching a redesigned checkout flow that reduces steps from 7 to 4. You have three stakeholders with different success definitions: Marketing expects a 15% lift in conversion rate (based on a competitor benchmark); Engineering wants guardrail metrics to catch regressions in edge cases (mobile, international payment methods, corporate cards); Finance needs assurance that average order value and subscription upgrade rates will not drop. You also need to decide: how long to run the A/B test before declaring a winner, what to do if primary metrics improve but guardrail metrics show degradation, and what your go/no-go criteria are for a full rollout. Write a prompt that will help an AI design a complete measurement framework: define primary, secondary, and guardrail metrics with specific operationalised definitions, calculate the minimum sample size needed for statistical significance at 95% confidence, produce a decision matrix for the four possible outcome combinations (primary up/down × guardrail safe/violated), and specify the monitoring cadence and who is responsible for each metric.',
  },
  {
    key: 'prod_competitor_analysis',
    title: 'Competitive Gap Analysis',
    description: 'Determine which competitive gaps are urgent versus noise',
    instruction:
      'Two of your main competitors released significant updates last week: Competitor A launched an AI-powered data enrichment feature, Competitor B released a major redesign of their core workflow and dropped their price by 15%. You have: both companies\' public changelogs, G2 and Capterra reviews from the past 30 days (many reference the new features), 5 churned customer exit interviews from the past quarter (3 went to Competitor B), and win/loss data from your last 30 deals showing that Competitor B came up in 18 of them. You have limited engineering capacity and cannot chase every feature. Write a prompt that will help an AI produce a competitive analysis that: distinguishes between gaps that are actively affecting win/loss vs. gaps that customers mention but do not drive decisions, identifies which Competitor B changes explain the specific churn cases, determines which gaps you must close in the next 90 days vs. which you can ignore or counter with positioning, and recommends a response strategy that includes both product and go-to-market actions.',
  },
];

// ============================================================================
// ENGINEERING SCENARIOS
// ============================================================================
const ENGINEERING_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'eng_incident_debug',
    title: 'Production Incident Root Cause Investigation',
    description: 'Systematically diagnose intermittent production errors with ambiguous signals',
    instruction:
      'Your API has been throwing intermittent 503 errors affecting 4–8% of requests for 36 hours, starting approximately 2 hours after a deployment. The errors are not consistent — they occur in bursts every 90–120 minutes and then clear. You have: Datadog APM traces showing latency spikes correlating with the error bursts, PostgreSQL slow query logs showing a specific query (a join across 3 tables with a subquery) spiking from 12ms to 8,400ms during error windows, Redis cache hit rates that dropped from 94% to 71% the day before the deployment but stabilised at 71% since, and your deployment diff which includes a schema migration, two new API endpoints, and a change to how sessions are serialised. Rollback is on the table but would require downtime. Write a prompt that will help an AI build a systematic debugging plan: a prioritised hypothesis list ranked by likelihood, the specific diagnostic steps and data to gather for each hypothesis, the decision tree for deciding whether to roll back vs. fix forward, and the monitoring changes needed to detect this class of problem earlier in the future.',
  },
  {
    key: 'eng_architecture',
    title: 'Architecture Decision Record (ADR)',
    description: 'Evaluate and document competing architectural approaches for a critical system',
    instruction:
      'You need to design a notification delivery system. Requirements: handle 50,000 events per minute at peak load, support four delivery channels (email, SMS, push, webhook), guarantee at-least-once delivery with idempotency, support per-user rate limiting to prevent notification fatigue, and allow per-channel retry strategies. You are on AWS. Current constraints: your team of 4 engineers has deep Lambda experience but no Kafka experience; you have a $4,000/month infrastructure budget for this service; the system must be operational in 8 weeks; and the engineering org is moving toward event-driven architecture as a strategic direction. You have identified three candidate approaches: SNS/SQS fan-out, a managed Kafka (MSK) solution, and a custom queue built on PostgreSQL. Write a prompt that will help an AI produce a formal ADR that: defines the decision criteria with explicit weightings, evaluates all three approaches against those criteria with honest trade-offs (not just pros/cons lists), addresses the team\'s skill gap risk for each option, recommends a specific approach with implementation sequencing, and identifies the open questions that must be resolved before work begins.',
  },
  {
    key: 'eng_security_review',
    title: 'Security-Focused Code Review',
    description: 'Review a complex PR for security vulnerabilities across multiple attack vectors',
    instruction:
      'A senior engineer submitted a PR that adds a public API endpoint. The endpoint accepts a user-uploaded JSON payload (up to 500KB), passes it through a rules engine that evaluates conditional logic defined in the JSON itself, executes database queries based on the evaluation results, and writes the processed output to a PostgreSQL table accessible to other internal services. The PR is 800 lines across 12 files. The engineer is experienced but this is their first time building a public endpoint that processes arbitrary user-defined logic. You are the tech lead doing the security review. Write a prompt that will help an AI perform a thorough security analysis: identify injection vulnerabilities (SQL, JSON, code injection via the rules engine), assess authentication and authorisation gaps, evaluate input validation completeness (schema validation, size limits, type coercion), check for data exposure risks in error responses, assess rate limiting and abuse potential, and produce a structured review with severity ratings (critical/high/medium/low) and specific code-level fix recommendations — written so the engineer can implement changes without a back-and-forth conversation.',
  },
  {
    key: 'eng_tech_debt',
    title: 'Technical Debt Prioritisation Framework',
    description: 'Build a defensible plan for allocating limited tech debt capacity across competing priorities',
    instruction:
      'Your team has identified and catalogued 80 technical debt items. The categories are: (1) a legacy monolith module (15,000 lines, no tests, touched by 3 of your 5 most-shipped features) that causes 2–3 production bugs per month; (2) a PostgreSQL schema that no longer reflects domain reality — 4 workaround tables, 3 columns that are semantically overloaded — slowing feature development by an estimated 20%; (3) three microservices that share a single database, creating deployment coupling and a recurring cause of cascading failures; (4) 12 dependencies with known CVEs, two rated critical. You have 20% of sprint capacity allocated to tech debt. Your VP of Engineering wants a structured plan, not ad hoc fixes. Write a prompt that will help an AI build a prioritisation framework that: quantifies the cost of each debt category in concrete terms (developer hours lost, incident frequency, security exposure), weights items by business risk vs. developer velocity impact vs. security urgency, recommends a 6-month roadmap with specific milestones, and produces the business case to justify the 20% allocation to non-technical stakeholders.',
  },
  {
    key: 'eng_performance',
    title: 'API Performance Degradation Analysis',
    description: 'Identify and prioritise performance optimisations for a scaled-up system',
    instruction:
      'Your primary API\'s p99 response time degraded from 180ms to 1,400ms over 3 months as you scaled from 10,000 to 80,000 daily active users. p50 is still acceptable at 210ms, which has masked the problem in averages. You have: PostgreSQL EXPLAIN ANALYZE output for your 10 slowest queries (including a report query that does a full table scan on a 40M-row table), N+1 query logs from your ORM showing a specific serialiser that generates 1 query per related object, profiler output showing 60% of request time is spent in ORM serialisation (not actual database time), and cache hit rate data showing your current Redis layer is only being used for session data (not query results). Your product is a read-heavy analytics dashboard — 85% of requests are GET. Write a prompt that will help an AI produce a performance improvement plan: rank the identified bottlenecks by expected impact, recommend specific fixes for each (including index strategies, ORM optimisation patterns, and cache layer architecture), estimate the complexity and risk of each change, and define the success metrics that would confirm each fix worked.',
  },
];

// ============================================================================
// HR SCENARIOS
// ============================================================================
const HR_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'hr_performance_conversation',
    title: 'Difficult Performance Conversation Preparation',
    description: 'Prepare for a direct but empathetic underperformance conversation with a senior employee',
    instruction:
      'One of your senior engineers (5 years at the company, previously strong performer) has missed sprint commitments in 3 of the last 4 sprints, submitted two PRs in the past month with significant quality issues that were caught in code review, and two teammates have raised concerns privately about unclear communication in team planning. You have been their manager for only 4 months following a reorg. You know they relocated 6 months ago and have mentioned the transition was harder than expected. There is no formal PIP in place yet, and you are not sure if this warrants one or whether this is a situational performance dip. Write a prompt that will help an AI prepare you for the conversation: design an opening that is direct without being confrontational, craft 4–5 questions that create space for them to explain their perspective before you share yours, define what specific behavioural changes you need to see and in what timeframe, prepare for the two most likely defensive responses and how to address them, and help you decide — based on what you learn in the conversation — whether to move toward a PIP, a support plan, or a role adjustment.',
  },
  {
    key: 'hr_job_description',
    title: 'High-Signal Job Description Rewrite',
    description: 'Rewrite a job description to attract the right candidates and filter mismatches earlier',
    instruction:
      'Your current Senior Product Manager job description is generating 80% underqualified applicants, a low response rate from passive candidates at target companies, and you have made 3 failed hires in 18 months (two left within 6 months; one was let go after 9 months). You have: the actual day-to-day responsibilities broken down by time allocation, the OKRs this person will directly own in their first year, the profile of your two best-performing PMs (what made them successful), and a clear analysis of what went wrong in each failed hire. You also know the company culture: highly autonomous, fast-moving, low process, senior stakeholders who push back hard. Write a prompt that will help an AI rewrite the JD to: open with the real challenge (not a generic mission statement), describe the role in terms of outcomes and decisions — not tasks, include culture-signal language that self-selects for the right fit and deters mismatches, avoid the generic phrases (like "cross-functional collaboration" and "data-driven") that attract everyone and mean nothing, and include a "this role is not for you if" section that is honest and specific.',
  },
  {
    key: 'hr_restructuring_comms',
    title: 'Organisational Restructuring Communication',
    description: 'Communicate a sensitive reorg in a way that preserves trust and prevents attrition',
    instruction:
      'You are merging two teams: a Design team of 8 and a UX Research team of 4, into a single Experience team under a new Head of Experience role. The complexity: the current Design Lead (who has been at the company 4 years) applied for the Head of Experience role and was not selected — instead, an external candidate was hired. The current Research Lead will now report to the new Head of Experience, whom they have never worked with. Two senior designers have been informally discussing leaving the company. The merger will also change project allocation in ways some designers will see as a demotion in seniority. Write a prompt that will help an AI prepare: the all-hands announcement (honest about what is changing and why, without over-promising stability), the individual conversation frameworks for the Design Lead (not selected), the Research Lead (reporting change), and the two flight-risk designers, and the 30-60-90 day plan for the new Head of Experience to build trust with the inherited team.',
  },
  {
    key: 'hr_compensation',
    title: 'Compensation Adjustment Plan',
    description: 'Design an equitable compensation adjustment that fits a real budget constraint',
    instruction:
      'You have salary data for 45 employees across 8 roles, Radford market survey data for your metro area, and an approved budget of $280,000 for the annual compensation cycle. Analysis shows: 12 employees are more than 15% below the market median for their role and level, 3 of those are on your highest-priority retention list (including your two most senior engineers and your head of customer success), 5 employees are above the 75th percentile (not a problem but limits their room for increases), and your current salary bands have not been updated in 3 years and no longer reflect market reality. Write a prompt that will help an AI recommend a complete adjustment plan: prioritise the 12 below-market employees by retention risk and market gap, allocate the $280K budget across adjustments, one-time equity grants, and promotion-linked increases, redesign the salary bands to reflect current market data, and produce a communication guide — what to tell employees who get large increases, small increases, and no increase, ensuring each message is honest, respectful, and minimises the risk of internal equity complaints.',
  },
  {
    key: 'hr_engagement_analysis',
    title: 'Employee Engagement Decline Root Cause',
    description: 'Diagnose the interconnected drivers of a sharp engagement score drop',
    instruction:
      'Your annual engagement survey results show a 14-point drop (from 72 to 58 overall). Scores are notably low on two items: "I understand how my work connects to company goals" (31% favourable, down from 67%) and "My manager gives me useful feedback" (28% favourable, down from 54%). Additional context: voluntary turnover doubled in Q4 (from 6% to 12% annualised), you promoted 8 individual contributors to manager roles in the past year (none with prior management experience or formal training), and the company went through a strategy pivot in Q2 that was not communicated clearly beyond the executive team. You have qualitative comments from the survey, exit interview summaries from Q4 departures, and individual manager-level engagement scores (which vary significantly). Write a prompt that will help an AI produce a root cause analysis that: identifies whether this is primarily a manager quality problem, a communication/strategy problem, or a structural problem, determines which of the two low-scoring items is cause and which is symptom, recommends a 90-day action plan with specific interventions and measurable leading indicators, and distinguishes between actions that will show up in next year\'s survey vs. actions that will only show up in retention data.',
  },
];

// ============================================================================
// OPERATIONS SCENARIOS
// ============================================================================
const OPERATIONS_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'ops_bottleneck',
    title: 'Fulfilment Process Bottleneck Analysis',
    description: 'Identify and quantify where a multi-step process is losing the most time',
    instruction:
      'Your order fulfilment process takes an average of 11.3 days from order placement to delivery. Your main competitor promises 5 days. You have process maps for 6 sub-processes (order validation, inventory allocation, pick-and-pack, quality check, carrier handoff, last-mile logistics), handoff logs between teams showing wait times, rework rates for each stage, system downtime logs from your WMS and ERP, and 3 months of cycle time data per order category. The data shows high variability: some orders fulfil in 4 days, others take 18 days, and the distribution is bimodal. Leadership wants a 40% reduction in average cycle time within 2 quarters. Write a prompt that will help an AI perform a constraint analysis: identify the top 3 bottlenecks by throughput impact (not just average time), distinguish between bottlenecks caused by process design flaws vs. resource constraints vs. system limitations, quantify the cycle time reduction achievable from fixing each bottleneck, and produce a sequenced improvement roadmap that prioritises changes by impact-to-effort ratio and avoids creating new constraints downstream.',
  },
  {
    key: 'ops_vendor_selection',
    title: 'Enterprise Software Vendor Evaluation',
    description: 'Produce a rigorous, defensible vendor selection recommendation',
    instruction:
      'You are selecting a new ERP system for a 300-person operations and finance team. You have RFP responses from 4 vendors, a requirements list of 68 items with business priority scores (P1/P2/P3), 3-year total cost of ownership models from each vendor (with different assumptions that make direct comparison difficult), reference calls from 5 existing customers per vendor (mostly positive but with some concerning themes), and an internal assessment showing your team has very limited ERP implementation capacity — you can only run one major initiative at a time. Two vendors have very different strengths: Vendor A covers 91% of P1 requirements out of the box but has a complex implementation history; Vendor B covers 78% of P1 requirements but has a faster time-to-value track record. Write a prompt that will help an AI produce a structured vendor comparison: normalise the TCO models to a consistent set of assumptions, weight requirement coverage by priority tier, surface the 3 highest-risk implementation issues from the reference call themes, and produce a recommendation with a clear rationale that can be presented to the executive team and withstand scrutiny from the CFO.',
  },
  {
    key: 'ops_capacity_planning',
    title: 'Infrastructure Capacity Planning',
    description: 'Design a capacity plan that balances reliability SLAs against budget constraints',
    instruction:
      'Your SaaS platform currently runs at 78% average CPU and memory utilisation during peak hours (9am–7pm weekdays). You are launching in 3 new markets next quarter, which your growth team projects will add 35–45% incremental load. Historical data shows load spikes of 2.2–2.6x during month-end close (last 3 business days of the month) — these spikes currently cause degraded performance but not full outages. Your committed SLA to enterprise customers is 99.9% uptime. Your approved infrastructure budget increase is $180K annually. Current infrastructure is on AWS with EC2 (manually scaled), RDS (single-region, multi-AZ), and no auto-scaling in place. Write a prompt that will help an AI produce a capacity plan that: models load scenarios (baseline growth + market expansion + month-end spikes) with confidence intervals, evaluates auto-scaling vs. reserved capacity vs. spot instances for different workload types, identifies the single most fragile component in the current architecture, recommends a specific implementation sequence to stay within the $180K budget while meeting the 99.9% SLA, and defines the monitoring thresholds and runbooks needed to manage the new capacity proactively.',
  },
  {
    key: 'ops_supply_chain',
    title: 'Supply Chain Resilience Strategy',
    description: 'Evaluate supplier diversification options against cost and risk trade-offs',
    instruction:
      'Your manufacturing operation sources 60% of a critical component from a single supplier in one geographic region. Over the past 18 months you have had 3 supply disruptions averaging 23 days each, costing an estimated $1.4M in lost production and expedited logistics. You have identified 8 alternative and supplementary suppliers: 3 in the same region (lower cost, same risk profile), 4 in different regions (15–30% higher unit cost, 12–18-day longer lead times), and 1 domestic supplier (50% higher cost but 2-day lead time). You also have: minimum order quantities per supplier, quality certification requirements (only 5 of the 8 meet all certifications), your current inventory carrying cost model, and demand forecasts with confidence intervals. Write a prompt that will help an AI evaluate your diversification options: model the risk-adjusted cost of each sourcing strategy (including the cost of disruptions under each scenario), identify the minimum viable diversification that eliminates single-source risk within your budget, recommend a dual-source or multi-source configuration with specific allocation percentages, and produce a transition plan that avoids quality certification gaps during the changeover.',
  },
  {
    key: 'ops_kpi_dashboard',
    title: 'Operational KPI Framework Design',
    description: 'Define a coherent set of operational metrics that leadership will actually use',
    instruction:
      'Your COO wants a weekly operational dashboard, but the current situation is: operational data lives across Jira, Salesforce, Snowflake, Looker, and Google Sheets; four teams (Engineering, Customer Success, Operations, Finance) each use different definitions for metrics with the same names (e.g., "on-time delivery" means different things to CS vs. Operations); the current executive reporting takes 6 hours of manual work per week and is always at least 3 days stale; and past dashboard efforts have been abandoned because leaders found them either too granular or too high-level. Write a prompt that will help an AI design a KPI framework and dashboard specification: identify the 10–14 metrics that actually drive the business outcomes the COO cares about (not metrics that are easy to measure), write standardised operational definitions for each metric that resolve the cross-team disagreements, specify the data source and calculation method for each, design the dashboard layout by decision cadence (daily operational, weekly steering, monthly strategic), and define the governance process to keep definitions and data sources current as the business evolves.',
  },
];

// ============================================================================
// FINANCE SCENARIOS
// ============================================================================
const FINANCE_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'fin_budget_variance',
    title: 'Q3 Budget Variance Analysis',
    description: 'Separate structural cost overruns from one-time items and recommend Q4 action',
    instruction:
      'Q3 came in $2.1M over budget against a $14M operating plan. The main variances are: Engineering headcount ($800K over — 6 contractors converted to FTE mid-quarter for retention reasons, approved verbally but not reflected in the budget), Cloud infrastructure ($450K over — a data migration project that was supposed to run in Q4 started early, pulling forward cloud costs), Marketing ($320K over — an influencer campaign was extended after strong early results, approved by the CMO but without a budget amendment), and G&A ($530K over — includes a one-time legal settlement and office lease renegotiation costs). The board is asking for a reforecast and wants to understand what is structural vs. one-time. Write a prompt that will help an AI produce a board-ready variance analysis: classify each variance as structural, one-time, or timing (pulled-forward), quantify the annualised run-rate impact of structural items, identify which budget processes failed (approval gaps, forecasting methodology), recommend specific Q4 budget adjustments, and write the CFO narrative explaining the variances without creating alarm while being fully transparent.',
  },
  {
    key: 'fin_revenue_forecast',
    title: 'Multi-Stream Revenue Forecast Model',
    description: 'Build a 12-month revenue forecast that accounts for each stream\'s distinct dynamics',
    instruction:
      'You are the FP&A lead for a SaaS company with three revenue streams: Subscriptions (82% of revenue, 93% net revenue retention, predictable but with a mix of monthly and annual contracts), Professional Services (lump-project-based, timing is unpredictable, average project size $45K, 8-week lead time from SOW to revenue recognition), and Usage-Based Pricing (growing 9% month-over-month on average, but with high variability — standard deviation of 18% around the mean growth rate). You need a 12-month forecast with a base case, upside, and downside scenario, and your CFO specifically asked for confidence intervals — not point estimates. Previous forecasts have been off by 20%+ in months where usage-based revenue surprised. Write a prompt that will help an AI design a forecast methodology: recommend the appropriate statistical approach for each revenue stream, identify the leading indicators that should be tracked to improve usage-based predictability, specify the model structure and key assumptions, define how to construct the confidence intervals, and produce a template that a junior analyst can maintain monthly without rebuilding the model from scratch.',
  },
  {
    key: 'fin_unit_economics',
    title: 'Unit Economics Deep Dive',
    description: 'Determine whether worsening payback periods signal deteriorating economics or a strategic investment',
    instruction:
      'Your SaaS company\'s CAC increased from $2,400 to $3,800 over 6 months. In the same period, average contract value grew from $18K to $24K ARR (+33%). Gross margin is stable at 76%. Cohort data shows: customers acquired 18–24 months ago have a 24-month CAC payback period, customers acquired in the past 6 months have a 31-month payback period. However, 6-month NRR for recent cohorts is 112% vs. 104% for older cohorts. Your sales team has expanded upmarket: 60% of new logos this quarter are 200+ person companies vs. 20% a year ago. Your board is split — half think the economics are deteriorating, half think the upmarket motion is a smart investment with longer-but-better payback. Write a prompt that will help an AI produce a unit economics analysis that: isolates the impact of the upmarket mix shift from genuine CAC efficiency changes, projects LTV under different NRR assumptions for each cohort, determines the CAC payback breakeven point where the upmarket motion is accretive, and produces a clear recommendation with supporting data that the board can use to resolve the disagreement.',
  },
  {
    key: 'fin_investment_memo',
    title: 'M&A Investment Memo',
    description: 'Evaluate an acquisition opportunity across strategic, financial, and risk dimensions',
    instruction:
      'You are evaluating the acquisition of a competitor for an asking price of $4.2M. Their financials: $1.1M ARR, 84% gross margin, 38% YoY growth, negative EBITDA of -$800K (primarily due to 3 sales reps hired 4 months ago who have not yet ramped). Customer overlap with your company is 11%. Strategic rationale: their product has a capability you have been planning to build internally (12-month roadmap estimate), and acquiring their customer base would accelerate your entry into the mid-market healthcare segment you have been targeting. Risks: their two co-founders hold all key customer relationships and have not committed to staying post-acquisition, their codebase is a monolith with no test coverage, and their largest customer (28% of ARR) is on a month-to-month contract. Write a prompt that will help an AI produce a concise investment memo: a strategic rationale that is honest about risks alongside benefits, three financial return scenarios (base, upside, downside) with explicit assumptions, a risk register with mitigation options for the top 5 risks, a recommended deal structure (earn-out considerations, retention packages), and a go/no-go recommendation with the specific conditions that would change it.',
  },
  {
    key: 'fin_cost_reduction',
    title: 'Path to Cash-Flow Neutrality',
    description: 'Model cost reduction scenarios to hit a cash-flow target without destroying the business',
    instruction:
      'The board has asked for a concrete plan to reach cash-flow neutrality within 9 months. Current situation: monthly burn rate is $380K, monthly revenue is $305K and growing at approximately 5.5% MoM. At current trajectory, you hit cash-flow neutrality in month 14 — 5 months too late. You have a full P&L and headcount plan. The largest cost line items are: Salaries & Benefits ($240K/month, 63% of burn), Cloud Infrastructure ($45K/month), Sales & Marketing ($62K/month, including 4 SDRs and 1 AE), and G&A ($33K/month). You have 14 months of runway. Write a prompt that will help an AI model the cost reduction scenarios: identify the combinations of cuts that reach cash-flow neutrality by month 9 while preserving the revenue growth rate, model the revenue impact of cutting sales headcount at different timing points (cutting early saves more but may reduce revenue growth), rank the cost reduction options by their cost-per-dollar-of-monthly-burn-reduction, produce the 3 most viable plans with their specific trade-offs, and recommend which plan to present to the board with a clear rationale for why it is the best balance between speed to neutrality and long-term growth preservation.',
  },
];

// ============================================================================
// CONSULTING SCENARIOS
// ============================================================================
const CONSULTING_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'con_problem_diagnosis',
    title: 'Client Problem Diagnosis Before Solutioning',
    description: 'Build a rigorous hypothesis tree before recommending any solution',
    instruction:
      'A mid-sized retail bank has engaged you. Their presenting problem: digital onboarding conversion rate dropped from 58% to 31% over 4 months following the introduction of a new regulatory identity verification step (video selfie + document scan). Leadership\'s hypothesis is that the UX is broken. However, the data you have gathered shows something more nuanced: drop-off is highest (74%) among customers who successfully complete the identity verification step — meaning those who fail verification are not the primary source of abandonment. The pre-verification drop-off rate has not changed. The branch staff report that some customers are calling to ask "why do I have to do this again?" suggesting prior customers are being re-prompted. Write a prompt that will help an AI build a structured diagnostic framework: develop a hypothesis tree covering all plausible root causes (UX, process design, system logic, customer trust, communication), design the specific diagnostic questions and data needed to confirm or eliminate each hypothesis, identify which hypotheses the existing data already rules out, and produce a prioritised interview guide for the next client working session that will narrow to the true root cause — without jumping to solutions before the diagnosis is complete.',
  },
  {
    key: 'con_recommendations',
    title: 'Structuring and Sequencing Recommendations',
    description: 'Translate diagnostic findings into prioritised, client-ready recommendations',
    instruction:
      'After a 4-week diagnostic of a logistics company\'s declining margins (from 18% to 14% EBITDA over 2 years), you have identified three root causes with different characteristics: (1) Route optimisation that does not account for real-time fuel price volatility — responsible for approximately 6–8% margin erosion on diesel-intensive routes, addressable with a software change in 6–8 weeks; (2) A pricing model with 60+ exception rules that cannot be automated, requiring 3 FTEs for manual quote calculations and preventing dynamic pricing — responsible for approximately 7–9% margin erosion on spot pricing, requires a 4–6 month transformation; (3) Customer mix shift toward lower-margin segments over the past 18 months due to a sales team incentivised on revenue rather than margin — responsible for approximately 5–6% impact, requires a compensation restructure and 12–18 months to show results. Write a prompt that will help an AI structure a recommendation document: sequence recommendations by speed-to-value and interdependencies (not just impact size), size the effort and investment required for each initiative, produce an integrated roadmap that explains how the three initiatives interact, build the CFO-ready business case for the first initiative (the one most likely to get immediate approval), and anticipate and pre-address the 3 most likely objections from the COO who is known to resist external recommendations.',
  },
  {
    key: 'con_stakeholder_alignment',
    title: 'Stakeholder Alignment for a Contested Initiative',
    description: 'Develop a tailored engagement strategy for a divided executive committee',
    instruction:
      'You are presenting a 3-year digital transformation roadmap to a 6-person executive committee next week. The initiative requires $4.2M investment over 3 years and touches every business function. The stakeholder landscape: CEO is the sponsor (enthusiastic but needs help articulating the ROI to the board), CFO is sceptical (previously blocked a $1.8M technology investment that failed — has a "show me the math" disposition and asks uncomfortable questions publicly), COO is concerned (operational disruption during implementation is his primary worry — he manages 280 people and has a full change agenda already), CMO is supportive (sees a competitive advantage angle), CHRO is neutral (waiting to see how it affects headcount before forming a view), and CTO is cautiously supportive (has implementation concerns about integrating with legacy systems). Write a prompt that will help an AI design a pre-meeting alignment strategy: identify the minimum coalition needed before the meeting, design the individualised conversation agenda for the CFO and COO (the two blockers), produce the specific financial and risk framing that addresses each objector\'s core concern, and recommend the meeting structure and decision-making process that gives the initiative the best chance of approval — including what to do if the CFO raises the prior failed investment.',
  },
  {
    key: 'con_benchmarking',
    title: 'Like-for-Like Competitive Benchmarking',
    description: 'Produce a normalised benchmarking analysis that survives scrutiny on accounting differences',
    instruction:
      'Your client, a B2B SaaS company, wants to understand whether their 76% gross margin is competitive. The problem: you have 10 public SaaS company filings in adjacent markets, your client\'s detailed cost breakdown, and two industry benchmark reports — but the comparisons are not straightforward. Some companies capitalise R&D costs (making COGS appear lower), some include customer success in COGS (making margins appear lower than pure infrastructure-cost definitions), and some companies break out "Cost of Revenue" differently than others. Your client specifically capitalises 35% of their engineering costs, which inflates their reported gross margin. The CFO has asked you not to embarrass him in front of the board by presenting a benchmark that a sophisticated investor could immediately challenge. Write a prompt that will help an AI produce a defensible benchmarking analysis: define a normalisation methodology that creates like-for-like comparisons, apply the normalisation to all comparators and your client, identify the specific cost line items that drive the variance between your client and the median performer, distinguish between cost differences driven by business model vs. operational inefficiency, and produce both a "reported" and "adjusted" benchmark view with clear explanations of the differences.',
  },
  {
    key: 'con_implementation_risk',
    title: 'Programme Implementation Risk Assessment',
    description: 'Build a comprehensive risk register for a high-stakes, complex programme',
    instruction:
      'A global pharmaceutical company is implementing a new clinical trial management system (CTMS) across 8 countries, replacing a 15-year-old legacy system. Programme parameters: 14-month timeline, $6.2M budget, go-live date is fixed (tied to a regulatory audit). Early warning signs that concern you: the selected vendor\'s only comparable implementation ran 8 months late and 40% over budget (the client chose them anyway due to regulatory fit), two of five workstream leads have never led a technology implementation, one key market (Germany) has a regulatory submission freeze in month 9 that will require a 6-week blackout period for that team, and the clinical operations team that will use the system was not consulted in the requirements phase. Write a prompt that will help an AI produce an implementation risk register: identify and document the top 10 risks with probability and impact ratings, develop specific mitigation strategies for the top 5 risks (not generic "monitor closely" responses), design early warning indicators for each critical risk that would trigger escalation, recommend structural programme changes that could reduce overall risk profile before kickoff, and produce a go/no-go decision framework for the month-3 programme checkpoint — defining the specific criteria that would justify recommending a timeline extension to the executive sponsor.',
  },
];

// ============================================================================
// MANAGEMENT SCENARIOS
// ============================================================================
const MANAGEMENT_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'mgmt_strategic_decision',
    title: 'High-Stakes Strategic Decision Under Uncertainty',
    description: 'Structure a major strategic decision when data is incomplete and costs are high',
    instruction:
      'You are VP of Product at a 180-person SaaS company. A potential expansion opportunity has emerged: entering a new vertical (healthcare) that could add $3M ARR in 18 months. The case for: a large enterprise healthcare prospect has expressed serious interest and a partner wants to co-invest. The case against: this requires redeploying 30% of your engineering team for 6 months, your current product roadmap will slip (including 2 committed features for existing enterprise customers worth $1.2M in renewal risk), your CFO is pushing for the company to reach profitability in the next 12 months, and you have no direct healthcare market knowledge. You have limited market research (no direct customer validation from additional healthcare prospects). Write a prompt that will help an AI structure the decision: build a decision framework that explicitly separates what you know, what you can find out quickly, and what you must decide under genuine uncertainty; model the opportunity cost of the roadmap slip in financial and customer risk terms; identify the minimum validation that would make the healthcare opportunity worth the commitment; design a staged commitment approach that preserves optionality; and produce the analysis you need to bring to your CEO with a clear recommendation and the specific conditions under which you would reverse it.',
  },
  {
    key: 'mgmt_team_restructure',
    title: 'Team Performance Restructuring',
    description: 'Fix systemic team dysfunction without losing strong individual contributors',
    instruction:
      'You manage a team of 9 people who consistently perform well as individuals but miss cross-functional deliverables. Post-mortems reveal the same patterns: unclear ownership at handoff points, two senior ICs (who are your strongest technical contributors and flight risks) who each believe the other is responsible for integration work and openly express frustration with each other in team meetings, and a culture where the entire team waits for your explicit approval before making non-trivial decisions — creating a bottleneck that means you are in 14–18 meetings per week. A reorg is not on the table. You cannot lose either senior IC. You have a performance review cycle starting in 6 weeks. Write a prompt that will help an AI design a restructuring plan without a reorg: define the role clarity changes needed (RACI or equivalent) and how to implement them without a formal reorg announcement, design the individual coaching approach for each senior IC that addresses their dynamic without making either feel singled out, create a decision-making framework that moves ownership down and reduces your meeting load, and recommend how to use the performance review cycle as a structural opportunity to reset expectations and accountability — without triggering a retention crisis.',
  },
  {
    key: 'mgmt_difficult_news',
    title: 'Communicating a Strategic Pivot to Affected Team Members',
    description: 'Deliver organisational news that eliminates key employees\' work without losing them',
    instruction:
      'The board approved a strategic pivot last week: the company is sunsetting a product line (B2C) to focus exclusively on B2B. This affects 4 team members directly: two senior engineers who have spent 18 months building the B2C product (both considered your best engineers overall; both have outside options), a product manager who was hired specifically for the B2C roadmap (6 months in), and a data scientist whose primary work was B2C analytics (also has active recruiter outreach). The pivot is the right business decision and is not reversible. You have genuine alternative work for all four in the B2B business — but it is less exciting to them in the short term, involves working with a different part of the codebase, and has less product ownership initially. Write a prompt that will help an AI prepare your communication approach: design how you tell them individually (not in a group) in a way that is completely honest about what happened, acknowledges the real cost of the decision to them personally, presents the path forward in the most compelling and honest way possible, and gives each person genuine agency in their response — without being manipulative. Include how to handle the case where one of them says they want to leave.',
  },
  {
    key: 'mgmt_conflict_resolution',
    title: 'Cross-Functional Conflict Resolution',
    description: 'Resolve an active conflict between departments that threatens both a customer relationship and team retention',
    instruction:
      'Sales and Engineering are in open conflict. The immediate issue: Sales promised a key customer (a $400K annual renewal contingent on a feature) that the feature would be delivered by end of quarter — 7 weeks away. Engineering\'s scoping shows the feature requires 11–13 weeks of work. Neither party is willing to back down publicly. The deeper issue: Sales has made at least 4 timeline commitments in the past year without consulting Engineering; the Engineering lead has told you privately that two senior engineers will resign if this pattern continues; and the customer is a reference account that marketing relies on. You are the CEO. Write a prompt that will help an AI develop a resolution framework: address the immediate customer situation (what to tell them, who tells them, and what a realistic negotiated outcome looks like), design the structural fix that prevents Sales from making unauthorised commitments (without creating a bureaucratic veto that slows sales velocity), create the accountability mechanism that makes both parties feel the new process is fair, prepare the conversation you need to have with the Sales leader and the Engineering lead separately before any joint session, and produce the criteria for deciding whether this situation — if it escalates — warrants a personnel decision.',
  },
  {
    key: 'mgmt_executive_reporting',
    title: 'Quarterly Business Review Narrative',
    description: 'Frame a mixed-results quarter to the board in a way that is transparent, credible, and forward-looking',
    instruction:
      'You are presenting your Q3 results to the board next week. The context: your team missed its primary OKR (achieved 62% of target, which was a stretch goal), exceeded two secondary metrics (customer NPS up 8 points, time-to-value reduced by 31%), and had 3 significant operational incidents in the quarter — one of which became public and was covered in a tech news outlet. You also made a key strategic hire (a new VP of Engineering) and shipped a major product milestone 2 weeks ahead of schedule. One board member specifically asked in the pre-read request for "a direct account of what went wrong, not a spin job." Another board member is known for pattern-matching to prior companies where management minimised bad news and it led to larger problems. Write a prompt that will help an AI structure your QBR presentation: design the narrative arc that is genuinely honest about the miss without being self-flagellating, present the results in the context that makes the board smarter about the business (not just more comfortable with you), explain the 3 operational incidents as a pattern with a root cause — not 3 separate bad-luck events, frame the positive indicators in a way that is credible given the miss, and design the Q4 commitments section so the board leaves with confidence in your command of the situation without you having over-promised.',
  },
];

// ============================================================================
// OTHER / GENERAL SCENARIOS
// ============================================================================
const OTHER_SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'gen_document_synthesis',
    title: 'Cross-Document Synthesis with Conflicting Assumptions',
    description: 'Identify and resolve contradictions across multiple strategic planning documents',
    instruction:
      'You have 5 strategic planning documents created by different teams over 3 months: a 3-year financial model, a board strategy deck, an HR workforce plan, a technology roadmap, and a market analysis. The problem: they were created with inconsistent assumptions and no one has reconciled them. Key contradictions you have spotted: the financial model assumes 25% headcount growth in year 2, but the HR workforce plan caps growth at 15% citing physical office constraints; the technology roadmap requires 8 engineers that do not appear in the financial model\'s headcount plan; the market analysis assumes a 28% total addressable market growth rate, but the financial model uses 18%; and the strategy deck references two product initiatives that do not appear in the technology roadmap. Write a prompt that will help an AI produce a synthesis document: identify all internal contradictions systematically (not just the ones you have spotted), quantify the financial impact of each contradiction, produce a single reconciled set of planning assumptions with rationale for each decision point, flag the decisions that require executive input vs. those that can be resolved analytically, and present the synthesis in a format that can go directly to the executive team for sign-off.',
  },
  {
    key: 'gen_negotiation_prep',
    title: 'Complex Multi-Party Negotiation Preparation',
    description: 'Map interests, constraints, and trade-offs across a three-party negotiation',
    instruction:
      'You are entering a technology licensing negotiation involving three parties. Your company (the licensee) wants broad usage rights at the lowest possible cost with a perpetual licence. The IP holder wants volume-based royalties (so they benefit if your product succeeds), wants approval rights over sublicensing, and has indicated a floor price below which they will not go. A third-party distributor already has an exclusive distribution agreement with the IP holder that overlaps with 40% of your intended use cases — they have not been formally engaged but their position in the deal is ambiguous and potentially disruptive. Each party has different walk-away positions and different information about the others\' constraints. You have one negotiating session scheduled with all three parties present. Write a prompt that will help an AI prepare your negotiation strategy: map each party\'s stated interests vs. likely underlying interests, identify potential value-creating trades that do not require anyone to simply concede, design the agenda and sequencing for the three-party session that gives you the most information before you commit to positions, prepare your BATNA and the specific conditions under which you would walk away, and produce the opening position and first-move strategy that tests the IP holder\'s floor without revealing your ceiling.',
  },
  {
    key: 'gen_research_synthesis',
    title: 'Evidence-Based Recommendation from Conflicting Sources',
    description: 'Synthesise contradictory research into a recommendation calibrated to your specific context',
    instruction:
      'Your organisation is deciding whether to adopt OKRs as a goal-setting framework across all 200 employees and 8 departments. You have assembled research: 15 academic papers (mixed findings — OKRs show positive effects in product teams and software companies but neutral-to-negative effects in organisations with high process interdependence), 8 case studies from comparable companies (4 successes, 3 failures, 1 mixed), 3 consulting proposals with different recommendations and methodologies, and internal data from a 6-month OKR pilot in your product team (67% of OKRs were marked "complete" at quarter-end, but qualitative feedback from the team was split — half found it clarifying, half found it added bureaucratic overhead without changing behaviour). Write a prompt that will help an AI synthesise this evidence into a recommendation that: does not simply average the evidence but weighs it by relevance to your specific organisational context, identifies the specific conditions under which OKRs succeed vs. fail (from the research) and assesses whether your organisation meets those conditions, produces a recommendation with explicit confidence level and the assumptions it depends on, designs the minimum viable pilot to test the remaining uncertainties before full rollout, and prepares the counter-arguments you need to address if the executive team asks "why not just implement it everywhere at once?"',
  },
  {
    key: 'gen_communication_audit',
    title: 'Organisational Communication Audit',
    description: 'Identify systemic communication failures and produce specific improvement guidelines',
    instruction:
      'Your organisation sent approximately 900 external communications last quarter across email, LinkedIn outreach, and client reports. Response rates vary from 11% to 73% by team and communication type. Recent NPS verbatims include "your emails are too long and hard to understand" (from 14 separate customers), "I never know what action you want from me" (from 8), and "the report format changes every month" (from 5). You have: a sample of 80 external emails (20 per team), open and response rate data by team and communication type, the verbatim comments, and a note from your largest client\'s account manager saying their executive sponsor "has stopped reading your weekly update emails." Write a prompt that will help an AI conduct a structured communication audit: analyse the high-performing vs. low-performing communications to identify the specific patterns that drive engagement (structural, linguistic, length, and CTA patterns), identify the 3–5 systemic issues that appear across multiple teams rather than being team-specific, produce specific and actionable writing guidelines that are concrete enough for a non-writer to implement (not generic advice like "be concise"), design a template system for the communication types with the highest volume and lowest performance, and recommend a training or coaching approach that will produce measurable improvement in 90 days.',
  },
  {
    key: 'gen_change_management',
    title: 'Change Management Plan for Low-Adoption History',
    description: 'Design a change management approach that addresses the specific reasons past changes failed',
    instruction:
      'Your organisation is transitioning from annual performance reviews to a continuous feedback model, effective at the start of next quarter. The scope: 200 employees, 35 managers (most have never delivered structured continuous feedback and were trained only on the annual review process), an HR team of 4 people who will support implementation, and a new HRIS module that requires managers to log feedback in a system they currently use only for payroll. Historical context: in the past 2 years, two similar change initiatives (a new project management tool adoption and a weekly check-in process) were announced with enthusiasm and largely abandoned within 4 months. Post-mortem analysis of those failures showed: managers felt unsupported and unclear on expectations, employees could not see how the new process benefited them personally, and the HR team lacked capacity to maintain momentum after launch. Write a prompt that will help an AI design a change management plan that directly addresses these failure modes: define what success looks like at 30, 60, and 90 days with measurable leading indicators (not just adoption rates), design the manager enablement programme from the perspective of "what makes this easy for a busy manager," produce the employee communication that answers "what is in it for me" honestly, build in the support infrastructure the HR team needs to sustain momentum with limited capacity, and design the early warning system that will detect adoption failure 6 weeks in — before it becomes irreversible.',
  },
];

// ============================================================================
// LEGACY GENERIC SCENARIOS (kept for backward compatibility)
// ============================================================================
export const SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'summarization',
    title: 'Summarization',
    description: 'Summarize a document or text',
    instruction:
      'You will be given a document. Write a prompt that would help an AI assistant summarize it effectively.',
  },
  {
    key: 'email_drafting',
    title: 'Email Drafting',
    description: 'Draft a professional email',
    instruction:
      'You need to write a professional email. Write a prompt that would help an AI assistant draft it for you.',
  },
  {
    key: 'action_list',
    title: 'Action List Extraction',
    description: 'Extract action items from meeting notes',
    instruction:
      'You have meeting notes and need to extract action items. Write a prompt that would help an AI assistant identify and list them.',
  },
  {
    key: 'comparison',
    title: 'Comparison Analysis',
    description: 'Compare two options or alternatives',
    instruction:
      'You need to compare two options. Write a prompt that would help an AI assistant create a useful comparison.',
  },
  {
    key: 'text_improvement',
    title: 'Text Improvement',
    description: 'Improve or rewrite existing text',
    instruction:
      'You have text that needs improvement. Write a prompt that would help an AI assistant enhance it.',
  },
] as const;

// ============================================================================
// SCENARIOS BY DOMAIN
// ============================================================================
export const SCENARIOS_BY_DOMAIN: Record<CampaignDomain, ScenarioDefinition[]> = {
  marketing: MARKETING_SCENARIOS,
  sales: SALES_SCENARIOS,
  support: SUPPORT_SCENARIOS,
  product: PRODUCT_SCENARIOS,
  engineering: ENGINEERING_SCENARIOS,
  hr: HR_SCENARIOS,
  operations: OPERATIONS_SCENARIOS,
  finance: FINANCE_SCENARIOS,
  consulting: CONSULTING_SCENARIOS,
  management: MANAGEMENT_SCENARIOS,
  other: OTHER_SCENARIOS,
};

export const DOMAIN_LABELS: Record<CampaignDomain, string> = {
  marketing: 'Marketing',
  sales: 'Sales',
  support: 'Support',
  product: 'Product',
  engineering: 'Engineering',
  hr: 'HR',
  operations: 'Operations',
  finance: 'Finance',
  consulting: 'Consulting',
  management: 'Management',
  other: 'Other',
};

// ============================================================================
// RUBRIC CRITERIA
// ============================================================================
export interface RubricCriterionDefinition {
  key: RubricCriterion;
  label: string;
  description: string;
  weight: number;
}

export const RUBRIC_CRITERIA: RubricCriterionDefinition[] = [
  {
    key: 'clarity',
    label: 'Clarity',
    description: 'The prompt clearly communicates what is needed',
    weight: 1,
  },
  {
    key: 'context',
    label: 'Context',
    description: 'The prompt provides relevant background information',
    weight: 1,
  },
  {
    key: 'constraints',
    label: 'Constraints',
    description: 'The prompt specifies limitations, requirements, or boundaries',
    weight: 1,
  },
  {
    key: 'output_format',
    label: 'Output Format',
    description: 'The prompt defines the expected format or structure of the response',
    weight: 1,
  },
  {
    key: 'verification',
    label: 'Verification',
    description: 'The prompt includes ways to verify or validate the output',
    weight: 1,
  },
] as const;

// ============================================================================
// SCORE BANDS
// ============================================================================
export interface ScoreBandDefinition {
  key: ScoreBand;
  label: string;
  minPercentage: number;
  maxPercentage: number;
  description: string;
}

export const SCORE_BANDS: ScoreBandDefinition[] = [
  {
    key: 'at_risk',
    label: 'At Risk',
    minPercentage: 0,
    maxPercentage: 19,
    description: 'Needs significant improvement in prompt writing',
  },
  {
    key: 'basic',
    label: 'Basic',
    minPercentage: 20,
    maxPercentage: 39,
    description: 'Just starting with AI prompt writing',
  },
  {
    key: 'functional',
    label: 'Functional',
    minPercentage: 40,
    maxPercentage: 59,
    description: 'Building foundational prompt skills',
  },
  {
    key: 'strong',
    label: 'Strong',
    minPercentage: 60,
    maxPercentage: 79,
    description: 'Competent at writing effective prompts',
  },
  {
    key: 'expert',
    label: 'Expert',
    minPercentage: 80,
    maxPercentage: 100,
    description: 'Expert-level prompt engineering skills',
  },
] as const;

export function getScoreBand(percentage: number): ScoreBandDefinition {
  const band = SCORE_BANDS.find(
    (b) => percentage >= b.minPercentage && percentage <= b.maxPercentage
  );
  return band ?? SCORE_BANDS[0];
}

export function getScenario(key: ScenarioKey): ScenarioDefinition | undefined {
  for (const scenarios of Object.values(SCENARIOS_BY_DOMAIN)) {
    const found = scenarios.find((s) => s.key === key);
    if (found) return found;
  }
  return SCENARIOS.find((s) => s.key === key);
}

export function getCriterion(key: RubricCriterion): RubricCriterionDefinition | undefined {
  return RUBRIC_CRITERIA.find((c) => c.key === key);
}

export const SCORE_MIN = 1;
export const SCORE_MAX = 4;
export const SCENARIOS_COUNT = 5;
export const CRITERIA_COUNT = RUBRIC_CRITERIA.length;
export const MAX_TOTAL_SCORE = SCENARIOS_COUNT * CRITERIA_COUNT * SCORE_MAX;
