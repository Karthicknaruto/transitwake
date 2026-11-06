import { consentStore } from '../src/services/consentStore';

describe('ConsentStore & Data Protection (Items 5, 6, 7, 17, 18, 20)', () => {
  beforeEach(() => {
    consentStore.eraseAllDataAndReset();
  });

  it('initializes with privacy-first defaults (essential only)', () => {
    const prefs = consentStore.getPreferences();
    expect(prefs.essentialOnly).toBe(true);
    expect(prefs.allowAnalyticsTelemetry).toBe(false);
    expect(prefs.soundAlertsEnabled).toBe(true);
    expect(prefs.vibrationAlertsEnabled).toBe(true);
  });

  it('updates preferences when user accepts essential only', () => {
    consentStore.acceptEssentialOnly();
    const prefs = consentStore.getPreferences();
    expect(prefs.hasAnsweredConsent).toBe(true);
    expect(prefs.essentialOnly).toBe(true);
    expect(prefs.allowAnalyticsTelemetry).toBe(false);
  });

  it('updates preferences when user accepts all', () => {
    consentStore.acceptAll();
    const prefs = consentStore.getPreferences();
    expect(prefs.hasAnsweredConsent).toBe(true);
    expect(prefs.essentialOnly).toBe(false);
    expect(prefs.allowAnalyticsTelemetry).toBe(true);
  });

  it('supports granular notification and alert opt-outs (Item 18)', () => {
    consentStore.updatePreferences({
      soundAlertsEnabled: false,
      notificationsEnabled: false,
    });
    const prefs = consentStore.getPreferences();
    expect(prefs.soundAlertsEnabled).toBe(false);
    expect(prefs.notificationsEnabled).toBe(false);
    expect(prefs.vibrationAlertsEnabled).toBe(true);
  });

  it('notifies subscribers when preferences change and supports unsubscribe', () => {
    const mockListener = jest.fn();
    const unsubscribe = consentStore.subscribe(mockListener);

    // Initial call on subscribe
    expect(mockListener).toHaveBeenCalled();

    // Trigger update
    consentStore.updatePreferences({ isAboveAgeConsent: true });
    expect(mockListener).toHaveBeenCalledTimes(2);

    // Unsubscribe
    unsubscribe();
    consentStore.updatePreferences({ soundAlertsEnabled: false });
    expect(mockListener).toHaveBeenCalledTimes(2); // no further calls
  });

  it('executes self-service local data erasure (Item 20 - Apple 5.1.1 & Google Play)', () => {
    consentStore.updatePreferences({
      allowAnalyticsTelemetry: true,
      hasAnsweredConsent: true,
    });
    expect(consentStore.getPreferences().allowAnalyticsTelemetry).toBe(true);

    const wiped = consentStore.eraseAllDataAndReset();
    expect(wiped).toBe(true);

    const resetPrefs = consentStore.getPreferences();
    expect(resetPrefs.hasAnsweredConsent).toBe(false);
    expect(resetPrefs.essentialOnly).toBe(true);
    expect(resetPrefs.allowAnalyticsTelemetry).toBe(false);
  });
});
