/**
 * Calendar Screen - Journey View
 * Visual progress tracking with streak celebrations and contextual Pip messaging
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

import {
  useCalendarMonth,
  useCalendarDay,
  getMonthName,
  useDashboardData,
  formatDateString,
} from '@/hooks';
import { useJourneyData } from '@/hooks/useJourneyData';
import {
  getJourneyPipState,
  getJourneyPipMessage,
  getJourneyHeaderMessage,
  JourneyDayData,
} from '@/lib/journey-logic';
import {
  JourneyHeader,
  MonthGrid,
  DayDetailSheet,
  MonthlyWins,
} from '@/components/calendar';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Current month state
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  // Selected day state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Pip message state
  const [pipMessage, setPipMessage] = useState<string>('');

  // Confetti refs
  const confettiRef = useRef<ConfettiCannon | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiCount, setConfettiCount] = useState(30);

  // Fetch data
  const {
    data: monthData,
    isLoading: monthLoading,
    error: monthError,
    refetch: refetchMonth,
  } = useCalendarMonth(currentYear, currentMonth);

  const {
    data: dayData,
    isLoading: dayLoading,
  } = useCalendarDay(selectedDate);

  const { data: dashboardData } = useDashboardData();
  const weightUnit = dashboardData?.user?.weightUnit || 'kg';

  // Journey data calculations
  const journeyData = useJourneyData(monthData, currentYear, currentMonth);

  // Entry animation for stats section
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (monthData) {
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 500,
        delay: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [monthData, currentYear, currentMonth, statsAnim]);

  // Set initial Pip message based on journey data
  useEffect(() => {
    if (journeyData) {
      const message = getJourneyHeaderMessage(
        journeyData.streakData.currentStreak,
        journeyData.monthlyStats.completionPercent,
        journeyData.monthlyStats.perfectDays
      );
      setPipMessage(message);
    }
  }, [journeyData]);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchMonth();
    setRefreshing(false);
  }, [refetchMonth]);

  // Navigate to previous month
  const goToPrevMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    // Reset stats animation
    statsAnim.setValue(0);
  }, [currentYear, currentMonth, statsAnim]);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    // Reset stats animation
    statsAnim.setValue(0);
  }, [currentYear, currentMonth, statsAnim]);

  // Go to today
  const goToToday = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDate(null);
  }, [today]);

  // Handle day press
  const handleDayPress = useCallback(
    (date: string) => {
      setSelectedDate(date);

      // Get day data for Pip message
      const dayCompletion = journeyData.completionByDate.get(date);
      const isMilestone = journeyData.streakData.milestoneDays.get(date) || null;
      const isStreakDay = journeyData.streakData.streakDays.has(date);

      const todayStr = formatDateString(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate()
      );
      const isToday = date === todayStr;
      const dayNumber = parseInt(date.split('-')[2], 10);

      // Build day data for Pip message
      const dayDataForPip: JourneyDayData | null = dayCompletion
        ? {
            completionPercent: dayCompletion.completionPercent,
            hasInjection: dayCompletion.hasInjection,
            hasWeighIn: dayCompletion.hasWeighIn,
            isMilestone,
            streakDay: isStreakDay,
          }
        : null;

      const message = getJourneyPipMessage(dayDataForPip, isToday, dayNumber);
      setPipMessage(message);

      // Trigger confetti for perfect days or milestones
      if (dayCompletion?.completionPercent === 100) {
        if (isMilestone) {
          // Full confetti for milestone
          setConfettiCount(30);
          setShowConfetti(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          // Mini confetti for perfect day
          setConfettiCount(10);
          setShowConfetti(true);
        }
      }
    },
    [journeyData, today]
  );

  // Close day detail sheet
  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
    // Reset Pip message to default
    if (journeyData) {
      const message = getJourneyHeaderMessage(
        journeyData.streakData.currentStreak,
        journeyData.monthlyStats.completionPercent,
        journeyData.monthlyStats.perfectDays
      );
      setPipMessage(message);
    }
  }, [journeyData]);

  // Handle share button press (trigger confetti)
  const handleSharePress = useCallback(() => {
    setConfettiCount(30);
    setShowConfetti(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  // Check if viewing current month
  const isCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1;

  // Check if we can go to next month (don't allow future months)
  const canGoNext = !(
    currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1
  );

  // Determine Pip state based on monthly completion
  const pipState = getJourneyPipState(journeyData.monthlyStats.completionPercent);

  // Loading state
  if (monthLoading && !monthData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2C9C91" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading your journey...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (monthError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            We couldn't load your journey. Please try again.
          </Text>
          <Pressable
            onPress={() => refetchMonth()}
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
      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          ref={confettiRef}
          count={confettiCount}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
          colors={['#14B8A6', '#22C55E', '#5EEAD4', '#FBBF24', '#FB7185']}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}

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
        {/* Journey Header with Pip */}
        <JourneyHeader
          year={currentYear}
          month={currentMonth}
          currentStreak={journeyData.streakData.currentStreak}
          pipState={pipState}
          pipMessage={pipMessage}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
          onGoToToday={goToToday}
          canGoNext={canGoNext}
          isCurrentMonth={isCurrentMonth}
        />

        {/* Calendar Grid */}
        <View style={{ marginTop: 16 }}>
          <MonthGrid
            year={currentYear}
            month={currentMonth}
            data={monthData}
            selectedDate={selectedDate}
            completionByDate={journeyData.completionByDate}
            streakData={journeyData.streakData}
            onDayPress={handleDayPress}
          />
        </View>

        {/* Monthly Wins Stats */}
        <Animated.View
          style={{
            opacity: statsAnim,
            transform: [
              {
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          }}
        >
          <MonthlyWins
            stats={{
              completionPercent: journeyData.monthlyStats.completionPercent,
              perfectDays: journeyData.monthlyStats.perfectDays,
              totalInjections: journeyData.monthlyStats.totalInjections,
              totalWeighIns: journeyData.monthlyStats.totalWeighIns,
              bestStreak: journeyData.streakData.bestStreak,
              weightChange: journeyData.monthlyStats.weightChange,
            }}
            weightUnit={weightUnit}
            monthName={`${getMonthName(currentMonth)} ${currentYear}`}
            onSharePress={handleSharePress}
          />
        </Animated.View>
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal
        visible={selectedDate !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseDetail}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'flex-end',
          }}
          onPress={handleCloseDetail}
        >
          <Pressable onPress={() => {}}>
            {selectedDate && (
              <DayDetailSheet
                date={selectedDate}
                data={dayData}
                isLoading={dayLoading}
                weightUnit={weightUnit}
                onClose={handleCloseDetail}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
