import { alarmManager } from '../src/services/alarmManager';
import { adService } from '../src/services/adService';
import { Vibration, Platform } from 'react-native';

describe('AlarmManager Safety & Audio/Vibration Execution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    alarmManager.stopAlarm(false);
    adService.resetForTesting();
  });

  afterEach(() => {
    alarmManager.stopAlarm(false);
  });

  it('initializes in idle state', () => {
    expect(alarmManager.getIsRinging()).toBe(false);
  });

  it('starts alarm, triggers vibration, and activates ad suppression', async () => {
    await alarmManager.startAlarm('Grand Central Terminal', 3.8);

    expect(alarmManager.getIsRinging()).toBe(true);
    expect(Vibration.vibrate).toHaveBeenCalledWith([1000, 500, 1000, 500], true);
    // Ad suppression must be active
    expect(adService.canShowInterstitial()).toBe(false);
  });

  it('ignores duplicate startAlarm calls while already ringing', async () => {
    await alarmManager.startAlarm('Grand Central Terminal', 3.8);
    expect(alarmManager.getIsRinging()).toBe(true);
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);

    await alarmManager.startAlarm('Grand Central Terminal', 3.5);
    // Should not vibrate again
    expect(Vibration.vibrate).toHaveBeenCalledTimes(1);
  });

  it('stops alarm, cancels vibration, and releases ad suppression on complete dismiss', async () => {
    await alarmManager.startAlarm('Grand Central Terminal', 3.8);
    expect(alarmManager.getIsRinging()).toBe(true);

    alarmManager.stopAlarm(false);

    expect(alarmManager.getIsRinging()).toBe(false);
    expect(Vibration.cancel).toHaveBeenCalled();
    // Ad suppression should now be released
    expect(adService.canShowInterstitial()).toBe(true);
  });

  it('stops alarm but PRESERVES ad suppression when snoozing (Safety Guardrail)', async () => {
    await alarmManager.startAlarm('Grand Central Terminal', 3.8);
    expect(alarmManager.getIsRinging()).toBe(true);

    // Stop with snooze flag true
    alarmManager.stopAlarm(true);

    expect(alarmManager.getIsRinging()).toBe(false);
    expect(Vibration.cancel).toHaveBeenCalled();
    // Ad suppression MUST remain blocked during snooze!
    expect(adService.canShowInterstitial()).toBe(false);

    // Re-trigger alarm after snooze expires
    await alarmManager.startAlarm('Grand Central Terminal', 3.0);
    expect(alarmManager.getIsRinging()).toBe(true);
    expect(adService.canShowInterstitial()).toBe(false);

    // Final explicit user dismissal
    alarmManager.stopAlarm(false);
    expect(alarmManager.getIsRinging()).toBe(false);
    expect(adService.canShowInterstitial()).toBe(true);
  });

  it('supports Web Audio API synthesizer gracefully on web platform', async () => {
    const originalOS = Platform.OS;
    (Platform as any).OS = 'web';

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };

    const mockGain = {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn(),
      },
      connect: jest.fn(),
    };

    const mockAudioContext = {
      currentTime: 0,
      createOscillator: jest.fn().mockReturnValue(mockOscillator),
      createGain: jest.fn().mockReturnValue(mockGain),
      destination: {},
      close: jest.fn(),
    };

    (global as any).window = {
      AudioContext: jest.fn().mockImplementation(() => mockAudioContext),
    };

    await alarmManager.startAlarm('Wall Street', 2.5);
    expect(alarmManager.getIsRinging()).toBe(true);
    expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    expect(mockOscillator.start).toHaveBeenCalled();

    alarmManager.stopAlarm(false);
    expect(alarmManager.getIsRinging()).toBe(false);
    expect(mockAudioContext.close).toHaveBeenCalled();

    // Clean up
    (Platform as any).OS = originalOS;
    delete (global as any).window;
  });
});
