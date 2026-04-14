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
