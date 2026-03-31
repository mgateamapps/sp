-- Migration: Create subscriptions table for annual plans
-- Run this after 006_payments.sql

-- Subscriptions table to track annual plans
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Plan details
  plan_type TEXT NOT NULL CHECK (plan_type IN ('team_annual', 'enterprise_annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'expired')),
  
  -- Stripe identifiers
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  
  -- Plan limits
  employee_limit INTEGER NOT NULL, -- 50 for team, custom for enterprise
  
  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Campaign usage tracking
  campaigns_used INTEGER DEFAULT 0,
  campaigns_limit INTEGER DEFAULT 4,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  
  -- Ensure one active subscription per organization
  CONSTRAINT unique_active_subscription UNIQUE (organization_id, status) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view own organization subscriptions" ON subscriptions
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert subscriptions for own organization" ON subscriptions
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update own organization subscriptions" ON subscriptions
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Add subscription reference to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_subscription_campaign BOOLEAN DEFAULT false;

-- Index for subscription payments
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
