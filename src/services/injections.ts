/**
 * Injections API Service
 */

import api from './api';
import {
  Injection,
  InjectionStatusResponse,
  CreateInjectionRequest,
  InjectionSite,
  DoseNumber,
} from '../types/api';

/**
 * Get injection status with recommendations
 */
export const getInjectionStatus = async (
  userId: string
): Promise<InjectionStatusResponse> => {
  const response = await api.get<InjectionStatusResponse>('/injections/status', {
    params: { userId },
  });
  return response.data;
};

/**
 * Log a new injection
 */
export const logInjection = async (
  data: CreateInjectionRequest
): Promise<Injection> => {
  const response = await api.post<Injection>('/injections', data);
  return response.data;
};

/**
 * Get injection history
 */
export const getInjections = async (
  userId: string,
  limit?: number,
  offset?: number
): Promise<Injection[]> => {
  const response = await api.get<Injection[]>('/injections', {
    params: { userId, limit, offset },
  });
  return response.data;
};

/**
 * Update an injection
 */
export const updateInjection = async (
  id: string,
  data: {
    userId: string;
    site?: InjectionSite;
    doseNumber?: DoseNumber;
    notes?: string;
    date?: string;
  }
): Promise<Injection> => {
  const response = await api.patch<Injection>(`/injections/${id}`, data);
  return response.data;
};

/**
 * Delete an injection
 */
export const deleteInjection = async (
  id: string,
  userId: string
): Promise<void> => {
  await api.delete(`/injections/${id}`, {
    params: { userId },
  });
};
