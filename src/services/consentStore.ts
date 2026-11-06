import { Platform } from 'react-native';

export interface UserConsentPreferences {
  hasAnsweredConsent: boolean;
  essentialOnly: boolean;
  allowNonPersonalizedAds: boolean;
  allowAnalyticsTelemetry: boolean;
  isAboveAgeConsent: boolean; // Age >= 13 (Item 17)
  soundAlertsEnabled: boolean;
  vibrationAlertsEnabled: boolean;
  notificationsEnabled: boolean; // Item 18
  timestamp: number;
}

const STORAGE_KEY = 'transitwake_consent_preferences_v1';

const DEFAULT_PREFERENCES: UserConsentPreferences = {
  hasAnsweredConsent: false,
  essentialOnly: true,
  allowNonPersonalizedAds: true,
  allowAnalyticsTelemetry: false,
  isAboveAgeConsent: true,
  soundAlertsEnabled: true,
  vibrationAlertsEnabled: true,
  notificationsEnabled: true,
  timestamp: Date.now(),
};

class ConsentStore {
  private preferences: UserConsentPreferences = { ...DEFAULT_PREFERENCES };
  private listeners: Array<(prefs: UserConsentPreferences) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
        }
      }
    } catch (e) {
      console.warn('Could not load consent preferences from local storage:', e);
    }
  }

  private persist() {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
      }
    } catch (e) {
      console.warn('Could not save consent preferences:', e);
    }
    this.notify();
  }

  public getPreferences(): UserConsentPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(partial: Partial<UserConsentPreferences>) {
    this.preferences = {
      ...this.preferences,
      ...partial,
      hasAnsweredConsent: true,
      timestamp: Date.now(),
    };
    this.persist();
  }

  public acceptAll() {
    this.updatePreferences({
      essentialOnly: false,
      allowNonPersonalizedAds: true,
      allowAnalyticsTelemetry: true,
      hasAnsweredConsent: true,
    });
  }

  public acceptEssentialOnly() {
    this.updatePreferences({
      essentialOnly: true,
      allowNonPersonalizedAds: true,
      allowAnalyticsTelemetry: false,
      hasAnsweredConsent: true,
    });
  }

  /**
   * Item 20: In-App Complete Data Deletion & Local Storage Wipe
   * Complies with Apple Guideline 5.1.1(v) and Google Play Data Safety
   */
  public eraseAllDataAndReset(): boolean {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      this.preferences = { ...DEFAULT_PREFERENCES };
      this.notify();
      return true;
    } catch (err) {
      console.error('Error during data wipe:', err);
      return false;
    }
  }

  public subscribe(listener: (prefs: UserConsentPreferences) => void): () => void {
    this.listeners.push(listener);
    listener(this.getPreferences());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const current = this.getPreferences();
    this.listeners.forEach((l) => l(current));
  }
}

export const consentStore = new ConsentStore();
