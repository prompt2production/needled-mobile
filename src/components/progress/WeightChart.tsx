/**
 * WeightChart Component
 * Main chart wrapper combining bar chart with goal line overlay
 */

import React, { useState } from 'react';
import { View, Text, useColorScheme, Dimensions, TouchableOpacity } from 'react-native';
import { WeightProgressData, Medication, WeightUnit } from '@/types/api';
import { ChartGrid } from './ChartGrid';
import { ChartAxis } from './ChartAxis';
import { BarChart } from './BarChart';
import { GoalLine } from './GoalLine';
import {
  getWeightBounds,
  normalizeChartPoints,
  getDosageLineColor,
  getUniqueDosages,
  calculateBarPositions,
  ChartPoint,
} from './chartUtils';

const { width: screenWidth } = Dimensions.get('window');

interface WeightChartProps {
  data: WeightProgressData;
  medication: Medication;
  weightUnit: WeightUnit;
  height?: number;
  startWeight?: number | null;
  goalWeight?: number | null;
  goalDate?: string | null; // ISO date string - target date to reach goal weight
}

export function WeightChart({
  data,
  medication,
  weightUnit,
  height = 260,
  startWeight,
  goalWeight,
  goalDate,
}: WeightChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Chart dimensions
  const chartWidth = screenWidth - 32; // Account for container padding
  const padding = {
    top: 20,
    right: 16,
    bottom: 30, // Space for X-axis labels
    left: 40, // Space for Y-axis labels
  };

  // Calculate bounds - include goal weight in bounds if present
  const baseBounds = getWeightBounds(data);
  const bounds = {
    min: goalWeight ? Math.min(baseBounds.min, goalWeight - 2) : baseBounds.min,
    max: startWeight ? Math.max(baseBounds.max, startWeight + 2) : baseBounds.max,
  };

  const points = normalizeChartPoints(data, bounds);

  // Selected point state for touch interaction
  const [selectedPoint, setSelectedPoint] = useState<ChartPoint | null>(null);

  // Handle point selection
  const handlePointTouch = (point: ChartPoint) => {
    setSelectedPoint(selectedPoint?.date === point.date ? null : point);
  };

  // Get unique dosages for legend
  const uniqueDosages = getUniqueDosages(points, medication);

  // Calculate bar positions for touch targets
  const barPositions = calculateBarPositions(points, chartWidth, height, padding, bounds, medication);

  // Determine if goal line should be shown (requires both goalWeight AND goalDate)
  const showGoalLine = startWeight && goalWeight && goalDate;

  // Calculate goal X position based on goalDate relative to chart's date range
  const calculateGoalXPosition = (): number => {
    if (!goalDate || points.length === 0) return 1;

    const goalDateTime = new Date(goalDate).getTime();
    const firstDate = new Date(points[0].date).getTime();
    const lastDate = new Date(points[points.length - 1].date).getTime();

    // If goal date is before or at first date, position at left
    if (goalDateTime <= firstDate) return 0;
    // If goal date is beyond chart range, position at right edge
    if (goalDateTime >= lastDate) return 1;

    // Calculate proportional position within the date range
    const dateRange = lastDate - firstDate;
    if (dateRange === 0) return 1;
    return (goalDateTime - firstDate) / dateRange;
  };

  const goalXPosition = calculateGoalXPosition();

  // Empty state
  if (data.weighIns.length === 0) {
    return (
      <View
        style={{
          backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          height,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginBottom: 8,
          }}
        >
          No weigh-ins yet
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark ? '#6B7280' : '#9CA3AF',
            textAlign: 'center',
          }}
        >
          Log your first weigh-in to see your progress chart
        </Text>
      </View>
    );
  }

  // Single point state
  if (data.weighIns.length === 1) {
    const weighIn = data.weighIns[0];
    return (
      <View
        style={{
          backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
          borderRadius: 20,
          padding: 24,
          alignItems: 'center',
          justifyContent: 'center',
          height,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginBottom: 8,
          }}
        >
          Starting weight
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          {weighIn.weight.toFixed(1)} {weightUnit}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: isDark ? '#6B7280' : '#9CA3AF',
            marginTop: 8,
          }}
        >
          Log more weigh-ins to see your progress
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Selected point tooltip */}
      {selectedPoint && (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 16,
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {new Date(selectedPoint.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: selectedPoint.dosageMg
                ? getDosageLineColor(selectedPoint.dosageMg, medication)
                : '#FB7185',
            }}
          >
            {selectedPoint.weight.toFixed(1)} {weightUnit}
          </Text>
          {selectedPoint.dosageMg && (
            <Text
              style={{
                fontSize: 11,
                color: getDosageLineColor(selectedPoint.dosageMg, medication),
                fontWeight: '600',
              }}
            >
              {selectedPoint.dosageMg}mg dose
            </Text>
          )}
        </View>
      )}

      {/* Chart container */}
      <View style={{ width: chartWidth, height }}>
        {/* Grid lines */}
        <ChartGrid
          width={chartWidth}
          height={height}
          padding={padding}
          minWeight={bounds.min}
          maxWeight={bounds.max}
          weightUnit={weightUnit}
        />

        {/* Bar chart */}
        <BarChart
          width={chartWidth}
          height={height}
          padding={padding}
          points={points}
          medication={medication}
          bounds={bounds}
        />

        {/* Goal line overlay - only shown if both goalWeight AND goalDate exist */}
        {showGoalLine && (
          <GoalLine
            width={chartWidth}
            height={height}
            padding={padding}
            startWeight={startWeight}
            goalWeight={goalWeight}
            bounds={bounds}
            goalXPosition={goalXPosition}
          />
        )}

        {/* X-axis */}
        <ChartAxis
          width={chartWidth}
          height={height}
          padding={padding}
          points={points}
        />

        {/* Touch targets for bars */}
        <View style={{ position: 'absolute', width: chartWidth, height }}>
          {barPositions.map((bar) => (
            <TouchableOpacity
              key={`touch-${bar.index}`}
              onPress={() => handlePointTouch(bar.point)}
              style={{
                position: 'absolute',
                left: bar.x - 8,
                top: bar.y - 8,
                width: bar.width + 16,
                height: bar.height + 16,
              }}
              activeOpacity={1}
            />
          ))}
        </View>
      </View>

      {/* Legend - shows each dosage present in data with its color */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          flexWrap: 'wrap',
          paddingVertical: 12,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        {uniqueDosages.map((dosage) => (
          <View
            key={`legend-${dosage.dosageMg}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                backgroundColor: dosage.color,
                borderRadius: 2,
              }}
            />
            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>
              {dosage.dosageMg}mg
            </Text>
          </View>
        ))}
        {/* Goal line legend item - only show if both goalWeight AND goalDate exist */}
        {showGoalLine && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View
              style={{
                width: 16,
                height: 0,
                borderTopWidth: 2.5,
                borderTopColor: '#FB7185',
                borderStyle: 'dashed',
              }}
            />
            <Text style={{ fontSize: 11, color: isDark ? '#9CA3AF' : '#6B7280' }}>
              Goal
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default WeightChart;
