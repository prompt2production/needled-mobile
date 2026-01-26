import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

import { PipWithBubble } from "@/components/pip";
import {
  NextDoseCard,
  WeightProgressCard,
  HabitsSection,
} from "@/components/dashboard";
import { determinePipState } from "@/lib/pip-logic";
import {
  mockDashboardData,
  mockInjectionStatus,
  mockTodayHabits,
  getInjectionDayName,
} from "@/lib/mock-data";

export default function DashboardScreen() {
  // Use mock data for now
  const dashboardData = mockDashboardData;
  const injectionStatus = mockInjectionStatus;

  // Local state for habits (for demo toggling)
  const [habits, setHabits] = useState(mockTodayHabits);

  // Calculate Pip state
  const dataForPip = {
    ...dashboardData,
    habits: {
      ...dashboardData.habits,
      todayCompleted: Object.values(habits).filter(Boolean).length,
    },
  };
  const pipState = determinePipState(dataForPip);

  // Get current date info
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Handle habit toggle (demo only)
  const handleHabitPress = (habit: "water" | "nutrition" | "exercise") => {
    setHabits((prev) => ({
      ...prev,
      [habit]: !prev[habit],
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Hey, {dashboardData.user.name}!
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {dateString}
              </Text>
            </View>
            <Link href="/settings" asChild>
              <Pressable className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center">
                <Text className="text-lg">⚙️</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Pip with Speech Bubble */}
        <View className="px-4 py-4">
          <PipWithBubble
            state={pipState.state}
            message={pipState.message}
            size="md"
          />
        </View>

        {/* Cards Section */}
        <View className="px-4">
          {/* Week Badge */}
          <View className="flex-row items-center mb-4">
            <View className="bg-teal-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-semibold">
                Week {dashboardData.journey.weekNumber}
              </Text>
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-sm ml-2">
              of your journey
            </Text>
          </View>

          {/* Next Dose Card */}
          <NextDoseCard
            daysUntil={injectionStatus.daysUntil}
            injectionDay={getInjectionDayName(dashboardData.user.injectionDay)}
            currentDose={injectionStatus.currentDose}
            dosesRemaining={injectionStatus.dosesRemaining}
            status={injectionStatus.status}
          />

          {/* Weight Progress Card */}
          <WeightProgressCard
            currentWeight={dashboardData.weight.currentWeight}
            startWeight={dashboardData.user.startWeight}
            goalWeight={dashboardData.user.goalWeight}
            totalLost={dashboardData.weight.totalLost}
            weekChange={dashboardData.weight.weekChange}
            progressPercent={dashboardData.weight.progressPercent}
            weightUnit={dashboardData.user.weightUnit}
          />

          {/* Habits Section */}
          <HabitsSection
            streak={dashboardData.habits.streak || 0}
            habits={habits}
            onHabitPress={handleHabitPress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
