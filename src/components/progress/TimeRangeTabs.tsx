/**
 * TimeRangeTabs Component
 * Tab selector for chart time range
 */

import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { ChartTimeRange } from '@/types/api';

interface TimeRangeTabsProps {
  selectedRange: ChartTimeRange;
  onRangeChange: (range: ChartTimeRange) => void;
}

const RANGES: { value: ChartTimeRange; label: string }[] = [
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'ALL', label: 'All' },
];

export function TimeRangeTabs({ selectedRange, onRangeChange }: TimeRangeTabsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: isDark ? '#374151' : '#F3F4F6',
        borderRadius: 12,
        padding: 4,
      }}
    >
      {RANGES.map(({ value, label }) => {
        const isSelected = selectedRange === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onRangeChange(value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: isSelected
                ? isDark
                  ? '#1E1E2E'
                  : '#FFFFFF'
                : 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: isSelected ? '600' : '500',
                color: isSelected
                  ? '#14B8A6'
                  : isDark
                  ? '#9CA3AF'
                  : '#6B7280',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default TimeRangeTabs;
