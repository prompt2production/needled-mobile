/**
 * JourneyLegend Component
 * Updated legend with emoji badges and heat map indicators
 */

import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

interface JourneyLegendProps {
  compact?: boolean;
}

export function JourneyLegend({ compact = false }: JourneyLegendProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (compact) {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 12,
          paddingTop: 8,
        }}
      >
        <LegendItem emoji="💉" label="Injection" isDark={isDark} />
        <LegendItem emoji="⚖️" label="Weigh-in" isDark={isDark} />
        <LegendItem emoji="🔥" label="Streak" isDark={isDark} />
      </View>
    );
  }

  return (
    <View
      style={{
        paddingTop: 12,
        paddingHorizontal: 8,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#374151' : '#E5E7EB',
      }}
    >
      {/* Heat map legend */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: isDark ? '#6B7280' : '#9CA3AF',
            marginRight: 8,
          }}
        >
          Habits:
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <HeatMapBlock level={0} isDark={isDark} />
          <HeatMapBlock level={33} isDark={isDark} />
          <HeatMapBlock level={66} isDark={isDark} />
          <HeatMapBlock level={100} isDark={isDark} />
        </View>
        <Text
          style={{
            fontSize: 10,
            color: isDark ? '#6B7280' : '#9CA3AF',
            marginLeft: 4,
          }}
        >
          0-100%
        </Text>
      </View>

      {/* Badge legend */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <LegendItem emoji="💉" label="Injection" isDark={isDark} bgColor="#FECDD3" />
        <LegendItem emoji="⚖️" label="Weigh-in" isDark={isDark} bgColor="#FEF3C7" />
        <LegendItem emoji="🔥" label="Streak" isDark={isDark} />
        <LegendItem emoji="⭐" label="7 days" isDark={isDark} />
      </View>
    </View>
  );
}

interface HeatMapBlockProps {
  level: 0 | 33 | 66 | 100;
  isDark: boolean;
}

function HeatMapBlock({ level, isDark }: HeatMapBlockProps) {
  const getBackgroundColor = () => {
    switch (level) {
      case 100:
        return isDark ? 'rgba(20, 184, 166, 0.25)' : '#CCFBF1';
      case 66:
        return isDark ? 'rgba(20, 184, 166, 0.15)' : '#F0FDFA';
      case 33:
        return isDark ? 'rgba(20, 184, 166, 0.08)' : '#F0FDFA';
      default:
        return isDark ? '#1E1E2E' : '#F9FAFB';
    }
  };

  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        backgroundColor: getBackgroundColor(),
        borderWidth: 1,
        borderColor: isDark ? '#374151' : '#E5E7EB',
      }}
    />
  );
}

interface LegendItemProps {
  emoji: string;
  label: string;
  isDark: boolean;
  bgColor?: string;
}

function LegendItem({ emoji, label, isDark, bgColor }: LegendItemProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          backgroundColor: bgColor || 'transparent',
          borderRadius: 4,
          padding: bgColor ? 2 : 0,
        }}
      >
        <Text style={{ fontSize: 10 }}>{emoji}</Text>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: isDark ? '#9CA3AF' : '#6B7280',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default JourneyLegend;
