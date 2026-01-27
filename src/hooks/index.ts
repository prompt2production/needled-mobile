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
