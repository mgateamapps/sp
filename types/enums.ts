// Campaign lifecycle status
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived';

// Participant status within a campaign
export type ParticipantStatus = 'invited' | 'started' | 'completed';

// Assessment attempt status
export type AttemptStatus = 'in_progress' | 'submitted' | 'scored';

// Five hardcoded assessment scenarios for MVP
export type ScenarioKey =
  | 'summarization'
  | 'email_drafting'
  | 'action_list'
  | 'comparison'
  | 'text_improvement';

// Rubric criteria for scoring prompts
export type RubricCriterion =
  | 'clarity'
  | 'context'
  | 'constraints'
  | 'output_format'
  | 'verification';

// Score bands for categorizing performance
export type ScoreBand = 'novice' | 'developing' | 'proficient' | 'advanced';
