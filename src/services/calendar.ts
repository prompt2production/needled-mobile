/**
 * Calendar API Service
 */

import api from './api';
import { CalendarMonth, CalendarDay } from '../types/api';

/**
 * Get all activity data for a month
 */
export const getMonthData = async (
  userId: string,
  year: number,
  month: number
): Promise<CalendarMonth> => {
  const response = await api.get<CalendarMonth>(`/calendar/${year}/${month}`, {
    params: { userId },
  });
  return response.data;
};

/**
 * Get detailed activity data for a specific day
 */
export const getDayData = async (
  userId: string,
  date: string
): Promise<CalendarDay> => {
  const response = await api.get<CalendarDay>(`/calendar/day/${date}`, {
    params: { userId },
  });
  return response.data;
};
