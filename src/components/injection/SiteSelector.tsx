/**
 * SiteSelector Component
 * 2x3 grid for selecting injection site
 */

import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { InjectionSite } from '@/types/api';

interface SiteSelectorProps {
  selectedSite: InjectionSite | null;
  suggestedSite: InjectionSite;
  onSelect: (site: InjectionSite) => void;
  disabled?: boolean;
}

const siteConfig: {
  id: InjectionSite;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'ABDOMEN_LEFT', label: 'Abdomen Left', shortLabel: 'Abdomen L' },
  { id: 'ABDOMEN_RIGHT', label: 'Abdomen Right', shortLabel: 'Abdomen R' },
  { id: 'THIGH_LEFT', label: 'Thigh Left', shortLabel: 'Thigh L' },
  { id: 'THIGH_RIGHT', label: 'Thigh Right', shortLabel: 'Thigh R' },
  { id: 'UPPER_ARM_LEFT', label: 'Arm Left', shortLabel: 'Arm L' },
  { id: 'UPPER_ARM_RIGHT', label: 'Arm Right', shortLabel: 'Arm R' },
];

export function SiteSelector({
  selectedSite,
  suggestedSite,
  onSelect,
  disabled = false,
}: SiteSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleSelect = (site: InjectionSite) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect(site);
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: isDark ? '#F9FAFB' : '#111827',
          marginBottom: 4,
        }}
      >
        Select Injection Site
      </Text>
      <Text
        style={{
          fontSize: 13,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 16,
        }}
      >
        Tap to select. Suggested site is highlighted.
      </Text>

      {/* 2x3 Grid */}
      <View style={{ gap: 10 }}>
        {/* Row 1: Abdomen */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {siteConfig.slice(0, 2).map((site) => (
            <SiteButton
              key={site.id}
              site={site}
              isSelected={selectedSite === site.id}
              isSuggested={suggestedSite === site.id}
              onPress={() => handleSelect(site.id)}
              disabled={disabled}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Row 2: Thigh */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {siteConfig.slice(2, 4).map((site) => (
            <SiteButton
              key={site.id}
              site={site}
              isSelected={selectedSite === site.id}
              isSuggested={suggestedSite === site.id}
              onPress={() => handleSelect(site.id)}
              disabled={disabled}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Row 3: Arms */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {siteConfig.slice(4, 6).map((site) => (
            <SiteButton
              key={site.id}
              site={site}
              isSelected={selectedSite === site.id}
              isSuggested={suggestedSite === site.id}
              onPress={() => handleSelect(site.id)}
              disabled={disabled}
              isDark={isDark}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

interface SiteButtonProps {
  site: { id: InjectionSite; label: string; shortLabel: string };
  isSelected: boolean;
  isSuggested: boolean;
  onPress: () => void;
  disabled: boolean;
  isDark: boolean;
}

function SiteButton({
  site,
  isSelected,
  isSuggested,
  onPress,
  disabled,
  isDark,
}: SiteButtonProps) {
  const getBackgroundColor = () => {
    if (isSelected) {
      return '#14B8A6'; // Teal when selected
    }
    if (isSuggested) {
      return isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1'; // Light teal for suggested
    }
    return isDark ? '#374151' : '#F3F4F6';
  };

  const getBorderColor = () => {
    if (isSelected) {
      return '#0D9488';
    }
    if (isSuggested) {
      return isDark ? '#0D9488' : '#5EEAD4';
    }
    return isDark ? '#4B5563' : '#E5E7EB';
  };

  const getTextColor = () => {
    if (isSelected) {
      return '#FFFFFF';
    }
    if (isSuggested) {
      return isDark ? '#5EEAD4' : '#0F766E';
    }
    return isDark ? '#D1D5DB' : '#374151';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: getBackgroundColor(),
        borderWidth: 2,
        borderColor: getBorderColor(),
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: getTextColor(),
          textAlign: 'center',
        }}
      >
        {site.shortLabel}
      </Text>
      {isSuggested && !isSelected && (
        <Text
          style={{
            fontSize: 10,
            color: isDark ? '#5EEAD4' : '#0F766E',
            marginTop: 2,
          }}
        >
          Suggested
        </Text>
      )}
    </Pressable>
  );
}

export default SiteSelector;
