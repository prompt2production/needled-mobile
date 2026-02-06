/**
 * Custom Hooks
 * Centralized exports for all hooks
 */

export {
  useDashboardData,
  useTodayHabits,
  useInjectionStatus,
  useToggleHabit,
  dashboardKeys,
  habitsKeys,
  injectionKeys,
} from './useDashboard';

export {
  useTodayHabitsForCheckIn,
  useWeeklyHabits,
  useToggleHabitForDate,
  getHabitsFromWeeklyCache,
  checkInKeys,
  formatDate,
  getStartOfDay,
  getDaysAgo,
  isToday,
  isFuture,
  getLast7Days,
  getDayAbbreviation,
  calculateStreak,
} from './useCheckIn';

export {
  useInjectionStatus as useInjectionStatusForInjection,
  useInjectionHistory,
  useLogInjection,
  injectionQueryKeys,
} from './useInjections';

export {
  useLatestWeighIn,
  useWeighInHistory,
  useLogWeighIn,
  weighInKeys,
} from './useWeighIns';

export {
  useWeightProgress,
  weightProgressKeys,
} from './useWeightProgress';

export {
  useCalendarMonth,
  useCalendarDay,
  calendarKeys,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  generateCalendarGrid,
  formatDateString,
} from './useCalendar';

export {
  useProfileSettings,
  useUpdateProfile,
  useUpdateEmail,
  useUpdatePassword,
  useExportData,
  useDeleteAccount,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  usePenDosingSettings,
  useUpdatePenDosing,
  settingsKeys,
} from './useSettings';

export {
  useJourneyData,
  getCompletionPercent,
  calculateStreakData,
  getStreakPosition,
} from './useJourneyData';

export type {
  DayCompletion,
  StreakData,
  JourneyData,
} from './useJourneyData';

export {
  useMedicationConfig,
  useMedicationOptions,
  usePenStrengthOptions,
  useDosageOptions,
  useDosageValues,
  useMicrodoseAmounts,
  useHasDosageTracking,
  useSupportsMicrodosing,
  useMedicationConfigByCode,
  useDefaultDosesPerPen,
  useSuggestedMicrodoseAmounts,
  medicationConfigKeys,
} from './useMedicationConfig';

// Note: Notification hooks are NOT exported here to prevent expo-notifications
// from being eagerly loaded in Expo Go (where push notifications aren't supported).
// Import directly from './useNotifications' in development builds only.
// export {
//   useNotificationsSetup,
//   useUpdateNotificationSchedule,
//   useUnregisterPushToken,
//   useCancelAllNotifications,
//   notificationKeys,
// } from './useNotifications';
