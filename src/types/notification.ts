export interface ArrivalNotificationPayload {
  destinationName: string;
  distanceKm: number;
  etaMinutes: number | null;
  radiusKm: number;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationActionResponse {
  actionId: 'DISMISS' | 'SNOOZE' | 'DEFAULT';
  notificationId: string;
}
