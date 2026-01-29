/**
 * Journey Data Hook
 * Calculates streaks, milestones, and completion data for calendar journey view
 */

import { useMemo } from 'react';
import { CalendarMonth } from '@/types/api';
import { formatDateString, getDaysInMonth } from './useCalendar';

export interface DayCompletion {
  date: string;
  completionPercent: 0 | 33 | 66 | 100;
  hasInjection: boolean;
  hasWeighIn: boolean;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  streakDays: Map<string, boolean>; // date -> is part of current streak
  milestoneDays: Map<string, 7 | 14 | 30>; // date -> milestone type
}

export interface JourneyData {
  completionByDate: Map<string, DayCompletion>;
  streakData: StreakData;
  monthlyStats: {
    totalDays: number;
    perfectDays: number;
    partialDays: number;
    completionPercent: number;
    totalInjections: number;
    totalWeighIns: number;
    weightChange: number | null;
  };
}

/**
 * Calculate completion percentage for a day's habits
 * Returns 0, 33, 66, or 100
 */
export function getCompletionPercent(habits: { water: boolean; nutrition: boolean; exercise: boolean } | null): 0 | 33 | 66 | 100 {
  if (!habits) return 0;

  const completed = [habits.water, habits.nutrition, habits.exercise].filter(Boolean).length;

  if (completed === 0) return 0;
  if (completed === 1) return 33;
  if (completed === 2) return 66;
  return 100;
}

/**
 * Calculate streak data from habits
 */
export function calculateStreakData(
  habits: Array<{ date: string; water: boolean; nutrition: boolean; exercise: boolean }>,
  year: number,
  month: number
): StreakData {
  const today = new Date();
  const todayStr = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // Create a set of perfect days
  const perfectDaysSet = new Set<string>();
  habits.forEach(h => {
    if (h.water && h.nutrition && h.exercise) {
      perfectDaysSet.add(h.date);
    }
  });

  // Sort dates for streak calculation
  const sortedPerfectDays = Array.from(perfectDaysSet).sort();

  // Calculate streaks and milestones
  const streakDays = new Map<string, boolean>();
  const milestoneDays = new Map<string, 7 | 14 | 30>();

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let streakStartDate: string | null = null;

  // Work backwards from today to find current streak
  const checkDate = new Date(today);
  const allPerfectDays: string[] = [];

  // Build list of all perfect days in chronological order
  const daysInMonth = getDaysInMonth(year, month);
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateString(year, month, day);
    if (perfectDaysSet.has(dateStr)) {
      allPerfectDays.push(dateStr);
    }
  }

  // Find consecutive streaks and mark milestones
  let streakCount = 0;
  let previousDate: Date | null = null;

  for (let i = 0; i < allPerfectDays.length; i++) {
    const currentDate = new Date(allPerfectDays[i] + 'T00:00:00');

    if (previousDate) {
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        streakCount++;
      } else {
        // Streak broken, check for milestones in previous streak
        if (streakCount >= 7) {
          // Mark milestone days
          markMilestones(allPerfectDays.slice(i - streakCount, i), milestoneDays, streakDays);
        }
        bestStreak = Math.max(bestStreak, streakCount);
        streakCount = 1; // Reset to 1 for current day
      }
    } else {
      streakCount = 1;
    }

    previousDate = currentDate;
  }

  // Check last streak
  if (streakCount >= 1) {
    if (streakCount >= 7) {
      markMilestones(allPerfectDays.slice(-streakCount), milestoneDays, streakDays);
    }
    bestStreak = Math.max(bestStreak, streakCount);
  }

  // Calculate current streak (streak that includes today or yesterday)
  if (allPerfectDays.length > 0) {
    const lastPerfectDay = allPerfectDays[allPerfectDays.length - 1];
    const lastPerfectDate = new Date(lastPerfectDay + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = todayDate.getTime() - lastPerfectDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      // Streak is current (today or yesterday was perfect)
      let count = 1;
      for (let i = allPerfectDays.length - 2; i >= 0; i--) {
        const current = new Date(allPerfectDays[i + 1] + 'T00:00:00');
        const prev = new Date(allPerfectDays[i] + 'T00:00:00');
        const diff = Math.round((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          count++;
          streakDays.set(allPerfectDays[i], true);
        } else {
          break;
        }
      }
      streakDays.set(lastPerfectDay, true);
      currentStreak = count;
    }
  }

  return {
    currentStreak,
    bestStreak,
    streakDays,
    milestoneDays,
  };
}

/**
 * Mark milestone days within a streak
 */
