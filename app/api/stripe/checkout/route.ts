import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAdminProfile } from '@/lib/queries/admin';
import { getCreditPackById, formatPrice } from '@/lib/utils/pricing';

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdminProfile();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // ─── Credit pack purchase ─────────────────────────────────────────────────
    if (body.type === 'credit_pack') {
      const { packId } = body;
      const pack = getCreditPackById(packId);
      if (!pack) {
        return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `ScorePrompt ${pack.name} Pack`,
                description: `${pack.credits} assessments — ${formatPrice(Math.round(pack.price_cents / pack.credits))} per assessment`,
              },
              unit_amount: pack.price_cents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appUrl}/app/billing?purchase=success`,
        cancel_url: `${appUrl}/app/billing`,
        metadata: {
          type: 'credit_pack',
          packId: pack.id,
          credits: pack.credits.toString(),
          organizationId: admin.organization_id,
        },
      });

      const supabase = await createClient();
      await supabase.from('payments').insert({
        organization_id: admin.organization_id,
        stripe_checkout_session_id: session.id,
        amount_cents: pack.price_cents,
        employee_count: pack.credits,
        status: 'pending',
      });

      return NextResponse.json({ url: session.url });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
