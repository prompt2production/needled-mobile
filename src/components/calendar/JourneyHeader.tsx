/**
 * JourneyHeader Component
 * Gradient header with streak badge, title, and Pip integration
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, useColorScheme, Pressable } from 'react-native';
import { LinearGradient } from 'react-native-svg';
import Svg, { Defs, Rect, Stop } from 'react-native-svg';
import { PipWithBubble } from '@/components/pip';
import { PipState } from '@/components/pip/Pip';
import { getMonthName } from '@/hooks/useCalendar';

interface JourneyHeaderProps {
  year: number;
  month: number;
  currentStreak: number;
  pipState: PipState;
  pipMessage: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
  canGoNext: boolean;
  isCurrentMonth: boolean;
}

export function JourneyHeader({
  year,
  month,
  currentStreak,
  pipState,
  pipMessage,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
  canGoNext,
  isCurrentMonth,
}: JourneyHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Entry animation
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }}
    >
      {/* Gradient background */}
      <View
        style={{
          backgroundColor: isDark ? '#1E1E2E' : '#F0FDFA',
          borderRadius: 20,
          marginHorizontal: 16,
          marginTop: 16,
          overflow: 'hidden',
        }}
      >
        {/* Title row with streak badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            >
              Your Journey
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginTop: 2,
              }}
            >
              {getMonthName(month)} {year}
            </Text>
          </View>

          {/* Streak badge */}
          {currentStreak > 0 && <StreakBadge streak={currentStreak} isDark={isDark} />}
        </View>

        {/* Pip with speech bubble */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <PipWithBubble state={pipState} message={pipMessage} size="md" />
        </View>

        {/* Month navigation */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#374151' : '#CCFBF1',
          }}
        >
          <Pressable
            onPress={onPrevMonth}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#374151' : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: isDark ? '#D1D5DB' : '#374151',
              }}
            >
              ←
            </Text>
          </Pressable>

          <Pressable onPress={onGoToToday}>
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              >
                {getMonthName(month)} {year}
              </Text>
              {!isCurrentMonth && (
                <Text
                  style={{
                    fontSize: 11,
                    color: '#14B8A6',
                    marginTop: 2,
                  }}
                >
                  Tap for today
                </Text>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={onNextMonth}
            disabled={!canGoNext}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: canGoNext
                ? isDark
                  ? '#374151'
                  : '#FFFFFF'
                : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoNext ? 1 : 0.3,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                color: isDark ? '#D1D5DB' : '#374151',
              }}
            >
              →
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

/**
 * Streak badge pill
 */
interface StreakBadgeProps {
  streak: number;
  isDark: boolean;
}

function StreakBadge({ streak, isDark }: StreakBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, [pulseAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#713F12' : '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: '#FBBF24',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: 16, marginRight: 4 }}>🔥</Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: isDark ? '#FCD34D' : '#92400E',
        }}
      >
        {streak}
      </Text>
    </Animated.View>
  );
}

export default JourneyHeader;
