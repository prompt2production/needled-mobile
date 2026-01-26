import React from 'react';
import { View, Text } from 'react-native';

export interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'teal' | 'coral' | 'yellow' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const variantStyles = {
  teal: {
    track: 'bg-teal-100',
    fill: 'bg-teal-500',
  },
  coral: {
    track: 'bg-coral-light',
    fill: 'bg-coral',
  },
  yellow: {
    track: 'bg-yellow-light',
    fill: 'bg-yellow',
  },
  success: {
    track: 'bg-success-light',
    fill: 'bg-success',
  },
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  progress,
  variant = 'teal',
  size = 'md',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View className={className}>
      {(showLabel || label) && (
        <View className="flex-row justify-between mb-1">
          {label && (
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {label}
            </Text>
          )}
          {showLabel && (
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View
        className={`
          w-full rounded-full overflow-hidden
          ${variantStyle.track}
          ${sizeStyle}
        `}
      >
        <View
          className={`
            h-full rounded-full
            ${variantStyle.fill}
          `}
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
    </View>
  );
}

// Circular progress variant
export interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'teal' | 'coral' | 'yellow' | 'success';
  children?: React.ReactNode;
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 8,
  variant = 'teal',
  children,
}: CircularProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const colorMap = {
    teal: '#14B8A6',
    coral: '#FB7185',
    yellow: '#FBBF24',
    success: '#22C55E',
  };

  const trackColor = '#E5E7EB';
  const fillColor = colorMap[variant];

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      {/* SVG would go here - for now using a simple View-based approach */}
      <View
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          borderWidth: strokeWidth,
          borderColor: trackColor,
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          borderWidth: strokeWidth,
          borderColor: fillColor,
          borderLeftColor: 'transparent',
          borderBottomColor: clampedProgress > 25 ? fillColor : 'transparent',
          borderRightColor: clampedProgress > 50 ? fillColor : 'transparent',
          borderTopColor: clampedProgress > 75 ? fillColor : 'transparent',
          transform: [{ rotate: '-90deg' }],
        }}
      />
      {children && (
        <View className="absolute items-center justify-center">
          {children}
        </View>
      )}
    </View>
  );
}

export default ProgressBar;
