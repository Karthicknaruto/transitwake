export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string;
  photoUrl: string | null;
  isGuest: boolean;
  provider: 'guest' | 'google';
  createdAt: number;
  lastSyncedAt?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
}

export interface AuthState {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
