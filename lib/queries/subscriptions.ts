import { createClient } from '@/lib/supabase/server';

export interface Subscription {
  id: string;
  organization_id: string;
  plan_type: 'team_annual' | 'enterprise_annual';
  status: 'active' | 'past_due' | 'cancelled' | 'expired';
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  stripe_price_id: string | null;
  employee_limit: number;
  current_period_start: string;
  current_period_end: string;
  campaigns_used: number;
  campaigns_limit: number;
  created_at: string;
  cancelled_at: string | null;
}

/**
 * Get active subscription for an organization
 */
export async function getActiveSubscription(organizationId: string): Promise<Subscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single();

  if (error || !data) return null;

  return data as Subscription;
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (error || !data) return null;

  return data as Subscription;
}

/**
 * Get all subscriptions for an organization (including past)
 */
export async function getOrganizationSubscriptions(organizationId: string): Promise<Subscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data as Subscription[];
}

/**
 * Increment campaigns used count for a subscription
 */
export async function incrementCampaignsUsed(subscriptionId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_campaigns_used', {
    sub_id: subscriptionId,
  });

  if (error) {
    // Fallback: manual increment
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('campaigns_used')
      .eq('id', subscriptionId)
      .single();

    if (sub) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ campaigns_used: sub.campaigns_used + 1 })
        .eq('id', subscriptionId);

      return !updateError;
    }
    return false;
  }

  return true;
}

/**
 * Check if subscription has remaining campaigns
 */
export function hasRemainingCampaigns(subscription: Subscription): boolean {
  return subscription.campaigns_used < subscription.campaigns_limit;
}

/**
 * Get remaining campaigns count
 */
export function getRemainingCampaigns(subscription: Subscription): number {
  return Math.max(0, subscription.campaigns_limit - subscription.campaigns_used);
}

/**
 * Check if subscription is within valid period
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.status !== 'active') return false;

  const now = new Date();
  const periodEnd = new Date(subscription.current_period_end);

  return now < periodEnd;
}
