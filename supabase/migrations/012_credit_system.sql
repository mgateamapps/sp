-- Add credit balance to organizations
ALTER TABLE organizations ADD COLUMN credit_balance INTEGER NOT NULL DEFAULT 0;

-- Full audit log of credit purchases and deductions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- positive = purchase, negative = deduction
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'adjustment')),
  assessment_attempt_id UUID REFERENCES assessment_attempts(id),
  payment_id UUID REFERENCES payments(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_org ON credit_transactions(organization_id, created_at DESC);
