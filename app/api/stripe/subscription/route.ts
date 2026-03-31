import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { getActiveSubscription } from '@/lib/queries/subscriptions';
import { calculateAnnualPrice, ANNUAL_PRICING } from '@/lib/utils/pricing';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planType, employeeCount } = await request.json();

    if (!planType || !employeeCount || employeeCount <= 0) {
      return NextResponse.json(
        { error: 'Invalid plan type or employee count' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (planType !== 'team_annual' && planType !== 'enterprise_annual') {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Validate employee count for plan type
    if (planType === 'team_annual' && employeeCount > ANNUAL_PRICING.TEAM_EMPLOYEE_LIMIT) {
      return NextResponse.json(
        { error: `Team plan is limited to ${ANNUAL_PRICING.TEAM_EMPLOYEE_LIMIT} employees. Use Enterprise for more.` },
        { status: 400 }
      );
    }

    // Check for existing active subscription
    const existingSubscription = await getActiveSubscription(admin.organization_id);
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get organization name for Stripe customer
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', admin.organization_id)
      .single();

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: admin.email,
      name: org?.name || undefined,
      metadata: {
        organizationId: admin.organization_id,
      },
    });

    // Calculate price
    const amountCents = calculateAnnualPrice(employeeCount, planType);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planType === 'team_annual' 
                ? 'ScorePrompt Team Annual' 
                : 'ScorePrompt Enterprise Annual',
              description: `${employeeCount} employees - ${ANNUAL_PRICING.CAMPAIGNS_INCLUDED} assessments per year`,
            },
            unit_amount: amountCents,
            recurring: {
              interval: 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard?subscription=success`,
      cancel_url: `${appUrl}/onboarding/choose-plan?subscription=cancelled`,
      metadata: {
        organizationId: admin.organization_id,
        planType,
        employeeCount: employeeCount.toString(),
      },
      subscription_data: {
        metadata: {
          organizationId: admin.organization_id,
          planType,
          employeeCount: employeeCount.toString(),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription checkout' },
      { status: 500 }
    );
  }
}
