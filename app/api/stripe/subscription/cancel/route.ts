import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { getActiveSubscription } from '@/lib/queries/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active subscription
    const subscription = await getActiveSubscription(admin.organization_id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Subscription has no Stripe ID' },
        { status: 400 }
      );
    }

    // Cancel at period end (user keeps access until subscription expires)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    const supabase = await createClient();

    // Update local subscription record
    await supabase
      .from('subscriptions')
      .update({
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      periodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
