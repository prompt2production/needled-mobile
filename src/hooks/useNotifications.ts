/**
 * Notifications Hook
 * Handles push notification setup, registration, and deep linking
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import {
  requestPermissions,
  getExpoPushToken,
  registerPushToken,
  unregisterPushToken,
  updateNotificationSchedule,
  cancelAllScheduledNotifications,
} from '../services/notifications';
import { useNotificationPreferences } from './useSettings';

// Query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  pushToken: () => [...notificationKeys.all, 'pushToken'] as const,
};

/**
 * Main notifications hook - call this in the root layout
 * Handles:
 * - Permission request
 * - Push token registration
 * - Notification response handling (deep linking)
 * - Local notification scheduling
 */
export function useNotificationsSetup() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { data: preferences } = useNotificationPreferences();
  const queryClient = useQueryClient();

  // Track if we've already registered the token this session
  const hasRegisteredToken = useRef(false);

  // Response listener ref (for cleanup)
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Mutation for registering push token
  const registerTokenMutation = useMutation({
    mutationFn: registerPushToken,
    onSuccess: () => {
      hasRegisteredToken.current = true;
    },
    onError: (error) => {
      console.error('Failed to register push token:', error);
    },
  });

  /**
   * Initialize push notifications
   * Request permission and register token with backend
   */
  const initializePushNotifications = useCallback(async () => {
    if (!isAuthenticated || hasRegisteredToken.current) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log('Push notification permission not granted');
      return;
    }

    const token = await getExpoPushToken();
    if (token) {
      registerTokenMutation.mutate(token);
    }
  }, [isAuthenticated, registerTokenMutation]);

  /**
   * Update local notification schedules based on preferences
   */
  const updateSchedules = useCallback(async () => {
    if (!isAuthenticated || !preferences || !user) return;

    await updateNotificationSchedule(preferences, user.injectionDay);
  }, [isAuthenticated, preferences, user?.injectionDay]);

  // Initialize push notifications when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      initializePushNotifications();
    } else {
      // User logged out - reset token registration flag
      hasRegisteredToken.current = false;
    }
  }, [isAuthenticated, initializePushNotifications]);

  // Update local notification schedules when preferences change
  useEffect(() => {
    updateSchedules();
  }, [updateSchedules]);

  // Handle notification responses (when user taps notification)
  useEffect(() => {
    // Handle notification that opened the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    // Listen for notification responses while app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  /**
   * Handle notification tap - navigate to appropriate screen
   */
  function handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const data = response.notification.request.content.data;

    if (data?.screen && typeof data.screen === 'string') {
      // Small delay to ensure app is ready
      setTimeout(() => {
        router.push(data.screen as any);
      }, 100);
    }
  }

  return {
    initializePushNotifications,
    updateSchedules,
    isRegistering: registerTokenMutation.isPending,
  };
}

/**
 * Hook to manually trigger notification schedule update
 * Use after changing notification preferences or injection day
 */
export function useUpdateNotificationSchedule() {
  const { user } = useAuthStore();
  const { data: preferences } = useNotificationPreferences();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!preferences || !user) {
        throw new Error('Missing preferences or user data');
      }
      await updateNotificationSchedule(preferences, user.injectionDay);
    },
  });

  return mutation;
}

/**
 * Hook to unregister push token (call on logout)
 */
export function useUnregisterPushToken() {
  return useMutation({
    mutationFn: unregisterPushToken,
  });
}

/**
 * Hook to cancel all scheduled local notifications
 */
export function useCancelAllNotifications() {
  return useMutation({
    mutationFn: cancelAllScheduledNotifications,
  });
}
