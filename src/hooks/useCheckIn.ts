/**
 * Check-in Tab Hooks
 * TanStack Query hooks for the check-in screen
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as habitsService from '../services/habits';
import { HabitType, DailyHabit } from '../types/api';

// Query keys
export const checkInKeys = {
  all: ['checkin'] as const,
  habits: (userId: string, date: string) => [...checkInKeys.all, 'habits', userId, date] as const,
  weekHistory: (userId: string, endDate: string) => [...checkInKeys.all, 'week', userId, endDate] as const,
};

/**
 * Format date as YYYY-MM-DD in local timezone
 * Note: Using local date components instead of toISOString() to avoid
 * timezone issues where midnight local time becomes previous day in UTC
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get start of day in local timezone
 */
export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number, from: Date = new Date()): Date {
  const d = getStartOfDay(from);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = getStartOfDay(new Date());
  const check = getStartOfDay(date);
  return today.getTime() === check.getTime();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
  const today = getStartOfDay(new Date());
  const check = getStartOfDay(date);
  return check.getTime() > today.getTime();
}

/**
 * Get the last 7 days as an array of dates (including today)
 */
export function getLast7Days(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push(getDaysAgo(i));
  }
  return days;
}

/**
 * Get day name abbreviation
 */
export function getDayAbbreviation(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
}

/**
 * Fetch habits for today only
 * Uses getTodayHabits endpoint which creates a record if it doesn't exist
 */
export function useTodayHabitsForCheckIn() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const dateStr = formatDate(new Date());

  return useQuery({
    queryKey: checkInKeys.habits(userId || '', dateStr),
    queryFn: () => habitsService.getTodayHabits(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get habits for a specific date from weekly cache
 * This ensures habit cards and weekly grid dots use the same data source
 */
export function getHabitsFromWeeklyCache(
  weeklyHabits: Map<string, DailyHabit> | undefined,
  date: Date
): DailyHabit {
  const dateStr = formatDate(date);
  const habit = weeklyHabits?.get(dateStr);

  return habit || {
    id: '',
    userId: '',
    date: dateStr,
    water: false,
    nutrition: false,
    exercise: false,
    createdAt: '',
    updatedAt: '',
  };
}

/**
 * Fetch weekly habit history (last 7 days)
 */
export function useWeeklyHabits() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const today = getStartOfDay(new Date());
  const endDateStr = formatDate(today);
  const startDateStr = formatDate(getDaysAgo(6));

  return useQuery({
    queryKey: checkInKeys.weekHistory(userId || '', endDateStr),
    queryFn: () => habitsService.getHabits(userId!, startDateStr, endDateStr),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      // Create a map of date -> habit record
      const habitMap = new Map<string, DailyHabit>();
      data.forEach((habit) => {
        const dateKey = habit.date.split('T')[0];
        habitMap.set(dateKey, habit);
      });
      return habitMap;
    },
  });
}

/**
 * Toggle habit mutation with optimistic updates
 */
export function useToggleHabitForDate(date: Date) {
  const { user } = useAuthStore();
  const userId = user?.id;
  const dateStr = formatDate(date);
  const queryClient = useQueryClient();
  const today = getStartOfDay(new Date());
  const weeklyQueryKey = checkInKeys.weekHistory(userId || '', formatDate(today));

  return useMutation({
    mutationFn: ({ habit, value }: { habit: HabitType; value: boolean }) =>
      habitsService.toggleHabit(userId!, habit, value, dateStr),

    // Optimistic update for both single date and weekly caches
    onMutate: async ({ habit, value }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: checkInKeys.habits(userId || '', dateStr) });
      await queryClient.cancelQueries({ queryKey: weeklyQueryKey });

      // Snapshot previous values
      const previousHabits = queryClient.getQueryData(checkInKeys.habits(userId || '', dateStr));
      const previousWeekly = queryClient.getQueryData<DailyHabit[]>(weeklyQueryKey);

      // Optimistically update single date cache
      queryClient.setQueryData(checkInKeys.habits(userId || '', dateStr), (old: DailyHabit | undefined) => ({
        ...old,
        [habit]: value,
      }));

      // Optimistically update weekly cache (raw array data)
      if (previousWeekly) {
        queryClient.setQueryData<DailyHabit[]>(weeklyQueryKey, (old) => {
          if (!old) return old;
          const updated = old.map((h) => {
            // Match by date (handle both ISO string and date-only formats)
            const habitDate = h.date.split('T')[0];
            if (habitDate === dateStr) {
              return { ...h, [habit]: value };
            }
            return h;
          });
          // If this date wasn't in the weekly data, add it
          const exists = updated.some((h) => h.date.split('T')[0] === dateStr);
          if (!exists) {
            updated.push({
              id: '',
              userId: userId || '',
              date: dateStr,
              water: habit === 'water' ? value : false,
              nutrition: habit === 'nutrition' ? value : false,
              exercise: habit === 'exercise' ? value : false,
              createdAt: '',
              updatedAt: '',
            });
          }
          return updated;
        });
      }

      return { previousHabits, previousWeekly };
    },

    // Update cache with server response
    onSuccess: (data) => {
      queryClient.setQueryData(checkInKeys.habits(userId || '', dateStr), data);

      // Also update weekly cache with the server response
      queryClient.setQueryData<DailyHabit[]>(weeklyQueryKey, (old) => {
        if (!old) return [data];
        const habitDate = data.date.split('T')[0];
        const exists = old.some((h) => h.date.split('T')[0] === habitDate);
        if (exists) {
          return old.map((h) => h.date.split('T')[0] === habitDate ? data : h);
        }
        return [...old, data];
      });
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(checkInKeys.habits(userId || '', dateStr), context.previousHabits);
      }
      if (context?.previousWeekly) {
        queryClient.setQueryData(weeklyQueryKey, context.previousWeekly);
      }
    },
  });
}

/**
 * Calculate streak from weekly history
 * Returns the number of consecutive days where all 3 habits were completed
 */
export function calculateStreak(habitMap: Map<string, DailyHabit>): number {
  let streak = 0;
  const today = getStartOfDay(new Date());

  // Start from today and go backwards
  for (let i = 0; i < 90; i++) {
    const checkDate = getDaysAgo(i, today);
    const dateKey = formatDate(checkDate);
    const habit = habitMap.get(dateKey);

    if (habit && habit.water && habit.nutrition && habit.exercise) {
      streak++;
    } else if (i === 0) {
      // Today doesn't break the streak if incomplete, just don't count it
      continue;
    } else {
      // Past day breaks the streak
      break;
    }
  }

  return streak;
}
