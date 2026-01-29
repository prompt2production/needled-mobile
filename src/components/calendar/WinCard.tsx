/**
 * WinCard Component
 * Gradient stat card for monthly wins section
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

export type WinCardVariant = 'coral' | 'yellow' | 'teal' | 'green';

interface WinCardProps {
  variant: WinCardVariant;
  emoji: string;
  value: string;
  label: string;
}

export function WinCard({ variant, emoji, value, label }: WinCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getColors = () => {
    switch (variant) {
      case 'coral':
        return {
          bg: isDark ? 'rgba(251, 113, 133, 0.15)' : '#FECDD3',
          border: isDark ? '#FB7185' : '#FB7185',
          text: isDark ? '#FB7185' : '#BE185D',
        };
      case 'yellow':
        return {
          bg: isDark ? 'rgba(251, 191, 36, 0.15)' : '#FEF3C7',
          border: isDark ? '#FBBF24' : '#FBBF24',
          text: isDark ? '#FBBF24' : '#92400E',
        };
      case 'teal':
        return {
          bg: isDark ? 'rgba(20, 184, 166, 0.15)' : '#CCFBF1',
          border: isDark ? '#14B8A6' : '#14B8A6',
          text: isDark ? '#14B8A6' : '#0F766E',
        };
      case 'green':
        return {
          bg: isDark ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7',
          border: isDark ? '#22C55E' : '#22C55E',
          text: isDark ? '#22C55E' : '#166534',
        };
    }
  };

  const colors = getColors();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        borderRadius: 16,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default WinCard;