function markMilestones(
  streakDays: string[],
  milestoneDays: Map<string, 7 | 14 | 30>,
  allStreakDays: Map<string, boolean>
): void {
  streakDays.forEach((day, index) => {
    allStreakDays.set(day, true);
    const dayNumber = index + 1;
    if (dayNumber === 7) milestoneDays.set(day, 7);
    if (dayNumber === 14) milestoneDays.set(day, 14);
    if (dayNumber === 30) milestoneDays.set(day, 30);
  });
}

/**
 * Main hook for journey data
 */
export function useJourneyData(
  monthData: CalendarMonth | undefined,
  year: number,
  month: number
): JourneyData {
  return useMemo(() => {
    const completionByDate = new Map<string, DayCompletion>();

    // Build habits map
    const habitsMap = new Map<string, { water: boolean; nutrition: boolean; exercise: boolean }>();
    monthData?.habits?.forEach(h => {
      habitsMap.set(h.date, { water: h.water, nutrition: h.nutrition, exercise: h.exercise });
    });

    // Build injections set
    const injectionsSet = new Set<string>();
    monthData?.injections?.forEach(i => injectionsSet.add(i.date));

    // Build weigh-ins set and calculate weight change
    const weighInsSet = new Set<string>();
    let firstWeight: number | null = null;
    let lastWeight: number | null = null;
    monthData?.weighIns?.forEach(w => {
      weighInsSet.add(w.date);
      if (!firstWeight || w.date < firstWeight.toString()) {
        firstWeight = w.weight;
      }
      if (!lastWeight || w.date > lastWeight.toString()) {
        lastWeight = w.weight;
      }
    });

    // Sort weigh-ins by date to get actual first/last
    const sortedWeighIns = [...(monthData?.weighIns || [])].sort((a, b) => a.date.localeCompare(b.date));
    if (sortedWeighIns.length >= 2) {
      firstWeight = sortedWeighIns[0].weight;
      lastWeight = sortedWeighIns[sortedWeighIns.length - 1].weight;
    }

    // Calculate completion for each day
    const daysInMonth = getDaysInMonth(year, month);
    let perfectDays = 0;
    let partialDays = 0;
    let totalCompletedHabits = 0;
    const today = new Date();
    const todayStr = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate());

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateString(year, month, day);

      // Skip future days
      if (dateStr > todayStr) continue;

      const habits = habitsMap.get(dateStr) || null;
      const completionPercent = getCompletionPercent(habits);

      completionByDate.set(dateStr, {
        date: dateStr,
        completionPercent,
        hasInjection: injectionsSet.has(dateStr),
        hasWeighIn: weighInsSet.has(dateStr),
      });

      if (completionPercent === 100) perfectDays++;
      else if (completionPercent > 0) partialDays++;

      if (habits) {
        totalCompletedHabits += [habits.water, habits.nutrition, habits.exercise].filter(Boolean).length;
      }
    }

    // Calculate streak data
    const streakData = calculateStreakData(
      monthData?.habits || [],
      year,
      month
    );

    // Calculate days passed in month (up to today)
    const currentDate = new Date();
    let daysPassed = daysInMonth;
    if (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1) {
      daysPassed = currentDate.getDate();
    } else if (year > currentDate.getFullYear() ||
               (year === currentDate.getFullYear() && month > currentDate.getMonth() + 1)) {
      daysPassed = 0;
    }

    // Total possible habits = days * 3
    const totalPossibleHabits = daysPassed * 3;
    const completionPercent = totalPossibleHabits > 0
      ? Math.round((totalCompletedHabits / totalPossibleHabits) * 100)
      : 0;

    return {
      completionByDate,
      streakData,
      monthlyStats: {
        totalDays: daysPassed,
        perfectDays,
        partialDays,
        completionPercent,
        totalInjections: monthData?.injections?.length || 0,
        totalWeighIns: monthData?.weighIns?.length || 0,
        weightChange: firstWeight !== null && lastWeight !== null
          ? lastWeight - firstWeight
          : null,
      },
    };
  }, [monthData, year, month]);
}

/**
 * Get streak position for a day cell
 */
export function getStreakPosition(
  dateStr: string,
  prevDateStr: string | null,
  nextDateStr: string | null,
  streakDays: Map<string, boolean>
): 'start' | 'continue' | 'end' | 'single' | 'none' {
  const isInStreak = streakDays.has(dateStr);
  if (!isInStreak) return 'none';

  const prevInStreak = prevDateStr ? streakDays.has(prevDateStr) : false;
  const nextInStreak = nextDateStr ? streakDays.has(nextDateStr) : false;

  if (!prevInStreak && !nextInStreak) return 'single';
  if (!prevInStreak && nextInStreak) return 'start';
  if (prevInStreak && nextInStreak) return 'continue';
  if (prevInStreak && !nextInStreak) return 'end';

  return 'none';
}
