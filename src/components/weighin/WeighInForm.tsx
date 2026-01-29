/**
 * WeighInForm Component
 * Weight input form with validation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { WeightUnit } from '@/types/api';

interface WeighInFormProps {
  weightUnit: WeightUnit;
  lastWeight: number | null;
  onSubmit: (weight: number) => void;
  isSubmitting: boolean;
}

export function WeighInForm({
  weightUnit,
  lastWeight,
  onSubmit,
  isSubmitting,
}: WeighInFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [weightInput, setWeightInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Get min/max based on unit
  const getRange = () => {
    if (weightUnit === 'kg') {
      return { min: 30, max: 300, step: 0.1 };
    }
    return { min: 66, max: 660, step: 0.1 };
  };

  const { min, max } = getRange();

  // Validate and submit
  const handleSubmit = useCallback(() => {
    setError(null);

    const weight = parseFloat(weightInput);

    if (!weightInput.trim()) {
      setError('Please enter your weight');
      return;
    }

    if (isNaN(weight)) {
      setError('Please enter a valid number');
      return;
    }

    if (weight < min || weight > max) {
      setError(`Weight must be between ${min} and ${max} ${weightUnit}`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSubmit(weight);
  }, [weightInput, min, max, weightUnit, onSubmit]);

  // Format placeholder with last weight
  const getPlaceholder = () => {
    if (lastWeight) {
      return `Last: ${lastWeight} ${weightUnit}`;
    }
    return `Enter weight in ${weightUnit}`;
  };

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: isDark ? '#F9FAFB' : '#111827',
          marginBottom: 4,
        }}
      >
        Log Your Weight
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 20,
        }}
      >
        Track your progress with a weekly weigh-in
      </Text>

      {/* Weight Input */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? '#374151' : '#F3F4F6',
          borderRadius: 16,
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <TextInput
          value={weightInput}
          onChangeText={(text) => {
            // Allow only numbers and decimal point
            const filtered = text.replace(/[^0-9.]/g, '');
            // Prevent multiple decimal points
            const parts = filtered.split('.');
            if (parts.length > 2) return;
            // Limit decimal places to 1
            if (parts[1] && parts[1].length > 1) return;
            setWeightInput(filtered);
            setError(null);
          }}
          placeholder={getPlaceholder()}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          keyboardType="decimal-pad"
          style={{
            flex: 1,
            fontSize: 24,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
            paddingVertical: 20,
          }}
        />
        <View
          style={{
            backgroundColor: isDark ? '#4B5563' : '#E5E7EB',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: isDark ? '#D1D5DB' : '#4B5563',
            }}
          >
            {weightUnit}
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <Text
          style={{
            fontSize: 14,
            color: '#EF4444',
            marginBottom: 12,
          }}
        >
          {error}
        </Text>
      )}

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting || !weightInput.trim()}
        style={{
          backgroundColor:
            isSubmitting || !weightInput.trim()
              ? isDark
                ? '#374151'
                : '#D1D5DB'
              : '#14B8A6',
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          opacity: isSubmitting || !weightInput.trim() ? 0.7 : 1,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text
            style={{
              fontSize: 17,
              fontWeight: '700',
              color:
                !weightInput.trim()
                  ? isDark
                    ? '#6B7280'
                    : '#9CA3AF'
                  : '#FFFFFF',
            }}
          >
            Log Weight
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default WeighInForm;
