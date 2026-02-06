/**
 * AppHeader Component
 * Shared header with hamburger menu for all tab screens
 */

import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface AppHeaderProps {
  title?: string;
  onMenuPress: () => void;
  rightElement?: React.ReactNode;
}

export function AppHeader({ title, onMenuPress, rightElement }: AppHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMenuPress();
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#111827' : '#FFFFFF',
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 56,
        }}
      >
        {/* Hamburger Menu Button */}
        <Pressable
          onPress={handleMenuPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? '#1E1E2E' : '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="menu"
            size={22}
            color={isDark ? '#F9FAFB' : '#374151'}
          />
        </Pressable>

        {/* Title - centered in remaining space */}
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          {title && (
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: isDark ? '#F9FAFB' : '#111827',
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Right element (optional) - maintains balance */}
        <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
          {rightElement}
        </View>
      </View>
    </View>
  );
}

export default AppHeader;
