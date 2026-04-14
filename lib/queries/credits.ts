import { createClient } from '@/lib/supabase/server';

export interface CreditTransaction {
  id: string;
  organization_id: string;
  amount: number;
  type: 'purchase' | 'deduction' | 'adjustment';
  assessment_attempt_id: string | null;
  payment_id: string | null;
  description: string | null;
  created_at: string;
}

export async function getCreditBalance(organizationId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('credit_balance')
    .eq('id', organizationId)
    .single();

  if (error || !data) return 0;
  return data.credit_balance as number;
}

export interface TrialStatus {
  granted: boolean;       // did the org receive a trial grant?
  total: number;          // how many trial credits were granted
  used: number;           // how many have been deducted since the grant
  remaining: number;      // min(total - used, current balance) — credits left from trial
}

export async function getTrialStatus(organizationId: string): Promise<TrialStatus> {
  const supabase = await createClient();

  // Find the trial grant transaction
  const { data: trialTx } = await supabase
    .from('credit_transactions')
    .select('amount, created_at')
    .eq('organization_id', organizationId)
    .eq('type', 'adjustment')
    .ilike('description', '%trial%')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (!trialTx) {
    return { granted: false, total: 0, used: 0, remaining: 0 };
  }

  const total = trialTx.amount;

  // Count deductions since the trial grant
  const { data: deductions } = await supabase
    .from('credit_transactions')
    .select('amount')
    .eq('organization_id', organizationId)
    .eq('type', 'deduction')
    .gte('created_at', trialTx.created_at);

  const used = deductions
    ? Math.abs(deductions.reduce((sum, d) => sum + d.amount, 0))
    : 0;

  // Also get current balance so remaining doesn't exceed what's actually there
  const { data: org } = await supabase
    .from('organizations')
    .select('credit_balance')
    .eq('id', organizationId)
    .single();

  const balance = (org?.credit_balance as number) ?? 0;
  const remaining = Math.max(0, Math.min(total - used, balance));

  return { granted: true, total, used, remaining };
}

export async function getCreditTransactions(
  organizationId: string,
  limit = 50
): Promise<CreditTransaction[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as CreditTransaction[];
}
