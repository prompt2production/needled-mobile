/**
 * DosageSelector Component
 * Allows users to select/confirm their medication dosage when logging an injection
 */

import React from 'react';
import { View, Text, useColorScheme, TouchableOpacity, ScrollView } from 'react-native';
import { Medication } from '@/types/api';
import { MEDICATION_DOSAGES, hasDosageTracking } from '@/constants/dosages';

interface DosageSelectorProps {
  medication: Medication;
  currentDosage: number | null;
  selectedDosage: number | null;
  onDosageChange: (dosage: number) => void;
  disabled?: boolean;
}

export function DosageSelector({
  medication,
  currentDosage,
  selectedDosage,
  onDosageChange,
  disabled = false,
}: DosageSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Don't render for medications without dosage tracking
  if (!hasDosageTracking(medication)) {
    return null;
  }

  const dosageOptions = MEDICATION_DOSAGES[medication];
  const isTitrating = selectedDosage !== null && currentDosage !== null && selectedDosage !== currentDosage;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          Dosage
        </Text>

        {isTitrating && (
          <View
            style={{
              backgroundColor: isDark ? 'rgba(251, 113, 133, 0.2)' : '#FFF1F2',
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#FB7185',
              }}
            >
              Titrating Up
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {dosageOptions.map((dose) => {
          const isSelected = selectedDosage === dose;
          const isCurrent = currentDosage === dose;

          return (
            <TouchableOpacity
              key={dose}
              onPress={() => !disabled && onDosageChange(dose)}
              disabled={disabled}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isSelected
                  ? '#14B8A6'
                  : isDark
                  ? '#374151'
                  : '#E5E7EB',
                backgroundColor: isSelected
                  ? isDark
                    ? 'rgba(20, 184, 166, 0.1)'
                    : '#F0FDFA'
                  : isDark
                  ? '#374151'
                  : '#F9FAFB',
                opacity: disabled ? 0.5 : 1,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: isSelected
                    ? '#14B8A6'
                    : isDark
                    ? '#F9FAFB'
                    : '#111827',
                }}
              >
                {dose} mg
              </Text>
              {isCurrent && !isSelected && (
                <Text
                  style={{
                    fontSize: 10,
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginTop: 2,
                  }}
                >
                  Current
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#6B7280' : '#9CA3AF',
          marginTop: 12,
        }}
      >
        Select a higher dose if you're titrating up this week
      </Text>
    </View>
  );
}

export default DosageSelector;
