/**
 * Notifications Setup Component
 * Wraps the useNotificationsSetup hook for lazy loading
 * This prevents expo-notifications from being imported in Expo Go
 */

import { useNotificationsSetup } from '../hooks/useNotifications';

export function NotificationsSetup() {
  useNotificationsSetup();
  return null;
}
