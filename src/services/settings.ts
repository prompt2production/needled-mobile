/**
 * Settings API Service
 */

import api from './api';
import {
  ProfileSettings,
  UpdateProfileRequest,
  NotificationPreferences,
  UpdatePenDosingRequest,
  PenDosingSettings,
} from '../types/api';

/**
 * Get current user's profile settings
 */
export const getSettings = async (): Promise<ProfileSettings> => {
  const response = await api.get<ProfileSettings>('/settings');
  return response.data;
};

/**
 * Update profile settings
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<ProfileSettings> => {
  const response = await api.put<ProfileSettings>('/settings/profile', data);
  return response.data;
};

/**
 * Update email address
 */
export const updateEmail = async (email: string): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>('/settings/email', { email });
  return response.data;
};

/**
 * Update password
 */
export const updatePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>('/settings/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

/**
 * Export all user data
 */
export const exportData = async (): Promise<Blob> => {
  const response = await api.get('/settings/export', {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Delete account
 */
export const deleteAccount = async (password: string): Promise<void> => {
  await api.delete('/settings/account', {
    data: { password },
  });
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await api.get<NotificationPreferences>('/notifications/preferences');
  return response.data;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  data: Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<NotificationPreferences> => {
  const response = await api.put<NotificationPreferences>(
    '/notifications/preferences',
    data
  );
  return response.data;
};

/**
 * Get pen and dosing settings
 */
export const getPenDosingSettings = async (): Promise<PenDosingSettings> => {
  const response = await api.get<PenDosingSettings>('/settings/pen-dosing');
  return response.data;
};

/**
 * Update pen and dosing settings
 */
export const updatePenDosing = async (
  data: UpdatePenDosingRequest
): Promise<PenDosingSettings> => {
  const response = await api.put<PenDosingSettings>('/settings/pen-dosing', data);
  return response.data;
};
