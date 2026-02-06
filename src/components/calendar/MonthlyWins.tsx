/**
 * MonthlyWins Component
 * Stats section for monthly progress
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { HeroStat } from './HeroStat';
import { WinCard } from './WinCard';

interface MonthlyWinsProps {
  stats: {
    completionPercent: number;
    perfectDays: number;
    totalInjections: number;
    totalWeighIns: number;
    bestStreak: number;
    weightChange: number | null;
  };
  weightUnit: string;
  monthName: string;
}

export function MonthlyWins({
  stats,
  weightUnit,
  monthName,
}: MonthlyWinsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Format weight change
  const formatWeightChange = () => {
    if (stats.weightChange === null) return '—';
    const sign = stats.weightChange < 0 ? '' : '+';
    return `${sign}${stats.weightChange.toFixed(1)} ${weightUnit}`;
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
      }}
    >
      {/* Title */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: isDark ? '#F9FAFB' : '#111827',
          marginBottom: 4,
        }}
      >
        🏆 Monthly Wins
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 12,
        }}
      >
        {monthName}
      </Text>

      {/* Hero stat - large progress ring */}
      <HeroStat completionPercent={stats.completionPercent} />

      {/* Win cards grid - 2x2 */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <WinCard
            variant="coral"
            emoji="💉"
            value={stats.totalInjections.toString()}
            label="Injections"
          />
          <WinCard
            variant="yellow"
            emoji="⚖️"
            value={stats.totalWeighIns.toString()}
            label="Weigh-ins"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <WinCard
            variant="teal"
            emoji="🔥"
            value={stats.bestStreak.toString()}
            label="Best Streak"
          />
          <WinCard
            variant="green"
            emoji={stats.weightChange !== null && stats.weightChange < 0 ? '📉' : '📊'}
            value={formatWeightChange()}
            label="Weight Change"
          />
        </View>
      </View>

      {/* Branding */}
      <View
        style={{
          alignItems: 'center',
          marginTop: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: isDark ? '#6B7280' : '#9CA3AF',
          }}
        >
          Tracked with Needled
        </Text>
      </View>
    </View>
  );
}

export default MonthlyWins;
