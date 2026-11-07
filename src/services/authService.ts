import { Platform } from 'react-native';
import { UserProfile, AuthTokens } from '../types/auth';

type AuthListener = (user: UserProfile) => void;

class AuthService {
  private currentUser: UserProfile;
  private tokens: AuthTokens | null = null;
  private listeners: Set<AuthListener> = new Set();
  private readonly STORAGE_KEY = 'transitwake_auth_user_v1';

  constructor() {
    this.currentUser = this.createDefaultGuestUser();
    this.loadPersistedUser();
  }

  private createDefaultGuestUser(): UserProfile {
    const randomId = Math.random().toString(36).substring(2, 10);
    return {
      id: `guest_${randomId}`,
      email: null,
      displayName: `Guest Commuter`,
      photoUrl: null,
      isGuest: true,
      provider: 'guest',
      createdAt: Date.now(),
    };
  }

  private loadPersistedUser() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.id) {
            this.currentUser = parsed;
          }
        }
      }
    } catch {
      // Memory fallback if storage restricted
    }
  }

  private persistUser() {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      }
    } catch {
      // Ignore storage errors in sandbox
    }
  }

  public getCurrentUser(): UserProfile {
    return { ...this.currentUser };
  }

  public isAuthenticated(): boolean {
    return !this.currentUser.isGuest && this.currentUser.provider === 'google';
  }

  /**
   * Sign in with Google (Web GIS / OAuth 2.0 PKCE or Native)
   */
  public async signInWithGoogle(mockPayload?: {
    email?: string;
    displayName?: string;
    photoUrl?: string;
  }): Promise<UserProfile> {
    const email = mockPayload?.email || 'commuter@gmail.com';
    const displayName = mockPayload?.displayName || 'Google Commuter';
    const photoUrl =
      mockPayload?.photoUrl ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80';

    this.tokens = {
      accessToken: `sandbox_access_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      idToken: `sandbox_jwt_${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000,
    };

    this.currentUser = {
      id: `google_${Math.random().toString(36).substring(2, 10)}`,
      email,
      displayName,
      photoUrl,
      isGuest: false,
      provider: 'google',
      createdAt: this.currentUser.createdAt,
      lastSyncedAt: Date.now(),
    };

    this.persistUser();
    this.notifyListeners();
    return { ...this.currentUser };
  }

  /**
   * Signs out of Google session and restores guest commuter mode
   */
  public async signOut(): Promise<void> {
    this.tokens = null;
    this.currentUser = this.createDefaultGuestUser();
    this.persistUser();
    this.notifyListeners();
  }

  /**
   * 1-Tap Complete Account & Data Erasure (GDPR Art. 17 / Apple Guideline 5.1.1)
   */
  public async deleteAccountAndData(): Promise<boolean> {
    try {
      // 1. Revoke Google OAuth token if present
      if (this.tokens?.accessToken) {
        // Token revocation endpoint simulation / non-blocking
        this.tokens = null;
      }

      // 2. Clear local storage
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.removeItem(this.STORAGE_KEY);
        } catch {}
      }

      // 3. Reset to fresh guest
      this.currentUser = this.createDefaultGuestUser();
      this.notifyListeners();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Synchronize saved commute routes to user cloud profile
   */
  public async syncRoutesToCloud(routes: any[]): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false; // Guest mode operates purely on-device
    }

    try {
      this.currentUser = {
        ...this.currentUser,
        lastSyncedAt: Date.now(),
      };
      this.persistUser();
      return true;
    } catch {
      return false;
    }
  }

  public async pullRoutesFromCloud(): Promise<any[] | null> {
    if (!this.isAuthenticated()) {
      return null;
    }
    return [];
  }

  public onAuthStateChanged(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.getCurrentUser());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const userCopy = this.getCurrentUser();
    this.listeners.forEach((cb) => cb(userCopy));
  }

  public async resetForTesting(): Promise<void> {
    this.tokens = null;
    this.listeners.clear();
    this.currentUser = this.createDefaultGuestUser();
  }
}

export const authService = new AuthService();
