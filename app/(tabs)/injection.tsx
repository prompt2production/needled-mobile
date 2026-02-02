import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

import {
  useInjectionStatusForInjection,
  useInjectionHistory,
  useLogInjection,
  useDashboardData,
} from '@/hooks';
import { PipWithBubble, PipState } from '@/components/pip';
import {
  SiteSelector,
  DosageSelector,
  InjectionDetailsCard,
  InjectionSuccessCard,
  InjectionHistory,
} from '@/components/injection';
import { hasDosageTracking } from '@/constants/dosages';
import { DatePicker } from '@/components/ui';
import { InjectionSite, InjectionStatus } from '@/types/api';

const { width: screenWidth } = Dimensions.get('window');

export default function InjectionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Fetch data
  const {
    data: injectionStatus,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useInjectionStatusForInjection();

  const {
    data: injectionHistory,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useInjectionHistory(5);

  const { data: dashboardData } = useDashboardData();

  // Form state
  const [selectedSite, setSelectedSite] = useState<InjectionSite | null>(null);
  const [selectedDosage, setSelectedDosage] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Celebration state
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const confettiRef = useRef<any>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Log injection mutation
  const logInjectionMutation = useLogInjection();

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStatus(), refetchHistory()]);
    setRefreshing(false);
  }, [refetchStatus, refetchHistory]);

  // Set default selected site from suggestion
  useEffect(() => {
    if (injectionStatus?.suggestedSite && !selectedSite) {
      setSelectedSite(injectionStatus.suggestedSite);
    }
  }, [injectionStatus?.suggestedSite, selectedSite]);

  // Set default dosage from current user dosage
  useEffect(() => {
    if (injectionStatus?.currentDosageMg && selectedDosage === null) {
      setSelectedDosage(injectionStatus.currentDosageMg);
    }
  }, [injectionStatus?.currentDosageMg, selectedDosage]);

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

  // Format date to YYYY-MM-DD string
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle marking as done
  const handleMarkAsDone = useCallback(() => {
    if (!selectedSite || logInjectionMutation.isPending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    triggerCelebration();

    // Format date if a historical date is selected
    const dateString = selectedDate ? formatDateString(selectedDate) : undefined;

    logInjectionMutation.mutate(
      {
        site: selectedSite,
        notes: notes.trim() || undefined,
        date: dateString,
        dosageMg: selectedDosage ?? undefined,
      },
      {
        onSuccess: () => {
          // Reset form
          setNotes('');
          setSelectedDate(null);
          setShowAddEntryForm(false); // Return to success state after logging
          // Don't reset selectedSite or selectedDosage here - let the next API response set new values
        },
      }
    );
  }, [selectedSite, selectedDosage, notes, selectedDate, logInjectionMutation, triggerCelebration]);

  // Handle showing the add entry form
  const handleAddEntry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddEntryForm(true);
    // Reset form state for new entry
    setSelectedSite(injectionStatus?.suggestedSite || null);
    setSelectedDosage(injectionStatus?.currentDosageMg || null);
    setNotes('');
    setSelectedDate(null);
  }, [injectionStatus?.suggestedSite, injectionStatus?.currentDosageMg]);

  // Handle canceling add entry
  const handleCancelAddEntry = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowAddEntryForm(false);
  }, []);

  // Determine status
  const status: InjectionStatus = injectionStatus?.status || 'upcoming';
  const isDone = status === 'done' && !showAddEntryForm;
  const isDue = status === 'due';
  const isOverdue = status === 'overdue';

  // Get user info from dashboard
  const medication = dashboardData?.user?.medication || 'OTHER';
  const injectionDay = dashboardData?.user?.injectionDay ?? 0;

  // Determine Pip state and message
  const getPipStateAndMessage = (): { state: PipState; message: string } => {
    if (isCelebrating) {
      return {
        state: 'celebrating',
        message: "You did it! Your weekly injection is logged. I'm so proud of you!",
      };
    }

    if (isDone) {
      return {
        state: 'proud',
        message: "Great job! You've completed your injection for this week. See you next time!",
      };
    }

    if (isOverdue) {
      return {
        state: 'encouraging',
        message: `Your injection is ${injectionStatus?.daysOverdue || 0} day${
          (injectionStatus?.daysOverdue || 0) > 1 ? 's' : ''
        } overdue. No worries - let's get it done today!`,
      };
    }

    if (isDue) {
      return {
        state: 'cheerful',
        message: "It's injection day! Select your site below and let's get this done together.",
      };
    }

    // upcoming
    return {
      state: 'cheerful',
      message: `Your next injection is in ${injectionStatus?.daysUntil || 0} days. You can log it early if needed!`,
    };
  };

  const { state: pipState, message: pipMessage } = getPipStateAndMessage();

  // Status badge config
  const getStatusBadge = () => {
    switch (status) {
      case 'done':
        return {
          text: 'Done',
          bgColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7',
          textColor: '#22C55E',
        };
      case 'due':
        return {
          text: 'Due Today',
          bgColor: isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1',
          textColor: '#14B8A6',
        };
      case 'overdue':
        return {
          text: 'Overdue',
          bgColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
          textColor: '#F59E0B',
        };
      default:
        return {
          text: 'Upcoming',
          bgColor: isDark ? '#374151' : '#F3F4F6',
          textColor: isDark ? '#9CA3AF' : '#6B7280',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Loading state
  if (statusLoading && !injectionStatus) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2C9C91" />
          <Text className="text-gray-500 dark:text-gray-400 mt-4">
            Loading injection status...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (statusError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Oops!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">
            We couldn't load your injection status. Please try again.
          </Text>
          <Pressable
            onPress={() => refetchStatus()}
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
                Weekly Injection
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

          {/* Content depends on status */}
          <View className="px-4" style={{ gap: 16 }}>
            {isDone ? (
              // AFTER STATE: Show success card and history
              <>
                {injectionStatus && (
                  <InjectionSuccessCard
                    status={injectionStatus}
                    injectionDay={injectionDay}
                  />
                )}

                {/* Add Entry Button */}
                <Pressable
                  onPress={handleAddEntry}
                  style={{
                    backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                    borderRadius: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    borderWidth: 2,
                    borderColor: '#14B8A6',
                    borderStyle: 'dashed',
                  }}
                >
                  <Text style={{ fontSize: 20 }}>+</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#14B8A6',
                    }}
                  >
                    Add Injection Entry
                  </Text>
                </Pressable>

                <InjectionHistory
                  injections={injectionHistory}
                  isLoading={historyLoading}
                  defaultExpanded={true}
                />
              </>
            ) : (
              // BEFORE STATE: Show form
              <>
                {injectionStatus && (
                  <InjectionDetailsCard
                    status={injectionStatus}
                    medication={medication}
                  />
                )}

                {/* Date Picker for historical entries */}
                <View
                  style={{
                    backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                  }}
                >
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    disabled={logInjectionMutation.isPending}
                    label="Injection Date"
                  />
                </View>

                {injectionStatus && (
                  <SiteSelector
                    selectedSite={selectedSite}
                    suggestedSite={injectionStatus.suggestedSite}
                    onSelect={setSelectedSite}
                    disabled={logInjectionMutation.isPending}
                  />
                )}

                {/* Dosage Selector - only shown for medications with dosage tracking */}
                {hasDosageTracking(medication) && (
                  <DosageSelector
                    medication={medication}
                    currentDosage={injectionStatus?.currentDosageMg || null}
                    selectedDosage={selectedDosage}
                    onDosageChange={setSelectedDosage}
                    disabled={logInjectionMutation.isPending}
                  />
                )}

                {/* Notes Input */}
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
                      marginBottom: 12,
                    }}
                  >
                    Notes (Optional)
                  </Text>
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Any notes about this injection..."
                    placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                    multiline
                    numberOfLines={3}
                    style={{
                      backgroundColor: isDark ? '#374151' : '#F3F4F6',
                      borderRadius: 12,
                      padding: 14,
                      fontSize: 15,
                      color: isDark ? '#F9FAFB' : '#111827',
                      minHeight: 80,
                      textAlignVertical: 'top',
                    }}
                  />
                </View>

                {/* Mark as Done Button */}
                <Pressable
                  onPress={handleMarkAsDone}
                  disabled={!selectedSite || logInjectionMutation.isPending}
                  style={{
                    backgroundColor:
                      !selectedSite || logInjectionMutation.isPending
                        ? isDark
                          ? '#374151'
                          : '#D1D5DB'
                        : '#14B8A6',
                    borderRadius: 16,
                    paddingVertical: 18,
                    alignItems: 'center',
                    opacity:
                      !selectedSite || logInjectionMutation.isPending ? 0.7 : 1,
                  }}
                >
                  {logInjectionMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '700',
                        color:
                          !selectedSite
                            ? isDark
                              ? '#6B7280'
                              : '#9CA3AF'
                            : '#FFFFFF',
                      }}
                    >
                      {showAddEntryForm ? 'Log Injection' : 'Mark as Done'}
                    </Text>
                  )}
                </Pressable>

                {/* Cancel Button (only when adding entry) */}
                {showAddEntryForm && (
                  <Pressable
                    onPress={handleCancelAddEntry}
                    disabled={logInjectionMutation.isPending}
                    style={{
                      paddingVertical: 14,
                      alignItems: 'center',
                      opacity: logInjectionMutation.isPending ? 0.5 : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                )}

                {/* History collapsed by default in before state */}
                <InjectionHistory
                  injections={injectionHistory}
                  isLoading={historyLoading}
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
