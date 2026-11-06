import { routeManager } from '../src/services/routeManager';

describe('RouteManager — 1-Tap Daily Commute Presets & Inversion', () => {
  beforeEach(async () => {
    await routeManager.resetForTesting();
  });

  it('provides default daily commute preset (Home <-> Work)', () => {
    const presets = routeManager.getPresets();
    expect(presets.length).toBeGreaterThan(0);
    const active = routeManager.getActivePreset();
    expect(active).toBeDefined();
    expect(active?.originName).toBeDefined();
    expect(active?.destinationName).toBeDefined();
  });

  it('inverts origin and destination with 1-tap route flip', () => {
    const initial = routeManager.getActivePreset();
    expect(initial).toBeDefined();
    if (!initial) return;

    const initialOrigin = initial.originName;
    const initialDest = initial.destinationName;
    const initialDirection = initial.direction;

    const flipped = routeManager.flipCurrentRoute();
    expect(flipped.originName).toBe(initialDest);
    expect(flipped.destinationName).toBe(initialOrigin);
    expect(flipped.direction).toBe(initialDirection === 'OUTBOUND' ? 'RETURN' : 'OUTBOUND');
  });

  it('creates and saves new custom commute preset', () => {
    const newPreset = routeManager.createPreset({
      name: 'Campus Commute',
      originName: 'Dormitory',
      originCoords: { latitude: 12.935, longitude: 77.624 },
      destinationName: 'Engineering Lab',
      destinationCoords: { latitude: 12.971, longitude: 77.594 },
      radiusKm: 3.5,
    });

    expect(newPreset.id).toBeDefined();
    expect(routeManager.getPresets().some((p) => p.name === 'Campus Commute')).toBe(true);
  });

  it('switches active preset cleanly', () => {
    const created = routeManager.createPreset({
      name: 'Gym Route',
      originName: 'Home',
      originCoords: { latitude: 12.9, longitude: 77.6 },
      destinationName: 'Fitness Center',
      destinationCoords: { latitude: 12.95, longitude: 77.65 },
      radiusKm: 2.0,
    });

    routeManager.setActivePreset(created.id);
    expect(routeManager.getActivePreset()?.id).toBe(created.id);
  });
});
