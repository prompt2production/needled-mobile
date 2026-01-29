/**
 * Weigh-in Query Hooks
 * TanStack Query hooks for weight tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as weighInsService from '../services/weighins';
import { WeighIn, WeighInLatest } from '../types/api';
import { dashboardKeys } from './useDashboard';

// Query keys
export const weighInKeys = {
  all: ['weighIns'] as const,
  latest: (userId: string) => [...weighInKeys.all, 'latest', userId] as const,
  history: (userId: string, limit?: number) =>
    [...weighInKeys.all, 'history', userId, limit] as const,
};

/**
 * Fetch latest weigh-in with stats
 */
export function useLatestWeighIn() {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: weighInKeys.latest(userId || ''),
    queryFn: () => weighInsService.getLatestWeighIn(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch weigh-in history
 */
export function useWeighInHistory(limit: number = 10) {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: weighInKeys.history(userId || '', limit),
    queryFn: () => weighInsService.getWeighIns(userId!, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Log weigh-in mutation with optimistic updates
 */
export function useLogWeighIn() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { weight: number; date?: string }) =>
      weighInsService.logWeighIn(userId!, data.weight, data.date),

    // Optimistic update
    onMutate: async ({ weight, date }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: weighInKeys.latest(userId || '') });
      await queryClient.cancelQueries({ queryKey: weighInKeys.history(userId || '') });

      // Snapshot previous values
      const previousLatest = queryClient.getQueryData<WeighInLatest>(
        weighInKeys.latest(userId || '')
      );
      const previousHistory = queryClient.getQueryData<WeighIn[]>(
        weighInKeys.history(userId || '', 10)
      );

      // Calculate optimistic changes
      const previousWeight = previousLatest?.weighIn?.weight;
      const weekChange = previousWeight ? weight - previousWeight : null;

      // Optimistically update latest
      if (previousLatest) {
        const optimisticWeighIn: WeighIn = {
          id: 'optimistic-' + Date.now(),
          userId: userId!,
          weight,
          date: date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData<WeighInLatest>(
          weighInKeys.latest(userId || ''),
          {
            ...previousLatest,
            weighIn: optimisticWeighIn,
            weekChange,
            canWeighIn: false,
            hasWeighedThisWeek: true,
          }
        );
      }

      // Optimistically add to history
      if (previousHistory) {
        const optimisticWeighIn: WeighIn = {
          id: 'optimistic-' + Date.now(),
          userId: userId!,
          weight,
          date: date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<WeighIn[]>(
          weighInKeys.history(userId || '', 10),
          [optimisticWeighIn, ...previousHistory.slice(0, 9)]
        );
      }

      return { previousLatest, previousHistory };
    },

    // On success, invalidate to get fresh data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weighInKeys.latest(userId || '') });
      queryClient.invalidateQueries({ queryKey: weighInKeys.history(userId || '') });
      // Also invalidate dashboard to update weight card
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousLatest) {
        queryClient.setQueryData(
          weighInKeys.latest(userId || ''),
          context.previousLatest
        );
      }
      if (context?.previousHistory) {
        queryClient.setQueryData(
          weighInKeys.history(userId || '', 10),
          context.previousHistory
        );
      }
    },
  });
}
