import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role client for webhook (no auth context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment') {
          await handlePaymentCheckoutCompleted(session);
        }
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_checkout_session_id', session.id);
        break;
      }
      default:
        // Subscription events preserved for existing subscribers but no new subscriptions
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handlePaymentCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { type, packId, credits, organizationId } = session.metadata || {};

  if (type === 'credit_pack') {
    if (!organizationId || !credits) {
      console.error('Missing metadata in credit pack checkout session');
      return;
    }

    const creditCount = parseInt(credits, 10);

    // Mark payment as completed
    const { data: payment } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent as string,
        completed_at: new Date().toISOString(),
      })
      .eq('stripe_checkout_session_id', session.id)
      .select('id')
      .single();

    // Add assessments to organization balance
    const { error: balanceError } = await supabase.rpc('increment_credit_balance', {
      org_id: organizationId,
      delta: creditCount,
    });

    if (balanceError) {
      // Fallback: direct update if RPC not available
      const { data: org } = await supabase
        .from('organizations')
        .select('credit_balance')
        .eq('id', organizationId)
        .single();

      await supabase
        .from('organizations')
        .update({ credit_balance: (org?.credit_balance ?? 0) + creditCount })
        .eq('id', organizationId);
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      organization_id: organizationId,
      amount: creditCount,
      type: 'purchase',
      payment_id: payment?.id ?? null,
      description: `${packId ? packId.charAt(0).toUpperCase() + packId.slice(1) : 'Assessment'} pack — ${creditCount} assessments`,
    });

    console.log(`Assessment pack purchased: ${creditCount} assessments for org ${organizationId}`);
    return;
  }

  // Legacy campaign payment (no-op for now — campaign model removed)
  console.log(`Unhandled payment checkout for session ${session.id}`);
}
