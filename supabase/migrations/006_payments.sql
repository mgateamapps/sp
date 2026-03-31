-- Migration: Create payments table for Stripe integration
-- Run this after 005_scoring_tables.sql

-- Payments table to track all campaign payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- Stripe identifiers
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_refund_id TEXT,
  
  -- Payment details
  amount_cents INTEGER NOT NULL,
  employee_count INTEGER NOT NULL,
  
  -- Refund tracking
  refund_amount_cents INTEGER DEFAULT 0,
  refund_employee_count INTEGER DEFAULT 0,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can only see payments for their organization
CREATE POLICY "Admins can view own organization payments" ON payments
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can insert payments for own organization" ON payments
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update own organization payments" ON payments
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM admin_profiles WHERE user_id = auth.uid())
  );

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payments_organization ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_campaign ON payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
