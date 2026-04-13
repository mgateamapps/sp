import type {
  CampaignStatus,
  ParticipantStatus,
  AttemptStatus,
  ScenarioKey,
  RubricCriterion,
  ScoreBand,
} from './enums';

// Organization that owns campaigns
export interface Organization {
  id: string;
  name: string;
  logo_url: string | null;
  invite_message: string | null;
  invite_reply_to: string | null;
  created_at: string;
  updated_at: string;
}

// Admin role within organization
export type AdminRole = 'owner' | 'admin' | 'member';

// Admin user profile linked to organization
export interface AdminProfile {
  id: string;
  user_id: string; // Supabase auth.users id
  organization_id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Employee being assessed (no login required)
export interface Employee {
  id: string;
  organization_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

// Assessment campaign
export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

// Link between campaign and employee with secure token
export interface CampaignParticipant {
  id: string;
  campaign_id: string;
  employee_id: string;
  token: string | null; // Legacy plain token (deprecated)
  token_hash: string | null; // SHA256 hash of invite token
  status: ParticipantStatus;
  invited_at: string;
  opened_at: string | null;
  started_at: string | null;
  completed_at: string | null;
}

// One assessment attempt by a participant
export interface AssessmentAttempt {
  id: string;
  campaign_participant_id: string;
  status: AttemptStatus;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  scored_at: string | null;
}

// Response to a single scenario within an attempt
export interface AssessmentResponse {
  id: string;
  attempt_id: string;
  scenario_key: ScenarioKey;
  response_text: string;
  created_at: string;
  updated_at: string;
}

// Score for a single scenario with rubric breakdown
export interface ScenarioScore {
  id: string;
  attempt_id: string;
  scenario_key: ScenarioKey;
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  scenario_score: number;
  strengths_json: string[];
  weaknesses_json: string[];
  coaching_tips_json: string[];
  improved_prompt: string | null;
  summary_feedback: string | null;
  rubric_version: string;
  created_at: string;
  updated_at: string;
}

// Aggregate score for entire assessment attempt
export interface AssessmentScore {
  id: string;
  attempt_id: string;
  clarity_score: number;
  context_score: number;
  constraints_score: number;
  output_format_score: number;
  verification_score: number;
  total_score: number;
  score_band: ScoreBand;
  strengths_json: string[];
  weaknesses_json: string[];
  coaching_tips_json: string[];
  summary_feedback: string | null;
  rubric_version: string;
  created_at: string;
  updated_at: string;
}

// Joined types for common queries

export interface CampaignWithParticipantCount extends Campaign {
  participant_count: number;
  completed_count: number;
}

export interface ParticipantWithEmployee extends CampaignParticipant {
  employee: Employee;
}

export interface ParticipantWithScore extends CampaignParticipant {
  employee: Employee;
  assessment_score: AssessmentScore | null;
}
