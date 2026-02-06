/**
 * CustomTabBar Component
 * Custom tab bar with larger touch targets and center Log button
 */

import React from 'react';
import { View, Text, Pressable, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_BAR_HEIGHT = 85;
const ICON_SIZE = 32;
const TOUCH_TARGET_SIZE = 48;

// Tab bar icons
const tabIcons = {
  home: require('../../../media/home.png'),
  'check-in': require('../../../media/check-in.png'),
  calendar: require('../../../media/calendar.png'),
};

interface TabButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
}

function TabButton({ label, icon, isActive, onPress }: TabButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        minHeight: TOUCH_TARGET_SIZE,
      }}
    >
      <View style={{ marginBottom: 4 }}>{icon}</View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: isActive
            ? '#14B8A6'
            : isDark
            ? '#94A3B8'
            : '#6B7280',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface LogButtonProps {
  onPress: () => void;
}

function LogButton({ onPress }: LogButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        minHeight: TOUCH_TARGET_SIZE,
      }}
    >
      <View style={{ marginBottom: 4 }}>
        <Ionicons
          name="add-circle-outline"
          size={ICON_SIZE}
          color="#14B8A6"
        />
      </View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: '#14B8A6',
        }}
      >
        Log
      </Text>
    </Pressable>
  );
}

export interface CustomTabBarProps extends BottomTabBarProps {
  onLogPress: () => void;
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
  onLogPress,
}: CustomTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Filter out hidden tabs and the log placeholder
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    // @ts-ignore - href is a valid option in expo-router
    return options.href !== null && route.name !== 'log';
  });

  // Get tab order: home, check-in, [log button], calendar, results
  const leftTabs = visibleRoutes.filter((r) =>
    ['index', 'check-in'].includes(r.name)
  );
  const rightTabs = visibleRoutes.filter((r) =>
    ['calendar', 'results'].includes(r.name)
  );

  const renderIcon = (routeName: string, focused: boolean) => {
    // For PNG icons, just use opacity (no tintColor to preserve original colors)
    if (routeName === 'index') {
      return (
        <Image
          source={tabIcons.home}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            opacity: focused ? 1 : 0.5,
          }}
        />
      );
    }

    if (routeName === 'check-in') {
      return (
        <Image
          source={tabIcons['check-in']}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            opacity: focused ? 1 : 0.5,
          }}
        />
      );
    }

    if (routeName === 'calendar') {
      return (
        <Image
          source={tabIcons.calendar}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            opacity: focused ? 1 : 0.5,
          }}
        />
      );
    }

    // Results uses Ionicons since there's no custom PNG
    if (routeName === 'results') {
      return (
        <Ionicons
          name="trending-up"
          size={ICON_SIZE}
          color={focused ? '#14B8A6' : isDark ? '#94A3B8' : '#6B7280'}
        />
      );
    }

    return null;
  };

  const getLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'check-in':
        return 'Habits';
      case 'calendar':
        return 'Calendar';
      case 'results':
        return 'Results';
      default:
        return routeName;
    }
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderTopColor: isDark ? '#374151' : '#E5E7EB',
        borderTopWidth: 1,
        paddingBottom: insets.bottom,
        height: TAB_BAR_HEIGHT + insets.bottom,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          height: TAB_BAR_HEIGHT,
        }}
      >
        {/* Left tabs */}
        {leftTabs.map((route) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          const focused = state.index === index;

          return (
            <TabButton
              key={route.key}
              label={getLabel(route.name)}
              icon={renderIcon(route.name, focused)}
              isActive={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}

        {/* Center Log button */}
        <LogButton onPress={onLogPress} />

        {/* Right tabs */}
        {rightTabs.map((route) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          const focused = state.index === index;

          return (
            <TabButton
              key={route.key}
              label={getLabel(route.name)}
              icon={renderIcon(route.name, focused)}
              isActive={focused}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

export default CustomTabBar;
