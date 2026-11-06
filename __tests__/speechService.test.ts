import { speechService } from '../src/services/speechService';

describe('SpeechService — Earphone Voice Station Announcements', () => {
  beforeEach(() => {
    speechService.resetForTesting();
  });

  it('initializes in unmuted state with TTS enabled', () => {
    expect(speechService.isMuted()).toBe(false);
  });

  it('triggers voice announcement at 10km milestone', async () => {
    const spoken = await speechService.checkMilestoneAndSpeak({
      destinationName: 'Indiranagar Metro',
      distanceKm: 9.8,
      radiusKm: 4.0,
    });

    expect(spoken).toBe(true);
    expect(speechService.getLastSpokenMilestone()).toBe('10KM');
  });

  it('prevents repeating the same milestone consecutively (deduplication)', async () => {
    // First call triggers
    await speechService.checkMilestoneAndSpeak({
      destinationName: 'Indiranagar Metro',
      distanceKm: 9.8,
      radiusKm: 4.0,
    });

    // Second call at 9.7 km should NOT duplicate
    const secondCall = await speechService.checkMilestoneAndSpeak({
      destinationName: 'Indiranagar Metro',
      distanceKm: 9.7,
      radiusKm: 4.0,
    });

    expect(secondCall).toBe(false);
  });

  it('triggers arrival alarm zone voice callout at or under radius threshold', async () => {
    const spoken = await speechService.checkMilestoneAndSpeak({
      destinationName: 'Indiranagar Metro',
      distanceKm: 3.8,
      radiusKm: 4.0,
    });

    expect(spoken).toBe(true);
    expect(speechService.getLastSpokenMilestone()).toBe('ARRIVAL_ZONE');
  });

  it('suppresses speech synthesis when muted by user', async () => {
    speechService.setMuted(true);
    expect(speechService.isMuted()).toBe(true);

    const spoken = await speechService.checkMilestoneAndSpeak({
      destinationName: 'Indiranagar Metro',
      distanceKm: 3.8,
      radiusKm: 4.0,
    });

    expect(spoken).toBe(false);
  });

  it('resets milestone memory when starting a new trip', async () => {
    await speechService.checkMilestoneAndSpeak({
      destinationName: 'First Stop',
      distanceKm: 3.8,
      radiusKm: 4.0,
    });

    speechService.resetMilestones();
    expect(speechService.getLastSpokenMilestone()).toBeNull();
  });
});
