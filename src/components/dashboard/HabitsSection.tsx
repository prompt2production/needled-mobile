import React, { memo, useCallback } from "react";
import { View, Text, Pressable, useColorScheme, Image, ImageSourcePropType } from "react-native";
import * as Haptics from "expo-haptics";

// Habit icons
const habitIcons = {
  water: require("../../../media/water.png"),
  nutrition: require("../../../media/nutrition.png"),
  exercise: require("../../../media/exercise.png"),
};

export interface HabitsSectionProps {
  streak: number;
  habits: {
    water: boolean;
    nutrition: boolean;
    exercise: boolean;
  };
  onHabitPress?: (habit: "water" | "nutrition" | "exercise") => void;
}

interface HabitCardProps {
  title: string;
  subtitle: string;
  icon: ImageSourcePropType;
  completed: boolean;
  onPress: () => void;
}

const HabitCard = memo(function HabitCard({
  title,
  subtitle,
  icon,
  completed,
  onPress,
}: HabitCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Use inline styles for dynamic properties (much faster than dynamic classNames)
  const cardStyle = {
    backgroundColor: completed
      ? (isDark ? "rgba(20, 184, 166, 0.2)" : "#F0FDFA")
      : (isDark ? "#1E1E2E" : "#FFFFFF"),
    borderColor: completed
      ? (isDark ? "#0D9488" : "#99F6E4")
      : (isDark ? "#374151" : "#E5E7EB"),
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: "center" as const,
  };

  const titleStyle = {
    color: completed
      ? (isDark ? "#5EEAD4" : "#0F766E")
      : (isDark ? "#D1D5DB" : "#374151"),
  };

  const handlePress = useCallback(() => {
    // Immediate haptic feedback - fires before any state update
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Pressable onPress={handlePress} style={{ flex: 1 }}>
      <View style={cardStyle}>
        <Image source={icon} style={{ width: 32, height: 32, marginBottom: 4 }} />
        <Text
          style={[
            { fontSize: 14, fontWeight: "600", textAlign: "center" },
            titleStyle,
          ]}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isDark ? "#9CA3AF" : "#6B7280",
            textAlign: "center",
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
        {completed && (
          <View
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "#14B8A6",
              borderRadius: 10,
              width: 20,
              height: 20,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>✓</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

export const HabitsSection = memo(function HabitsSection({
  streak,
  habits,
  onHabitPress,
}: HabitsSectionProps) {
  const completedCount = [habits.water, habits.nutrition, habits.exercise].filter(
    Boolean
  ).length;

  const handleWaterPress = useCallback(() => onHabitPress?.("water"), [onHabitPress]);
  const handleNutritionPress = useCallback(() => onHabitPress?.("nutrition"), [onHabitPress]);
  const handleExercisePress = useCallback(() => onHabitPress?.("exercise"), [onHabitPress]);

  return (
    <View>
      {/* Streak Banner */}
      {streak > 0 && (
        <View className="bg-yellow-light dark:bg-yellow/20 rounded-xl p-3 mb-3 flex-row items-center">
          <Text className="text-xl mr-2">🔥</Text>
          <Text className="text-yellow-700 dark:text-yellow font-semibold">
            {streak} day streak!
          </Text>
        </View>
      )}

      {/* Section Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Today's Habits
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {completedCount}/3 done
        </Text>
      </View>

      {/* Habit Cards */}
      <View className="flex-row gap-3">
        <HabitCard
          title="Water"
          subtitle="8 glasses"
          icon={habitIcons.water}
          completed={habits.water}
          onPress={handleWaterPress}
        />
        <HabitCard
          title="Nutrition"
          subtitle="Protein first"
          icon={habitIcons.nutrition}
          completed={habits.nutrition}
          onPress={handleNutritionPress}
        />
        <HabitCard
          title="Exercise"
          subtitle="30 min"
          icon={habitIcons.exercise}
          completed={habits.exercise}
          onPress={handleExercisePress}
        />
      </View>
    </View>
  );
});

export default HabitsSection;
