import fs from 'fs';
import path from 'path';
import { subscriptionService, computeReceiptSignature, verifyReceiptSignature } from '../src/services/subscriptionService';
import { validateServerPrice, SERVER_PRICING_CATALOG } from '../src/config/serverPricing';
import { rateLimiter } from '../src/utils/rateLimiter';
import { routeManager } from '../src/services/routeManager';
import { authService } from '../src/services/authService';

describe('Security Audit — 6 Critical Heists Remediation', () => {
  beforeEach(async () => {
    rateLimiter.resetForTesting();
    await subscriptionService.resetForTesting();
    await routeManager.resetForTesting();
    await authService.resetForTesting();
  });

  afterEach(async () => {
    rateLimiter.resetForTesting();
    await subscriptionService.resetForTesting();
    await routeManager.resetForTesting();
    await authService.resetForTesting();
  });

  // =========================================================================
  // Heist 1: Calculate every price on the server
  // =========================================================================
  describe('Heist 1: Server-Authoritative Pricing Contract', () => {
    it('accepts legitimate server-catalog price (₹26/month)', () => {
      const result = validateServerPrice('transitwake_prime_monthly', 26, 'INR');
      expect(result.isValid).toBe(true);
      expect(result.plan.priceInr).toBe(26);
    });

    it('rejects client-side price tampering (e.g. ₹1 or ₹0)', () => {
      const result = validateServerPrice('transitwake_prime_monthly', 1, 'INR');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Price tampering detected');
    });

    it('rejects unknown product IDs', () => {
      const result = validateServerPrice('fraudulent_free_tier', 0, 'INR');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unknown product ID');
    });

    it('blocks purchase attempt in subscriptionService when claimed price differs from server', async () => {
      const purchaseRes = await subscriptionService.purchasePrime('transitwake_prime_monthly', 5);
      expect(purchaseRes.success).toBe(false);
      expect(purchaseRes.error).toContain('Price tampering detected');
      expect(subscriptionService.isAdFree()).toBe(false);
    });
  });

  // =========================================================================
  // Heist 2: Never trust role or isPro from the browser
  // =========================================================================
  describe('Heist 2: Cryptographic Receipt & Anti-Tamper Entitlement', () => {
    it('grants ad-free access only when receipt signature is cryptographically verified', async () => {
      const purchase = await subscriptionService.purchasePrime();
      expect(purchase.success).toBe(true);
      expect(purchase.state.isVerified).toBe(true);
      expect(purchase.state.receiptSignature).toBeDefined();
      expect(subscriptionService.isAdFree()).toBe(true);
    });

    it('rejects forged localStorage injection that lacks valid cryptographic signature', async () => {
      // Simulate attacker opening DevTools and forging localStorage state
      const forgedState = {
        tier: 'prime',
        status: 'active',
        productId: 'transitwake_prime_monthly',
        priceInr: 26,
        currency: 'INR',
        billingPeriod: 'monthly',
        subscribedAt: Date.now(),
        expiresAt: Date.now() + 1000000000,
        autoRenew: true,
        transactionId: 'tx_hacked_free',
        receiptSignature: 'fake_signature_123',
        isVerified: true,
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('transitwake_prime_subscription_v2', JSON.stringify(forgedState));
      }

      // Re-trigger restoration / load
      await subscriptionService.restorePurchases();
      const state = subscriptionService.getState();

      // Tampered state must be downgraded to free
      expect(state.tier).toBe('free');
      expect(state.isVerified).toBe(false);
      expect(subscriptionService.isAdFree()).toBe(false);
    });

    it('detects tampering when subscription payload parameters are altered', () => {
      const now = Date.now();
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000;
      const genuineSig = computeReceiptSignature(
        'transitwake_prime_monthly',
        26,
        'prime',
        now,
        expiresAt,
        'tx_original_123'
      );

      const genuineState = {
        tier: 'prime' as const,
        status: 'active' as const,
        productId: 'transitwake_prime_monthly',
        priceInr: 26,
        currency: 'INR',
        billingPeriod: 'monthly' as const,
        subscribedAt: now,
        expiresAt,
        autoRenew: true,
        transactionId: 'tx_original_123',
        receiptSignature: genuineSig,
        isVerified: true,
      };

      expect(verifyReceiptSignature(genuineState)).toBe(true);

      // Attacker extends expiration date by 1 year
      const tamperedState = {
        ...genuineState,
        expiresAt: expiresAt + 365 * 24 * 60 * 60 * 1000,
      };

      expect(verifyReceiptSignature(tamperedState)).toBe(false);
    });
  });

  // =========================================================================
  // Heist 3: Turn on RLS for every table
  // =========================================================================
  describe('Heist 3: Row Level Security (RLS) Coverage', () => {
    it('verifies RLS migration file enforces RLS on all tables with FORCE RLS', () => {
      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20261107000000_enable_rls.sql');
      expect(fs.existsSync(migrationPath)).toBe(true);

      const sql = fs.readFileSync(migrationPath, 'utf8');

      const expectedTables = [
        'user_profiles',
        'subscriptions',
        'student_referrals',
        'commute_presets',
        'audit_logs',
      ];

      for (const table of expectedTables) {
        expect(sql).toContain(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
        expect(sql).toContain(`ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;`);
      }

      // Check for user-scoped policies
      expect(sql).toContain('auth.uid() = id');
      expect(sql).toContain('auth.uid() = user_id');
      expect(sql).toContain('SECURITY DEFINER');
    });
  });

  // =========================================================================
  // Heist 4: Rate-limit every form that sends email / external action
  // =========================================================================
  describe('Heist 4: Sliding-Window Rate Limiting', () => {
    it('permits calls within threshold and throttles once exceeded', () => {
      const key = 'contact_email_user_1';
      const maxAttempts = 3;
      const windowMs = 60000;

      // 3 attempts succeed
      expect(rateLimiter.checkLimit(key, maxAttempts, windowMs).allowed).toBe(true);
      expect(rateLimiter.checkLimit(key, maxAttempts, windowMs).allowed).toBe(true);
      expect(rateLimiter.checkLimit(key, maxAttempts, windowMs).allowed).toBe(true);

      // 4th attempt is throttled
      const blocked = rateLimiter.checkLimit(key, maxAttempts, windowMs);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('enforces rate limit on referral code redemption to prevent brute-forcing', async () => {
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        attempts.push(await subscriptionService.redeemReferralCode(`FAKE${i}`));
      }

      // 6th attempt must be blocked by rate limiter
      const blockedAttempt = await subscriptionService.redeemReferralCode('FAKE6');
      expect(blockedAttempt.success).toBe(false);
      expect(blockedAttempt.message).toContain('Too many attempts');
    });
  });

  // =========================================================================
  // Heist 5: Check who owns it before update or delete
  // =========================================================================
  describe('Heist 5: Ownership Validation (Anti-IDOR)', () => {
    it('allows owner to update and delete their own commute preset', () => {
      const currentUserId = authService.getCurrentUser().id;

      const preset = routeManager.createPreset({
        name: 'My Morning Route',
        originName: 'Indiranagar',
        originCoords: { latitude: 12.97, longitude: 77.64 },
        destinationName: 'Whitefield',
        destinationCoords: { latitude: 12.96, longitude: 77.74 },
        radiusKm: 3.0,
      });

      expect(preset.userId).toBe(currentUserId);

      // Owner can update
      const updated = routeManager.updatePreset(preset.id, { radiusKm: 4.5 });
      expect(updated.radiusKm).toBe(4.5);

      // Owner can delete
      const deleted = routeManager.deletePreset(preset.id);
      expect(deleted).toBe(true);
    });

    it('throws access denied when another user attempts to mutate or delete a preset', () => {
      // Create preset belonging to user_alice
      const presetAlice = routeManager.createPreset({
        name: 'Alice Private Commute',
        originName: 'Home',
        originCoords: { latitude: 12.9, longitude: 77.6 },
        destinationName: 'Office',
        destinationCoords: { latitude: 12.95, longitude: 77.65 },
        radiusKm: 2.0,
        userId: 'user_alice_123',
      });

      // Current user is guest or user_bob (not alice)
      expect(authService.getCurrentUser().id).not.toBe('user_alice_123');

      // Attempt update by non-owner must throw
      expect(() => {
        routeManager.updatePreset(presetAlice.id, { name: 'Hacked Commute' });
      }).toThrow(/Access denied/);

      // Attempt delete by non-owner must throw
      expect(() => {
        routeManager.deletePreset(presetAlice.id);
      }).toThrow(/Access denied/);
    });
  });

  // =========================================================================
  // Heist 6: Keep secret keys out of the frontend
  // =========================================================================
  describe('Heist 6: Zero Secret Keys in Client Bundle', () => {
    it('verifies that no sensitive private keys exist in src directory', () => {
      const srcDir = path.join(__dirname, '..', 'src');
      const sensitivePatterns = [
        /sk_live_[0-9a-zA-Z]{24}/,
        /rzp_live_[0-9a-zA-Z]{14}/,
        /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
      ];

      function scan(dir: string) {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            scan(fullPath);
          } else if (/\.(ts|tsx|js|json)$/.test(file.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const pattern of sensitivePatterns) {
              expect(pattern.test(content)).toBe(false);
            }
          }
        }
      }

      scan(srcDir);
    });
  });
});
