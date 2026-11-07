/**
 * Server-Authoritative Pricing Catalog
 * 
 * In accordance with strict security standards:
 * 1. The client NEVER calculates, alters, or dictates subscription pricing.
 * 2. All product costs, currency rules, and billing periods originate exclusively
 *    from this authoritative contract (or the verified store receipt).
 * 3. Any client request with a mismatched price is immediately rejected.
 */

export interface AuthoritativePlan {
  productId: string;
  name: string;
  priceInr: number;
  currency: 'INR';
  billingPeriod: 'monthly' | 'annual';
  durationDays: number;
  features: string[];
}

export const SERVER_PRICING_CATALOG: Record<string, AuthoritativePlan> = {
  transitwake_prime_monthly: {
    productId: 'transitwake_prime_monthly',
    name: 'TransitWake Prime Monthly',
    priceInr: 26,
    currency: 'INR',
    billingPeriod: 'monthly',
    durationDays: 30,
    features: [
      'Zero banner & interstitial ads',
      'Multi-leg intermediate interchange alarms',
      '1-tap WhatsApp peace of mind live ETA sharing',
      'Offline subway tunnel tile caching',
      'Emergency loudspeaker failsafe routing',
    ],
  },
  transitwake_prime_annual: {
    productId: 'transitwake_prime_annual',
    name: 'TransitWake Prime Annual Pass',
    priceInr: 199,
    currency: 'INR',
    billingPeriod: 'annual',
    durationDays: 365,
    features: [
      'All Prime monthly features included',
      'Save over 36% compared to monthly',
      '14-day statutory money-back guarantee',
    ],
  },
};

/**
 * Validates a purchase request against server-authoritative pricing.
 * Prevents client-side price tampering.
 */
export function validateServerPrice(
  productId: string,
  claimedPriceInr?: number,
  claimedCurrency?: string
): { isValid: boolean; plan: AuthoritativePlan; error?: string } {
  const plan = SERVER_PRICING_CATALOG[productId];
  if (!plan) {
    return {
      isValid: false,
      plan: SERVER_PRICING_CATALOG.transitwake_prime_monthly,
      error: `Unknown product ID: ${productId}`,
    };
  }

  if (claimedPriceInr !== undefined && claimedPriceInr !== plan.priceInr) {
    return {
      isValid: false,
      plan,
      error: `Price tampering detected. Server price for ${plan.productId} is ${plan.priceInr} ${plan.currency}, claimed ${claimedPriceInr}.`,
    };
  }

  if (claimedCurrency !== undefined && claimedCurrency !== plan.currency) {
    return {
      isValid: false,
      plan,
      error: `Currency mismatch. Server currency is ${plan.currency}, claimed ${claimedCurrency}.`,
    };
  }

  return { isValid: true, plan };
}
