/**
 * InjectionHistory Component
 * List of recent injections
 */

import React, { useState } from 'react';
import { View, Text, Pressable, useColorScheme, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Injection, InjectionSite } from '@/types/api';

interface InjectionHistoryProps {
  injections: Injection[] | undefined;
  isLoading: boolean;
  defaultExpanded?: boolean;
}

const siteNames: Record<InjectionSite, string> = {
  ABDOMEN_LEFT: 'Abdomen L',
  ABDOMEN_RIGHT: 'Abdomen R',
  THIGH_LEFT: 'Thigh L',
  THIGH_RIGHT: 'Thigh R',
  UPPER_ARM_LEFT: 'Arm L',
  UPPER_ARM_RIGHT: 'Arm R',
};

export function InjectionHistory({
  injections,
  isLoading,
  defaultExpanded = false,
}: InjectionHistoryProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const hasHistory = injections && injections.length > 0;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* Header - Always visible */}
      <Pressable
        onPress={toggleExpanded}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          Injection History
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {hasHistory && (
            <Text
              style={{
                fontSize: 14,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginRight: 8,
              }}
            >
              {injections.length} recent
            </Text>
          )}
          <Text
            style={{
              fontSize: 16,
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            {expanded ? '−' : '+'}
          </Text>
        </View>
      </Pressable>

      {/* Content - Expandable */}
      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {isLoading ? (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="small" color="#14B8A6" />
            </View>
          ) : !hasHistory ? (
            <View
              style={{
                backgroundColor: isDark ? '#374151' : '#F3F4F6',
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  textAlign: 'center',
                }}
              >
                No injections logged yet.{'\n'}Your history will appear here.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {injections.map((injection) => (
                <InjectionHistoryItem
                  key={injection.id}
                  injection={injection}
                  isDark={isDark}
                  formatDate={formatDate}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

interface InjectionHistoryItemProps {
  injection: Injection;
  isDark: boolean;
  formatDate: (dateStr: string) => string;
}

function InjectionHistoryItem({
  injection,
  isDark,
  formatDate,
}: InjectionHistoryItemProps) {
  return (
    <View
      style={{
        backgroundColor: isDark ? '#374151' : '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Dose badge */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            color: '#14B8A6',
          }}
        >
          #{injection.doseNumber}
        </Text>
      </View>

      {/* Details */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
            marginBottom: 2,
          }}
        >
          {formatDate(injection.date)}
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          {siteNames[injection.site]}
          {injection.notes ? ` • ${injection.notes}` : ''}
        </Text>
      </View>
    </View>
  );
}

export default InjectionHistory;
