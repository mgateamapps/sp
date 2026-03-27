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
  token: string; // Secure invite token
  status: ParticipantStatus;
  invited_at: string;
  started_at: string | null;
  completed_at: string | null;
}

// One assessment attempt by a participant
export interface AssessmentAttempt {
  id: string;
  participant_id: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at: string | null;
  scored_at: string | null;
}

// Response to a single scenario within an attempt
export interface AssessmentResponse {
  id: string;
  attempt_id: string;
  scenario_key: ScenarioKey;
  prompt_text: string;
  created_at: string;
}

// AI-generated score for a single scenario response
export interface ScenarioScore {
  id: string;
  response_id: string;
  criterion: RubricCriterion;
  score: number; // 1-4
  feedback: string | null;
  created_at: string;
}

// Aggregate score for entire assessment attempt
export interface AssessmentScore {
  id: string;
  attempt_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  band: ScoreBand;
  summary_feedback: string | null;
  created_at: string;
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
