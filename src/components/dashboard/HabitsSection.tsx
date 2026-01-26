import React from "react";
import { View, Text, Pressable } from "react-native";
import { Card } from "@/components/ui";

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
  icon: string;
  completed: boolean;
  onPress?: () => void;
}

function HabitCard({
  title,
  subtitle,
  icon,
  completed,
  onPress,
}: HabitCardProps) {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <Card
        variant="outline"
        padding="sm"
        className={`items-center ${completed ? "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700" : ""}`}
      >
        <Text className="text-2xl mb-1">{icon}</Text>
        <Text
          className={`text-sm font-semibold text-center ${
            completed
              ? "text-teal-700 dark:text-teal-300"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {title}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-0.5">
          {subtitle}
        </Text>
        {completed && (
          <View className="absolute top-1 right-1 bg-teal-500 rounded-full w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs">✓</Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

export function HabitsSection({
  streak,
  habits,
  onHabitPress,
}: HabitsSectionProps) {
  const completedCount = [habits.water, habits.nutrition, habits.exercise].filter(
    Boolean
  ).length;

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
          icon="💧"
          completed={habits.water}
          onPress={() => onHabitPress?.("water")}
        />
        <HabitCard
          title="Nutrition"
          subtitle="Protein first"
          icon="🥗"
          completed={habits.nutrition}
          onPress={() => onHabitPress?.("nutrition")}
        />
        <HabitCard
          title="Exercise"
          subtitle="30 min"
          icon="🏃"
          completed={habits.exercise}
          onPress={() => onHabitPress?.("exercise")}
        />
      </View>
    </View>
  );
}

export default HabitsSection;
