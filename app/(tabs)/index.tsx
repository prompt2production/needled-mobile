import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import ConfettiCannon from "react-native-confetti-cannon";

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

const { width: screenWidth } = Dimensions.get("window");

export default function DashboardScreen() {
  // Use mock data for now
  const dashboardData = mockDashboardData;
  const injectionStatus = mockInjectionStatus;

  // Local state for habits (for demo toggling)
  const [habits, setHabits] = useState(mockTodayHabits);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const confettiRef = useRef<any>(null);
  const celebrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if all habits are complete
  const allHabitsComplete = habits.water && habits.nutrition && habits.exercise;

  // Trigger celebration (confetti + temporary Pip state)
  const triggerCelebration = useCallback(() => {
    confettiRef.current?.start();
    setIsCelebrating(true);

    // Clear any existing timeout
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }

    // Revert after 2 seconds
    celebrationTimeoutRef.current = setTimeout(() => {
      setIsCelebrating(false);
    }, 2000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  // Calculate Pip state
  const dataForPip = {
    ...dashboardData,
    habits: {
      ...dashboardData.habits,
      todayCompleted: Object.values(habits).filter(Boolean).length,
    },
  };
  const basePipState = determinePipState(dataForPip);

  // Override with celebrating state temporarily
  const pipState = isCelebrating
    ? { state: "celebrating" as const, message: "All habits done today! You're absolutely crushing it!" }
    : basePipState;

  // Get current date info
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Handle habit toggle (demo only)
  const handleHabitPress = useCallback((habit: "water" | "nutrition" | "exercise") => {
    setHabits(prev => {
      const newHabits = {
        ...prev,
        [habit]: !prev[habit],
      };

      // Trigger celebration if this completes all habits
      const wasAllComplete = prev.water && prev.nutrition && prev.exercise;
      const willBeAllComplete = newHabits.water && newHabits.nutrition && newHabits.exercise;
      if (willBeAllComplete && !wasAllComplete) {
        triggerCelebration();
      }

      return newHabits;
    });
  }, [triggerCelebration]);

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

      {/* Confetti - always mounted, triggered via ref for instant response */}
      <ConfettiCannon
        ref={confettiRef}
        count={120}
        origin={{ x: screenWidth / 2, y: -30 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={2000}
        explosionSpeed={600}
        colors={["#14B8A6", "#2DD4BF", "#FB7185", "#FBBF24", "#22C55E", "#5EEAD4"]}
        autoStartDelay={0}
      />
    </SafeAreaView>
  );
}
