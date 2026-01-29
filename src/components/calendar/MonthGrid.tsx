/**
 * MonthGrid Component
 * Monthly calendar grid with Journey view styling
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, useColorScheme } from 'react-native';
import { CalendarMonth } from '@/types/api';
import {
  generateCalendarGrid,
  formatDateString,
  getDaysInMonth,
} from '@/hooks/useCalendar';
import {
  getCompletionPercent,
  getStreakPosition,
  StreakData,
  DayCompletion,
} from '@/hooks/useJourneyData';
import { JourneyDay, StreakPosition } from './JourneyDay';
import { JourneyLegend } from './JourneyLegend';

interface MonthGridProps {
  year: number;
  month: number;
  data: CalendarMonth | undefined;
  selectedDate: string | null;
  completionByDate: Map<string, DayCompletion>;
  streakData: StreakData;
  onDayPress: (date: string) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MonthGrid({
  year,
  month,
  data,
  selectedDate,
  completionByDate,
  streakData,
  onDayPress,
}: MonthGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Generate grid of days
  const grid = useMemo(() => generateCalendarGrid(year, month), [year, month]);

  // Create lookup maps for quick access
  const injectionsSet = useMemo(() => {
    const set = new Set<string>();
    data?.injections?.forEach((i) => set.add(i.date));
    return set;
  }, [data?.injections]);

  const weighInsSet = useMemo(() => {
    const set = new Set<string>();
    data?.weighIns?.forEach((w) => set.add(w.date));
    return set;
  }, [data?.weighIns]);

  // Get today's date string
  const today = new Date();
  const todayStr = formatDateString(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  // Handle day press
  const handleDayPress = (day: number) => {
    const dateStr = formatDateString(year, month, day);
    onDayPress(dateStr);
  };

  // Split grid into weeks (rows of 7)
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < grid.length; i += 7) {
    weeks.push(grid.slice(i, i + 7));
  }

  // Pad last week if needed
  if (weeks.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push(null);
    }
  }

  // Entry animations for rows
  const rowAnims = useRef(weeks.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset animations when month changes
    rowAnims.forEach((anim) => anim.setValue(0));

    // Stagger fade in each row
    const animations = rowAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );

    Animated.parallel(animations).start();
  }, [year, month, rowAnims]);

  // Helper to get previous/next date strings
  const getAdjacentDates = (
    day: number
  ): { prev: string | null; next: string | null } => {
    const daysInMonth = getDaysInMonth(year, month);

    const prevDay = day > 1 ? day - 1 : null;
    const nextDay = day < daysInMonth ? day + 1 : null;

    return {
      prev: prevDay ? formatDateString(year, month, prevDay) : null,
      next: nextDay ? formatDateString(year, month, nextDay) : null,
    };
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        marginHorizontal: 16,
      }}
    >
      {/* Weekday headers */}
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {WEEKDAY_LABELS.map((label) => (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: isDark ? '#6B7280' : '#9CA3AF',
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, weekIndex) => (
        <Animated.View
          key={weekIndex}
          style={{
            flexDirection: 'row',
            opacity: rowAnims[weekIndex] || 1,
            transform: [
              {
                translateY: (rowAnims[weekIndex] || new Animated.Value(1)).interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          }}
        >
          {week.map((day, dayIndex) => {
            const dateStr = day ? formatDateString(year, month, day) : null;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const isFuture = dateStr ? dateStr > todayStr : false;

            // Get completion data
            const dayCompletion = dateStr
              ? completionByDate.get(dateStr)
              : undefined;
            const completionPercent = dayCompletion?.completionPercent || 0;

            // Get injection/weigh-in flags
            const hasInjection = dateStr ? injectionsSet.has(dateStr) : false;
            const hasWeighIn = dateStr ? weighInsSet.has(dateStr) : false;

            // Get streak position and milestone
            let streakPosition: StreakPosition = 'none';
            let milestone: 7 | 14 | 30 | null = null;

            if (day && dateStr) {
              const { prev, next } = getAdjacentDates(day);
              streakPosition = getStreakPosition(
                dateStr,
                prev,
                next,
                streakData.streakDays
              );
              milestone = streakData.milestoneDays.get(dateStr) || null;
            }

            return (
              <JourneyDay
                key={dayIndex}
                day={day}
                isToday={isToday}
                isSelected={isSelected}
                isFuture={isFuture}
                completionPercent={completionPercent as 0 | 33 | 66 | 100}
                hasInjection={hasInjection}
                hasWeighIn={hasWeighIn}
                streakPosition={streakPosition}
                milestone={milestone}
                onPress={handleDayPress}
              />
            );
          })}
        </Animated.View>
      ))}

      {/* Legend */}
      <JourneyLegend />
    </View>
  );
}

export default MonthGrid;
