export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  description: string;
  highlighted?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 50,
    price_cents: 8900,
    description: 'Perfect for small teams or a pilot assessment',
  },
  {
    id: 'team',
    name: 'Team',
    credits: 200,
    price_cents: 29900,
    description: 'Best value for mid-size teams',
    highlighted: true,
  },
  {
    id: 'business',
    name: 'Business',
    credits: 500,
    price_cents: 64900,
    description: 'For large teams and multiple campaigns',
  },
];

export function getCreditPackById(id: string): CreditPack | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

export function getPricePerCredit(pack: CreditPack): number {
  return pack.price_cents / pack.credits;
}

/**
 * Format cents to dollar string
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}
