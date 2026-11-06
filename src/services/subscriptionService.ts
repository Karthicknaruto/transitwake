import {
  PrimeSubscriptionState,
  PurchaseResult,
  SubscriptionPlanDetails,
} from '../types/subscription';

const STORAGE_KEY = 'transitwake_prime_subscription_v2';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const DEFAULT_STATE: PrimeSubscriptionState = {
  tier: 'free',
  status: 'none',
  productId: 'transitwake_prime_monthly',
  priceInr: 26,
  currency: 'INR',
  billingPeriod: 'monthly',
  subscribedAt: null,
  expiresAt: null,
  autoRenew: false,
  transactionId: null,
};

type SubscriptionListener = (state: PrimeSubscriptionState) => void;

class SubscriptionService {
  private state: PrimeSubscriptionState = { ...DEFAULT_STATE };
  private listeners: Set<SubscriptionListener> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: PrimeSubscriptionState = JSON.parse(stored);
          this.state = this.evaluateExpiration(parsed);
          this.initialized = true;
          return;
        }
      }
    } catch {
      // Memory fallback if storage is restricted
    }
    this.initialized = true;
  }

  private persistState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Memory fallback
    }
    this.notifyListeners();
  }

  private evaluateExpiration(state: PrimeSubscriptionState): PrimeSubscriptionState {
    if (state.tier === 'prime' && state.expiresAt && state.expiresAt <= Date.now()) {
      return {
        ...state,
        status: 'expired',
      };
    }
    return state;
  }

  private notifyListeners() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // Safe dispatch
      }
    });
  }

  public getState(): PrimeSubscriptionState {
    this.state = this.evaluateExpiration(this.state);
    return { ...this.state };
  }

  public isAdFree(): boolean {
    const current = this.getState();
    if (current.tier !== 'prime') {
      return false;
    }
    if (current.status !== 'active' && current.status !== 'cancelled_grace_period') {
      return false;
    }
    if (!current.expiresAt || current.expiresAt <= Date.now()) {
      return false;
    }
    return true;
  }

  public subscribe(listener: SubscriptionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public async purchasePrime(): Promise<PurchaseResult> {
    const now = Date.now();
    const expiresAt = now + THIRTY_DAYS_MS;
    const transactionId = `tx_${now}_${Math.random().toString(36).substring(2, 9)}`;

    this.state = {
      tier: 'prime',
      status: 'active',
      productId: 'transitwake_prime_monthly',
      priceInr: 26,
      currency: 'INR',
      billingPeriod: 'monthly',
      subscribedAt: now,
      expiresAt,
      autoRenew: true,
      transactionId,
    };

    this.persistState();

    return {
      success: true,
      state: this.getState(),
    };
  }

  public async cancelSubscription(): Promise<boolean> {
    if (this.state.tier !== 'prime') {
      return false;
    }

    this.state = {
      ...this.state,
      autoRenew: false,
      status: 'cancelled_grace_period',
    };

    this.persistState();
    return true;
  }

  public async restorePurchases(): Promise<PurchaseResult> {
    this.loadFromStorage();
    return {
      success: this.state.tier === 'prime' && this.isAdFree(),
      state: this.getState(),
    };
  }

  public async wipeData(): Promise<void> {
    this.state = { ...DEFAULT_STATE };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Memory fallback
    }
    this.notifyListeners();
  }

  public getPlanDetails(): SubscriptionPlanDetails {
    return {
      id: 'transitwake_prime_monthly',
      name: 'TransitWake Prime',
      priceFormatted: '₹26/month',
      priceInr: 26,
      period: 'Monthly',
      description: 'Ad-free transit experience with priority updates and instant geofence alerts.',
      features: [
        'Complete ad removal (zero banner and interstitial ads)',
        'Full 14-day statutory refund guarantee',
        'Transparent 1-tap cancellation with no exit barriers',
        'Directly supports independent transit software',
      ],
      refundTerms: '14-day refund window honored via store support or direct contact.',
    };
  }

  public setTestExpiration(expiresAt: number) {
    this.state = {
      ...this.state,
      expiresAt,
    };
    this.state = this.evaluateExpiration(this.state);
    this.persistState();
  }

  public async resetForTesting(): Promise<void> {
    this.listeners.clear();
    await this.wipeData();
  }
}

export const subscriptionService = new SubscriptionService();
