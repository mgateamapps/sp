import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { getActiveSubscription, hasRemainingCampaigns } from '@/lib/queries/subscriptions';
import { calculateCampaignPrice, formatPrice } from '@/lib/utils/pricing';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId, employeeCount, useSubscription } = await request.json();

    if (!campaignId || !employeeCount || employeeCount <= 0) {
      return NextResponse.json(
        { error: 'Invalid campaign or employee count' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify campaign belongs to admin's organization
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, name, organization_id, status')
      .eq('id', campaignId)
      .eq('organization_id', admin.organization_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'draft') {
      return NextResponse.json(
        { error: 'Campaign is not in draft status' },
        { status: 400 }
      );
    }

    // Check for active subscription with remaining campaigns
    const subscription = await getActiveSubscription(admin.organization_id);

    if (useSubscription && subscription && hasRemainingCampaigns(subscription)) {
      // Use subscription campaign credit
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ campaigns_used: subscription.campaigns_used + 1 })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Failed to increment campaigns_used:', updateError);
        return NextResponse.json(
          { error: 'Failed to use subscription credit' },
          { status: 500 }
        );
      }

      // Create payment record (amount = 0 for subscription)
      await supabase.from('payments').insert({
        organization_id: admin.organization_id,
        campaign_id: campaignId,
        subscription_id: subscription.id,
        amount_cents: 0,
        employee_count: employeeCount,
        status: 'completed',
        is_subscription_campaign: true,
        completed_at: new Date().toISOString(),
      });

      // Activate campaign
      await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      return NextResponse.json({
        success: true,
        usedSubscription: true,
        remainingCampaigns: subscription.campaigns_limit - subscription.campaigns_used - 1,
      });
    }

    // Standard payment flow
    const amountCents = calculateCampaignPrice(employeeCount);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ScorePrompt Assessment - ${campaign.name}`,
              description: `${employeeCount} employee${employeeCount > 1 ? 's' : ''} - ${formatPrice(amountCents)}`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/dashboard/campaigns/${campaignId}?payment=success`,
      cancel_url: `${appUrl}/dashboard/campaigns/${campaignId}?payment=cancelled`,
      metadata: {
        campaignId,
        organizationId: admin.organization_id,
        employeeCount: employeeCount.toString(),
      },
    });

    // Create pending payment record
    const { error: paymentError } = await supabase.from('payments').insert({
      organization_id: admin.organization_id,
      campaign_id: campaignId,
      stripe_checkout_session_id: session.id,
      amount_cents: amountCents,
      employee_count: employeeCount,
      status: 'pending',
    });

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

// GET endpoint to check subscription status
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getActiveSubscription(admin.organization_id);

    if (!subscription) {
      return NextResponse.json({ hasSubscription: false });
    }

    return NextResponse.json({
      hasSubscription: true,
      planType: subscription.plan_type,
      campaignsUsed: subscription.campaigns_used,
      campaignsLimit: subscription.campaigns_limit,
      remainingCampaigns: subscription.campaigns_limit - subscription.campaigns_used,
      periodEnd: subscription.current_period_end,
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
