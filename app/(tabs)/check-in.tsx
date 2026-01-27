import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";

import {
  useHabitsForDate,
  useWeeklyHabits,
  useToggleHabitForDate,
  formatDate,
  getStartOfDay,
  getDaysAgo,
  isToday,
  isFuture,
  getLast7Days,
  getDayAbbreviation,
} from "@/hooks";
import { HabitType } from "@/types/api";

const { width: screenWidth } = Dimensions.get("window");

// Habit icons
const habitIcons = {
  water: require("../../media/water.png"),
  nutrition: require("../../media/nutrition.png"),
  exercise: require("../../media/exercise.png"),
};

// Habit details
const habitInfo = {
  water: {
    title: "Hydration",
    subtitle: "Drink 8+ glasses of water",
    description: "Staying hydrated helps manage hunger and supports medication effectiveness",
  },
  nutrition: {
    title: "Protein First",
    subtitle: "Prioritize protein at meals",
    description: "Eating protein first helps maintain muscle mass during weight loss",
  },
  exercise: {
    title: "Movement",
    subtitle: "30 minutes of activity",
    description: "Regular exercise boosts mood and accelerates your progress",
  },
};

interface HabitCardProps {
  type: HabitType;
  completed: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function HabitCard({ type, completed, onPress, disabled }: HabitCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const info = habitInfo[type];

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress, disabled]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        backgroundColor: completed
          ? isDark
            ? "rgba(20, 184, 166, 0.15)"
            : "#F0FDFA"
          : isDark
          ? "#1E1E2E"
          : "#FFFFFF",
        borderColor: completed
          ? isDark
            ? "#0D9488"
            : "#99F6E4"
          : isDark
          ? "#374151"
          : "#E5E7EB",
        borderWidth: 2,
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: completed
            ? isDark
              ? "rgba(20, 184, 166, 0.3)"
              : "#CCFBF1"
            : isDark
            ? "#374151"
            : "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <Image
          source={habitIcons[type]}
          style={{ width: 32, height: 32 }}
        />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: completed
              ? isDark
                ? "#5EEAD4"
                : "#0F766E"
              : isDark
              ? "#F9FAFB"
              : "#111827",
            marginBottom: 2,
          }}
        >
          {info.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark ? "#9CA3AF" : "#6B7280",
          }}
        >
          {info.subtitle}
        </Text>
      </View>

      {/* Checkbox */}
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: completed
            ? "#14B8A6"
            : isDark
            ? "#4B5563"
            : "#D1D5DB",
          backgroundColor: completed ? "#14B8A6" : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {completed && <Text style={{ color: "white", fontSize: 16 }}>✓</Text>}
      </View>
    </Pressable>
  );
}

interface WeeklyGridProps {
  habitMap: Map<string, { water: boolean; nutrition: boolean; exercise: boolean }>;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

function WeeklyGrid({ habitMap, selectedDate, onDateSelect }: WeeklyGridProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const days = getLast7Days();
  const selectedDateStr = formatDate(selectedDate);

  return (
    <View
      style={{
        backgroundColor: isDark ? "#1E1E2E" : "#FFFFFF",
        borderRadius: 20,
        padding: 16,
        marginTop: 8,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: isDark ? "#F9FAFB" : "#111827",
          marginBottom: 12,
        }}
      >
        This Week
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {days.map((day) => {
          const dateStr = formatDate(day);
          const isSelected = dateStr === selectedDateStr;
          const isTodayDate = isToday(day);
          const habit = habitMap.get(dateStr);
          const allComplete = habit?.water && habit?.nutrition && habit?.exercise;
          const someComplete = habit && (habit.water || habit.nutrition || habit.exercise);

          return (
            <Pressable
              key={dateStr}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDateSelect(day);
              }}
              style={{
                alignItems: "center",
                flex: 1,
              }}
            >
              {/* Day name */}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: isSelected
                    ? "#14B8A6"
                    : isDark
                    ? "#9CA3AF"
                    : "#6B7280",
                  marginBottom: 6,
                }}
              >
                {getDayAbbreviation(day)}
              </Text>

              {/* Day circle */}
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isSelected
                    ? "#14B8A6"
                    : allComplete
                    ? isDark
                      ? "rgba(20, 184, 166, 0.2)"
                      : "#CCFBF1"
                    : "transparent",
                  borderWidth: isTodayDate && !isSelected ? 2 : 0,
                  borderColor: "#14B8A6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected || isTodayDate ? "700" : "500",
                    color: isSelected
                      ? "#FFFFFF"
                      : allComplete
                      ? "#14B8A6"
                      : isDark
                      ? "#D1D5DB"
                      : "#374151",
                  }}
                >
                  {day.getDate()}
                </Text>
              </View>

