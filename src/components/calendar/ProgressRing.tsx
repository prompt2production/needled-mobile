/**
 * ProgressRing Component
 * Circular SVG progress indicator with animation support
 */

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  size: number;
  percent: number;
  strokeWidth?: number;
  animated?: boolean;
  backgroundColor?: string;
  progressColor?: string;
  useGradient?: boolean;
  children?: React.ReactNode;
}

export function ProgressRing({
  size,
  percent,
  strokeWidth = 3,
  animated = true,
  backgroundColor = '#E5E7EB',
  progressColor = '#14B8A6',
  useGradient = false,
  children,
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  useEffect(() => {
    if (animated) {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: percent,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(percent);
    }
  }, [percent, animated, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {useGradient && (
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#14B8A6" />
              <Stop offset="100%" stopColor="#0D9488" />
            </LinearGradient>
          </Defs>
        )}

        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={useGradient ? 'url(#progressGradient)' : progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>

      {/* Children (usually centered content) */}
      {children}
    </View>
  );
}

/**
 * Small progress ring for day cells
 */
interface MiniProgressRingProps {
  size: number;
  percent: 0 | 33 | 66 | 100;
  isDark?: boolean;
}

export function MiniProgressRing({ size, percent, isDark = false }: MiniProgressRingProps) {
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Color based on completion
  const getProgressColor = () => {
    if (percent === 100) return '#0D9488'; // teal-600
    if (percent >= 66) return '#14B8A6'; // teal-500
    if (percent >= 33) return '#5EEAD4'; // teal-300
    return 'transparent';
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={isDark ? '#374151' : '#E5E7EB'}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        {percent > 0 && (
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={getProgressColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${center}, ${center})`}
          />
        )}
      </Svg>
    </View>
  );
}

export default ProgressRing;
