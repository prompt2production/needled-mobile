/**
 * WeighInHistory Component
 * List of recent weigh-ins
 */

import React, { useState } from 'react';
import { View, Text, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { WeighIn, WeightUnit } from '@/types/api';

interface WeighInHistoryProps {
  weighIns: WeighIn[] | undefined;
  isLoading: boolean;
  weightUnit: WeightUnit;
  defaultExpanded?: boolean;
}

export function WeighInHistory({
  weighIns,
  isLoading,
  weightUnit,
  defaultExpanded = false,
}: WeighInHistoryProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate change from previous weigh-in
  const getChange = (index: number): number | null => {
    if (!weighIns || index >= weighIns.length - 1) return null;
    const current = weighIns[index].weight;
    const previous = weighIns[index + 1].weight;
    return current - previous;
  };

  const hasHistory = weighIns && weighIns.length > 0;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Header - Always visible */}
      <Pressable
        onPress={toggleExpanded}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          Weigh-in History
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {hasHistory && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginRight: 8,
              }}
            >
              {weighIns.length} entries
            </Text>
          )}
          <Text
            style={{
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {expanded ? '−' : '+'}
          </Text>
        </View>
      </Pressable>

      {/* Content - Expandable */}
      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="small" color="#14B8A6" />
            </View>
          ) : !hasHistory ? (
            <View
              style={{
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textAlign: 'center',
                }}
              >
                No weigh-ins logged yet.{'\n'}Your history will appear here.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {weighIns.map((weighIn, index) => (
                <WeighInHistoryItem
                  key={weighIn.id}
                  weighIn={weighIn}
                  change={getChange(index)}
                  weightUnit={weightUnit}
                  isDark={isDark}
                  formatDate={formatDate}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface WeighInHistoryItemProps {
  weighIn: WeighIn;
  change: number | null;
  weightUnit: WeightUnit;
  isDark: boolean;
  formatDate: (dateStr: string) => string;
}

function WeighInHistoryItem({
  weighIn,
  change,
  weightUnit,
  isDark,
  formatDate,
}: WeighInHistoryItemProps) {
  const formatChange = (ch: number | null) => {
    if (ch === null) return '';
    const sign = ch > 0 ? '+' : '';
    return `${sign}${ch.toFixed(1)}`;
  };

  const getChangeColor = (ch: number | null) => {
    if (ch === null) return isDark ? '#9CA3AF' : '#6B7280';
    if (ch < 0) return '#22C55E'; // Green for weight loss
    if (ch > 0) return '#F59E0B'; // Yellow/orange for weight gain
    return isDark ? '#9CA3AF' : '#6B7280'; // Neutral for no change
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#374151' : '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: Date */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          {formatDate(weighIn.date)}
        </Text>
      </View>

      {/* Center: Weight */}
      <View style={{ alignItems: 'center', marginHorizontal: 16 }}>
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          {weighIn.weight.toFixed(1)} {weightUnit}
        </Text>
      </View>

      {/* Right: Change */}
      <View style={{ width: 60, alignItems: 'flex-end' }}>
        {change !== null && (
          <View
            style={{
              backgroundColor:
                change < 0
                  ? isDark
                    ? 'rgba(34, 197, 94, 0.2)'
                    : '#DCFCE7'
                  : change > 0
                  ? isDark
                    ? 'rgba(245, 158, 11, 0.2)'
                    : '#FEF3C7'
                  : isDark
                  ? '#4B5563'
                  : '#E5E7EB',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: getChangeColor(change),
              }}
            >
              {formatChange(change)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default WeighInHistory;
