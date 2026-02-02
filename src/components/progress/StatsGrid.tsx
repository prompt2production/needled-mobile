/**
 * StatsGrid Component
 * 2x3 grid of stat cards showing weight progress metrics
 */

import React from 'react';
import { View, useColorScheme } from 'react-native';
import { WeightProgressStats, WeightUnit } from '@/types/api';
import { StatCard } from './StatCard';

interface StatsGridProps {
  stats: WeightProgressStats;
  weightUnit: WeightUnit;
}

export function StatsGrid({ stats, weightUnit }: StatsGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Format weight value
  const formatWeight = (value: number | null): string => {
    if (value === null) return '--';
    return value >= 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
  };

  // Format percentage
  const formatPercent = (value: number | null): string => {
    if (value === null) return '--';
    return `${value.toFixed(1)}%`;
  };

  // Format BMI
  const formatBmi = (value: number | null): string => {
    if (value === null) return '--';
    return value.toFixed(1);
  };

  // Determine trend direction
  const getTrend = (value: number | null): 'up' | 'down' | 'neutral' => {
    if (value === null) return 'neutral';
    if (value < 0) return 'down'; // Weight loss is down (good)
    if (value > 0) return 'up'; // Weight gain is up
    return 'neutral';
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Row 1 */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard
          label="Total Change"
          value={formatWeight(stats.totalChange)}
          unit={weightUnit}
          trend={getTrend(stats.totalChange)}
        />
        <StatCard
          label="Current BMI"
          value={formatBmi(stats.currentBmi)}
        />
      </View>

      {/* Row 2 */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard
          label="Goal Progress"
          value={stats.goalProgress !== null ? `${Math.round(stats.goalProgress)}%` : '--'}
          highlight={stats.goalProgress !== null && stats.goalProgress >= 100}
        />
        <StatCard
          label="% Change"
          value={formatPercent(stats.percentChange)}
          trend={getTrend(stats.percentChange ? -stats.percentChange : null)}
        />
      </View>

      {/* Row 3 */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <StatCard
          label="Weekly Avg"
          value={stats.weeklyAverage !== null ? formatWeight(stats.weeklyAverage) : '--'}
          unit={stats.weeklyAverage !== null ? `${weightUnit}/wk` : undefined}
          trend={getTrend(stats.weeklyAverage)}
        />
        <StatCard
          label="To Goal"
          value={stats.toGoal !== null ? Math.abs(stats.toGoal).toFixed(1) : '--'}
          unit={stats.toGoal !== null ? weightUnit : undefined}
          highlight={stats.toGoal !== null && stats.toGoal <= 0}
        />
      </View>
    </View>
  );
}

export default StatsGrid;
