import {
  PrimeSubscriptionState,
  PurchaseResult,
  SubscriptionPlanDetails,
  StudentReferralState,
} from '../types/subscription';

const STORAGE_KEY = 'transitwake_prime_subscription_v2';
const REFERRAL_STORAGE_KEY = 'transitwake_student_referrals_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_HUNDRED_EIGHTY_DAYS_MS = 180 * 24 * 60 * 60 * 1000;

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

const DEFAULT_REFERRAL_STATE: StudentReferralState = {
  myReferralCode: 'TW-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
  redeemedCount: 0,
  requiredForUnlock: 2,
  semesterPassUnlocked: false,
  semesterPassExpiresAt: null,
  history: [],
};

type SubscriptionListener = (state: PrimeSubscriptionState) => void;

class SubscriptionService {
  private state: PrimeSubscriptionState = { ...DEFAULT_STATE };
  private referralState: StudentReferralState = { ...DEFAULT_REFERRAL_STATE };
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
        }

        const storedReferral = window.localStorage.getItem(REFERRAL_STORAGE_KEY);
        if (storedReferral) {
          this.referralState = JSON.parse(storedReferral);
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
        window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(this.referralState));
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

  public getReferralState(): StudentReferralState {
    return { ...this.referralState };
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

  /**
   * Redeems a classmate's invite code to unlock the student referral pass.
   */
  public async redeemReferralCode(code: string): Promise<{ success: boolean; message: string }> {
    const normalized = code.trim().toUpperCase();
    if (!normalized || normalized.length < 4) {
      return { success: false, message: 'Please enter a valid invite code.' };
    }

    if (normalized === this.referralState.myReferralCode) {
      return { success: false, message: 'You cannot use your own referral code.' };
    }

    if (this.referralState.history.includes(normalized)) {
      return { success: false, message: 'This code has already been redeemed on this device.' };
    }

    const nextCount = this.referralState.redeemedCount + 1;
    const history = [...this.referralState.history, normalized];

    let unlocked = this.referralState.semesterPassUnlocked;
    let expiresAt = this.referralState.semesterPassExpiresAt;

    if (nextCount >= this.referralState.requiredForUnlock) {
      unlocked = true;
      const now = Date.now();
      expiresAt = now + ONE_HUNDRED_EIGHTY_DAYS_MS;

      // Activate Prime for 180 days
      this.state = {
        tier: 'prime',
        status: 'active',
        productId: 'transitwake_student_semester_free',
        priceInr: 0,
        currency: 'INR',
        billingPeriod: 'monthly',
        subscribedAt: now,
        expiresAt,
        autoRenew: false,
        transactionId: `referral_${now}`,
      };
    }

    this.referralState = {
      ...this.referralState,
      redeemedCount: nextCount,
      history,
      semesterPassUnlocked: unlocked,
      semesterPassExpiresAt: expiresAt,
    };

    this.persistState();

    if (unlocked) {
      return {
        success: true,
        message: 'Student pass unlocked. 6 months of ad-free TransitWake Prime activated.',
      };
    }

    return {
      success: true,
      message: `Referral registered (1 of 2). Invite one more classmate to unlock your free semester pass.`,
    };
  }

  public async wipeData(): Promise<void> {
    this.state = { ...DEFAULT_STATE };
    this.referralState = {
      ...DEFAULT_REFERRAL_STATE,
      myReferralCode: 'TW-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
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
      description: 'Ad-free transit experience with multi-leg transfer alarms and live WhatsApp status sharing.',
      features: [
        'Complete ad removal (zero banner and interstitial ads)',
        'Multi-leg intermediate interchange transfer alarms',
        '1-tap WhatsApp peace of mind live arrival link',
        'Full 14-day statutory refund guarantee',
        'Transparent 1-tap cancellation with no exit barriers',
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
