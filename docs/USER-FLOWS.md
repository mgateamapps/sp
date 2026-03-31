# ScorePrompt User Flows

This document describes the application from the perspective of its two main user types: **Admins** and **Employees**.

---

## Admin Flows

Admins are company representatives who manage AI literacy assessments for their organization.

### 1. Registration & Onboarding

**Goal**: Create an admin account, organization, and select a plan.

```
┌─────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Navigate to /auth/register                              │
│                                                             │
│  2. Fill registration form:                                 │
│     • Full Name (required)                                  │
│     • Organization Name (required)                          │
│     • Email (required)                                      │
│     • Password (required)                                   │
│     • Accept Terms (required)                               │
│                                                             │
│  3. Submit form                                             │
│                                                             │
│  4. System automatically creates:                           │
│     • Supabase auth user                                    │
│     • Organization record                                   │
│     • Admin profile (role: owner)                           │
│                                                             │
│  5. Receive email verification link                         │
│                                                             │
│  6. Click link → Redirect to /onboarding/choose-plan        │
│                                                             │
│  7. Choose a plan:                                          │
│     • Free Test (test yourself)                             │
│     • Pay Per Campaign (pay as you go)                      │
│     • Annual Plan (25% savings, 4 campaigns)                │
│                                                             │
│  8. If Annual selected:                                     │
│     • Enter estimated employee count                        │
│     • See calculated price                                  │
│     • Proceed to Stripe Checkout                            │
│     • Complete payment                                      │
│                                                             │
│  9. Access admin dashboard at /dashboard                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What the admin sees**:
- Clean registration form with organization name field
- Choose Plan page with 3 options
- Annual plan shows live price calculation
- Dashboard with campaign overview after completion

---

### 2. Login

**Goal**: Access the admin dashboard.

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Navigate to /auth/login                                 │
│                                                             │
│  2. Enter email and password                                │
│                                                             │
│  3. Submit                                                  │
│                                                             │
│  4. If valid → Redirect to /dashboard                       │
│     If invalid → Show error message                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Protected routes**:
- All `/dashboard/*` routes require authentication
- Unauthenticated users are redirected to `/auth/login`

---

### 3. Creating a Campaign

**Goal**: Set up a new assessment campaign and add employees.

```
┌─────────────────────────────────────────────────────────────┐
│                  CREATE CAMPAIGN FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. From dashboard, click "New Campaign"                    │
│     or navigate to /dashboard/campaigns/new                 │
│                                                             │
│  2. Fill campaign form:                                     │
│     • Campaign Name (required)                              │
│       Example: "Q1 2024 AI Skills Assessment"               │
│     • Description (optional)                                │
│       Example: "Baseline assessment for engineering team"   │
│     • Deadline (optional)                                   │
│       Example: March 31, 2024                               │
│     • Employee Emails (required)                            │
│       Enter one email per line:                             │
│       john@company.com                                      │
│       jane@company.com                                      │
│       bob@company.com                                       │
│                                                             │
│  3. Click "Create Campaign"                                 │
│                                                             │
│  4. System:                                                 │
│     • Creates campaign (status: draft)                      │
│     • Creates/finds employee records                        │
│     • Creates participant records                           │
│                                                             │
│  5. Redirect to campaign detail page                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What the admin sees**:
- Simple form with textarea for bulk email entry
- Success toast notification
- Campaign detail page with participant list

---

### 4. Sending Invites (with Payment)

**Goal**: Pay for and send assessment invites to employees.

```
┌─────────────────────────────────────────────────────────────┐
│                   SEND INVITES FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. From campaign detail page (/dashboard/campaigns/[id])   │
│                                                             │
│  2. See "Pay & Send Invites" button with pending count      │
│     Example: "Pay & Send Invites (3 pending)"               │
│                                                             │
│  3. Click button → Payment dialog opens                     │
│                                                             │
│  4. Dialog shows:                                           │
│     ┌───────────────────────────────────────────────┐       │
│     │ Confirm Payment                               │       │
│     │                                               │       │
│     │ 3 employees × $2.00 = $6.00                   │       │
│     │                                               │       │
│     │ [Cancel]              [Pay & Send Invites]    │       │
│     └───────────────────────────────────────────────┘       │
│                                                             │
│  5. If user has annual subscription with credits:           │
│     ┌───────────────────────────────────────────────┐       │
│     │ Use Subscription Credit                       │       │
│     │                                               │       │
│     │ You have 3 campaigns remaining                │       │
│     │ This campaign will be free!                   │       │
│     │                                               │       │
│     │ [Cancel]           [Use Subscription]         │       │
│     └───────────────────────────────────────────────┘       │
│                                                             │
│  6. Click "Pay & Send" → Stripe Checkout                    │
│     (or "Use Subscription" if has credits)                  │
│                                                             │
│  7. Complete payment (if applicable)                        │
│                                                             │
│  8. System:                                                 │
│     • Creates payment record                                │
│     • Generates secure tokens for each participant          │
│     • Stores token hashes in database                       │
│     • Sends personalized email via Resend                   │
│     • Updates campaign status to "active"                   │
│                                                             │
│  9. See success toast: "Payment successful! Sent 3 invites" │
│                                                             │
│  10. Button updates to "Send Invites (0 pending)"           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Pricing**:
| Employees | Rate |
|-----------|------|
| 1-50 | $2.00/employee |
| 51+ | $1.50/employee |

**Email received by employee**:
```
Subject: You're invited to complete an AI literacy assessment

Hi,

You've been invited to complete an AI literacy assessment 
for [Campaign Name].

Click here to start: [Secure Link]

This assessment takes approximately 15-20 minutes.

Best regards,
ScorePrompt
```

---

### 5. Monitoring Campaign Progress

**Goal**: Track who has completed assessments.

```
┌─────────────────────────────────────────────────────────────┐
│                CAMPAIGN MONITORING                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Campaign Detail Page shows:                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Stats Cards                                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Invited: 10  │ Opened: 7  │ Completed: 5  │ Rate: 50%│   │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Participants Table                                  │    │
│  ├──────────────────┬────────┬───────┬─────────────────┤    │
│  │ Email            │ Status │ Score │ Actions         │    │
│  ├──────────────────┼────────┼───────┼─────────────────┤    │
│  │ john@company.com │completed│  75  │ [View]          │    │
│  │ jane@company.com │completed│  82  │ [View]          │    │
│  │ bob@company.com  │ started │  —   │ [View] disabled │    │
│  │ alice@company.com│ opened  │  —   │ [View] disabled │    │
│  │ tom@company.com  │ invited │  —   │ [View] disabled │    │
│  └──────────────────┴────────┴───────┴─────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Status meanings**:
| Status | Meaning |
|--------|---------|
| invited | Email sent, not yet opened |
| opened | Link clicked, viewing welcome page |
| started | Assessment in progress |
| completed | Assessment submitted and scored |

---

### 6. Viewing Employee Results

**Goal**: Review an individual employee's assessment results.

```
┌─────────────────────────────────────────────────────────────┐
│              VIEW EMPLOYEE RESULTS FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. From campaign detail page, click "View" on a            │
│     completed participant                                   │
│                                                             │
│  2. Navigate to /dashboard/campaigns/[id]/employees/[pid]   │
│                                                             │
│  3. See comprehensive results:                              │
│                                                             │
│     Employee Header:                                        │
│     • Email: john@company.com                               │
│     • Completed: Mar 15, 2024 at 2:30 PM                    │
│                                                             │
│     Overall Score Card:                                     │
│     • Total Score: 75/100                                   │
│     • Band: Proficient                                      │
│     • Criterion breakdown bars                              │
│                                                             │
│     Strengths & Weaknesses:                                 │
│     • Clear task communication                              │
│     • Good use of constraints                               │
│     • Could improve verification criteria                   │
│                                                             │
│     Scenario Breakdown (5 scenarios):                       │
│     For each scenario:                                      │
│     • Employee's actual prompt                              │
│     • Individual criterion scores                           │
│     • Strengths/weaknesses for that scenario                │
│     • Example of improved prompt                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Why this is useful**:
- Identify specific skill gaps
- Provide targeted coaching
- Compare performance across team members

---

### 7. Billing & Subscription Management

**Goal**: View payment history and manage subscription.

```
┌─────────────────────────────────────────────────────────────┐
│                    BILLING PAGE                             │
│                  /dashboard/billing                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Summary Cards:                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ Total Spent │ │ Total       │ │ Employees   │            │
│  │   $486.00   │ │ Refunded    │ │ Assessed    │            │
│  │             │ │   $24.00    │ │    243      │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│  If has active subscription:                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Your Subscription: Team Annual                      │    │
│  │                                                     │    │
│  │ Status: Active                                      │    │
│  │ Renews: December 15, 2024                          │    │
│  │                                                     │    │
│  │ Campaign Usage: 2/4 campaigns used                  │    │
│  │ [████████░░░░░░░░] 50%                              │    │
│  │                                                     │    │
│  │ [Cancel subscription]                               │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  If no subscription:                                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 💡 Save 25% with an annual plan                     │    │
│  │    Get 4 campaigns per year (pay for 3!)            │    │
│  │    [View Annual Plans]                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Payment History:                                           │
│  ┌──────────────┬──────────────┬──────┬─────────────────┐   │
│  │ Date         │ Campaign     │Amount│ Status          │   │
│  ├──────────────┼──────────────┼──────┼─────────────────┤   │
│  │ Mar 15, 2024 │ Q1 Assessment│$60.00│ Completed       │   │
│  │ Mar 10, 2024 │ Test Run     │  —   │ Subscription    │   │
│  │ Feb 28, 2024 │ Pilot        │$20.00│ Partial Refund  │   │
│  └──────────────┴──────────────┴──────┴─────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Requesting Refunds

**Goal**: Get refund for employees who haven't started.

```
┌─────────────────────────────────────────────────────────────┐
│                    REFUND FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Go to campaign detail page                              │
│                                                             │
│  2. If campaign is paid and some employees haven't started: │
│     See "Request Refund" button                             │
│                                                             │
│  3. Click button → Confirmation dialog:                     │
│     ┌───────────────────────────────────────────────┐       │
│     │ Request Partial Refund                        │       │
│     │                                               │       │
│     │ 5 of 10 employees haven't started yet.        │       │
│     │ Eligible refund: $10.00                       │       │
│     │                                               │       │
│     │ Note: This will remove these employees        │       │
│     │ from the campaign.                            │       │
│     │                                               │       │
│     │ [Cancel]                   [Request Refund]   │       │
│     └───────────────────────────────────────────────┘       │
│                                                             │
│  4. Refund processed via Stripe                             │
│                                                             │
│  5. See success toast: "Refund of $10.00 processed"         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Refund eligibility**:
- Only for employees who haven't started (status: invited or opened)
- Uses same pricing tiers as original charge
- Employees are removed from campaign after refund

---

### 9. Logging Out

```
┌─────────────────────────────────────────────────────────────┐
│                     LOGOUT FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Click profile dropdown in header                        │
│                                                             │
│  2. Click "Logout"                                          │
│                                                             │
│  3. Session is cleared                                      │
│                                                             │
│  4. Redirect to /auth/login                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Employee Flows

Employees are the people being assessed. They do NOT have accounts—they access the system via secure token links.

### 1. Receiving the Invite

**Goal**: Access the assessment.

```
┌─────────────────────────────────────────────────────────────┐
│                   INVITE EMAIL FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Receive email with invite link                          │
│     Link format: https://app.com/invite/[secure-token]      │
│                                                             │
│  2. Click link                                              │
│                                                             │
│  3. Server validates token (employee never sees this)       │
│                                                             │
│  4. If valid → See welcome page                             │
│     If invalid → See "Invalid or expired link" page         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Important**: 
- No login required
- Token is the only authentication
- Same link works for resuming incomplete assessments

---

### 2. Welcome Page

**Goal**: Understand what to expect before starting.

```
┌─────────────────────────────────────────────────────────────┐
│                    WELCOME PAGE                             │
│                /invite/[token]                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      [Trophy Icon]                          │
│                                                             │
│                       Welcome!                              │
│     You've been invited to complete an AI literacy          │
│                      assessment.                            │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │ Q1 2024 AI Skills Assessment                    │     │
│     │ Baseline assessment for engineering team        │     │
│     │ Deadline: March 31, 2024                        │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     What to expect:                                         │
│     • The assessment takes approximately 15-20 minutes      │
│     • You'll complete 5 AI prompting scenarios              │
│     • Answer thoughtfully - there are no trick questions    │
│     • You'll receive personalized feedback upon completion  │
│                                                             │
│                  [Start Assessment]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. Taking the Assessment

**Goal**: Complete 5 prompt-writing scenarios.

```
┌─────────────────────────────────────────────────────────────┐
│                  ASSESSMENT FLOW                            │
│             /invite/[token]/assessment                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scenario 1 of 5                           [●○○○○] 20%      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Summarization                                       │    │
│  │ Summarize a document or text                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Your task:                                                 │
│  You will be given a document. Write a prompt that would    │
│  help an AI assistant summarize it effectively.             │
│                                                             │
│  Your prompt:                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │ Please summarize the following document in 3-5      │    │
│  │ bullet points. Focus on the main ideas and key      │    │
│  │ takeaways. Keep each point concise.                 │    │
│  │                                                     │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│  156 characters                                             │
│                                                             │
│  [Previous]                              [Next →]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**The 5 Scenarios**:

| # | Scenario | Task |
|---|----------|------|
| 1 | Summarization | Write a prompt to summarize a document |
| 2 | Email Drafting | Write a prompt to draft a professional email |
| 3 | Action List Extraction | Write a prompt to extract action items from meeting notes |
| 4 | Comparison Analysis | Write a prompt to compare two options |
| 5 | Text Improvement | Write a prompt to improve existing text |

**Features**:
- Progress indicator shows completion
- Responses auto-save when clicking "Next"
- Can navigate back to previous scenarios
- Can return later with same link (progress saved)

---

### 4. Submitting the Assessment

**Goal**: Complete and submit for scoring.

```
┌─────────────────────────────────────────────────────────────┐
│                   SUBMISSION FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  On last scenario (5 of 5):                                 │
│                                                             │
│  • "Next" button changes to "Submit Assessment"             │
│  • Button disabled until all 5 scenarios have responses     │
│                                                             │
│  1. Employee clicks "Submit Assessment"                     │
│                                                             │
│  2. System validates all scenarios have responses           │
│                                                             │
│  3. If valid:                                               │
│     • Mark attempt as "submitted"                           │
│     • Mark participant as "completed"                       │
│     • Redirect to processing page                           │
│                                                             │
│  4. If missing responses:                                   │
│     • Show error: "Missing responses for: [scenario]"       │
│     • Stay on assessment page                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Processing Page

**Goal**: Wait while assessment is scored.

```
┌─────────────────────────────────────────────────────────────┐
│                   PROCESSING PAGE                           │
│              /invite/[token]/processing                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [Spinner Animation]                      │
│                                                             │
│              Processing Your Assessment                     │
│                                                             │
│     Please wait while we analyze your responses...          │
│                                                             │
│     Analyzing responses...                                  │
│     Generating feedback...                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens behind the scenes**:
1. Server detects `status = submitted`
2. Server runs scoring algorithm
3. Scores are saved to database
4. Attempt status updated to `scored`
5. Automatic redirect to feedback page

**Timing**: Currently instant with mock scoring. With real AI, ~2-5 seconds.

---

### 6. Viewing Feedback

**Goal**: See assessment results and learn how to improve.

```
┌─────────────────────────────────────────────────────────────┐
│                    FEEDBACK PAGE                            │
│               /invite/[token]/feedback                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      [Trophy Icon]                          │
│                                                             │
│              Your Assessment Results                        │
│              Q1 2024 AI Skills Assessment                   │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │                                                 │     │
│     │                     75                          │     │
│     │                  out of 100                     │     │
│     │                                                 │     │
│     │                [Proficient]                     │     │
│     │     Competent at writing effective prompts      │     │
│     │                                                 │     │
│     │  Clarity      ████████████░░░░  72%            │     │
│     │  Context      ██████████░░░░░░  65%            │     │
│     │  Constraints  █████████████░░░  78%            │     │
│     │  Format       ███████████████░  85%            │     │
│     │  Verification █████████░░░░░░░  58%            │     │
│     │                                                 │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     Overall Feedback:                                       │
│     Good job! You scored 75/100, showing proficient         │
│     prompt writing abilities. Focus on adding more          │
│     specific constraints and verification criteria.         │
│                                                             │
│     ┌────────────────────┐  ┌────────────────────┐          │
│     │ ✓ Strengths        │  │ ↑ Areas to Improve │          │
│     │ • Clear tasks      │  │ • Add verification │          │
│     │ • Good constraints │  │ • More context     │          │
│     └────────────────────┘  └────────────────────┘          │
│                                                             │
│     Coaching Tips:                                          │
│     1. Include criteria for how to verify output quality    │
│     2. Add relevant background information                  │
│                                                             │
│     ─────────────────────────────────────────────           │
│                                                             │
│     Scenario Breakdown                                      │
│                                                             │
│     ┌─────────────────────────────────────────────────┐     │
│     │ Summarization                           78/100  │     │
│     │─────────────────────────────────────────────────│     │
│     │ Your Prompt:                                    │     │
│     │ "Please summarize the document in 3-5 points.   │     │
│     │  Focus on main ideas and key takeaways."        │     │
│     │                                                 │     │
│     │ Clarity: 16/20  Context: 12/20  ...            │     │
│     │                                                 │     │
│     │ ✓ Clear and direct communication                │     │
│     │ ↑ Missing verification criteria                 │     │
│     │                                                 │     │
│     │ 💡 Improved Prompt Example:                     │     │
│     │ "Please summarize the following document in     │     │
│     │  3-5 bullet points. Focus on the main ideas    │     │
│     │  and key takeaways. Keep each point concise    │     │
│     │  (1-2 sentences). Ensure the summary captures  │     │
│     │  the document's purpose and conclusions."      │     │
│     └─────────────────────────────────────────────────┘     │
│                                                             │
│     [Similar cards for remaining 4 scenarios]               │
│                                                             │
│              Thank you for completing the assessment!       │
│                      Powered by ScorePrompt                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Score Bands**:

| Band | Score Range | Description |
|------|-------------|-------------|
| At Risk | 0-19 | Needs significant improvement in prompt writing |
| Basic | 20-39 | Just starting with AI prompt writing |
| Functional | 40-59 | Building foundational prompt skills |
| Strong | 60-79 | Competent at writing effective prompts |
| Expert | 80-100 | Expert-level prompt engineering skills |

---

### 7. Returning to Assessment

**Goal**: Resume an incomplete assessment.

```
┌─────────────────────────────────────────────────────────────┐
│                    RESUME FLOW                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Employee clicks original invite link again                 │
│                                                             │
│  System checks participant/attempt status:                  │
│                                                             │
│  If status = invited/opened:                                │
│  → Show welcome page                                        │
│                                                             │
│  If status = started, attempt = in_progress:                │
│  → Load assessment with saved responses                     │
│  → Can continue where they left off                         │
│                                                             │
│  If status = completed, attempt = scored:                   │
│  → Redirect directly to feedback page                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key point**: Progress is saved automatically. Employees can close browser and return later.

---

## Error States

### Invalid Token

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      [Warning Icon]                         │
│                                                             │
│                    Invalid Link                             │
│                                                             │
│     This assessment link is invalid or has expired.         │
│     Please contact your administrator for assistance.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scoring Failed

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      [Error Icon]                           │
│                                                             │
│                   Processing Error                          │
│                                                             │
│     There was an issue processing your assessment.          │
│     Please contact your administrator for assistance.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: Admin vs Employee Comparison

| Aspect | Admin | Employee |
|--------|-------|----------|
| Authentication | Email + Password | Token link only |
| Account required | Yes | No |
| Main actions | Create campaigns, pay, send invites, view results, manage billing | Take assessment, view own feedback |
| Data access | All employees in organization | Own results only |
| Routes | /dashboard/* (protected) | /invite/[token]/* (token-validated) |
| Session persistence | Cookie-based | Token-based |
| Payment | Stripe (one-time or subscription) | None |
