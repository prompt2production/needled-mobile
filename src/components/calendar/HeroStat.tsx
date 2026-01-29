/**
 * HeroStat Component
 * Large progress ring with percentage and comparison text
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { ProgressRing } from './ProgressRing';

interface HeroStatProps {
  completionPercent: number;
  previousMonthPercent?: number;
  monthName?: string;
}

export function HeroStat({
  completionPercent,
  previousMonthPercent,
  monthName = 'last month',
}: HeroStatProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Calculate comparison
  const getComparisonText = () => {
    if (previousMonthPercent === undefined || previousMonthPercent === null) {
      return null;
    }

    const diff = completionPercent - previousMonthPercent;
    if (diff > 0) {
      return {
        text: `↑ ${Math.abs(diff)}% better than ${monthName}!`,
        color: '#22C55E',
      };
    } else if (diff < 0) {
      return {
        text: `${Math.abs(diff)}% behind ${monthName}`,
        color: isDark ? '#9CA3AF' : '#6B7280',
      };
    }
    return {
      text: `Same as ${monthName}`,
      color: isDark ? '#9CA3AF' : '#6B7280',
    };
  };

  const comparison = getComparisonText();

  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: 16,
      }}
    >
      <ProgressRing
        size={100}
        percent={completionPercent}
        strokeWidth={8}
        animated={true}
        useGradient={true}
        backgroundColor={isDark ? '#374151' : '#E5E7EB'}
      >
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            {completionPercent}%
          </Text>
        </View>
      </ProgressRing>

      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: isDark ? '#D1D5DB' : '#374151',
          marginTop: 12,
        }}
      >
        Habit Completion
      </Text>

      {comparison && (
        <Text
          style={{
            fontSize: 12,
            color: comparison.color,
            marginTop: 4,
          }}
        >
          {comparison.text}
        </Text>
      )}
    </View>
  );
}

export default HeroStat;
