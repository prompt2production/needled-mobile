/**
 * DayDetailSheet Component
 * Shows detailed activities for a selected day
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarDay, InjectionSite, WeightUnit } from '@/types/api';

interface DayDetailSheetProps {
  date: string;
  data: CalendarDay | undefined;
  isLoading: boolean;
  weightUnit: WeightUnit;
  onClose: () => void;
}

const siteNames: Record<InjectionSite, string> = {
  ABDOMEN_LEFT: 'Abdomen Left',
  ABDOMEN_RIGHT: 'Abdomen Right',
  THIGH_LEFT: 'Thigh Left',
  THIGH_RIGHT: 'Thigh Right',
  UPPER_ARM_LEFT: 'Arm Left',
  UPPER_ARM_RIGHT: 'Arm Right',
};

export function DayDetailSheet({
  date,
  data,
  isLoading,
  weightUnit,
  onClose,
}: DayDetailSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Format the date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  // Check if there's any activity
  const hasActivity =
    data?.habit || data?.injection || data?.weighIn;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      {/* Handle bar */}
      <View
        style={{
          width: 40,
          height: 4,
          borderRadius: 2,
          backgroundColor: isDark ? '#4B5563' : '#D1D5DB',
          alignSelf: 'center',
          marginBottom: 16,
        }}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          {formatDate(date)}
        </Text>
        <Pressable
          onPress={handleClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: isDark ? '#374151' : '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 16, color: isDark ? '#9CA3AF' : '#6B7280' }}>
            ✕
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ alignItems: 'center', padding: 30 }}>
          <ActivityIndicator size="small" color="#14B8A6" />
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginTop: 12,
            }}
          >
            Loading...
          </Text>
        </View>
      ) : !hasActivity ? (
        <View
          style={{
            backgroundColor: isDark ? '#374151' : '#F9FAFB',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
              textAlign: 'center',
            }}
          >
            No activities recorded for this day.
          </Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {/* Habits */}
          {data?.habit && (
            <ActivityCard
              title="Daily Habits"
              icon={require('../../../media/check-in.png')}
              isDark={isDark}
            >
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <HabitBadge
                  label="Water"
                  completed={data.habit.water}
                  isDark={isDark}
                />
                <HabitBadge
                  label="Nutrition"
                  completed={data.habit.nutrition}
                  isDark={isDark}
                />
                <HabitBadge
                  label="Exercise"
                  completed={data.habit.exercise}
                  isDark={isDark}
                />
              </View>
            </ActivityCard>
          )}

          {/* Injection */}
          {data?.injection && (
            <ActivityCard
              title="Injection"
              icon={require('../../../media/injection.png')}
              isDark={isDark}
              accentColor="#FB7185"
            >
              <Text
                style={{
                  fontSize: 15,
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              >
                Site: {siteNames[data.injection.site]}
              </Text>
            </ActivityCard>
          )}

          {/* Weigh-in */}
          {data?.weighIn && (
            <ActivityCard
              title="Weigh-in"
              icon={require('../../../media/weigh-in.png')}
              isDark={isDark}
              accentColor="#FBBF24"
            >
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: isDark ? '#F9FAFB' : '#111827',
                  }}
                >
                  {data.weighIn.weight}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginLeft: 4,
                  }}
                >
                  {weightUnit}
                </Text>
                {data.weighIn.change !== null && (
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color:
                        data.weighIn.change <= 0 ? '#22C55E' : '#F59E0B',
                      marginLeft: 12,
                    }}
                  >
                    {data.weighIn.change > 0 ? '+' : ''}
                    {data.weighIn.change.toFixed(1)} {weightUnit}
                  </Text>
                )}
              </View>
            </ActivityCard>
          )}
        </View>
      )}
    </View>
  );
}

interface ActivityCardProps {
  title: string;
  icon: any;
  isDark: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

function ActivityCard({
  title,
  icon,
  isDark,
  accentColor = '#14B8A6',
  children,
}: ActivityCardProps) {
  return (
    <View
      style={{
        backgroundColor: isDark ? '#374151' : '#F9FAFB',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: accentColor,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Image source={icon} style={{ width: 20, height: 20, marginRight: 8 }} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

interface HabitBadgeProps {
  label: string;
  completed: boolean;
  isDark: boolean;
}

function HabitBadge({ label, completed, isDark }: HabitBadgeProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: completed
          ? isDark
            ? 'rgba(20, 184, 166, 0.2)'
            : '#CCFBF1'
          : isDark
          ? '#4B5563'
          : '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '600',
          color: completed
            ? '#14B8A6'
            : isDark
            ? '#9CA3AF'
            : '#6B7280',
        }}
      >
        {completed ? '✓ ' : ''}{label}
      </Text>
    </View>
  );
}

export default DayDetailSheet;
