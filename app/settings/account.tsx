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
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useUpdateEmail, useExportData, useDeleteAccount } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  const updateEmailMutation = useUpdateEmail();
  const exportDataMutation = useExportData();
  const deleteAccountMutation = useDeleteAccount();

  // Email change state
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateEmailMutation.mutateAsync(newEmail.trim());
      Alert.alert(
        'Success',
        'A verification email has been sent to your new address. Please verify to complete the change.',
        [{ text: 'OK', onPress: () => setShowEmailChange(false) }]
      );
      setNewEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update email');
    }
  };

  const handleExportData = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const data = await exportDataMutation.mutateAsync();

      // Convert to formatted JSON string
      const jsonString = JSON.stringify(data, null, 2);

      // Use Share API to allow user to save/share the data
      await Share.share({
        message: jsonString,
        title: 'Needled Data Export',
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export data');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setShowDeleteConfirm(true),
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password to confirm');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      await deleteAccountMutation.mutateAsync(deletePassword);
      // Logout is handled by the mutation's onSuccess
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete account');
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
          Account
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
          {/* Current Email Display */}
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
                marginBottom: 8,
              }}
            >
              Current Email
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            >
              {user?.email || 'Not set'}
            </Text>
          </View>

          {/* Email Change Section */}
          <View
            style={{
              backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowEmailChange(!showEmailChange);
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              >
                Change Email
              </Text>
              <Text style={{ color: '#14B8A6', fontSize: 14 }}>
                {showEmailChange ? '▲' : '▼'}
              </Text>
            </Pressable>

            {showEmailChange && (
              <View style={{ marginTop: 16 }}>
                <TextInput
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter new email"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={inputStyle}
                />
                <Pressable
                  onPress={handleEmailChange}
                  disabled={updateEmailMutation.isPending}
                  style={{
                    backgroundColor: updateEmailMutation.isPending
                      ? '#9CA3AF'
                      : '#14B8A6',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  {updateEmailMutation.isPending ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                      Update Email
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* Export Data Section */}
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
                fontSize: 16,
                fontWeight: '500',
                color: isDark ? '#F9FAFB' : '#111827',
                marginBottom: 8,
              }}
            >
              Export Your Data
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginBottom: 12,
              }}
            >
              Download all your data including habits, injections, and weigh-ins in JSON format.
            </Text>
            <Pressable
              onPress={handleExportData}
              disabled={exportDataMutation.isPending}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#14B8A6',
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              {exportDataMutation.isPending ? (
                <ActivityIndicator color="#14B8A6" size="small" />
              ) : (
                <Text style={{ color: '#14B8A6', fontSize: 14, fontWeight: '600' }}>
                  Export Data
                </Text>
              )}
            </Pressable>
          </View>

          {/* Danger Zone */}
          <View
            style={{
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#EF4444',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              Danger Zone
            </Text>

            {!showDeleteConfirm ? (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    color: isDark ? '#FCA5A5' : '#B91C1C',
                    marginBottom: 12,
                  }}
                >
                  Deleting your account will permanently remove all your data. This action cannot be undone.
                </Text>
                <Pressable
                  onPress={handleDeleteAccount}
                  style={{
                    backgroundColor: '#EF4444',
                    borderRadius: 8,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Delete Account
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 13,
                    color: isDark ? '#FCA5A5' : '#B91C1C',
                    marginBottom: 12,
                  }}
                >
                  Enter your password to confirm account deletion:
                </Text>
                <TextInput
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  placeholder="Your password"
                  placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    ...inputStyle,
                    borderColor: '#EF4444',
                  }}
                />
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <Pressable
                    onPress={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: isDark ? '#374151' : '#D1D5DB',
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? '#D1D5DB' : '#374151',
                        fontSize: 14,
                        fontWeight: '600',
                      }}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={confirmDeleteAccount}
                    disabled={deleteAccountMutation.isPending}
                    style={{
                      flex: 1,
                      backgroundColor: deleteAccountMutation.isPending
                        ? '#9CA3AF'
                        : '#EF4444',
                      borderRadius: 8,
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                  >
                    {deleteAccountMutation.isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                        Confirm Delete
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
