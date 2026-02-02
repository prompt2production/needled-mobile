/**
 * ChartGrid Component
 * Background gridlines for the weight chart
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { generateYAxisLabels } from './chartUtils';
import { WeightUnit } from '@/types/api';

interface ChartGridProps {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  minWeight: number;
  maxWeight: number;
  weightUnit: WeightUnit;
  gridLineCount?: number;
}

export function ChartGrid({
  width,
  height,
  padding,
  minWeight,
  maxWeight,
  weightUnit,
  gridLineCount = 5,
}: ChartGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const labels = generateYAxisLabels(minWeight, maxWeight, gridLineCount);
  const reversedLabels = [...labels].reverse(); // Top to bottom

  const gridColor = isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.8)';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <View style={{ position: 'absolute', width, height }}>
      {/* SVG for grid lines */}
      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        {reversedLabels.map((label, index) => {
          const y =
            padding.top +
            (index / (gridLineCount - 1)) * chartHeight;

          return (
            <Line
              key={`grid-${label}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={gridColor}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          );
        })}
      </Svg>

      {/* Y-axis labels */}
      {reversedLabels.map((label, index) => {
        const y =
          padding.top +
          (index / (gridLineCount - 1)) * chartHeight;

        return (
          <Text
            key={`label-${label}`}
            style={{
              position: 'absolute',
              left: 4,
              top: y - 8,
              fontSize: 11,
              color: textColor,
              fontWeight: '500',
            }}
          >
            {label}
          </Text>
        );
      })}
    </View>
  );
}

export default ChartGrid;
