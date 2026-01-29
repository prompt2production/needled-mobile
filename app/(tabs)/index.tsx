import React, { useRef, useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
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
import { getInjectionDayName } from "@/lib/mock-data";
import {
  useDashboardData,
  useTodayHabits,
  useInjectionStatus,
  useToggleHabit,
} from "@/hooks";
import { HabitType } from "@/types/api";

const { width: screenWidth } = Dimensions.get("window");

export default function DashboardScreen() {
  // Fetch real data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardData();

  const {
    data: habitsData,
    isLoading: habitsLoading,
    refetch: refetchHabits,
  } = useTodayHabits();

  const {
    data: injectionStatus,
    isLoading: injectionLoading,
    refetch: refetchInjection,
  } = useInjectionStatus();

  const toggleHabitMutation = useToggleHabit();

  // Local state for celebration
  const [isCelebrating, setIsCelebrating] = useState(false);
  const confettiRef = useRef<any>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchDashboard(), refetchHabits(), refetchInjection()]);
    setRefreshing(false);
  }, [refetchDashboard, refetchHabits, refetchInjection]);

  // Trigger celebration (confetti + temporary Pip state)
  const triggerCelebration = useCallback(() => {
    confettiRef.current?.start();
    setIsCelebrating(true);

    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }

    celebrationTimeoutRef.current = setTimeout(() => {
      setIsCelebrating(false);
    }, 4000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  // Handle habit toggle
  const handleHabitPress = useCallback(
    (habit: HabitType) => {
      if (!habitsData) return;
      if (toggleHabitMutation.isPending) return; // Prevent rapid double-taps

      const currentValue = habitsData[habit];
      const newValue = !currentValue;

      // Check if this will complete all habits
      const otherHabits = { ...habitsData, [habit]: newValue };
      const wasAllComplete = habitsData.water && habitsData.nutrition && habitsData.exercise;
      const willBeAllComplete = otherHabits.water && otherHabits.nutrition && otherHabits.exercise;

      if (willBeAllComplete && !wasAllComplete) {
        triggerCelebration();
      }

      toggleHabitMutation.mutate({ habit, value: newValue });
    },
    [habitsData, toggleHabitMutation, triggerCelebration]
  );

  // Loading state
  const isLoading = dashboardLoading || habitsLoading || injectionLoading;

  if (isLoading && !dashboardData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2C9C91" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (dashboardError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            We couldn't load your dashboard. Please try again.
          </Text>
          <Pressable
            onPress={() => refetchDashboard()}
            className="bg-teal-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Data is loaded
  const habits = habitsData || { water: false, nutrition: false, exercise: false };

  // Calculate Pip state
  const dataForPip = dashboardData
    ? {
        ...dashboardData,
        habits: {
          ...dashboardData.habits,
          todayCompleted: [habits.water, habits.nutrition, habits.exercise].filter(Boolean).length,
        },
      }
    : null;

  const basePipState = dataForPip
    ? determinePipState(dataForPip)
    : { state: "cheerful" as const, message: "Loading..." };

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2C9C91"
            colors={["#2C9C91"]}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Hey, {dashboardData?.user.name || "there"}!
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
          {dashboardData && (
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
          )}

          {/* Next Dose Card */}
          {injectionStatus && dashboardData && (
            <NextDoseCard
              daysUntil={injectionStatus.daysUntil}
              injectionDay={getInjectionDayName(dashboardData.user.injectionDay)}
              currentDose={injectionStatus.currentDose}
              dosesRemaining={injectionStatus.dosesRemaining}
              status={injectionStatus.status}
            />
          )}

          {/* Weight Progress Card */}
          {dashboardData && (
            <WeightProgressCard
              currentWeight={dashboardData.weight.currentWeight}
              startWeight={dashboardData.user.startWeight}
              goalWeight={dashboardData.user.goalWeight}
              totalLost={dashboardData.weight.totalLost}
              weekChange={dashboardData.weight.weekChange}
              progressPercent={dashboardData.weight.progressPercent}
              weightUnit={dashboardData.user.weightUnit}
            />
          )}

          {/* Habits Section */}
          <HabitsSection
            streak={dashboardData?.habits.streak || 0}
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
