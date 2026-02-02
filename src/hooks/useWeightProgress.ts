/**
 * Weight Progress Query Hook
 * TanStack Query hook for weight progress chart data
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as weighinsService from '../services/weighins';
import { ChartTimeRange, WeightProgressData } from '../types/api';

// Query keys
export const weightProgressKeys = {
  all: ['weightProgress'] as const,
  progress: (userId: string, range: ChartTimeRange) =>
    [...weightProgressKeys.all, userId, range] as const,
};

/**
 * Fetch weight progress data for the chart
 */
export function useWeightProgress(range: ChartTimeRange = 'ALL') {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: weightProgressKeys.progress(userId || '', range),
    queryFn: () => weighinsService.getWeightProgress(userId!, range),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default useWeightProgress;
