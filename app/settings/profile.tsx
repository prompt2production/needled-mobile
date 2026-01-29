import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useProfileSettings, useUpdateProfile, useDashboardData } from '@/hooks';
import { Medication, InjectionDay } from '@/types/api';

const MEDICATIONS: { value: Medication; label: string }[] = [
  { value: 'OZEMPIC', label: 'Ozempic' },
  { value: 'WEGOVY', label: 'Wegovy' },
  { value: 'MOUNJARO', label: 'Mounjaro' },
  { value: 'ZEPBOUND', label: 'Zepbound' },
  { value: 'OTHER', label: 'Other' },
];

const DAYS: { value: InjectionDay; label: string }[] = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' },
];

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: settings, isLoading } = useProfileSettings();
  const { data: dashboardData } = useDashboardData();
  const updateProfileMutation = useUpdateProfile();

  // Form state
  const [name, setName] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [medication, setMedication] = useState<Medication>('OZEMPIC');
  const [injectionDay, setInjectionDay] = useState<InjectionDay>(0);

  const weightUnit = dashboardData?.user?.weightUnit || 'kg';

  // Initialize form with current values
  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setGoalWeight(settings.goalWeight?.toString() || '');
      setMedication(settings.medication);
      setInjectionDay(settings.injectionDay);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim(),
        goalWeight: goalWeight ? parseFloat(goalWeight) : null,
        medication,
        injectionDay,
      });

      Alert.alert('Success', 'Your profile has been updated', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
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
          Edit Profile
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            />
          </View>

          {/* Goal Weight */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Goal Weight ({weightUnit})
            </Text>
            <TextInput
              value={goalWeight}
              onChangeText={(text) => setGoalWeight(text.replace(/[^0-9.]/g, ''))}
              placeholder="Optional"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
              }}
            />
          </View>

          {/* Medication */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Medication
            </Text>
            <View
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
                overflow: 'hidden',
              }}
            >
              {MEDICATIONS.map((med, index) => (
                <Pressable
                  key={med.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setMedication(med.value);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: index < MEDICATIONS.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                    backgroundColor:
                      medication === med.value
                        ? isDark
                          ? 'rgba(20, 184, 166, 0.1)'
                          : '#F0FDFA'
                        : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        medication === med.value
                          ? '#14B8A6'
                          : isDark
                          ? '#F9FAFB'
                          : '#111827',
                    }}
                  >
                    {med.label}
                  </Text>
                  {medication === med.value && (
                    <Text style={{ color: '#14B8A6', fontSize: 16 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Injection Day */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Injection Day
            </Text>
            <View
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? '#374151' : '#E5E7EB',
                overflow: 'hidden',
              }}
            >
              {DAYS.map((day, index) => (
                <Pressable
                  key={day.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setInjectionDay(day.value);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: index < DAYS.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                    backgroundColor:
                      injectionDay === day.value
                        ? isDark
                          ? 'rgba(20, 184, 166, 0.1)'
                          : '#F0FDFA'
                        : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        injectionDay === day.value
                          ? '#14B8A6'
                          : isDark
                          ? '#F9FAFB'
                          : '#111827',
                    }}
                  >
                    {day.label}
                  </Text>
                  {injectionDay === day.value && (
                    <Text style={{ color: '#14B8A6', fontSize: 16 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
            style={{
              backgroundColor: updateProfileMutation.isPending ? '#9CA3AF' : '#14B8A6',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Save Changes
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
