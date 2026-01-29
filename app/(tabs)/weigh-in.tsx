import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

import {
  useLatestWeighIn,
  useWeighInHistory,
  useLogWeighIn,
  useDashboardData,
} from '@/hooks';
import { PipWithBubble, PipState } from '@/components/pip';
import {
  WeighInForm,
  WeighInSuccessCard,
  WeightStatsCard,
  WeighInHistory,
} from '@/components/weighin';

const { width: screenWidth } = Dimensions.get('window');

export default function WeighInScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fetch data
  const {
    data: latestData,
    isLoading: latestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useLatestWeighIn();

  const {
    data: weighInHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useWeighInHistory(10);

  const { data: dashboardData } = useDashboardData();

  // Celebration state
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [justLoggedWeight, setJustLoggedWeight] = useState(false);
  const confettiRef = useRef<any>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Log weigh-in mutation
  const logWeighInMutation = useLogWeighIn();

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchLatest(), refetchHistory()]);
    setRefreshing(false);
  }, [refetchLatest, refetchHistory]);

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

  // Handle weight submission
  const handleLogWeight = useCallback(
    (weight: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      triggerCelebration();

      logWeighInMutation.mutate(
        { weight },
        {
          onSuccess: () => {
            setJustLoggedWeight(true);
          },
        }
      );
    },
    [logWeighInMutation, triggerCelebration]
  );

  // Get user info from dashboard
  const weightUnit = dashboardData?.user?.weightUnit || 'kg';
  const startWeight = dashboardData?.user?.startWeight || 0;
  const goalWeight = dashboardData?.user?.goalWeight || null;

  // Determine if user has weighed in this week
  const hasWeighedThisWeek = latestData?.hasWeighedThisWeek || false;
  const canWeighIn = latestData?.canWeighIn ?? true;

  // Show success state if just logged or already weighed this week
  const showSuccessState = justLoggedWeight || hasWeighedThisWeek;

  // Determine Pip state and message
  const getPipStateAndMessage = (): { state: PipState; message: string } => {
    if (isCelebrating) {
      return {
        state: 'celebrating',
        message: "Awesome job logging your weight! Every weigh-in brings you closer to your goal!",
      };
    }

    if (showSuccessState) {
      const weekChange = latestData?.weekChange;
      if (weekChange !== null && weekChange !== undefined) {
        if (weekChange < 0) {
          return {
            state: 'proud',
            message: `You lost ${Math.abs(weekChange).toFixed(1)} ${weightUnit} this week! Keep up the amazing work!`,
          };
        }
        if (weekChange === 0) {
          return {
            state: 'cheerful',
            message: "You maintained your weight this week. Consistency is key!",
          };
        }
        return {
          state: 'encouraging',
          message: "Weight fluctuates - that's totally normal! Stay focused on your journey.",
        };
      }
      return {
        state: 'proud',
        message: "Great job logging your weigh-in! Tracking is the first step to success.",
      };
    }

    if (!latestData?.weighIn) {
      return {
        state: 'cheerful',
        message: "Ready to log your first weigh-in? This will be your starting point!",
      };
    }

    return {
      state: 'cheerful',
      message: "Time for your weekly weigh-in! Step on the scale and let's see your progress.",
    };
  };

  const { state: pipState, message: pipMessage } = getPipStateAndMessage();

  // Status badge config
  const getStatusBadge = () => {
    if (showSuccessState) {
      return {
        text: 'Done',
        bgColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
        textColor: '#22C55E',
      };
    }
    return {
      text: 'Ready',
      bgColor: isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1',
      textColor: '#14B8A6',
    };
  };

  const statusBadge = getStatusBadge();

  // Loading state
  if (latestLoading && !latestData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2C9C91" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading weight data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (latestError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            We couldn't load your weight data. Please try again.
          </Text>
          <Pressable
            onPress={() => refetchLatest()}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
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
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              >
                Weekly Weigh-in
              </Text>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: statusBadge.bgColor,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: statusBadge.textColor,
                  }}
                >
                  {statusBadge.text}
                </Text>
              </View>
            </View>
          </View>

          {/* Pip with Speech Bubble */}
          <View className="px-4 py-4">
            <PipWithBubble
              state={pipState}
              message={pipMessage}
              size="md"
            />
          </View>

          {/* Content depends on state */}
          <View className="px-4" style={{ gap: 16 }}>
            {showSuccessState ? (
              // SUCCESS STATE: Show success card and history
              <>
                {latestData && (
                  <WeighInSuccessCard
                    latestData={latestData}
                    weightUnit={weightUnit}
                    startWeight={startWeight}
                    goalWeight={goalWeight}
                  />
                )}

                <WeighInHistory
                  weighIns={weighInHistory}
                  isLoading={historyLoading}
                  weightUnit={weightUnit}
                  defaultExpanded={true}
                />
              </>
            ) : (
              // FORM STATE: Show stats and form
              <>
                <WeightStatsCard
                  latestData={latestData || null}
                  weightUnit={weightUnit}
                  startWeight={startWeight}
                  goalWeight={goalWeight}
                />

                <WeighInForm
                  weightUnit={weightUnit}
                  lastWeight={latestData?.weighIn?.weight || null}
                  onSubmit={handleLogWeight}
                  isSubmitting={logWeighInMutation.isPending}
                />

                <WeighInHistory
                  weighIns={weighInHistory}
                  isLoading={historyLoading}
                  weightUnit={weightUnit}
                  defaultExpanded={false}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: screenWidth / 2, y: -30 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={2500}
        explosionSpeed={500}
        colors={['#14B8A6', '#2DD4BF', '#FB7185', '#FBBF24', '#22C55E', '#5EEAD4']}
        autoStartDelay={0}
      />
    </SafeAreaView>
  );
}
