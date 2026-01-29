/**
 * WeightStatsCard Component
 * Display current weight status and stats
 */

import React from 'react';
import { View, Text, useColorScheme, Image } from 'react-native';
import { WeighInLatest, WeightUnit } from '@/types/api';

interface WeightStatsCardProps {
  latestData: WeighInLatest | null;
  weightUnit: WeightUnit;
  startWeight: number;
  goalWeight: number | null;
}

export function WeightStatsCard({
  latestData,
  weightUnit,
  startWeight,
  goalWeight,
}: WeightStatsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentWeight = latestData?.weighIn?.weight;
  const totalChange = latestData?.totalChange;
  const canWeighIn = latestData?.canWeighIn ?? true;
  const hasWeighedThisWeek = latestData?.hasWeighedThisWeek ?? false;

  // Format change value
  const formatChange = (change: number | null | undefined) => {
    if (change === null || change === undefined) return '--';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} ${weightUnit}`;
  };

  // Calculate goal progress
  const getGoalProgress = () => {
    if (!goalWeight || !currentWeight) return null;
    const totalToLose = startWeight - goalWeight;
    if (totalToLose <= 0) return null;
    const lost = startWeight - currentWeight;
    const percent = Math.min(100, Math.max(0, (lost / totalToLose) * 100));
    return percent;
  };

  const goalProgress = getGoalProgress();

  // Get last weigh-in date
  const getLastWeighInText = () => {
    if (!latestData?.weighIn?.date) return 'No weigh-ins yet';
    const date = new Date(latestData.weighIn.date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../../media/weigh-in.png')}
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            Weight Progress
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 10,
            backgroundColor: hasWeighedThisWeek
              ? isDark
                ? 'rgba(34, 197, 94, 0.2)'
                : '#DCFCE7'
              : isDark
              ? 'rgba(20, 184, 166, 0.2)'
              : '#CCFBF1',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: hasWeighedThisWeek ? '#22C55E' : '#14B8A6',
            }}
          >
            {hasWeighedThisWeek ? 'Done this week' : 'Ready to weigh'}
          </Text>
        </View>
      </View>

      {/* Current Weight */}
      {currentWeight ? (
        <View
          style={{
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 16,
            padding: 16,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 4,
            }}
          >
            Current Weight
          </Text>
          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            {currentWeight.toFixed(1)}
            <Text style={{ fontSize: 18, fontWeight: '500' }}> {weightUnit}</Text>
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginTop: 4,
            }}
          >
            Last weighed: {getLastWeighInText()}
          </Text>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
            }}
          >
            No weigh-ins recorded yet.{'\n'}Log your first weigh-in below!
          </Text>
        </View>
      )}

      {/* Stats Row */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Total Change */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 4,
            }}
          >
            Total Change
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color:
                totalChange === null || totalChange === undefined
                  ? isDark
                    ? '#D1D5DB'
                    : '#4B5563'
                  : totalChange <= 0
                  ? '#22C55E'
                  : '#F59E0B',
            }}
          >
            {formatChange(totalChange)}
          </Text>
        </View>

        {/* Start Weight */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 4,
            }}
          >
            Start Weight
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: isDark ? '#D1D5DB' : '#4B5563',
            }}
          >
            {startWeight} {weightUnit}
          </Text>
        </View>

        {/* Goal Progress */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 4,
            }}
          >
            Goal Progress
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: goalProgress !== null ? '#14B8A6' : isDark ? '#D1D5DB' : '#4B5563',
            }}
          >
            {goalProgress !== null ? `${goalProgress.toFixed(0)}%` : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default WeightStatsCard;
