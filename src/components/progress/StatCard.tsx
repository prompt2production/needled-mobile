/**
 * StatCard Component
 * Individual stat display card for the progress screen
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  highlight = false,
}: StatCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Trend colors
  const getTrendColor = () => {
    switch (trend) {
      case 'down':
        return '#22C55E'; // Green for weight loss
      case 'up':
        return '#FB7185'; // Coral for weight gain
      default:
        return isDark ? '#9CA3AF' : '#6B7280';
    }
  };

  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        backgroundColor: highlight
          ? isDark
            ? 'rgba(20, 184, 166, 0.1)'
            : '#F0FDFA'
          : isDark
          ? '#374151'
          : '#F9FAFB',
        borderRadius: 16,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 6,
        }}
      >
        {label}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: trend
              ? getTrendColor()
              : highlight
              ? '#14B8A6'
              : isDark
              ? '#F9FAFB'
              : '#111827',
          }}
        >
          {value}
        </Text>
        {unit && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginLeft: 4,
            }}
          >
            {unit}
          </Text>
        )}
      </View>
    </View>
  );
}

export default StatCard;
