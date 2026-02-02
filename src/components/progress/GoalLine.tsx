/**
 * GoalLine Component
 * Renders a bold coral line overlay showing the ideal trajectory from start weight to goal weight
 * Features filled circle markers at both endpoints
 * Only rendered when both goalWeight AND goalDate are provided
 */

import React from 'react';
import Svg, { Line, Circle } from 'react-native-svg';

interface GoalLineProps {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
  startWeight: number;
  goalWeight: number;
  bounds: { min: number; max: number };
  /** Optional X position for goal endpoint (0-1 range within chart). Defaults to right edge (1) */
  goalXPosition?: number;
}

// Coral color for the goal line - stands out against teal/gray bars
const GOAL_LINE_COLOR = '#FB7185';
const STROKE_WIDTH = 2.5;
const MARKER_RADIUS = 4;

export function GoalLine({
  width,
  height,
  padding,
  startWeight,
  goalWeight,
  bounds,
  goalXPosition = 1,
}: GoalLineProps) {
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const weightRange = bounds.max - bounds.min || 1;

  // Calculate Y positions for start and goal weights
  // Y is inverted: higher weight = lower Y position (closer to top)
  const startY =
    padding.top + (1 - (startWeight - bounds.min) / weightRange) * chartHeight;
  const goalY =
    padding.top + (1 - (goalWeight - bounds.min) / weightRange) * chartHeight;

  // X positions: start at left edge, goal at specified position (default right edge)
  const x1 = padding.left;
  const x2 = padding.left + chartWidth * goalXPosition;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute' }}>
      {/* Main goal line */}
      <Line
        x1={x1}
        y1={startY}
        x2={x2}
        y2={goalY}
        stroke={GOAL_LINE_COLOR}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray="6,3"
        strokeLinecap="round"
      />
      {/* Start point marker */}
      <Circle
        cx={x1}
        cy={startY}
        r={MARKER_RADIUS}
        fill={GOAL_LINE_COLOR}
      />
      {/* Goal point marker */}
      <Circle
        cx={x2}
        cy={goalY}
        r={MARKER_RADIUS}
        fill={GOAL_LINE_COLOR}
      />
    </Svg>
  );
}

export default GoalLine;
