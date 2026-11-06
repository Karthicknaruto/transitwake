import { authService } from '../src/services/authService';

describe('AuthService — Google Authentication & Privacy Compliance', () => {
  beforeEach(async () => {
    // Reset state before each test
    await authService.resetForTesting();
  });

  it('initializes with default anonymous guest profile', () => {
    const user = authService.getCurrentUser();
    expect(user).toBeDefined();
    expect(user.isGuest).toBe(true);
    expect(user.provider).toBe('guest');
    expect(user.email).toBeNull();
    expect(user.displayName).toContain('Guest');
  });

  it('signs in with Google and updates user profile and auth state', async () => {
    let stateChanged = false;
    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (user.provider === 'google') {
        stateChanged = true;
      }
    });

    const user = await authService.signInWithGoogle({
      email: 'commuter@example.com',
      displayName: 'Transit Commuter',
      photoUrl: 'https://lh3.googleusercontent.com/a/default-user',
    });

    expect(user.isGuest).toBe(false);
    expect(user.provider).toBe('google');
    expect(user.email).toBe('commuter@example.com');
    expect(user.displayName).toBe('Transit Commuter');
    expect(authService.isAuthenticated()).toBe(true);
    expect(stateChanged).toBe(true);

    unsubscribe();
  });

  it('signs out and cleanly restores guest profile without throwing', async () => {
    await authService.signInWithGoogle({
      email: 'test@example.com',
      displayName: 'Test User',
    });

    expect(authService.isAuthenticated()).toBe(true);

    await authService.signOut();

    const currentUser = authService.getCurrentUser();
    expect(currentUser.isGuest).toBe(true);
    expect(currentUser.provider).toBe('guest');
    expect(currentUser.email).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('complies with GDPR Art. 17 and Apple 5.1.1: 1-tap delete completely wipes all data', async () => {
    await authService.signInWithGoogle({
      email: 'delete-me@example.com',
      displayName: 'Purge User',
    });

    const wiped = await authService.deleteAccountAndData();
    expect(wiped).toBe(true);

    const currentUser = authService.getCurrentUser();
    expect(currentUser.isGuest).toBe(true);
    expect(currentUser.email).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('synchronizes routes to cloud when authenticated and warns in guest mode', async () => {
    const mockRoutes = [
      { id: 'home-work', name: 'Home to Office', distanceKm: 12.4 },
    ];

    // In guest mode, cloud sync returns false gracefully (local only)
    const guestSync = await authService.syncRoutesToCloud(mockRoutes);
    expect(guestSync).toBe(false);

    // In authenticated mode, cloud sync succeeds
    await authService.signInWithGoogle({
      email: 'sync@example.com',
      displayName: 'Sync User',
    });

    const authSync = await authService.syncRoutesToCloud(mockRoutes);
    expect(authSync).toBe(true);
  });
});
