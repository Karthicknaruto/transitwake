import { subscriptionService } from '../src/services/subscriptionService';
import { PrimeSubscriptionState } from '../src/types/subscription';

describe('SubscriptionService', () => {
  beforeEach(async () => {
    await subscriptionService.resetForTesting();
  });

  afterEach(async () => {
    await subscriptionService.resetForTesting();
  });

  test('initializes with default free state and ads enabled', () => {
    const state = subscriptionService.getState();
    expect(state.tier).toBe('free');
    expect(state.status).toBe('none');
    expect(state.priceInr).toBe(26);
    expect(state.currency).toBe('INR');
    expect(state.autoRenew).toBe(false);
    expect(state.subscribedAt).toBeNull();
    expect(state.expiresAt).toBeNull();
    expect(subscriptionService.isAdFree()).toBe(false);
  });

  test('purchasePrime activates monthly subscription at 26 rupees', async () => {
    const beforePurchase = Date.now();
    const result = await subscriptionService.purchasePrime();

    expect(result.success).toBe(true);
    expect(result.state.tier).toBe('prime');
    expect(result.state.status).toBe('active');
    expect(result.state.priceInr).toBe(26);
    expect(result.state.autoRenew).toBe(true);
    expect(result.state.transactionId).toBeDefined();
    expect(result.state.transactionId).toMatch(/^tx_/);
    expect(result.state.subscribedAt).toBeGreaterThanOrEqual(beforePurchase);

    // Renewal date is approximately 30 days in future
    const expectedExpiry = (result.state.subscribedAt || 0) + 30 * 24 * 60 * 60 * 1000;
    expect(result.state.expiresAt).toBe(expectedExpiry);
    expect(subscriptionService.isAdFree()).toBe(true);
  });

  test('cancelSubscription disables autoRenew and retains benefits during grace period', async () => {
    await subscriptionService.purchasePrime();
    expect(subscriptionService.isAdFree()).toBe(true);

    const cancelled = await subscriptionService.cancelSubscription();
    expect(cancelled).toBe(true);

    const state = subscriptionService.getState();
    expect(state.autoRenew).toBe(false);
    expect(state.status).toBe('cancelled_grace_period');
    // Fair practice / zero dark pattern: paid period is retained until expiration
    expect(subscriptionService.isAdFree()).toBe(true);
  });

  test('expired subscription revokes ad-free privilege', async () => {
    await subscriptionService.purchasePrime();

    // Fast-forward expiration into the past
    const pastExpiry = Date.now() - 5000;
    subscriptionService.setTestExpiration(pastExpiry);

    expect(subscriptionService.isAdFree()).toBe(false);
    expect(subscriptionService.getState().status).toBe('expired');
  });

  test('restorePurchases restores active subscription from storage', async () => {
    await subscriptionService.purchasePrime();
    const restored = await subscriptionService.restorePurchases();

    expect(restored.success).toBe(true);
    expect(restored.state.tier).toBe('prime');
    expect(restored.state.status).toBe('active');
    expect(subscriptionService.isAdFree()).toBe(true);
  });

  test('subscribes listeners and notifies them on state transitions', async () => {
    const listener = jest.fn();
    const unsubscribe = subscriptionService.subscribe(listener);

    await subscriptionService.purchasePrime();
    expect(listener).toHaveBeenCalled();
    const lastCallState: PrimeSubscriptionState = listener.mock.calls[listener.mock.calls.length - 1][0];
    expect(lastCallState.tier).toBe('prime');

    unsubscribe();
    await subscriptionService.cancelSubscription();
    // Listener should not receive further calls after unsubscription
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('wipeData clears subscription and restores free mode', async () => {
    await subscriptionService.purchasePrime();
    expect(subscriptionService.isAdFree()).toBe(true);

    await subscriptionService.wipeData();
    expect(subscriptionService.isAdFree()).toBe(false);
    expect(subscriptionService.getState().tier).toBe('free');
  });

  test('getPlanDetails returns accurate 26 rupees per month terms', () => {
    const plan = subscriptionService.getPlanDetails();
    expect(plan.id).toBe('transitwake_prime_monthly');
    expect(plan.priceInr).toBe(26);
    expect(plan.priceFormatted).toContain('26');
    expect(plan.refundTerms).toContain('14');
    expect(plan.features.length).toBeGreaterThan(0);
  });
});
