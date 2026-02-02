import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWeightProgress, useDashboardData } from '@/hooks';
import { PipWithBubble } from '@/components/pip';
import { WeightChart, StatsGrid, TimeRangeTabs } from '@/components/progress';
import { ChartTimeRange } from '@/types/api';

export default function ResultsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Time range state
  const [selectedRange, setSelectedRange] = useState<ChartTimeRange>('ALL');

  // Fetch data
  const {
    data: progressData,
    isLoading,
    error,
    refetch,
  } = useWeightProgress(selectedRange);

  const { data: dashboardData } = useDashboardData();

  // User info
  const medication = dashboardData?.user?.medication || 'OTHER';
  const weightUnit = dashboardData?.user?.weightUnit || 'lbs';
  const userName = dashboardData?.user?.name || 'there';

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Determine Pip state and message based on progress
  const getPipStateAndMessage = () => {
    if (!progressData || !progressData.stats) {
      return {
        state: 'cheerful' as const,
        message: "Let's see how your weight loss journey is going!",
      };
    }

    const { totalChange, goalProgress } = progressData.stats;

    // Goal achieved
    if (goalProgress !== null && goalProgress >= 100) {
      return {
        state: 'celebrating' as const,
        message: "You did it! You've reached your goal weight! I'm so incredibly proud of you!",
      };
    }

    // Significant progress (more than 50% to goal)
    if (goalProgress !== null && goalProgress >= 50) {
      return {
        state: 'proud' as const,
        message: `Wow, ${userName}! You're more than halfway to your goal. Keep up the amazing work!`,
      };
    }

    // Good progress (weight loss)
    if (totalChange !== null && totalChange < -5) {
      return {
        state: 'proud' as const,
        message: `Great progress! You've lost ${Math.abs(totalChange).toFixed(1)} ${weightUnit}. Your hard work is paying off!`,
      };
    }

    // Some progress
    if (totalChange !== null && totalChange < 0) {
      return {
        state: 'cheerful' as const,
        message: `You're making progress! Every step counts on this journey.`,
      };
    }

    // Just starting or no progress yet
    return {
      state: 'encouraging' as const,
      message: "Your progress chart will fill in as you log more weigh-ins. You've got this!",
    };
  };

  const { state: pipState, message: pipMessage } = getPipStateAndMessage();

  // Loading state
  if (isLoading && !progressData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2C9C91" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading your progress...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            We couldn't load your progress. Please try again.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="bg-teal-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2C9C91"
            colors={['#2C9C91']}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <Text
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            Your Progress
          </Text>
        </View>

        {/* Pip with Speech Bubble */}
        <View className="px-4 py-4">
          <PipWithBubble
            state={pipState}
            message={pipMessage}
            size="md"
          />
        </View>

        {/* Content */}
        <View className="px-4" style={{ gap: 16 }}>
          {/* Time Range Tabs */}
          <TimeRangeTabs
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />

          {/* Weight Progress Chart */}
          {progressData && (
            <WeightChart
              data={progressData}
              medication={medication}
              weightUnit={weightUnit}
              startWeight={dashboardData?.user?.startWeight}
              goalWeight={dashboardData?.user?.goalWeight}
              goalDate={dashboardData?.user?.goalDate}
            />
          )}

          {/* Stats Grid */}
          {progressData?.stats && (
            <View
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderRadius: 20,
                padding: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: isDark ? '#F9FAFB' : '#111827',
                  marginBottom: 16,
                }}
              >
                Stats
              </Text>
              <StatsGrid stats={progressData.stats} weightUnit={weightUnit} />
            </View>
          )}

          {/* Journey info card */}
          {dashboardData?.journey && (
            <View
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderRadius: 20,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginBottom: 4,
                  }}
                >
                  Journey Started
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: isDark ? '#F9FAFB' : '#111827',
                  }}
                >
                  {new Date(dashboardData.journey.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : '#F0FDFA',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#14B8A6',
                    fontWeight: '600',
                  }}
                >
                  Week {dashboardData.journey.weekNumber}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
