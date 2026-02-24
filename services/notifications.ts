import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { APP_CONFIG } from '../constants/api';

class NotificationService {
  constructor() {
    this.configureNotifications();
  }

  private configureNotifications(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleBookmarkNotification(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Great Job!',
        body: 'You\'ve bookmarked 5+ courses. Keep up the great learning momentum!',
        data: { type: 'bookmark_milestone' },
      },
      trigger: null, // Show immediately
    });
  }

  async scheduleInactivityReminder(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const triggerDate = new Date(Date.now() + APP_CONFIG.INACTIVE_REMINDER_HOURS * 60 * 60 * 1000);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📚 Continue Learning',
        body: 'It\'s been a while! Check out your bookmarked courses and continue your learning journey.',
        data: { type: 'inactivity_reminder' },
      },
      trigger: {
        date: triggerDate,
      } as Notifications.NotificationTriggerInput,
    });
  }

  async showEnrollmentSuccess(courseTitle: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Successfully Enrolled!',
        body: `You're now enrolled in ${courseTitle}`,
        data: { type: 'enrollment_success' },
      },
      trigger: null,
    });
  }

  async showNetworkError(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌐 Network Error',
        body: 'Please check your internet connection and try again.',
        data: { type: 'network_error' },
      },
      trigger: null,
    });
  }

  async getNotificationCount(): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }

    const notificationCount = await Notifications.getBadgeCountAsync();
    return notificationCount;
  }

  async clearNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  }

  async cancelAllScheduledNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();
