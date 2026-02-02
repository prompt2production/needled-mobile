/**
 * BarChart Component
 * Renders vertical bars for each weigh-in, colored by dosage
 */

import React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Rect, ClipPath, Defs } from 'react-native-svg';
import { ChartPoint, getDosageLineColor } from './chartUtils';

interface BarChartProps {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  points: ChartPoint[];
  medication: string;
  bounds: { min: number; max: number };
}

export function BarChart({
  width,
  height,
  padding,
  points,
  medication,
  bounds,
}: BarChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (points.length === 0) return null;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate bar dimensions
  const barGap = 2; // Gap between bars
  const totalGaps = (points.length - 1) * barGap;
  const barWidth = Math.max(4, (chartWidth - totalGaps) / points.length);
  const effectiveBarWidth = Math.min(barWidth, 24); // Cap bar width for aesthetics

  // Recalculate if bars would be too narrow
  const actualTotalWidth = points.length * effectiveBarWidth + totalGaps;
  const startOffset = (chartWidth - actualTotalWidth) / 2;

  // Calculate chart bottom (where min weight would be) - bars grow upward from here
  const chartBottom = padding.top + chartHeight;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute' }}>
      <Defs>
        <ClipPath id="barClip">
          <Rect
            x={padding.left}
            y={padding.top}
            width={chartWidth}
            height={chartHeight}
          />
        </ClipPath>
      </Defs>

      {points.map((point, index) => {
        // X position for this bar
        const barX = padding.left + startOffset + index * (effectiveBarWidth + barGap);

        // Y position - where the top of the bar should be (lower weight = lower Y = taller bar from bottom)
        // point.y is normalized 0-1 where 0 = top (max weight), 1 = bottom (min weight)
        // But wait - higher weight should have taller bars visually
        // So we need to invert: bar height should be proportional to weight value
        const weightRange = bounds.max - bounds.min || 1;
        const normalizedWeight = (point.weight - bounds.min) / weightRange;

        // Bar height is proportional to weight (heavier = taller bar)
        const barHeight = Math.max(2, normalizedWeight * chartHeight);

        // Bar Y position (top of the bar) - bars grow up from chart bottom
        const barY = chartBottom - barHeight;

        // Get color based on dosage
        const barColor = point.dosageMg
          ? getDosageLineColor(point.dosageMg, medication)
          : isDark
          ? '#9CA3AF'
          : '#6B7280';

        return (
          <Rect
            key={`bar-${index}`}
            x={barX}
            y={barY}
            width={effectiveBarWidth}
            height={barHeight}
            fill={barColor}
            rx={3}
            ry={3}
            clipPath="url(#barClip)"
          />
        );
      })}
    </Svg>
  );
}

export default BarChart;
