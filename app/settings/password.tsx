import React, { useState } from 'react';
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

import { useUpdatePassword } from '@/hooks';

export default function PasswordSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const updatePasswordMutation = useUpdatePassword();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password strength calculation
  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: '#9CA3AF' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: '#EF4444' };
    if (score <= 2) return { level: 2, label: 'Fair', color: '#F59E0B' };
    if (score <= 3) return { level: 3, label: 'Good', color: '#14B8A6' };
    return { level: 4, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSave = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      Alert.alert('Success', 'Your password has been updated', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: isDark ? '#F9FAFB' : '#111827',
    borderWidth: 1,
    borderColor: isDark ? '#374151' : '#E5E7EB',
  };

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
          Change Password
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
          {/* Current Password */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Current Password
            </Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={inputStyle}
            />
          </View>

          {/* New Password */}
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              New Password
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={inputStyle}
            />
          </View>

          {/* Password Strength Indicator */}
          {newPassword.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {[1, 2, 3, 4].map((level) => (
                  <View
                    key={level}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        level <= passwordStrength.level
                          ? passwordStrength.color
                          : isDark
                          ? '#374151'
                          : '#E5E7EB',
                    }}
                  />
                ))}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: passwordStrength.color,
                  fontWeight: '500',
                }}
              >
                {passwordStrength.label}
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Confirm New Password
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              style={inputStyle}
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <Text
                style={{
                  fontSize: 12,
                  color: '#EF4444',
                  marginTop: 4,
                }}
              >
                Passwords do not match
              </Text>
            )}
          </View>

          {/* Password Requirements */}
          <View
            style={{
              backgroundColor: isDark ? '#1E1E2E' : '#F9FAFB',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 8,
              }}
            >
              Password Requirements
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#9CA3AF' : '#6B7280',
                lineHeight: 20,
              }}
            >
              • At least 8 characters{'\n'}
              • Mix of uppercase and lowercase{'\n'}
              • Include numbers{'\n'}
              • Include special characters
            </Text>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={updatePasswordMutation.isPending}
            style={{
              backgroundColor: updatePasswordMutation.isPending ? '#9CA3AF' : '#14B8A6',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            {updatePasswordMutation.isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Update Password
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
