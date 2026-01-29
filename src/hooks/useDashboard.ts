/**
 * Dashboard Query Hooks
 * TanStack Query hooks for dashboard data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as dashboardService from '../services/dashboard';
import * as habitsService from '../services/habits';
import * as injectionsService from '../services/injections';
import { HabitType } from '../types/api';

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: (userId: string) => [...dashboardKeys.all, userId] as const,
};

export const habitsKeys = {
  all: ['habits'] as const,
  today: (userId: string) => [...habitsKeys.all, 'today', userId] as const,
};

export const injectionKeys = {
  all: ['injections'] as const,
  status: (userId: string) => [...injectionKeys.all, 'status', userId] as const,
};

/**
 * Fetch dashboard data
 */
export function useDashboardData() {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: dashboardKeys.detail(userId || ''),
    queryFn: () => dashboardService.getDashboard(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Fetch today's habits
 */
export function useTodayHabits() {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: habitsKeys.today(userId || ''),
    queryFn: () => habitsService.getTodayHabits(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes - trust optimistic updates longer
  });
}

/**
 * Fetch injection status
 */
export function useInjectionStatus() {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: injectionKeys.status(userId || ''),
    queryFn: () => injectionsService.getInjectionStatus(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Toggle habit mutation with optimistic updates
 */
export function useToggleHabit() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habit, value }: { habit: HabitType; value: boolean }) =>
      habitsService.toggleHabit(userId!, habit, value),

    // Optimistic update
    onMutate: async ({ habit, value }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: habitsKeys.today(userId || '') });

      // Snapshot previous value
      const previousHabits = queryClient.getQueryData(habitsKeys.today(userId || ''));

      // Optimistically update
      queryClient.setQueryData(habitsKeys.today(userId || ''), (old: any) => ({
        ...old,
        [habit]: value,
      }));

      return { previousHabits };
    },

    // Update cache with server response (no refetch needed)
    onSuccess: (data) => {
      queryClient.setQueryData(habitsKeys.today(userId || ''), data);
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(habitsKeys.today(userId || ''), context.previousHabits);
      }
    },
  });
}
