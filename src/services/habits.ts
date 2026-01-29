/**
 * Habits API Service
 */

import api from './api';
import { DailyHabit, HabitType } from '../types/api';

/**
 * Get today's habit record (creates if doesn't exist)
 */
export const getTodayHabits = async (userId: string): Promise<DailyHabit> => {
  const response = await api.get<DailyHabit>('/habits/today', {
    params: { userId },
  });
  return response.data;
};

/**
 * Toggle a habit for today (or a specific date)
 */
export const toggleHabit = async (
  userId: string,
  habit: HabitType,
  value: boolean,
  date?: string
): Promise<DailyHabit> => {
  const response = await api.patch<DailyHabit>('/habits/today', {
    userId,
    habit,
    value,
    date,
  });
  return response.data;
};

/**
 * Get habit history
 */
export const getHabits = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<DailyHabit[]> => {
  const response = await api.get<DailyHabit[]>('/habits', {
    params: { userId, startDate, endDate },
  });
  return response.data;
};
