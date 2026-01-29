/**
 * Weigh-ins API Service
 */

import api from './api';
import { WeighIn, WeighInLatest, CreateWeighInRequest } from '../types/api';

/**
 * Get latest weigh-in with stats
 */
export const getLatestWeighIn = async (userId: string): Promise<WeighInLatest> => {
  const response = await api.get<WeighInLatest>('/weigh-ins/latest', {
    params: { userId },
  });
  return response.data;
};

/**
 * Log a new weigh-in
 */
export const logWeighIn = async (
  userId: string,
  weight: number,
  date?: string
): Promise<WeighIn> => {
  const response = await api.post<WeighIn>('/weigh-ins', {
    userId,
    weight,
    date,
  } as CreateWeighInRequest);
  return response.data;
};

/**
 * Get weigh-in history
 */
export const getWeighIns = async (
  userId: string,
  limit?: number,
  offset?: number
): Promise<WeighIn[]> => {
  const response = await api.get<WeighIn[]>('/weigh-ins', {
    params: { userId, limit, offset },
  });
  return response.data;
};

/**
 * Update a weigh-in
 */
export const updateWeighIn = async (
  id: string,
  data: { userId: string; weight?: number; date?: string }
): Promise<WeighIn> => {
  const response = await api.patch<WeighIn>(`/weigh-ins/${id}`, data);
  return response.data;
};

/**
 * Delete a weigh-in
 */
export const deleteWeighIn = async (id: string, userId: string): Promise<void> => {
  await api.delete(`/weigh-ins/${id}`, {
    params: { userId },
  });
};
