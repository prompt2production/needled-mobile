/**
 * ChartAxis Component
 * X-axis date labels for the weight chart
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { ChartPoint, formatAxisDate } from './chartUtils';

interface ChartAxisProps {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  points: ChartPoint[];
  maxLabels?: number;
}

export function ChartAxis({
  width,
  height,
  padding,
  points,
  maxLabels = 5,
}: ChartAxisProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (points.length === 0) return null;

  const chartWidth = width - padding.left - padding.right;
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  // Select evenly distributed points for labels
  const step = Math.max(1, Math.floor(points.length / maxLabels));
  const labelPoints = points.filter((_, index) =>
    index === 0 ||
    index === points.length - 1 ||
    index % step === 0
  ).slice(0, maxLabels);

  return (
    <View
      style={{
        position: 'absolute',
        top: height - padding.bottom + 4,
        left: padding.left,
        width: chartWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      {labelPoints.map((point, index) => (
        <Text
          key={`axis-${point.date}-${index}`}
          style={{
            fontSize: 10,
            color: textColor,
            fontWeight: '500',
          }}
        >
          {formatAxisDate(point.date)}
        </Text>
      ))}
    </View>
  );
}

export default ChartAxis;
