/**
 * Dashboard API Service
 */

import api from './api';
import { DashboardData } from '../types/api';

/**
 * Get aggregated dashboard data
 */
export const getDashboard = async (userId: string): Promise<DashboardData> => {
  const response = await api.get<DashboardData>('/dashboard', {
    params: { userId },
  });
  return response.data;
};
