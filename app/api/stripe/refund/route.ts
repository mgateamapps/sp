import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { calculateRefundAmount } from '@/lib/utils/pricing';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Get payment for this campaign
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('organization_id', admin.organization_id)
      .eq('status', 'completed')
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'No completed payment found for this campaign' },
        { status: 404 }
      );
    }

    if (!payment.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: 'Payment intent not found' },
        { status: 400 }
      );
    }

    // Count employees who have NOT started the assessment
    const { count: notStartedCount, error: countError } = await supabase
      .from('campaign_participants')
      .select('id', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'invited');

    if (countError) {
      return NextResponse.json(
        { error: 'Failed to count eligible employees' },
        { status: 500 }
      );
    }

    const eligibleCount = notStartedCount || 0;

    if (eligibleCount === 0) {
      return NextResponse.json(
        { error: 'No employees eligible for refund (all have started assessment)' },
        { status: 400 }
      );
    }

    // Calculate refund amount
    const refundAmountCents = calculateRefundAmount(
      payment.employee_count,
      eligibleCount
    );

    if (refundAmountCents <= 0) {
      return NextResponse.json(
        { error: 'Calculated refund amount is zero' },
        { status: 400 }
      );
    }

    // Check we haven't exceeded what can be refunded
    const alreadyRefunded = payment.refund_amount_cents || 0;
    const maxRefundable = payment.amount_cents - alreadyRefunded;

    if (refundAmountCents > maxRefundable) {
      return NextResponse.json(
        { error: 'Refund amount exceeds maximum refundable' },
        { status: 400 }
      );
    }

    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      amount: refundAmountCents,
      reason: 'requested_by_customer',
      metadata: {
        campaignId,
        eligibleEmployeeCount: eligibleCount.toString(),
      },
    });

    // Update payment record
    const newRefundTotal = alreadyRefunded + refundAmountCents;
    const newRefundEmployeeCount = (payment.refund_employee_count || 0) + eligibleCount;
    const newStatus = newRefundTotal === payment.amount_cents ? 'refunded' : 'partially_refunded';

    const { error: updateError } = await supabase
      .from('payments')
      .update({
        stripe_refund_id: refund.id,
        refund_amount_cents: newRefundTotal,
        refund_employee_count: newRefundEmployeeCount,
        status: newStatus,
        refunded_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('Failed to update payment record:', updateError);
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundAmountCents,
      eligibleEmployeeCount: eligibleCount,
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
