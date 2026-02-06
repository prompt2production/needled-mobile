/**
 * MenuDropdown Component
 * Bottom sheet menu for navigation and settings
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  useColorScheme,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAuthStore } from '@/stores/authStore';

export interface MenuDropdownProps {
  visible: boolean;
  onClose: () => void;
  onLogAction: (action: 'injection' | 'weight') => void;
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  isDanger?: boolean;
  isDark: boolean;
}

function MenuItem({ icon, label, onPress, isActive, isDanger, isDark }: MenuItemProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.menuItem}
    >
      <View style={[
        styles.menuItemInner,
        { backgroundColor: isDark ? '#1F2937' : '#F0F9FF' }
      ]}>
        <Ionicons
          name={icon}
          size={22}
          color={
            isDanger
              ? '#EF4444'
              : isActive
              ? '#14B8A6'
              : isDark
              ? '#D1D5DB'
              : '#374151'
          }
        />
        <Text
          style={[
            styles.menuItemLabel,
            {
              color: isDanger
                ? '#EF4444'
                : isActive
                ? '#14B8A6'
                : isDark
                ? '#F9FAFB'
                : '#111827',
              fontWeight: isActive ? '600' : '500',
            }
          ]}
        >
          {label}
        </Text>
        {isActive && <View style={styles.activeIndicator} />}
      </View>
    </Pressable>
  );
}

export function MenuDropdown({ visible, onClose, onLogAction }: MenuDropdownProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const navigateTo = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path as any);
    }, 150);
  };

  const handleLogout = () => {
    onClose();
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

  const handleLogAction = (action: 'injection' | 'weight') => {
    onClose();
    setTimeout(() => {
      onLogAction(action);
    }, 150);
  };

  const isActiveTab = (tabPath: string) => {
    if (tabPath === '/' || tabPath === '/index') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.includes(tabPath);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View style={[
          styles.sheet,
          {
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
            paddingBottom: insets.bottom + 16,
          }
        ]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[
              styles.handle,
              { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }
            ]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[
              styles.headerTitle,
              { color: isDark ? '#F9FAFB' : '#111827' }
            ]}>
              Menu
            </Text>
            <Pressable
              onPress={onClose}
              style={styles.doneButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Navigation */}
            <Text style={[styles.sectionHeader, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Navigation
            </Text>
            <MenuItem icon="home-outline" label="Home" onPress={() => navigateTo('/')} isActive={isActiveTab('/')} isDark={isDark} />
            <MenuItem icon="checkbox-outline" label="Check-in" onPress={() => navigateTo('/check-in')} isActive={isActiveTab('/check-in')} isDark={isDark} />
            <MenuItem icon="calendar-outline" label="Calendar" onPress={() => navigateTo('/calendar')} isActive={isActiveTab('/calendar')} isDark={isDark} />
            <MenuItem icon="trending-up-outline" label="Results" onPress={() => navigateTo('/results')} isActive={isActiveTab('/results')} isDark={isDark} />

            {/* Quick Actions */}
            <Text style={[styles.sectionHeader, { color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 16 }]}>
              Quick Actions
            </Text>
            <MenuItem icon="medical-outline" label="Log Injection" onPress={() => handleLogAction('injection')} isDark={isDark} />
            <MenuItem icon="scale-outline" label="Log Weight" onPress={() => handleLogAction('weight')} isDark={isDark} />

            {/* Settings */}
            <Text style={[styles.sectionHeader, { color: isDark ? '#9CA3AF' : '#6B7280', marginTop: 16 }]}>
              Settings
            </Text>
            <MenuItem icon="person-outline" label="Profile" onPress={() => navigateTo('/settings/profile')} isDark={isDark} />
            <MenuItem icon="flask-outline" label="Pen & Dosing" onPress={() => navigateTo('/settings/pen-dosing')} isDark={isDark} />
            <MenuItem icon="notifications-outline" label="Preferences" onPress={() => navigateTo('/settings/preferences')} isDark={isDark} />
            <MenuItem icon="settings-outline" label="Account" onPress={() => navigateTo('/settings/account')} isDark={isDark} />

            {/* Logout */}
            <View style={{ marginTop: 16 }}>
              <MenuItem icon="log-out-outline" label="Log Out" onPress={handleLogout} isDanger isDark={isDark} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  doneButton: {
    position: 'absolute',
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#14B8A6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    marginBottom: 8,
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#14B8A6',
  },
});

export default MenuDropdown;
