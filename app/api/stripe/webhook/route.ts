import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { ANNUAL_PRICING } from '@/lib/utils/pricing';

// Use service role client for webhook (no auth context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Extended types for Stripe objects with fields that might not be in the TS definitions
interface StripeSubscriptionData {
  id: string;
  customer: string;
  status: Stripe.Subscription.Status;
  metadata: Record<string, string>;
  current_period_start: number;
  current_period_end: number;
}

interface StripeInvoiceData {
  id: string;
  subscription: string | null;
  billing_reason: string | null;
  period_start: number;
  period_end: number;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // One-time payment events
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment') {
          await handlePaymentCheckoutCompleted(session);
        } else if (session.mode === 'subscription') {
          await handleSubscriptionCheckoutCompleted(session);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      // Subscription events
      case 'customer.subscription.created': {
        const subscription = event.data.object as unknown as StripeSubscriptionData;
        await handleSubscriptionCreated(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as StripeSubscriptionData;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as StripeSubscriptionData;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as unknown as StripeInvoiceData;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as StripeInvoiceData;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// One-time payment handlers
async function handlePaymentCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { campaignId, organizationId, employeeCount } = session.metadata || {};

  if (!campaignId || !organizationId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
      completed_at: new Date().toISOString(),
    })
    .eq('stripe_checkout_session_id', session.id);

  if (paymentError) {
    console.error('Failed to update payment record:', paymentError);
  }

  const { error: campaignError } = await supabase
    .from('campaigns')
    .update({ status: 'active' })
    .eq('id', campaignId);

  if (campaignError) {
    console.error('Failed to update campaign status:', campaignError);
  }

  console.log(`Payment completed for campaign ${campaignId}, ${employeeCount} employees`);
}

// Subscription checkout completed
async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { organizationId, planType } = session.metadata || {};

  if (!organizationId || !planType) {
    console.error('Missing metadata in subscription checkout session');
    return;
  }

  console.log(`Subscription checkout completed for org ${organizationId}, plan ${planType}`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { error } = await supabase
    .from('payments')
    .update({ status: 'failed' })
    .eq('stripe_checkout_session_id', session.id);

  if (error) {
    console.error('Failed to update expired payment:', error);
  }
}

// Subscription event handlers
async function handleSubscriptionCreated(subscription: StripeSubscriptionData) {
  const { organizationId, planType, employeeCount } = subscription.metadata || {};

  if (!organizationId || !planType) {
    console.error('Missing metadata in subscription:', subscription.id);
    return;
  }

  const employeeLimit = parseInt(employeeCount || '50', 10);

  const { error } = await supabase.from('subscriptions').insert({
    organization_id: organizationId,
    plan_type: planType,
    status: 'active',
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer,
    employee_limit: employeeLimit,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    campaigns_used: 0,
    campaigns_limit: ANNUAL_PRICING.CAMPAIGNS_INCLUDED,
  });

  if (error) {
    console.error('Failed to create subscription record:', error);
  } else {
    console.log(`Subscription created for org ${organizationId}, plan ${planType}`);
  }
}

async function handleSubscriptionUpdated(subscription: StripeSubscriptionData) {
  const status = mapStripeStatus(subscription.status);

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to update subscription:', error);
  } else {
    console.log(`Subscription ${subscription.id} updated to status ${status}`);
  }
}

async function handleSubscriptionDeleted(subscription: StripeSubscriptionData) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'expired',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Failed to mark subscription as expired:', error);
  } else {
    console.log(`Subscription ${subscription.id} marked as expired`);
  }
}

async function handleInvoicePaid(invoice: StripeInvoiceData) {
  if (!invoice.subscription) return;

  // Reset campaigns_used for renewal
  if (invoice.billing_reason === 'subscription_cycle') {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        campaigns_used: 0,
        current_period_start: new Date(invoice.period_start * 1000).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) {
      console.error('Failed to reset campaigns_used:', error);
    } else {
      console.log(`Subscription ${invoice.subscription} renewed, campaigns reset`);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: StripeInvoiceData) {
  if (!invoice.subscription) return;

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);

  if (error) {
    console.error('Failed to update subscription to past_due:', error);
  }
}

function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'cancelled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'expired';
    default:
      return 'active';
  }
}
