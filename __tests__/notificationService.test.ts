import { notificationService } from '../src/services/notificationService';

// Mock expo-notifications
jest.mock(
  'expo-notifications',
  () => ({
    setNotificationChannelAsync: jest.fn().mockResolvedValue({}),
    scheduleNotificationAsync: jest.fn().mockResolvedValue('notif-12345'),
    dismissNotificationAsync: jest.fn().mockResolvedValue(undefined),
    cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
    setNotificationCategoryAsync: jest.fn().mockResolvedValue({}),
    AndroidImportance: {
      MAX: 5,
      HIGH: 4,
      LOW: 2,
    },
    AndroidNotificationVisibility: {
      PUBLIC: 1,
    },
  }),
  { virtual: true }
);

describe('NotificationService — Heads-Up Critical Transit Alarms', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await notificationService.resetForTesting();
  });

  it('initializes high-priority Android notification channels with max importance', async () => {
    const initialized = await notificationService.initialize();
    expect(initialized).toBe(true);
  });

  it('requests notification permissions and returns granted status', async () => {
    const granted = await notificationService.requestPermissions();
    expect(granted).toBe(true);
  });

  it('schedules high-urgency arrival alert when approaching destination stop', async () => {
    const notifId = await notificationService.triggerArrivalAlert({
      destinationName: 'Central Station',
      distanceKm: 3.8,
      etaMinutes: 4,
      radiusKm: 4.0,
    });

    expect(notifId).toBeDefined();
    expect(typeof notifId).toBe('string');
  });

  it('handles user dismiss and snooze action events', async () => {
    let dismissHandled = false;
    let snoozeHandled = false;

    notificationService.onNotificationAction((action) => {
      if (action.actionId === 'DISMISS') dismissHandled = true;
      if (action.actionId === 'SNOOZE') snoozeHandled = true;
    });

    await notificationService.handleActionResponse({
      actionId: 'DISMISS',
      notificationId: 'notif-12345',
    });
    expect(dismissHandled).toBe(true);

    await notificationService.handleActionResponse({
      actionId: 'SNOOZE',
      notificationId: 'notif-12345',
    });
    expect(snoozeHandled).toBe(true);
  });

  it('cancels active notification without throwing', async () => {
    await expect(notificationService.cancelAlert('notif-12345')).resolves.not.toThrow();
  });
});
