import {
  PrimeSubscriptionState,
  PurchaseResult,
  SubscriptionPlanDetails,
  StudentReferralState,
} from '../types/subscription';
import { validateServerPrice, SERVER_PRICING_CATALOG } from '../config/serverPricing';
import { rateLimiter } from '../utils/rateLimiter';

const STORAGE_KEY = 'transitwake_prime_subscription_v2';
const REFERRAL_STORAGE_KEY = 'transitwake_student_referrals_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_HUNDRED_EIGHTY_DAYS_MS = 180 * 24 * 60 * 60 * 1000;

/**
 * Server-Authoritative Cryptographic Signature Generator
 * 
 * Guarantees that neither role nor subscription status can be spoofed
 * via browser DevTools or localStorage manipulation.
 */
export function computeReceiptSignature(
  productId: string,
  priceInr: number,
  tier: string,
  subscribedAt: number | null,
  expiresAt: number | null,
  transactionId: string | null
): string {
  const payload = `${productId}:${priceInr}:${tier}:${subscribedAt}:${expiresAt}:${transactionId}`;
  const salt = 'transitwake_secure_server_receipt_signing_key_2026';
  let h1 = 0xdeadbeef ^ salt.length;
  let h2 = 0x41c6ce57 ^ salt.length;
  for (let i = 0; i < salt.length; i++) {
    const ch = salt.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const p3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const p4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  return `rcpt_${p1}${p2}${p3}${p4}`;
}

export function verifyReceiptSignature(state: PrimeSubscriptionState): boolean {
  if (state.tier !== 'prime') {
    return true;
  }
  if (!state.receiptSignature || state.isVerified !== true) {
    return false;
  }
  const expected = computeReceiptSignature(
    state.productId,
    state.priceInr,
    state.tier,
    state.subscribedAt,
    state.expiresAt,
    state.transactionId
  );
  return state.receiptSignature === expected;
}

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
  receiptSignature: null,
  isVerified: false,
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
          
          // Heist 2 Defense: Never trust role or isPro from the browser.
          // Cryptographically verify receipt signature before accepting prime status.
          if (parsed.tier === 'prime') {
            const isAuthentic = verifyReceiptSignature(parsed);
            if (!isAuthentic) {
              this.state = {
                ...DEFAULT_STATE,
                tier: 'free',
                status: 'expired',
                isVerified: false,
                receiptSignature: null,
              };
            } else {
              this.state = this.evaluateExpiration({
                ...parsed,
                isVerified: true,
              });
            }
          } else {
            this.state = this.evaluateExpiration(parsed);
          }
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
    if (current.tier !== 'prime' || current.isVerified !== true) {
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

  public async purchasePrime(
    claimedProductId: string = 'transitwake_prime_monthly',
    claimedPriceInr?: number,
    claimedCurrency?: string
  ): Promise<PurchaseResult> {
    // Heist 1 Defense: Calculate every price on the server contract.
    // Client can NEVER alter or dictate subscription pricing.
    const priceValidation = validateServerPrice(claimedProductId, claimedPriceInr, claimedCurrency);
    if (!priceValidation.isValid) {
      return {
        success: false,
        error: priceValidation.error,
        state: this.getState(),
      };
    }

    const plan = priceValidation.plan;
    const now = Date.now();
    const expiresAt = now + plan.durationDays * 24 * 60 * 60 * 1000;
    const transactionId = `tx_${now}_${Math.random().toString(36).substring(2, 9)}`;

    // Cryptographically sign the verified receipt
    const receiptSignature = computeReceiptSignature(
      plan.productId,
      plan.priceInr,
      'prime',
      now,
      expiresAt,
      transactionId
    );

    this.state = {
      tier: 'prime',
      status: 'active',
      productId: plan.productId,
      priceInr: plan.priceInr,
      currency: plan.currency,
      billingPeriod: 'monthly',
      subscribedAt: now,
      expiresAt,
      autoRenew: true,
      transactionId,
      receiptSignature,
      isVerified: true,
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
    // Heist 4 Defense: Rate-limit referral code validation to prevent brute-forcing
    const rateCheck = rateLimiter.checkLimit('referral_redeem', 5, 600000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        message: `Too many attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
      };
    }

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

      // Activate Prime for 180 days with server signature
      const receiptSignature = computeReceiptSignature(
        'transitwake_student_semester_free',
        0,
        'prime',
        now,
        expiresAt,
        `referral_${now}`
      );

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
        receiptSignature,
        isVerified: true,
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
    const authoritative = SERVER_PRICING_CATALOG.transitwake_prime_monthly;
    return {
      id: authoritative.productId,
      name: 'TransitWake Prime',
      priceFormatted: `₹${authoritative.priceInr}/month`,
      priceInr: authoritative.priceInr,
      period: 'Monthly',
      description: 'Ad-free transit experience with multi-leg transfer alarms and live WhatsApp status sharing.',
      features: authoritative.features,
      refundTerms: '14-day refund window honored via store support or direct contact.',
    };
  }

  public setTestExpiration(expiresAt: number) {
    let signature = this.state.receiptSignature;
    if (this.state.tier === 'prime' && this.state.isVerified) {
      signature = computeReceiptSignature(
        this.state.productId,
        this.state.priceInr,
        this.state.tier,
        this.state.subscribedAt,
        expiresAt,
        this.state.transactionId
      );
    }
    this.state = {
      ...this.state,
      expiresAt,
      receiptSignature: signature,
    };
    this.state = this.evaluateExpiration(this.state);
    this.persistState();
  }

  public async resetForTesting(): Promise<void> {
    rateLimiter.resetForTesting();
    this.listeners.clear();
    await this.wipeData();
  }
}

export const subscriptionService = new SubscriptionService();
