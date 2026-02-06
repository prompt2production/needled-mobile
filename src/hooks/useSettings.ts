/**
 * Settings Query Hooks
 * TanStack Query hooks for user settings and preferences
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import * as settingsService from '../services/settings';
import {
  ProfileSettings,
  UpdateProfileRequest,
  NotificationPreferences,
  PenDosingSettings,
  UpdatePenDosingRequest,
} from '../types/api';
import { dashboardKeys } from './useDashboard';

// Check if running in Expo Go (push notifications not supported)
const isExpoGo = Constants.appOwnership === 'expo';

// Lazy load updateNotificationSchedule to prevent expo-notifications import in Expo Go
const updateNotificationScheduleLazy = async (
  preferences: NotificationPreferences,
  injectionDay: number
) => {
  if (isExpoGo) return; // Skip in Expo Go
  const { updateNotificationSchedule } = await import('../services/notifications');
  return updateNotificationSchedule(preferences, injectionDay);
};

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  penDosing: () => [...settingsKeys.all, 'penDosing'] as const,
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
            await updateNotificationScheduleLazy(preferences, data.injectionDay);
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
          await updateNotificationScheduleLazy(data, user.injectionDay);
        } catch (error) {
          console.warn('Failed to update notification schedule:', error);
        }
      }
    },
  });
}

/**
 * Fetch pen and dosing settings
 */
export function usePenDosingSettings() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: settingsKeys.penDosing(),
    queryFn: () => settingsService.getPenDosingSettings(),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Update pen and dosing settings mutation
 */
export function useUpdatePenDosing() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdatePenDosingRequest) => settingsService.updatePenDosing(data),

    onSuccess: (data: PenDosingSettings) => {
      // Update the pen dosing cache
      queryClient.setQueryData(settingsKeys.penDosing(), data);

      // Update the auth store user with new pen/dosing settings
      updateUser({
        dosingMode: data.dosingMode,
        penStrengthMg: data.penStrengthMg,
        doseAmountMg: data.doseAmountMg,
        dosesPerPen: data.dosesPerPen,
        tracksGoldenDose: data.tracksGoldenDose,
        currentDoseInPen: data.currentDoseInPen,
      });

      // Invalidate dashboard to reflect injection status changes
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
