/**
 * Injection Query Hooks
 * TanStack Query hooks for injection tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as injectionsService from '../services/injections';
import {
  Injection,
  InjectionStatusResponse,
  CreateInjectionRequest,
  InjectionSite,
} from '../types/api';
import { injectionKeys, dashboardKeys } from './useDashboard';

// Extended query keys for injection history
export const injectionQueryKeys = {
  ...injectionKeys,
  history: (userId: string, limit?: number) =>
    [...injectionKeys.all, 'history', userId, limit] as const,
};

/**
 * Fetch injection status with recommendations
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
 * Fetch injection history
 */
export function useInjectionHistory(limit: number = 5) {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: injectionQueryKeys.history(userId || '', limit),
    queryFn: () => injectionsService.getInjections(userId!, limit),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Log injection mutation with optimistic updates
 */
export function useLogInjection() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { site: InjectionSite; notes?: string; date?: string }) =>
      injectionsService.logInjection({
        userId: userId!,
        site: data.site,
        notes: data.notes,
        date: data.date,
      }),

    // Optimistic update
    onMutate: async ({ site, notes, date }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: injectionKeys.status(userId || '') });
      await queryClient.cancelQueries({ queryKey: injectionQueryKeys.history(userId || '') });

      // Snapshot previous values
      const previousStatus = queryClient.getQueryData<InjectionStatusResponse>(
        injectionKeys.status(userId || '')
      );
      const previousHistory = queryClient.getQueryData<Injection[]>(
        injectionQueryKeys.history(userId || '', 5)
      );

      // Optimistically update status to 'done'
      if (previousStatus) {
        queryClient.setQueryData<InjectionStatusResponse>(
          injectionKeys.status(userId || ''),
          {
            ...previousStatus,
            status: 'done',
            daysUntil: 7,
            daysOverdue: 0,
            lastInjection: {
              id: 'optimistic-' + Date.now(),
              site,
              doseNumber: previousStatus.nextDose,
              date: date || new Date().toISOString(),
              notes: notes || null,
            },
            currentDose: previousStatus.nextDose,
            nextDose: previousStatus.nextDose === 4 ? 1 : ((previousStatus.nextDose + 1) as 1 | 2 | 3 | 4),
            dosesRemaining: previousStatus.nextDose === 4 ? 4 : previousStatus.dosesRemaining - 1,
          }
        );
      }

      // Optimistically add to history
      if (previousHistory) {
        const optimisticInjection: Injection = {
          id: 'optimistic-' + Date.now(),
          userId: userId!,
          date: date || new Date().toISOString(),
          site,
          doseNumber: previousStatus?.nextDose || 1,
          notes: notes || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Injection[]>(
          injectionQueryKeys.history(userId || '', 5),
          [optimisticInjection, ...previousHistory.slice(0, 4)]
        );
      }

      return { previousStatus, previousHistory };
    },

    // On success, invalidate to get fresh data
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: injectionKeys.status(userId || '') });
      queryClient.invalidateQueries({ queryKey: injectionQueryKeys.history(userId || '') });
      // Also invalidate dashboard to update injection card
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          injectionKeys.status(userId || ''),
          context.previousStatus
        );
      }
      if (context?.previousHistory) {
        queryClient.setQueryData(
          injectionQueryKeys.history(userId || '', 5),
          context.previousHistory
        );
      }
    },
  });
}
