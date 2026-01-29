/**
 * InjectionDetailsCard Component
 * Pre-injection information card
 */

import React from 'react';
import { View, Text, useColorScheme, Image } from 'react-native';
import { InjectionStatusResponse, Medication, InjectionSite, DoseNumber } from '@/types/api';

interface InjectionDetailsCardProps {
  status: InjectionStatusResponse;
  medication: Medication;
}

const medicationNames: Record<Medication, string> = {
  OZEMPIC: 'Ozempic',
  WEGOVY: 'Wegovy',
  MOUNJARO: 'Mounjaro',
  ZEPBOUND: 'Zepbound',
  OTHER: 'GLP-1',
};

const siteNames: Record<InjectionSite, string> = {
  ABDOMEN_LEFT: 'Abdomen Left',
  ABDOMEN_RIGHT: 'Abdomen Right',
  THIGH_LEFT: 'Thigh Left',
  THIGH_RIGHT: 'Thigh Right',
  UPPER_ARM_LEFT: 'Arm Left',
  UPPER_ARM_RIGHT: 'Arm Right',
};

export function InjectionDetailsCard({
  status,
  medication,
}: InjectionDetailsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isOverdue = status.status === 'overdue';
  const isDue = status.status === 'due';

  // Calculate time since last injection
  const getTimeSinceLast = () => {
    if (!status.lastInjection) {
      return 'First injection';
    }
    const lastDate = new Date(status.lastInjection.date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: isOverdue ? 2 : 0,
        borderColor: isOverdue ? '#F59E0B' : 'transparent',
      }}
    >
      {/* Header with status */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../../media/injection.png')}
            style={{ width: 24, height: 24, marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            {medicationNames[medication]}
          </Text>
        </View>

        {/* Status Badge */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: isOverdue
              ? isDark
                ? 'rgba(245, 158, 11, 0.2)'
                : '#FEF3C7'
              : isDue
              ? isDark
                ? 'rgba(20, 184, 166, 0.2)'
                : '#CCFBF1'
              : isDark
              ? '#374151'
              : '#F3F4F6',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: isOverdue
                ? '#F59E0B'
                : isDue
                ? '#14B8A6'
                : isDark
                ? '#9CA3AF'
                : '#6B7280',
            }}
          >
            {isOverdue
              ? `${status.daysOverdue} day${status.daysOverdue > 1 ? 's' : ''} overdue`
              : isDue
              ? 'Due today'
              : `Due in ${status.daysUntil} days`}
          </Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {/* Dose Number */}
        <InfoItem
          label="Dose"
          value={`${status.nextDose} of 4`}
          isDark={isDark}
        />

        {/* Doses Remaining */}
        <InfoItem
          label="Doses Left in Pen"
          value={status.dosesRemaining.toString()}
          isDark={isDark}
        />

        {/* Last Injection */}
        <InfoItem
          label="Last Injection"
          value={getTimeSinceLast()}
          isDark={isDark}
        />

        {/* Suggested Site */}
        <InfoItem
          label="Suggested Site"
          value={siteNames[status.suggestedSite]}
          isDark={isDark}
          highlight={true}
        />
      </View>
    </View>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
  isDark: boolean;
  highlight?: boolean;
}

function InfoItem({ label, value, isDark, highlight = false }: InfoItemProps) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        backgroundColor: highlight
          ? isDark
            ? 'rgba(20, 184, 166, 0.1)'
            : '#F0FDFA'
          : isDark
          ? '#374151'
          : '#F9FAFB',
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          color: highlight
            ? '#14B8A6'
            : isDark
            ? '#F9FAFB'
            : '#111827',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

export default InjectionDetailsCard;
