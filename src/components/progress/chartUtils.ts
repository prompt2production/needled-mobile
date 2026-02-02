/**
 * Chart Utility Functions
 * Helper functions for weight progress chart rendering
 */

import { WeightProgressData } from '@/types/api';

export interface ChartPoint {
  x: number; // 0-1 normalized position
  y: number; // 0-1 normalized position
  date: string;
  weight: number;
  dosageMg: number | null;
}

export interface DosageSegment {
  startX: number;
  endX: number;
  dosageMg: number;
  color: string;
  lineColor: string;
}

/**
 * Calculate min/max weight values with padding
 */
export function getWeightBounds(
  data: WeightProgressData
): { min: number; max: number } {
  if (data.weighIns.length === 0) {
    return { min: 0, max: 100 };
  }

  const weights = data.weighIns.map((w) => w.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);

  // Add padding (5% on each side)
  const range = max - min || 10;
  const padding = range * 0.1;

  return {
    min: Math.floor(min - padding),
    max: Math.ceil(max + padding),
  };
}

/**
 * Convert data points to normalized chart coordinates
 */
export function normalizeChartPoints(
  data: WeightProgressData,
  bounds: { min: number; max: number }
): ChartPoint[] {
  if (data.weighIns.length === 0) return [];

  const sortedWeighIns = [...data.weighIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedWeighIns[0].date).getTime();
  const endDate = new Date(sortedWeighIns[sortedWeighIns.length - 1].date).getTime();
  const dateRange = endDate - startDate || 1;
  const weightRange = bounds.max - bounds.min || 1;

  return sortedWeighIns.map((weighIn) => ({
    x: (new Date(weighIn.date).getTime() - startDate) / dateRange,
    y: 1 - (weighIn.weight - bounds.min) / weightRange, // Invert Y so higher weights are at top
    date: weighIn.date,
    weight: weighIn.weight,
    dosageMg: weighIn.dosageMg,
  }));
}

/**
 * Distinct colors for dosage line segments
 * Each dosage level gets a unique, easily distinguishable color
 */
export const DOSAGE_LINE_COLORS = [
  '#9CA3AF', // Gray - lowest dose (2.5mg)
  '#14B8A6', // Teal (5mg)
  '#22C55E', // Green (7.5mg)
  '#FB7185', // Coral/Pink (10mg)
  '#8B5CF6', // Purple (12.5mg)
  '#3B82F6', // Blue (15mg)
];

/**
 * Get line color for a specific dosage
 * Maps dosage level to a distinct color from the palette
 */
export function getDosageLineColor(dosageMg: number, medication: string): string {
  // Define dose ranges for different medications
  const doseRanges: Record<string, number[]> = {
    OZEMPIC: [0.25, 0.5, 1, 2],
    WEGOVY: [0.25, 0.5, 1, 1.7, 2.4],
    MOUNJARO: [2.5, 5, 7.5, 10, 12.5, 15],
    ZEPBOUND: [2.5, 5, 7.5, 10, 12.5, 15],
  };

  const range = doseRanges[medication] || doseRanges.MOUNJARO;
  const index = range.indexOf(dosageMg);
  const colorIndex = index >= 0 ? index : 0;

  return DOSAGE_LINE_COLORS[colorIndex % DOSAGE_LINE_COLORS.length];
}

/**
 * Get teal color for dosage level (background shading - optional, low opacity)
 * Lower doses = lighter teal, higher doses = darker teal
 */
export function getDosageColor(
  dosageMg: number,
  medication: string,
  opacity: number = 0.08
): string {
  // Define dose ranges for different medications
  const doseRanges: Record<string, number[]> = {
    OZEMPIC: [0.25, 0.5, 1, 2],
    WEGOVY: [0.25, 0.5, 1, 1.7, 2.4],
    MOUNJARO: [2.5, 5, 7.5, 10, 12.5, 15],
    ZEPBOUND: [2.5, 5, 7.5, 10, 12.5, 15],
  };

  const range = doseRanges[medication] || doseRanges.MOUNJARO;
  const index = range.indexOf(dosageMg);
  const normalizedIndex = index >= 0 ? index : 0;
  const maxIndex = range.length - 1;

  // Map to teal shades (100-600)
  const tealShades = [
    `rgba(204, 251, 241, ${opacity})`, // teal-100
    `rgba(153, 246, 228, ${opacity})`, // teal-200
    `rgba(94, 234, 212, ${opacity})`,  // teal-300
    `rgba(45, 212, 191, ${opacity})`,  // teal-400
    `rgba(20, 184, 166, ${opacity})`,  // teal-500
    `rgba(13, 148, 136, ${opacity})`,  // teal-600
  ];

  const shadeIndex = Math.min(
    Math.floor((normalizedIndex / maxIndex) * (tealShades.length - 1)),
    tealShades.length - 1
  );

  return tealShades[shadeIndex] || tealShades[0];
}

/**
 * Calculate dosage segments for background rendering and line coloring
 */
