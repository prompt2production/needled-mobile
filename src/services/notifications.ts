/**
 * Push Notifications Service
 * Handles Expo push notifications setup, permissions, and scheduling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from './api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushTokenResponse {
  success: boolean;
  message?: string;
}

export interface NotificationPreferences {
  injectionReminder: boolean;
  weighInReminder: boolean;
  habitReminder: boolean;
  reminderTime: string;
  habitReminderTime: string;
  timezone: string;
}

/**
 * Request notification permissions from the user
 * Returns true if granted, false otherwise
 */
export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Get the Expo push token for this device
 * Returns null if unable to get token
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // For Android, we need to set up a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#14B8A6',
      });

      // Injection reminders channel
      await Notifications.setNotificationChannelAsync('injection-reminders', {
        name: 'Injection Reminders',
        description: 'Reminders for your weekly injection',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#14B8A6',
      });

      // Weigh-in reminders channel
      await Notifications.setNotificationChannelAsync('weighin-reminders', {
        name: 'Weigh-in Reminders',
        description: 'Reminders to log your weekly weigh-in',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#14B8A6',
      });

      // Habit reminders channel
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Daily Habit Reminders',
        description: 'Reminders to complete your daily habits',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#14B8A6',
      });
    }

    // Get project ID from EAS config or environment
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      process.env.EXPO_PUBLIC_PROJECT_ID;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
}

/**
 * Register the push token with the backend
 */
export async function registerPushToken(token: string): Promise<PushTokenResponse> {
  const response = await api.post<PushTokenResponse>('/users/push-token', {
    token,
    platform: Platform.OS,
  });
  return response.data;
}

/**
 * Unregister push token (call on logout)
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    await api.delete('/users/push-token');
  } catch (error) {
    // Best effort - don't fail logout if this fails
    console.warn('Failed to unregister push token:', error);
  }
}

// ============================================
// Local Notification Scheduling
// ============================================

/**
 * Cancel all scheduled local notifications
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule injection reminder
 * @param dayOfWeek - 1 (Sunday) through 7 (Saturday) - Expo uses 1-indexed
 * @param hour - Hour in 24h format
 * @param minute - Minute
 */
export async function scheduleInjectionReminder(
  dayOfWeek: number,
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time for your injection! 💉",
        body: "Pip is here to remind you it's injection day. You've got this!",
        data: { type: 'injection', screen: '/(tabs)/injection' },
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'injection-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek,
        hour,
        minute,
      },
    });
    return identifier;
  } catch (error) {
    console.error('Failed to schedule injection reminder:', error);
    return null;
  }
}

/**
 * Schedule weigh-in reminder (same day as injection, or custom day)
 */
export async function scheduleWeighInReminder(
  dayOfWeek: number,
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Weigh-in day! ⚖️",
        body: "Time to log your weekly weigh-in and track your progress.",
        data: { type: 'weighin', screen: '/(tabs)/weigh-in' },
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'weighin-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek,
        hour,
        minute,
      },
    });
    return identifier;
  } catch (error) {
    console.error('Failed to schedule weigh-in reminder:', error);
    return null;
  }
}

/**
 * Schedule daily habit reminder
 */
export async function scheduleDailyHabitReminder(
  hour: number,
  minute: number
): Promise<string | null> {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't forget your habits! 🌟",
        body: "Have you logged your water, nutrition, and exercise today?",
        data: { type: 'habits', screen: '/(tabs)/check-in' },
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'habit-reminders' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return identifier;
  } catch (error) {
    console.error('Failed to schedule habit reminder:', error);
    return null;
  }
}

/**
 * Update all local notification schedules based on user preferences
 * Call this when:
 * - User logs in
 * - User changes notification preferences
 * - User changes injection day
 */
export async function updateNotificationSchedule(
  preferences: NotificationPreferences,
  injectionDay: number // 0 = Monday, 1 = Tuesday, ..., 6 = Sunday (API format)
): Promise<void> {
  // Cancel existing scheduled notifications
  await cancelAllScheduledNotifications();

  // Parse reminder times
  const [reminderHour, reminderMinute] = preferences.reminderTime.split(':').map(Number);
  const [habitHour, habitMinute] = preferences.habitReminderTime.split(':').map(Number);

  // Convert API injection day (0=Monday) to Expo weekday (1=Sunday, 2=Monday, etc.)
  // API: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  // Expo: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
  const expoWeekday = injectionDay === 6 ? 1 : injectionDay + 2;

  // Schedule injection reminder if enabled
  if (preferences.injectionReminder) {
    await scheduleInjectionReminder(expoWeekday, reminderHour, reminderMinute);
  }

  // Schedule weigh-in reminder if enabled (same day as injection)
  if (preferences.weighInReminder) {
    await scheduleWeighInReminder(expoWeekday, reminderHour, reminderMinute);
  }

  // Schedule daily habit reminder if enabled
  if (preferences.habitReminder) {
    await scheduleDailyHabitReminder(habitHour, habitMinute);
  }
}

/**
 * Get all currently scheduled notifications (for debugging)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
