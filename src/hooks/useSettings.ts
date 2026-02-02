/**
 * Settings Query Hooks
 * TanStack Query hooks for user settings and preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as settingsService from '../services/settings';
import { updateNotificationSchedule } from '../services/notifications';
import {
  ProfileSettings,
  UpdateProfileRequest,
  NotificationPreferences,
} from '../types/api';
import { dashboardKeys } from './useDashboard';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
};

/**
 * Fetch current user's profile settings
 */
export function useProfileSettings() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: () => settingsService.getSettings(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Update profile settings mutation
 * Also updates notification schedules if injection day changes
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => settingsService.updateProfile(data),

    onSuccess: async (data) => {
      // Update the settings cache
      queryClient.setQueryData(settingsKeys.profile(), data);
      // Update the auth store user
      updateUser({
        name: data.name,
        goalWeight: data.goalWeight,
        goalDate: data.goalDate,
        medication: data.medication,
        injectionDay: data.injectionDay,
      });
      // Invalidate dashboard to reflect changes
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });

      // If injection day changed, update notification schedules
      if (user && data.injectionDay !== user.injectionDay) {
        const preferences = queryClient.getQueryData<NotificationPreferences>(
          settingsKeys.notifications()
        );
        if (preferences) {
          try {
            await updateNotificationSchedule(preferences, data.injectionDay);
          } catch (error) {
            console.warn('Failed to update notification schedule:', error);
          }
        }
      }
    },
  });
}

/**
 * Update email mutation
 */
export function useUpdateEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => settingsService.updateEmail(email),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

/**
 * Update password mutation
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
      confirmPassword,
    }: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => settingsService.updatePassword(currentPassword, newPassword, confirmPassword),
  });
}

/**
 * Export data mutation
 */
export function useExportData() {
  return useMutation({
    mutationFn: () => settingsService.exportData(),
  });
}

/**
 * Delete account mutation
 */
export function useDeleteAccount() {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: (password: string) => settingsService.deleteAccount(password),

    onSuccess: () => {
      logout();
    },
  });
}

/**
 * Fetch notification preferences
 */
export function useNotificationPreferences() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: () => settingsService.getNotificationPreferences(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Update notification preferences mutation
 * Also updates local notification schedules
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (
      data: Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ) => settingsService.updateNotificationPreferences(data),

    onSuccess: async (data) => {
      queryClient.setQueryData(settingsKeys.notifications(), data);

      // Update local notification schedules
      if (user) {
        try {
          await updateNotificationSchedule(data, user.injectionDay);
        } catch (error) {
          console.warn('Failed to update notification schedule:', error);
        }
      }
    },
  });
}
