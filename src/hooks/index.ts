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
  useHabitsForDate,
  useWeeklyHabits,
  useToggleHabitForDate,
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
