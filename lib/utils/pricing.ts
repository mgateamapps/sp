// Pricing tiers for campaign assessments

// Monthly (per-campaign) pricing
const TIER_1_RATE_CENTS = 200; // $2.00 per employee
const TIER_2_RATE_CENTS = 150; // $1.50 per employee
const TIER_1_LIMIT = 50;

// Annual subscription pricing (pay for 3 campaigns, get 4)
const ANNUAL_TEAM_RATE_CENTS = 600; // $6.00 per employee per year (3 × $2)
const ANNUAL_ENTERPRISE_RATE_CENTS = 450; // $4.50 per employee per year (3 × $1.50)
const ANNUAL_CAMPAIGNS_INCLUDED = 4;
const ANNUAL_CAMPAIGNS_PAID = 3;

/**
 * Calculate the total price for a campaign based on employee count
 * - First 50 employees: $2.00 each
 * - Above 50 employees: $1.50 each
 */
export function calculateCampaignPrice(employeeCount: number): number {
  if (employeeCount <= 0) return 0;

  if (employeeCount <= TIER_1_LIMIT) {
    return employeeCount * TIER_1_RATE_CENTS;
  }

  const tier1Cost = TIER_1_LIMIT * TIER_1_RATE_CENTS;
  const tier2Count = employeeCount - TIER_1_LIMIT;
  const tier2Cost = tier2Count * TIER_2_RATE_CENTS;

  return tier1Cost + tier2Cost;
}

/**
 * Calculate annual subscription price based on employee count
 * Team plan (≤50 employees): $6/employee/year
 * Enterprise plan (>50 employees): $4.50/employee/year
 */
export function calculateAnnualPrice(employeeCount: number, planType: 'team_annual' | 'enterprise_annual'): number {
  if (employeeCount <= 0) return 0;

  const ratePerEmployee = planType === 'team_annual' 
    ? ANNUAL_TEAM_RATE_CENTS 
    : ANNUAL_ENTERPRISE_RATE_CENTS;

  return employeeCount * ratePerEmployee;
}

/**
 * Calculate refund amount for employees who never started
 * Uses the same tiered pricing logic
 */
export function calculateRefundAmount(
  originalEmployeeCount: number,
  eligibleForRefundCount: number
): number {
  if (eligibleForRefundCount <= 0) return 0;
  if (eligibleForRefundCount > originalEmployeeCount) {
    eligibleForRefundCount = originalEmployeeCount;
  }

  const startedCount = originalEmployeeCount - eligibleForRefundCount;
  const costForStarted = calculateCampaignPrice(startedCount);
  const originalCost = calculateCampaignPrice(originalEmployeeCount);
  return originalCost - costForStarted;
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

/**
 * Get price breakdown for display
 */
export function getPriceBreakdown(employeeCount: number): {
  tier1Count: number;
  tier1Total: number;
  tier2Count: number;
  tier2Total: number;
  total: number;
} {
  if (employeeCount <= TIER_1_LIMIT) {
    return {
      tier1Count: employeeCount,
      tier1Total: employeeCount * TIER_1_RATE_CENTS,
      tier2Count: 0,
      tier2Total: 0,
      total: employeeCount * TIER_1_RATE_CENTS,
    };
  }

  const tier1Total = TIER_1_LIMIT * TIER_1_RATE_CENTS;
  const tier2Count = employeeCount - TIER_1_LIMIT;
  const tier2Total = tier2Count * TIER_2_RATE_CENTS;

  return {
    tier1Count: TIER_1_LIMIT,
    tier1Total,
    tier2Count,
    tier2Total,
    total: tier1Total + tier2Total,
  };
}

/**
 * Get annual price breakdown for display
 */
export function getAnnualPriceBreakdown(employeeCount: number, planType: 'team_annual' | 'enterprise_annual'): {
  employeeCount: number;
  ratePerEmployee: number;
  total: number;
  savingsPercent: number;
  campaignsIncluded: number;
} {
  const ratePerEmployee = planType === 'team_annual' 
    ? ANNUAL_TEAM_RATE_CENTS 
    : ANNUAL_ENTERPRISE_RATE_CENTS;

  const monthlyEquivalent = calculateCampaignPrice(employeeCount) * ANNUAL_CAMPAIGNS_INCLUDED;
  const annualTotal = employeeCount * ratePerEmployee;
  const savings = monthlyEquivalent - annualTotal;
  const savingsPercent = monthlyEquivalent > 0 ? Math.round((savings / monthlyEquivalent) * 100) : 0;

  return {
    employeeCount,
    ratePerEmployee,
    total: annualTotal,
    savingsPercent,
    campaignsIncluded: ANNUAL_CAMPAIGNS_INCLUDED,
  };
}

/**
 * Check if a subscription has remaining free campaigns
 */
export function hasRemainingCampaigns(campaignsUsed: number): boolean {
  return campaignsUsed < ANNUAL_CAMPAIGNS_INCLUDED;
}

/**
 * Get remaining campaigns count
 */
export function getRemainingCampaigns(campaignsUsed: number): number {
  return Math.max(0, ANNUAL_CAMPAIGNS_INCLUDED - campaignsUsed);
}

export const PRICING = {
  TIER_1_RATE_CENTS,
  TIER_2_RATE_CENTS,
  TIER_1_LIMIT,
};

export const ANNUAL_PRICING = {
  TEAM_RATE_CENTS: ANNUAL_TEAM_RATE_CENTS,
  ENTERPRISE_RATE_CENTS: ANNUAL_ENTERPRISE_RATE_CENTS,
  TEAM_EMPLOYEE_LIMIT: 50,
  CAMPAIGNS_INCLUDED: ANNUAL_CAMPAIGNS_INCLUDED,
  CAMPAIGNS_PAID: ANNUAL_CAMPAIGNS_PAID,
};
