/**
 * WeighInSuccessCard Component
 * Post weigh-in confirmation card
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { WeighInLatest, WeightUnit } from '@/types/api';

interface WeighInSuccessCardProps {
  latestData: WeighInLatest;
  weightUnit: WeightUnit;
  startWeight: number;
  goalWeight: number | null;
}

export function WeighInSuccessCard({
  latestData,
  weightUnit,
  startWeight,
  goalWeight,
}: WeighInSuccessCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const currentWeight = latestData.weighIn?.weight || 0;
  const weekChange = latestData.weekChange;
  const totalChange = latestData.totalChange;

  // Format change value with sign
  const formatChange = (change: number | null) => {
    if (change === null) return '--';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} ${weightUnit}`;
  };

  // Determine if change is good (weight loss for most users)
  const isGoodChange = (change: number | null) => {
    if (change === null) return null;
    return change <= 0; // Negative or zero = good (weight loss or maintained)
  };

  // Calculate goal progress
  const getGoalProgress = () => {
    if (!goalWeight || !currentWeight) return null;
    const totalToLose = startWeight - goalWeight;
    if (totalToLose <= 0) return null;
    const lost = startWeight - currentWeight;
    const percent = Math.min(100, Math.max(0, (lost / totalToLose) * 100));
    return { percent, remaining: currentWeight - goalWeight };
  };

  const goalProgress = getGoalProgress();

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: isDark ? '#0D9488' : '#99F6E4',
      }}
    >
      {/* Success Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 20 }}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDark ? '#5EEAD4' : '#0F766E',
            }}
          >
            Weigh-in Logged!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginTop: 2,
            }}
          >
            {latestData.weighIn?.date
              ? formatDate(latestData.weighIn.date)
              : 'Today'}
          </Text>
        </View>
      </View>

      {/* Current Weight Display */}
      <View
        style={{
          backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : '#F0FDFA',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginBottom: 4,
          }}
        >
          Current Weight
        </Text>
        <Text
          style={{
            fontSize: 36,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          {currentWeight.toFixed(1)}
          <Text style={{ fontSize: 20, fontWeight: '500' }}> {weightUnit}</Text>
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {/* Week Change */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 4,
            }}
          >
            This Week
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color:
                isGoodChange(weekChange) === null
                  ? isDark
                    ? '#D1D5DB'
                    : '#4B5563'
                  : isGoodChange(weekChange)
                  ? '#22C55E'
                  : '#F59E0B',
            }}
          >
            {formatChange(weekChange)}
          </Text>
        </View>

        {/* Total Change */}
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 14,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 4,
            }}
          >
            Total
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color:
                isGoodChange(totalChange) === null
                  ? isDark
                    ? '#D1D5DB'
                    : '#4B5563'
                  : isGoodChange(totalChange)
                  ? '#22C55E'
                  : '#F59E0B',
            }}
          >
            {formatChange(totalChange)}
          </Text>
        </View>
      </View>

      {/* Goal Progress */}
      {goalProgress && goalWeight && (
        <View
          style={{
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            >
              Goal Progress
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              {goalProgress.remaining.toFixed(1)} {weightUnit} to go
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 10,
              backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${goalProgress.percent}%`,
                height: '100%',
                backgroundColor: '#14B8A6',
                borderRadius: 5,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              Start: {startWeight} {weightUnit}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#14B8A6',
                fontWeight: '600',
              }}
            >
              {goalProgress.percent.toFixed(0)}%
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: isDark ? '#9CA3AF' : '#6B7280',
              }}
            >
              Goal: {goalWeight} {weightUnit}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default WeighInSuccessCard;
