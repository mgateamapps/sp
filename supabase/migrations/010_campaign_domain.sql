-- Migration: Add domain field to campaigns, expand scenario_key constraint

-- Add domain column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'other';

-- Drop old restrictive CHECK constraint on scenario_scores.scenario_key
ALTER TABLE scenario_scores DROP CONSTRAINT IF EXISTS scenario_scores_scenario_key_check;

-- Add new CHECK constraint with all domain-specific scenario keys
ALTER TABLE scenario_scores ADD CONSTRAINT scenario_scores_scenario_key_check CHECK (
  scenario_key IN (
    -- Legacy generic (keep for backward compatibility)
    'summarization', 'email_drafting', 'action_list', 'comparison', 'text_improvement',
    -- Marketing
    'mkt_campaign_analysis', 'mkt_competitive_positioning', 'mkt_content_strategy', 'mkt_ad_copy', 'mkt_persona_synthesis',
    -- Sales
    'sales_discovery_prep', 'sales_objection', 'sales_pipeline_forecast', 'sales_executive_proposal', 'sales_account_expansion',
    -- Support
    'sup_escalation', 'sup_knowledge_base', 'sup_root_cause', 'sup_process_doc', 'sup_csat_analysis',
    -- Product
    'prod_prd', 'prod_prioritization', 'prod_user_research', 'prod_metrics', 'prod_competitor_analysis',
    -- Engineering
    'eng_incident_debug', 'eng_architecture', 'eng_security_review', 'eng_tech_debt', 'eng_performance',
    -- HR
    'hr_performance_conversation', 'hr_job_description', 'hr_restructuring_comms', 'hr_compensation', 'hr_engagement_analysis',
    -- Operations
    'ops_bottleneck', 'ops_vendor_selection', 'ops_capacity_planning', 'ops_supply_chain', 'ops_kpi_dashboard',
    -- Finance
    'fin_budget_variance', 'fin_revenue_forecast', 'fin_unit_economics', 'fin_investment_memo', 'fin_cost_reduction',
    -- Consulting
    'con_problem_diagnosis', 'con_recommendations', 'con_stakeholder_alignment', 'con_benchmarking', 'con_implementation_risk',
    -- Management
    'mgmt_strategic_decision', 'mgmt_team_restructure', 'mgmt_difficult_news', 'mgmt_conflict_resolution', 'mgmt_executive_reporting',
    -- Other / General
    'gen_document_synthesis', 'gen_negotiation_prep', 'gen_research_synthesis', 'gen_communication_audit', 'gen_change_management'
  )
);
