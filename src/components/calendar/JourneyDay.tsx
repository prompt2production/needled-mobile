/**
 * JourneyDay Component
 * Enhanced day cell with heat map, progress rings, badges, and animations
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MiniProgressRing } from './ProgressRing';
import { LinearGradient } from 'react-native-svg';
import Svg, { Defs, Rect, Stop } from 'react-native-svg';

export type StreakPosition = 'start' | 'continue' | 'end' | 'single' | 'none';

interface JourneyDayProps {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  completionPercent: 0 | 33 | 66 | 100;
  hasInjection: boolean;
  hasWeighIn: boolean;
  streakPosition: StreakPosition;
  milestone: 7 | 14 | 30 | null;
  onPress: (day: number) => void;
}

export function JourneyDay({
  day,
  isToday,
  isSelected,
  isFuture,
  completionPercent,
  hasInjection,
  hasWeighIn,
  streakPosition,
  milestone,
  onPress,
}: JourneyDayProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Today pulsing animation
  useEffect(() => {
    if (isToday && !isSelected) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isToday, isSelected, pulseAnim]);

  // Streak glow animation
  useEffect(() => {
    if (streakPosition !== 'none') {
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      glow.start();
      return () => glow.stop();
    }
  }, [streakPosition, glowAnim]);

  // Empty cell
  if (day === null) {
    return <View style={{ flex: 1, aspectRatio: 1 }} />;
  }

  const handlePress = () => {
    if (isFuture) return;

    // Tap animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Haptics.impactAsync(
      milestone
        ? Haptics.ImpactFeedbackStyle.Heavy
        : completionPercent === 100
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );

    onPress(day);
  };

  // Heat map background colors
  const getBackgroundColor = () => {
    if (isSelected) return '#14B8A6';
    if (isFuture) return isDark ? '#1E1E2E' : '#FFFFFF';

    switch (completionPercent) {
      case 100:
        return isDark ? 'rgba(20, 184, 166, 0.25)' : '#CCFBF1'; // teal-100
      case 66:
        return isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA'; // teal-50
      case 33:
        return isDark ? 'rgba(20, 184, 166, 0.08)' : '#F0FDFA'; // lighter teal-50
      default:
        return isDark ? '#1E1E2E' : '#F9FAFB'; // gray-50
    }
  };

  // Text color
  const getTextColor = () => {
    if (isSelected) return '#FFFFFF';
    if (isFuture) return isDark ? '#4B5563' : '#9CA3AF';
    if (isToday) return '#14B8A6';
    return isDark ? '#D1D5DB' : '#374151';
  };

  const showStreak = streakPosition !== 'none' && completionPercent === 100;
  const cellSize = 40;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isFuture}
      style={{
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 1,
      }}
    >
      <Animated.View
        style={{
          width: '95%',
          aspectRatio: 1,
          borderRadius: 12,
          backgroundColor: getBackgroundColor(),
          borderWidth: isToday && !isSelected ? 2 : 0,
          borderColor: '#14B8A6',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [
            { scale: isToday && !isSelected ? pulseAnim : scaleAnim },
          ],
          // Subtle shadow for perfect days
          ...(completionPercent === 100 && !isSelected && !isFuture
            ? {
                shadowColor: '#14B8A6',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2,
              }
            : {}),
        }}
      >
        {/* Progress ring overlay for partial completion */}
        {completionPercent > 0 && completionPercent < 100 && !isSelected && !isFuture && (
          <View style={{ position: 'absolute', top: 2, right: 2 }}>
            <MiniProgressRing size={14} percent={completionPercent} isDark={isDark} />
          </View>
        )}

        {/* Milestone badge */}
        {milestone && !isSelected && (
          <View
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              zIndex: 10,
            }}
          >
            <MilestoneBadge milestone={milestone} />
          </View>
        )}

        {/* Streak fire indicator */}
        {showStreak && !milestone && !isSelected && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: 0,
              zIndex: 10,
            }}
          >
            <Text style={{ fontSize: 10 }}>🔥</Text>
          </View>
        )}

        {/* Day number */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: isToday || isSelected || completionPercent === 100 ? '700' : '500',
            color: getTextColor(),
          }}
        >
          {day}
        </Text>

        {/* Activity badges (emoji style) */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 1,
            gap: 2,
          }}
        >
          {hasInjection && (
            <View
              style={{
                backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#FECDD3',
                borderRadius: 4,
                paddingHorizontal: 2,
              }}
            >
              <Text style={{ fontSize: 8 }}>💉</Text>
            </View>
          )}
          {hasWeighIn && (
            <View
              style={{
                backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : '#FEF3C7',
                borderRadius: 4,
                paddingHorizontal: 2,
              }}
            >
              <Text style={{ fontSize: 8 }}>⚖️</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Streak connector (to next day) */}
      {(streakPosition === 'start' || streakPosition === 'continue') && (
        <StreakConnector isDark={isDark} />
      )}
    </Pressable>
  );
}

/**
 * Milestone badge component
 */
interface MilestoneBadgeProps {
  milestone: 7 | 14 | 30;
}

function MilestoneBadge({ milestone }: MilestoneBadgeProps) {
  const getEmoji = () => {
    switch (milestone) {
      case 7:
        return '⭐';
      case 14:
        return '🔥';
      case 30:
        return '🏆';
    }
  };

  const getBackgroundColor = () => {
    switch (milestone) {
      case 7:
        return '#FEF3C7'; // yellow-light
      case 14:
        return '#FFEDD5'; // orange-light
      case 30:
        return '#DBEAFE'; // blue-light (for trophy)
    }
  };

  return (
    <View
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 8,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Text style={{ fontSize: 10 }}>{getEmoji()}</Text>
    </View>
  );
}

/**
 * Streak connector between days
 */
interface StreakConnectorProps {
  isDark: boolean;
}

function StreakConnector({ isDark }: StreakConnectorProps) {
  return (
    <View
      style={{
        position: 'absolute',
        right: -3,
        width: 8,
        height: 3,
        backgroundColor: isDark ? '#0D9488' : '#14B8A6',
        borderRadius: 1.5,
        zIndex: 5,
      }}
    />
  );
}

export default JourneyDay;
