import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks';

export default function PreferencesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  // Form state - matches API fields
  const [injectionReminder, setInjectionReminder] = useState(true);
  const [weighInReminder, setWeighInReminder] = useState(true);
  const [habitReminder, setHabitReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [habitReminderTime, setHabitReminderTime] = useState('20:00');
  const [timezone, setTimezone] = useState('UTC');

  // Initialize form with current values
  useEffect(() => {
    if (preferences) {
      setInjectionReminder(preferences.injectionReminder ?? true);
      setWeighInReminder(preferences.weighInReminder ?? true);
      setHabitReminder(preferences.habitReminder ?? true);
      setReminderTime(preferences.reminderTime ?? '09:00');
      setHabitReminderTime(preferences.habitReminderTime ?? '20:00');
      setTimezone(preferences.timezone ?? 'UTC');
    }
  }, [preferences]);

  const handleToggle = async (
    key: string,
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(value);

    // Build update object with all current values
    const updates = {
      injectionReminder: key === 'injectionReminder' ? value : injectionReminder,
      weighInReminder: key === 'weighInReminder' ? value : weighInReminder,
      habitReminder: key === 'habitReminder' ? value : habitReminder,
      reminderTime,
      habitReminderTime,
      timezone,
    };

    try {
      await updateMutation.mutateAsync(updates);
    } catch (error: any) {
      // Revert on error
      setter(!value);
      Alert.alert('Error', error.message || 'Failed to update preference');
    }
  };

  const PreferenceItem = ({
    title,
    description,
    value,
    preferenceKey,
  }: {
    title: string;
    description: string;
    value: boolean;
    preferenceKey: string;
  }) => {
    const setter =
      preferenceKey === 'injectionReminder'
        ? setInjectionReminder
        : preferenceKey === 'weighInReminder'
        ? setWeighInReminder
        : setHabitReminder;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        }}
      >
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: isDark ? '#F9FAFB' : '#111827',
              marginBottom: 4,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {description}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={(v) => handleToggle(preferenceKey, v, setter)}
          trackColor={{ false: isDark ? '#374151' : '#D1D5DB', true: '#14B8A6' }}
          thumbColor="#FFFFFF"
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#14B8A6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#374151' : '#E5E7EB',
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Text style={{ color: '#14B8A6', fontSize: 16 }}>← Back</Text>
        </Pressable>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          Notifications
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Reminders Section */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            Reminders
          </Text>

          <PreferenceItem
            title="Injection Reminder"
            description="Remind me on my scheduled injection day"
            value={injectionReminder}
            preferenceKey="injectionReminder"
          />

          <PreferenceItem
            title="Weigh-in Reminder"
            description="Remind me to log my weekly weigh-in"
            value={weighInReminder}
            preferenceKey="weighInReminder"
          />

          <View style={{ borderBottomWidth: 0 }}>
            <PreferenceItem
              title="Daily Habits"
              description="Remind me to complete my daily habits"
              value={habitReminder}
              preferenceKey="habitReminder"
            />
          </View>
        </View>

        {/* Reminder Times */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            Reminder Times
          </Text>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? '#374151' : '#E5E7EB',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            >
              Injection & Weigh-in
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#14B8A6',
                fontWeight: '500',
              }}
            >
              {reminderTime}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            >
              Daily Habits
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#14B8A6',
                fontWeight: '500',
              }}
            >
              {habitReminderTime}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 12,
              color: isDark ? '#6B7280' : '#9CA3AF',
              marginTop: 8,
            }}
          >
            Time zone: {timezone}
          </Text>
        </View>

        {/* Info Note */}
        <View
          style={{
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : '#F0FDFA',
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#5EEAD4' : '#0D9488',
              lineHeight: 20,
            }}
          >
            Notifications help you stay on track with your GLP-1 journey. Push notifications require permission in your device settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
