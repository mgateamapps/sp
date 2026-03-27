# ScorePrompt Technical Documentation

## Overview

ScorePrompt is a B2B SaaS platform for assessing employee AI literacy through prompt writing exercises. The system evaluates how effectively employees can communicate with AI assistants.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui components |
| Backend | Next.js Server Components & Server Actions |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Email | Resend |
| Scoring | Mock scorer (replaceable with OpenAI) |

---

## Architecture

### Directory Structure

```
sp/
├── app/                    # Next.js App Router pages
│   ├── app/               # Admin dashboard (protected)
│   │   ├── campaigns/     # Campaign management
│   │   └── ...
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   └── invite/            # Employee-facing (public, token-based)
│       └── [token]/
│           ├── assessment/
│           ├── processing/
│           └── feedback/
├── components/            # Reusable UI components
├── lib/                   # Business logic
│   ├── actions/          # Server Actions (mutations)
│   ├── queries/          # Data fetching functions
│   ├── scoring/          # Scoring module
│   ├── email/            # Email service
│   ├── supabase/         # Supabase clients
│   └── constants/        # Application constants
├── types/                 # TypeScript type definitions
└── supabase/
    └── migrations/       # SQL migration files
```

### Design Principles

1. **Server-first**: Heavy use of Server Components for data fetching
2. **Clean separation**: Server Actions for mutations, queries for reads
3. **Type safety**: Strict TypeScript throughout
4. **Security by default**: RLS policies, server-side token validation
5. **Replaceability**: Modular scoring system ready for AI integration

---

## Database Schema

### Entity Relationship

```
organizations (1) ──────< (N) admin_profiles
      │
      │ (1)
      ▼
     (N)
  campaigns ───────────< (N) campaign_participants >────────── employees
      │                           │
      │                           │ (1)
      │                           ▼
      │                          (1)
      │                   assessment_attempts
      │                           │
      │                           │ (1)
      │               ┌───────────┴───────────┐
      │               ▼                       ▼
      │         (N) assessment_responses  (1) assessment_scores
      │               │
      │               │
      │               ▼
      │         (N) scenario_scores
```

### Tables

#### `organizations`
Represents a company using ScorePrompt.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Organization name |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

#### `admin_profiles`
Links Supabase auth users to organizations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users |
| organization_id | UUID | FK to organizations |
| full_name | TEXT | Admin's name |
| email | TEXT | Admin's email |
| role | TEXT | owner/admin/member |

**Why this design**: Separates auth (Supabase handles) from business data. Allows multiple admins per organization with different roles.

#### `employees`
People being assessed (no login required).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| email | TEXT | Employee email |
| full_name | TEXT | Optional name |

**Constraint**: `UNIQUE(organization_id, email)` - prevents duplicate employees per org.

#### `campaigns`
Assessment campaigns created by admins.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organizations |
| name | TEXT | Campaign name |
| description | TEXT | Optional description |
| status | TEXT | draft/active/closed |
| deadline | TIMESTAMPTZ | Optional deadline |

#### `campaign_participants`
Links employees to campaigns with secure tokens.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_id | UUID | FK to campaigns |
| employee_id | UUID | FK to employees |
| token_hash | TEXT | SHA256 hash of invite token |
| status | TEXT | invited/opened/started/completed |
| invited_at | TIMESTAMPTZ | When invite was sent |
| opened_at | TIMESTAMPTZ | When link was first opened |
| started_at | TIMESTAMPTZ | When assessment started |
| completed_at | TIMESTAMPTZ | When assessment finished |

**Why token_hash**: Raw tokens are only in email links. We store hashes to prevent token exposure if database is compromised.

#### `assessment_attempts`
One attempt per participant.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_participant_id | UUID | FK to participants |
| status | TEXT | in_progress/submitted/scored/failed |
| submitted_at | TIMESTAMPTZ | When employee submitted |
| scored_at | TIMESTAMPTZ | When scoring completed |

**Constraint**: `UNIQUE(campaign_participant_id)` - enforces one attempt per participant.

#### `assessment_responses`
Employee responses to each scenario.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| attempt_id | UUID | FK to attempts |
| scenario_key | TEXT | summarization/email_drafting/etc. |
| response_text | TEXT | Employee's prompt |

**Constraint**: `UNIQUE(attempt_id, scenario_key)` - one response per scenario.

#### `scenario_scores`
Per-scenario scoring results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| attempt_id | UUID | FK to attempts |
| scenario_key | TEXT | Which scenario |
| clarity_score | INT | 0-20 |
| context_score | INT | 0-20 |
| constraints_score | INT | 0-20 |
| output_format_score | INT | 0-20 |
| verification_score | INT | 0-20 |
| scenario_score | INT | 0-100 (sum of above) |
| strengths_json | JSONB | Array of strength strings |
| weaknesses_json | JSONB | Array of weakness strings |
| coaching_tips_json | JSONB | Array of tip strings |
| improved_prompt | TEXT | Example better prompt |
| summary_feedback | TEXT | Narrative feedback |
| rubric_version | TEXT | Version tracking |

#### `assessment_scores`
Overall assessment results.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| attempt_id | UUID | FK to attempts |
| clarity_score | INT | 0-100 (averaged) |
| context_score | INT | 0-100 |
| constraints_score | INT | 0-100 |
| output_format_score | INT | 0-100 |
| verification_score | INT | 0-100 |
| total_score | INT | 0-100 |
| score_band | TEXT | novice/developing/proficient/advanced |
| strengths_json | JSONB | Top strengths |
| weaknesses_json | JSONB | Top weaknesses |
| coaching_tips_json | JSONB | Top tips |
| summary_feedback | TEXT | Overall narrative |
| rubric_version | TEXT | Version tracking |

