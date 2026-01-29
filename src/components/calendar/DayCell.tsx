/**
 * DayCell Component
 * Individual day cell with activity indicators
 */

import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  habits: { water: boolean; nutrition: boolean; exercise: boolean } | null;
  hasInjection: boolean;
  hasWeighIn: boolean;
  onPress: (day: number) => void;
}

export function DayCell({
  day,
  isToday,
  isSelected,
  habits,
  hasInjection,
  hasWeighIn,
  onPress,
}: DayCellProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Empty cell
  if (day === null) {
    return <View style={{ flex: 1, aspectRatio: 1 }} />;
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(day);
  };

  // Check if all habits are complete
  const allHabitsComplete = habits?.water && habits?.nutrition && habits?.exercise;
  const someHabitsComplete = habits && (habits.water || habits.nutrition || habits.exercise);

  // Determine background color
  const getBackgroundColor = () => {
    if (isSelected) {
      return '#14B8A6';
    }
    if (allHabitsComplete) {
      return isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA';
    }
    return 'transparent';
  };

  // Determine text color
  const getTextColor = () => {
    if (isSelected) {
      return '#FFFFFF';
    }
    if (isToday) {
      return '#14B8A6';
    }
    return isDark ? '#D1D5DB' : '#374151';
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
      }}
    >
      {/* Day circle/background */}
      <View
        style={{
          width: '90%',
          aspectRatio: 1,
          borderRadius: 12,
          backgroundColor: getBackgroundColor(),
          borderWidth: isToday && !isSelected ? 2 : 0,
          borderColor: '#14B8A6',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Day number */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: isToday || isSelected ? '700' : '500',
            color: getTextColor(),
          }}
        >
          {day}
        </Text>

        {/* Activity indicators */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 2,
            gap: 2,
          }}
        >
          {/* Habits indicator - 3 small dots */}
          {habits && (
            <>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: habits.water
                    ? isSelected
                      ? 'rgba(255,255,255,0.8)'
                      : '#14B8A6'
                    : isDark
                    ? '#4B5563'
                    : '#D1D5DB',
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: habits.nutrition
                    ? isSelected
                      ? 'rgba(255,255,255,0.8)'
                      : '#14B8A6'
                    : isDark
                    ? '#4B5563'
                    : '#D1D5DB',
                }}
              />
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: habits.exercise
                    ? isSelected
                      ? 'rgba(255,255,255,0.8)'
                      : '#14B8A6'
                    : isDark
                    ? '#4B5563'
                    : '#D1D5DB',
                }}
              />
            </>
          )}

          {/* Injection indicator - syringe dot */}
          {hasInjection && (
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : '#FB7185',
                marginLeft: habits ? 2 : 0,
              }}
            />
          )}

          {/* Weigh-in indicator */}
          {hasWeighIn && (
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: isSelected ? 'rgba(255,255,255,0.8)' : '#FBBF24',
                marginLeft: (habits || hasInjection) ? 2 : 0,
              }}
            />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default DayCell;
