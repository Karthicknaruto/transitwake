import { Platform } from 'react-native';
import {
  ArrivalNotificationPayload,
  NotificationActionResponse,
} from '../types/notification';

type ActionCallback = (action: NotificationActionResponse) => void;

class NotificationService {
  private isInitialized = false;
  private actionListeners: Set<ActionCallback> = new Set();
  private activeNotificationId: string | null = null;

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      if (Platform.OS !== 'web') {
        const Notifications = require('expo-notifications');
        if (Notifications.setNotificationChannelAsync) {
          await Notifications.setNotificationChannelAsync('transitwake_arrival_critical', {
            name: 'TransitWake Arrival Alarms',
            description: 'Critical high-priority arrival wake-up alerts',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 800, 400, 800, 400, 1200],
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'default',
            enableVibrate: true,
            bypassDnd: true,
          });
        }
      }
      this.isInitialized = true;
      return true;
    } catch {
      // Fallback in web / mock environment
      this.isInitialized = true;
      return true;
    }
  }

  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const res = await window.Notification.requestPermission();
          return res === 'granted';
        }
        return true;
      }

      const Notifications = require('expo-notifications');
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowCriticalAlerts: true,
        },
      });
      return status === 'granted';
    } catch {
      return true;
    }
  }

  /**
   * Triggers the high-priority arrival notification
   */
  public async triggerArrivalAlert(
    payload: ArrivalNotificationPayload
  ): Promise<string | null> {
    await this.initialize();

    const title = `Approaching ${payload.destinationName}`;
    const body = `Within ${payload.radiusKm.toFixed(1)} km of your stop. Tap to dismiss or snooze.`;

    try {
      if (Platform.OS === 'web') {
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          window.Notification.permission === 'granted'
        ) {
          const notif = new window.Notification(title, {
            body,
            icon: '/assets/icon.png',
            tag: 'transitwake_arrival',
            requireInteraction: true,
          });
          notif.onclick = () => {
            this.handleActionResponse({
              actionId: 'DISMISS',
              notificationId: 'web_arrival',
            });
          };
          this.activeNotificationId = 'web_arrival';
          return 'web_arrival';
        }
        this.activeNotificationId = 'web_mock';
        return 'web_mock';
      }

      const Notifications = require('expo-notifications');
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidImportance.MAX,
          data: {
            destinationName: payload.destinationName,
            distanceKm: payload.distanceKm,
            categoryIdentifier: 'TRANSIT_ARRIVAL',
          },
        },
        trigger: null, // deliver immediately
      });

      this.activeNotificationId = notifId;
      return notifId;
    } catch {
      const fallbackId = `notif_${Date.now()}`;
      this.activeNotificationId = fallbackId;
      return fallbackId;
    }
  }

  public async cancelAlert(notificationId?: string): Promise<void> {
    const id = notificationId || this.activeNotificationId;
    if (!id) return;

    try {
      if (Platform.OS !== 'web') {
        const Notifications = require('expo-notifications');
        if (Notifications.dismissNotificationAsync) {
          await Notifications.dismissNotificationAsync(id);
        }
      }
    } catch {}

    if (id === this.activeNotificationId) {
      this.activeNotificationId = null;
    }
  }

  public onNotificationAction(listener: ActionCallback): () => void {
    this.actionListeners.add(listener);
    return () => {
      this.actionListeners.delete(listener);
    };
  }

  public async handleActionResponse(
    response: NotificationActionResponse
  ): Promise<void> {
    this.actionListeners.forEach((cb) => cb(response));
    if (response.actionId === 'DISMISS') {
      await this.cancelAlert(response.notificationId);
    }
  }

  public async resetForTesting(): Promise<void> {
    this.actionListeners.clear();
    this.activeNotificationId = null;
    this.isInitialized = false;
  }
}

export const notificationService = new NotificationService();