export function calculateDosageSegments(
  data: WeightProgressData,
  medication: string
): DosageSegment[] {
  if (data.weighIns.length === 0) return [];

  const sortedWeighIns = [...data.weighIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedWeighIns[0].date).getTime();
  const endDate = new Date(sortedWeighIns[sortedWeighIns.length - 1].date).getTime();
  const dateRange = endDate - startDate || 1;

  const segments: DosageSegment[] = [];
  let currentDosage: number | null = null;
  let segmentStartX = 0;

  // Track dosage changes from injection data
  const dosageChanges = [...data.dosageChanges].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // If no dosage changes, use first weigh-in dosage for whole chart
  if (dosageChanges.length === 0) {
    const firstDosage = sortedWeighIns.find((w) => w.dosageMg !== null)?.dosageMg;
    if (firstDosage) {
      return [
        {
          startX: 0,
          endX: 1,
          dosageMg: firstDosage,
          color: getDosageColor(firstDosage, medication),
          lineColor: getDosageLineColor(firstDosage, medication),
        },
      ];
    }
    return [];
  }

  // Build segments from dosage changes
  for (let i = 0; i < dosageChanges.length; i++) {
    const change = dosageChanges[i];
    const changeX = (new Date(change.date).getTime() - startDate) / dateRange;

    if (currentDosage !== null) {
      segments.push({
        startX: segmentStartX,
        endX: changeX,
        dosageMg: currentDosage,
        color: getDosageColor(currentDosage, medication),
        lineColor: getDosageLineColor(currentDosage, medication),
      });
    }

    currentDosage = change.toDosage;
    segmentStartX = changeX;
  }

  // Add final segment
  if (currentDosage !== null) {
    segments.push({
      startX: segmentStartX,
      endX: 1,
      dosageMg: currentDosage,
      color: getDosageColor(currentDosage, medication),
      lineColor: getDosageLineColor(currentDosage, medication),
    });
  }

  return segments;
}

/**
 * Generate smooth bezier curve path for SVG
 */
export function generateSmoothPath(
  points: ChartPoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number }
): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const x = padding.left + points[0].x * (width - padding.left - padding.right);
    const y = padding.top + points[0].y * (height - padding.top - padding.bottom);
    return `M ${x} ${y}`;
  }

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Convert normalized points to pixel coordinates
  const pixelPoints = points.map((p) => ({
    x: padding.left + p.x * chartWidth,
    y: padding.top + p.y * chartHeight,
  }));

  // Generate smooth bezier curve
  let path = `M ${pixelPoints[0].x} ${pixelPoints[0].y}`;

  for (let i = 0; i < pixelPoints.length - 1; i++) {
    const p0 = pixelPoints[Math.max(0, i - 1)];
    const p1 = pixelPoints[i];
    const p2 = pixelPoints[i + 1];
    const p3 = pixelPoints[Math.min(pixelPoints.length - 1, i + 2)];

    // Calculate control points using Catmull-Rom to Bezier conversion
    const tension = 0.3;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Format date for axis label
 */
export function formatAxisDate(date: string): string {
  const d = new Date(date);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  return `${month} ${day}`;
}

/**
 * Generate Y-axis labels
 */
export function generateYAxisLabels(
  min: number,
  max: number,
  count: number = 5
): number[] {
  const range = max - min;
  const step = range / (count - 1);
  const labels: number[] = [];

  for (let i = 0; i < count; i++) {
    labels.push(Math.round(min + step * i));
  }

  return labels;
}

/**
 * Bar position information for rendering
 */
export interface BarPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  point: ChartPoint;
  index: number;
}

/**
 * Calculate bar positions for bar chart rendering
 */
export function calculateBarPositions(
  points: ChartPoint[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  bounds: { min: number; max: number },
  medication: string
): BarPosition[] {
  if (points.length === 0) return [];

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate bar dimensions
  const barGap = 2;
  const totalGaps = (points.length - 1) * barGap;
  const barWidth = Math.max(4, (chartWidth - totalGaps) / points.length);
  const effectiveBarWidth = Math.min(barWidth, 24);

  // Recalculate offset to center bars
  const actualTotalWidth = points.length * effectiveBarWidth + totalGaps;
  const startOffset = (chartWidth - actualTotalWidth) / 2;

  const chartBottom = padding.top + chartHeight;
  const weightRange = bounds.max - bounds.min || 1;

  return points.map((point, index) => {
    const barX = padding.left + startOffset + index * (effectiveBarWidth + barGap);
    const normalizedWeight = (point.weight - bounds.min) / weightRange;
    const barHeight = Math.max(2, normalizedWeight * chartHeight);
    const barY = chartBottom - barHeight;

    const barColor = point.dosageMg
      ? getDosageLineColor(point.dosageMg, medication)
      : '#9CA3AF';

    return {
      x: barX,
      y: barY,
      width: effectiveBarWidth,
      height: barHeight,
      color: barColor,
      point,
      index,
    };
  });
}

/**
 * Get unique dosages present in chart data
 */
export function getUniqueDosages(
  points: ChartPoint[],
  medication: string
): { dosageMg: number; color: string }[] {
  const seen = new Set<number>();
  const result: { dosageMg: number; color: string }[] = [];

  for (const point of points) {
    if (point.dosageMg !== null && !seen.has(point.dosageMg)) {
      seen.add(point.dosageMg);
      result.push({
        dosageMg: point.dosageMg,
        color: getDosageLineColor(point.dosageMg, medication),
      });
    }
  }

  // Sort by dosage amount
  return result.sort((a, b) => a.dosageMg - b.dosageMg);
}
