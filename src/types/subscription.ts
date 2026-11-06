export type SubscriptionTier = 'free' | 'prime';

export type SubscriptionStatus =
  | 'none'
  | 'active'
  | 'cancelled_grace_period'
  | 'expired';

export interface PrimeSubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  productId: string;
  priceInr: number;
  currency: string;
  billingPeriod: 'monthly';
  subscribedAt: number | null;
  expiresAt: number | null;
  autoRenew: boolean;
  transactionId: string | null;
}

export interface PurchaseResult {
  success: boolean;
  error?: string;
  state: PrimeSubscriptionState;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  priceFormatted: string;
  priceInr: number;
  period: string;
  description: string;
  features: string[];
  refundTerms: string;
}