---

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:

1. **Admins see only their organization's data**
   ```sql
   organization_id IN (
     SELECT organization_id FROM admin_profiles 
     WHERE user_id = auth.uid()
   )
   ```

2. **No public employee access to tables**
   - Employees don't have Supabase auth accounts
   - All employee operations go through server-side token validation

### Token-Based Employee Access

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Generate   │     │   Hash &    │     │   Send in   │
│ Raw Token   │────▶│   Store     │────▶│   Email     │
│ (32 bytes)  │     │ (SHA256)    │     │   Link      │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │  Database stores only   │
              │     token_hash          │
              └─────────────────────────┘
```

**Validation Flow**:
1. Employee clicks link with raw token
2. Server hashes the token
3. Server queries `campaign_participants` by `token_hash`
4. If found, employee can proceed

**Why this approach**:
- Tokens never stored in plaintext
- If DB is compromised, tokens can't be reconstructed
- Server-side validation prevents browser access to participant table

---

## Scoring System

### Architecture

```
lib/scoring/
├── types.ts        # Interfaces (ScoringInput, ScoringOutput)
├── mock-scorer.ts  # MockScorer implements Scorer
└── index.ts        # scoreAttempt() public API
```

### Scorer Interface

```typescript
interface Scorer {
  score(input: ScoringInput): Promise<ScoringOutput>;
}
```

**Why interface**: Easy to swap MockScorer with OpenAIScorer later without changing calling code.

### Mock Scoring Algorithm

Deterministic scoring based on text analysis:

#### Per-Criterion Score (0-20)

```typescript
score = min(signalScore + lengthScore, 20)
```

**Signal Score (0-12)**:
Count matching keywords and multiply by 3.

| Criterion | Sample Keywords |
|-----------|-----------------|
| Clarity | "please", "create", "write", "generate" |
| Context | "background", "because", "given that" |
| Constraints | "must", "limit", "maximum", "avoid" |
| Output Format | "format", "list", "table", "step by step" |
| Verification | "verify", "check", "ensure", "quality" |

**Length Score (0-8)**:
Based on response length:
- <20 chars: 1.6
- <50 chars: 3.2
- <100 chars: 4.8
- <200 chars: 6.4
- ≥200 chars: 8.0

#### Scenario Score (0-100)
Sum of 5 criterion scores.

#### Total Score (0-100)
Average of normalized criterion scores across all scenarios.

### Idempotency

`scoreAttempt()` is safe to call multiple times:

```typescript
async function scoreAttempt(attemptId: string) {
  // 1. Check if already scored
  if (attempt.status === 'scored') {
    return { success: true, already_scored: true };
  }
  
  // 2. Check if scores exist (race condition protection)
  if (existingScore) {
    // Just update status
    return { success: true, already_scored: true };
  }
  
  // 3. Use upsert for score inserts
  await supabase.from('scenario_scores').upsert(
    { ... },
    { onConflict: 'attempt_id,scenario_key' }
  );
}
```

---

## Email System

### Resend Integration

```typescript
// lib/email/resend.ts
export async function sendInviteEmail(params: {
  to: string;
  campaignName: string;
  inviteUrl: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({ ... });
}
```

**Why Resend**: Simple API, good deliverability, no complex setup.

### Invite Flow

1. Admin clicks "Send Invites"
2. Server generates raw tokens for uninvited participants
3. Server hashes and stores `token_hash`
4. Server sends emails via Resend with raw token in URL
5. Campaign status updated to `active` if it was `draft`

---

## Route Protection

### Admin Routes (`/app/*`)

Protected via middleware + Server Component checks:

```typescript
// In page.tsx
const admin = await getCurrentAdminProfile();
if (!admin) {
  redirect('/auth/login');
}
```

### Employee Routes (`/invite/*`)

Token validation in each page:

```typescript
const participant = await validateInviteToken(token);
if (!participant) {
  redirect('/invite/invalid');
}
```

---

## Status Transitions

### Campaign Status

```
draft ──(send invites)──▶ active ──(manual)──▶ closed
```

### Participant Status

```
invited ──(open link)──▶ opened ──(start assessment)──▶ started ──(submit)──▶ completed
```

### Attempt Status

```
in_progress ──(submit)──▶ submitted ──(score)──▶ scored
                              │
                              └──(error)──▶ failed
```

---

## Processing Flow

```
Employee submits assessment
         │
         ▼
Redirect to /invite/[token]/processing
         │
         ▼
Server checks attempt.status
         │
    ┌────┴────┐
    │         │
submitted   scored
    │         │
    ▼         ▼
scoreAttempt()  Redirect to feedback
    │
    ▼
Redirect to feedback
```

**Why server-side scoring trigger**: 
- Simpler than background jobs for MVP
- Mock scoring is instant
- Real AI scoring will be ~2-5 seconds (acceptable wait)
- Processing page already shows loading state

---

## Future Considerations

### OpenAI Integration

Replace MockScorer:

```typescript
// lib/scoring/openai-scorer.ts
export class OpenAIScorer implements Scorer {
  async score(input: ScoringInput): Promise<ScoringOutput> {
    // Call OpenAI API
    // Parse structured response
    // Return in same format as MockScorer
  }
}

// lib/scoring/index.ts
const scorer: Scorer = new OpenAIScorer(); // Just change this line
```

### Background Jobs

If scoring takes too long:
1. Submit triggers job creation
2. Processing page polls status
3. Redirect when complete

### Multi-tenant Scaling

Current RLS policies support multi-tenancy. For scale:
- Add connection pooling
- Consider read replicas
- Add caching layer for scores
