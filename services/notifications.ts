import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { authService } from './auth';

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Register for push notifications and get the Expo push token
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

      if (!projectId) {
        console.error('Project ID not found');
        return null;
      }

      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      // Update the user's profile with the token
      await authService.updatePushToken(token);

      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  /**
   * Schedule a local notification
   */
  async scheduleNotification(
    title: string,
    body: string,
    trigger: Notifications.NotificationTriggerInput,
    data?: any
  ) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger,
    });
  },

  /**
   * Schedule a notification for service start (15 minutes before)
   */
  async scheduleServiceStartNotification(serviceTime: Date, programTitle: string) {
    const notificationTime = new Date(serviceTime.getTime() - 15 * 60 * 1000); // 15 minutes before
    const now = new Date();

    if (notificationTime <= now) {
      return null; // Can't schedule in the past
    }

    return this.scheduleNotification(
      'Service Starting Soon',
      `${programTitle} starts in 15 minutes!`,
      { date: notificationTime },
      { type: 'service_starting', title: programTitle }
    );
  },

  /**
   * Schedule notifications for program items (2 minutes before each)
   */
  async scheduleProgramItemNotifications(
    programDate: Date,
    items: Array<{ time: string; title: string; id: string }>
  ) {
    const notifications = [];

    for (const item of items) {
      // Parse time (format: HH:MM:SS)
      const [hours, minutes] = item.time.split(':').map(Number);
      const itemDateTime = new Date(programDate);
      itemDateTime.setHours(hours, minutes, 0, 0);

      // Schedule 2 minutes before
      const notificationTime = new Date(itemDateTime.getTime() - 2 * 60 * 1000);
      const now = new Date();

      if (notificationTime > now) {
        const id = await this.scheduleNotification(
          'Next Item',
          `"${item.title}" starts in 2 minutes`,
          { date: notificationTime },
          { type: 'next_item', itemId: item.id, title: item.title }
        );
        notifications.push(id);
      }
    }

    return notifications;
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Cancel specific notification
   */
  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Send immediate notification (useful for task assignments)
   */
  async sendImmediateNotification(title: string, body: string, data?: any) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Setup notification listeners
   */
  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    // Handle notification received while app is in foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Handle notification tap/interaction
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

    return {
      remove: () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      },
    };
  },

  /**
   * Get notification permissions status
   */
  async getPermissionStatus() {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  },

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  },
};
