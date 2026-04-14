// Campaign lifecycle status
export type CampaignStatus = 'draft' | 'active' | 'closed';

// Participant status within a campaign
export type ParticipantStatus = 'invited' | 'started' | 'completed';

// Assessment attempt status
export type AttemptStatus = 'in_progress' | 'submitted' | 'scored' | 'failed';

// Campaign domain for tailoring assessment scenarios
export type CampaignDomain =
  | 'marketing'
  | 'sales'
  | 'support'
  | 'product'
  | 'engineering'
  | 'hr'
  | 'operations'
  | 'finance'
  | 'consulting'
  | 'management'
  | 'other';

// Assessment scenario keys — legacy generic + per-domain
export type ScenarioKey =
  // Legacy generic (kept for backward compatibility)
  | 'summarization'
  | 'email_drafting'
  | 'action_list'
  | 'comparison'
  | 'text_improvement'
  // Marketing
  | 'mkt_campaign_analysis'
  | 'mkt_competitive_positioning'
  | 'mkt_content_strategy'
  | 'mkt_ad_copy'
  | 'mkt_persona_synthesis'
  // Sales
  | 'sales_discovery_prep'
  | 'sales_objection'
  | 'sales_pipeline_forecast'
  | 'sales_executive_proposal'
  | 'sales_account_expansion'
  // Support
  | 'sup_escalation'
  | 'sup_knowledge_base'
  | 'sup_root_cause'
  | 'sup_process_doc'
  | 'sup_csat_analysis'
  // Product
  | 'prod_prd'
  | 'prod_prioritization'
  | 'prod_user_research'
  | 'prod_metrics'
  | 'prod_competitor_analysis'
  // Engineering
  | 'eng_incident_debug'
  | 'eng_architecture'
  | 'eng_security_review'
  | 'eng_tech_debt'
  | 'eng_performance'
  // HR
  | 'hr_performance_conversation'
  | 'hr_job_description'
  | 'hr_restructuring_comms'
  | 'hr_compensation'
  | 'hr_engagement_analysis'
  // Operations
  | 'ops_bottleneck'
  | 'ops_vendor_selection'
  | 'ops_capacity_planning'
  | 'ops_supply_chain'
  | 'ops_kpi_dashboard'
  // Finance
  | 'fin_budget_variance'
  | 'fin_revenue_forecast'
  | 'fin_unit_economics'
  | 'fin_investment_memo'
  | 'fin_cost_reduction'
  // Consulting
  | 'con_problem_diagnosis'
  | 'con_recommendations'
  | 'con_stakeholder_alignment'
  | 'con_benchmarking'
  | 'con_implementation_risk'
  // Management
  | 'mgmt_strategic_decision'
  | 'mgmt_team_restructure'
  | 'mgmt_difficult_news'
  | 'mgmt_conflict_resolution'
  | 'mgmt_executive_reporting'
  // Other / General
  | 'gen_document_synthesis'
  | 'gen_negotiation_prep'
  | 'gen_research_synthesis'
  | 'gen_communication_audit'
  | 'gen_change_management';

// Rubric criteria for scoring prompts
export type RubricCriterion =
  | 'clarity'
  | 'context'
  | 'constraints'
  | 'output_format'
  | 'verification';

// Score bands for categorizing performance
export type ScoreBand = 'at_risk' | 'basic' | 'functional' | 'strong' | 'expert';
