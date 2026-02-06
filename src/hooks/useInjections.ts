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

// Default for backwards compatibility
const DEFAULT_DOSES_PER_PEN = 4;

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
 * Calculate the next dose number based on current status
 * Handles dynamic dosesPerPen and golden dose logic
 */
function calculateNextDose(
  currentNextDose: number,
  dosesPerPen: number,
  tracksGoldenDose: boolean,
  isGoldenDose: boolean
): number {
  // If this was a golden dose, next dose is 1 (new pen)
  if (isGoldenDose) {
    return 1;
  }

  // If we just completed the last standard dose
  if (currentNextDose >= dosesPerPen) {
    // If golden dose is tracked and available, that's next
    // Otherwise, start a new pen
    return tracksGoldenDose ? dosesPerPen + 1 : 1;
  }

  // Normal increment
  return currentNextDose + 1;
}

/**
 * Calculate doses remaining after logging an injection
 */
function calculateDosesRemaining(
  currentNextDose: number,
  dosesPerPen: number,
  isGoldenDose: boolean
): number {
  // If this was a golden dose, new pen has full doses
  if (isGoldenDose) {
    return dosesPerPen;
  }

  // If we just completed the last standard dose
  if (currentNextDose >= dosesPerPen) {
    return dosesPerPen; // New pen (API will handle golden dose state)
  }

  // Normal decrement
  return dosesPerPen - currentNextDose;
}

/**
 * Log injection mutation with optimistic updates
 * Now supports dynamic dosesPerPen and golden dose tracking
 */
export function useLogInjection() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      site: InjectionSite;
      notes?: string;
      date?: string;
      dosageMg?: number;
      isGoldenDose?: boolean;
    }) =>
      injectionsService.logInjection({
        userId: userId!,
        site: data.site,
        notes: data.notes,
        date: data.date,
        dosageMg: data.dosageMg,
        isGoldenDose: data.isGoldenDose,
      }),

    // Optimistic update
    onMutate: async ({ site, notes, date, dosageMg, isGoldenDose = false }) => {
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
        const dosesPerPen = previousStatus.dosesPerPen || DEFAULT_DOSES_PER_PEN;
        const tracksGoldenDose = previousStatus.tracksGoldenDose || false;

        const nextDose = calculateNextDose(
          previousStatus.nextDose,
          dosesPerPen,
          tracksGoldenDose,
          isGoldenDose
        );

        const dosesRemaining = calculateDosesRemaining(
          previousStatus.nextDose,
          dosesPerPen,
          isGoldenDose
        );

        // Determine golden dose availability
        const isGoldenDoseAvailable = !isGoldenDose &&
          tracksGoldenDose &&
          previousStatus.nextDose >= dosesPerPen;

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
              dosageMg: dosageMg ?? previousStatus.currentDosageMg ?? null,
              isGoldenDose,
              date: date || new Date().toISOString(),
              notes: notes || null,
            },
            currentDose: previousStatus.nextDose,
            nextDose,
            dosesRemaining,
            currentDosageMg: dosageMg ?? previousStatus.currentDosageMg ?? null,
            dosesPerPen,
            tracksGoldenDose,
            isGoldenDoseAvailable: isGoldenDoseAvailable && !isGoldenDose,
            isOnGoldenDose: !isGoldenDose && tracksGoldenDose && nextDose > dosesPerPen,
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
          dosageMg: dosageMg ?? previousStatus?.currentDosageMg ?? null,
          isGoldenDose,
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