              {/* Completion indicator dots */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 6,
                  gap: 2,
                }}
              >
                {["water", "nutrition", "exercise"].map((h) => (
                  <View
                    key={h}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        habit && habit[h as HabitType]
                          ? "#14B8A6"
                          : isDark
                          ? "#374151"
                          : "#E5E7EB",
                    }}
                  />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function CheckInScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Selected date state
  const [selectedDate, setSelectedDate] = useState(() => getStartOfDay(new Date()));

  // Fetch habits for selected date
  const {
    data: habitsData,
    isLoading: habitsLoading,
    error: habitsError,
    refetch: refetchHabits,
  } = useHabitsForDate(selectedDate);

  // Fetch weekly history
  const {
    data: weeklyHabits,
    isLoading: weeklyLoading,
    refetch: refetchWeekly,
  } = useWeeklyHabits();

  // Toggle mutation for selected date
  const toggleHabitMutation = useToggleHabitForDate(selectedDate);

  // Celebration state
  const [isCelebrating, setIsCelebrating] = useState(false);
  const confettiRef = useRef<any>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchHabits(), refetchWeekly()]);
    setRefreshing(false);
  }, [refetchHabits, refetchWeekly]);

  // Trigger celebration
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
  const handleHabitToggle = useCallback(
    (habit: HabitType) => {
      if (!habitsData) return;
      if (toggleHabitMutation.isPending) return;

      const currentValue = habitsData[habit];
      const newValue = !currentValue;

      // Check if this will complete all habits (only celebrate on today)
      if (isToday(selectedDate)) {
        const otherHabits = { ...habitsData, [habit]: newValue };
        const wasAllComplete =
          habitsData.water && habitsData.nutrition && habitsData.exercise;
        const willBeAllComplete =
          otherHabits.water && otherHabits.nutrition && otherHabits.exercise;

        if (willBeAllComplete && !wasAllComplete) {
          triggerCelebration();
        }
      }

      toggleHabitMutation.mutate({ habit, value: newValue });
    },
    [habitsData, toggleHabitMutation, selectedDate, triggerCelebration]
  );

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(getStartOfDay(date));
  }, []);

  // Navigate to previous/next day
  const goToPrevDay = useCallback(() => {
    const prev = getDaysAgo(1, selectedDate);
    // Don't go more than 7 days back
    const weekAgo = getDaysAgo(7);
    if (prev >= weekAgo) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(prev);
    }
  }, [selectedDate]);

  const goToNextDay = useCallback(() => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (!isFuture(next)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedDate(getStartOfDay(next));
    }
  }, [selectedDate]);

  // Format selected date for display
  const isTodaySelected = isToday(selectedDate);
  const dateDisplay = isTodaySelected
    ? "Today"
    : selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

  // Calculate completion count
  const habits = habitsData || { water: false, nutrition: false, exercise: false };
  const completedCount = [habits.water, habits.nutrition, habits.exercise].filter(Boolean).length;
  const allComplete = completedCount === 3;

  // Check if can navigate
  const canGoBack = formatDate(selectedDate) > formatDate(getDaysAgo(6));
  const canGoForward = !isTodaySelected;

  // Loading state
  if (habitsLoading && !habitsData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2C9C91" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading habits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (habitsError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            We couldn't load your habits. Please try again.
          </Text>
          <Pressable
            onPress={() => refetchHabits()}
            className="bg-teal-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Header with Date Selector */}
        <View className="px-4 pt-4 pb-2">
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: isDark ? "#F9FAFB" : "#111827",
              marginBottom: 8,
            }}
          >
            Daily Check-in
          </Text>

          {/* Date Navigation */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: isDark ? "#1E1E2E" : "#FFFFFF",
              borderRadius: 16,
              padding: 12,
            }}
          >
            <Pressable
              onPress={goToPrevDay}
              disabled={!canGoBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: canGoBack
                  ? isDark
                    ? "#374151"
                    : "#F3F4F6"
                  : "transparent",
                alignItems: "center",
                justifyContent: "center",
                opacity: canGoBack ? 1 : 0.3,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: isDark ? "#D1D5DB" : "#374151",
                }}
              >
                ←
              </Text>
            </Pressable>

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: isDark ? "#F9FAFB" : "#111827",
                }}
              >
                {dateDisplay}
              </Text>
              {!isTodaySelected && (
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    marginTop: 2,
                  }}
                >
                  Editing past day
                </Text>
              )}
            </View>

            <Pressable
              onPress={goToNextDay}
              disabled={!canGoForward}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: canGoForward
                  ? isDark
                    ? "#374151"
                    : "#F3F4F6"
                  : "transparent",
                alignItems: "center",
                justifyContent: "center",
                opacity: canGoForward ? 1 : 0.3,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: isDark ? "#D1D5DB" : "#374151",
                }}
              >
                →
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Progress Summary */}
        <View className="px-4 py-4">
          <View
            style={{
              backgroundColor: allComplete
                ? isDark
                  ? "rgba(20, 184, 166, 0.15)"
                  : "#F0FDFA"
                : isDark
                ? "#1E1E2E"
                : "#FFFFFF",
              borderRadius: 20,
              padding: 20,
              alignItems: "center",
              borderWidth: allComplete ? 2 : 0,
              borderColor: "#14B8A6",
            }}
          >
            {allComplete ? (
              <>
                <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "#14B8A6",
                    marginBottom: 4,
                  }}
                >
                  All Done!
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9CA3AF" : "#6B7280",
                    textAlign: "center",
                  }}
                >
                  You've completed all your habits{" "}
                  {isTodaySelected ? "today" : "for this day"}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 48,
                    fontWeight: "700",
                    color: "#14B8A6",
                    marginBottom: 4,
                  }}
                >
                  {completedCount}/3
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9CA3AF" : "#6B7280",
                  }}
                >
                  habits completed{" "}
                  {isTodaySelected ? "today" : "this day"}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Habit Cards */}
        <View className="px-4">
          <HabitCard
            type="water"
            completed={habits.water}
            onPress={() => handleHabitToggle("water")}
            disabled={toggleHabitMutation.isPending}
          />
          <HabitCard
            type="nutrition"
            completed={habits.nutrition}
            onPress={() => handleHabitToggle("nutrition")}
            disabled={toggleHabitMutation.isPending}
          />
          <HabitCard
            type="exercise"
            completed={habits.exercise}
            onPress={() => handleHabitToggle("exercise")}
            disabled={toggleHabitMutation.isPending}
          />
        </View>

        {/* Weekly Grid */}
        <View className="px-4">
          <WeeklyGrid
            habitMap={
              weeklyHabits ||
              new Map<string, { water: boolean; nutrition: boolean; exercise: boolean }>()
            }
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </View>
      </ScrollView>

      {/* Confetti - only for today's completion */}
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
