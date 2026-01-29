import React from 'react';
import { View, Text, Pressable, Alert, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAuthStore } from '@/stores/authStore';

interface MenuItemProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  showArrow?: boolean;
  isDanger?: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  const MenuItem = ({
    title,
    subtitle,
    onPress,
    showArrow = true,
    isDanger = false,
  }: MenuItemProps) => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#F3F4F6',
      }}
    >
      <View>
        <Text
          style={{
            fontSize: 16,
            color: isDanger
              ? '#EF4444'
              : isDark
              ? '#F9FAFB'
              : '#111827',
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showArrow && (
        <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 16 }}>
          →
        </Text>
      )}
    </Pressable>
  );

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
          Settings
        </Text>
      </View>

      <View style={{ flex: 1, padding: 16 }}>
        {/* User Info */}
        {user && (
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
                fontSize: 18,
                fontWeight: '600',
                color: isDark ? '#F9FAFB' : '#111827',
              }}
            >
              {user.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginTop: 4,
              }}
            >
              {user.email}
            </Text>
          </View>
        )}

        {/* Profile Section */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 12,
            marginBottom: 20,
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            Profile
          </Text>
          <MenuItem
            title="Edit Profile"
            subtitle="Name, goal weight, medication"
            onPress={() => router.push('/settings/profile')}
          />
          <MenuItem
            title="Change Password"
            subtitle="Update your password"
            onPress={() => router.push('/settings/password')}
          />
        </View>

        {/* Preferences Section */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 12,
            marginBottom: 20,
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            Preferences
          </Text>
          <MenuItem
            title="Notifications"
            subtitle="Reminders and alerts"
            onPress={() => router.push('/settings/preferences')}
          />
        </View>

        {/* Account Section */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 12,
            marginBottom: 20,
            overflow: 'hidden',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isDark ? '#9CA3AF' : '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            Account
          </Text>
          <MenuItem
            title="Account Settings"
            subtitle="Email, data export, delete account"
            onPress={() => router.push('/settings/account')}
          />
          <View style={{ borderBottomWidth: 0 }}>
            <MenuItem
              title="Log Out"
              onPress={handleLogout}
              showArrow={false}
              isDanger
            />
          </View>
        </View>

        {/* App Info */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#6B7280' : '#9CA3AF',
            }}
          >
            Needled v1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
