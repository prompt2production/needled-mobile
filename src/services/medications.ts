/**
 * Medications API Service
 * Fetches medication configuration from the backend
 */

import api from './api';
import type { MedicationConfigResponse } from '../types/api';

/**
 * Fetch medication configuration from API
 * Includes dosages, pen strengths, and microdose amounts for all medications
 */
export async function getMedicationConfig(): Promise<MedicationConfigResponse> {
  const response = await api.get<MedicationConfigResponse>('/medications');
  return response.data;
}
