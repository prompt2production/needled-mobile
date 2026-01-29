/**
 * Calendar Query Hooks
 * TanStack Query hooks for calendar data
 */

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as calendarService from '../services/calendar';
import { CalendarMonth, CalendarDay } from '../types/api';

// Query keys
export const calendarKeys = {
  all: ['calendar'] as const,
  month: (userId: string, year: number, month: number) =>
    [...calendarKeys.all, 'month', userId, year, month] as const,
  day: (userId: string, date: string) =>
    [...calendarKeys.all, 'day', userId, date] as const,
};

/**
 * Fetch calendar data for a month
 */
export function useCalendarMonth(year: number, month: number) {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: calendarKeys.month(userId || '', year, month),
    queryFn: () => calendarService.getMonthData(userId!, year, month),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch detailed data for a specific day
 */
export function useCalendarDay(date: string | null) {
  const { user } = useAuthStore();
  const userId = user?.id;

  return useQuery({
    queryKey: calendarKeys.day(userId || '', date || ''),
    queryFn: () => calendarService.getDayData(userId!, date!),
    enabled: !!userId && !!date,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Helper to get days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Helper to get first day of month (0 = Sunday, 1 = Monday, etc.)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * Helper to format month name
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
}

/**
 * Helper to generate calendar grid data
 */
export function generateCalendarGrid(year: number, month: number): (number | null)[] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Create array with leading nulls for empty cells before first day
  const grid: (number | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    grid.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push(day);
  }

  return grid;
}

/**
 * Helper to format date as YYYY-MM-DD
 */
export function formatDateString(year: number, month: number, day: number): string {
  const m = month.toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${year}-${m}-${d}`;
}
