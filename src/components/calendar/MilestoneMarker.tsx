/**
 * MilestoneMarker Component
 * Animated badges for 7, 14, and 30 day streak milestones
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, useColorScheme } from 'react-native';

interface MilestoneMarkerProps {
  milestone: 7 | 14 | 30;
  size?: 'sm' | 'md' | 'lg';
}

export function MilestoneMarker({ milestone, size = 'md' }: MilestoneMarkerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Different animations for different milestones
    if (milestone === 7) {
      // Star twinkle animation
      const twinkle = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      twinkle.start();
      return () => twinkle.stop();
    }

    if (milestone === 14) {
      // Flame flicker animation
      const flicker = Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 0.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -0.1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      );
      const scale = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );
      flicker.start();
      scale.start();
      return () => {
        flicker.stop();
        scale.stop();
      };
    }

    if (milestone === 30) {
      // Trophy bounce animation
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 400,
            easing: Easing.out(Easing.bounce),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(500),
        ])
      );
      // Glow pulse
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      bounce.start();
      glow.start();
      return () => {
        bounce.stop();
        glow.stop();
      };
    }
  }, [milestone, scaleAnim, rotateAnim, glowAnim]);

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

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return { fontSize: 14, padding: 4 };
      case 'md':
        return { fontSize: 20, padding: 6 };
      case 'lg':
        return { fontSize: 28, padding: 8 };
    }
  };

  const getBackgroundColor = () => {
    switch (milestone) {
      case 7:
        return isDark ? '#713F12' : '#FEF3C7'; // yellow tones
      case 14:
        return isDark ? '#7C2D12' : '#FFEDD5'; // orange tones
      case 30:
        return isDark ? '#1E3A8A' : '#DBEAFE'; // blue tones
    }
  };

  const getGlowColor = () => {
    switch (milestone) {
      case 7:
        return '#FBBF24'; // yellow
      case 14:
        return '#F97316'; // orange
      case 30:
        return '#3B82F6'; // blue
    }
  };

  const sizeStyle = getSizeStyle();
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-0.1, 0, 0.1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { scale: scaleAnim },
          { rotate: rotateInterpolate },
        ],
        shadowColor: getGlowColor(),
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: milestone === 30 ? glowAnim : 0.5,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <View
        style={{
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          padding: sizeStyle.padding,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: sizeStyle.fontSize }}>{getEmoji()}</Text>
      </View>
    </Animated.View>
  );
}

/**
 * Inline milestone indicator for stats
 */
interface MilestoneInlineProps {
  milestone: 7 | 14 | 30;
  count?: number;
}

export function MilestoneInline({ milestone, count }: MilestoneInlineProps) {
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

  const getLabel = () => {
    switch (milestone) {
      case 7:
        return '7-Day Streak';
      case 14:
        return '14-Day Streak';
      case 30:
        return '30-Day Champion';
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Text style={{ fontSize: 16 }}>{getEmoji()}</Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '500',
          color: '#6B7280',
        }}
      >
        {getLabel()}
        {count && count > 1 ? ` x${count}` : ''}
      </Text>
    </View>
  );
}

export default MilestoneMarker;
