import { subscriptionService } from '../src/services/subscriptionService';

describe('student referral 2-peer unlock suite', () => {
  beforeEach(async () => {
    await subscriptionService.resetForTesting();
  });

  it('initializes with a valid anonymous referral code and zero redemptions', () => {
    const state = subscriptionService.getReferralState();
    expect(state.myReferralCode).toMatch(/^TW-[A-Z0-9]{4}$/);
    expect(state.redeemedCount).toBe(0);
    expect(state.requiredForUnlock).toBe(2);
    expect(state.semesterPassUnlocked).toBe(false);
  });

  it('rejects redeeming ones own referral code', async () => {
    const state = subscriptionService.getReferralState();
    const result = await subscriptionService.redeemReferralCode(state.myReferralCode);

    expect(result.success).toBe(false);
    expect(result.message).toContain('cannot use your own referral code');
  });

  it('rejects short or empty invite codes', async () => {
    const result = await subscriptionService.redeemReferralCode('TW');
    expect(result.success).toBe(false);
    expect(result.message).toContain('valid invite code');
  });

  it('increments referral tally on first valid classmate code', async () => {
    const result = await subscriptionService.redeemReferralCode('TW-CLASSMATE1');
    expect(result.success).toBe(true);
    expect(result.message).toContain('1 of 2');

    const state = subscriptionService.getReferralState();
    expect(state.redeemedCount).toBe(1);
    expect(state.semesterPassUnlocked).toBe(false);
    expect(subscriptionService.isAdFree()).toBe(false);
  });

  it('rejects duplicate redemption of the same code', async () => {
    await subscriptionService.redeemReferralCode('TW-DUPLICATE');
    const duplicateResult = await subscriptionService.redeemReferralCode('TW-DUPLICATE');

    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.message).toContain('already been redeemed');
  });

  it('unlocks 180-day Prime semester pass on second classmate code', async () => {
    await subscriptionService.redeemReferralCode('TW-PEER1');
    const secondResult = await subscriptionService.redeemReferralCode('TW-PEER2');

    expect(secondResult.success).toBe(true);
    expect(secondResult.message).toContain('Student pass unlocked');

    const referralState = subscriptionService.getReferralState();
    expect(referralState.redeemedCount).toBe(2);
    expect(referralState.semesterPassUnlocked).toBe(true);
    expect(referralState.semesterPassExpiresAt).not.toBeNull();

    // Verify Prime subscription state
    const subState = subscriptionService.getState();
    expect(subState.tier).toBe('prime');
    expect(subState.status).toBe('active');
    expect(subState.productId).toBe('transitwake_student_semester_free');
    expect(subscriptionService.isAdFree()).toBe(true);
  });
});
