import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { WizardStep } from '../WizardStep';
import { InputLight } from '../../ui/InputLight';
import { WeightUnit } from '../../../types/api';

export interface WeightStepProps {
  weightUnit: WeightUnit;
  startWeight: string;
  goalWeight: string;
  onWeightUnitChange: (unit: WeightUnit) => void;
  onStartWeightChange: (weight: string) => void;
  onGoalWeightChange: (weight: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isLoading?: boolean;
  error?: string | null;
}

export function WeightStep({
  weightUnit,
  startWeight,
  goalWeight,
  onWeightUnitChange,
  onStartWeightChange,
  onGoalWeightChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  isLoading = false,
  error = null,
}: WeightStepProps) {
  const startWeightRef = useRef<TextInput>(null);
  const goalWeightRef = useRef<TextInput>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startWeightRef.current?.focus();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  // Validate weight
  const startWeightNum = parseFloat(startWeight);
  const isStartWeightValid =
    startWeight.length > 0 &&
    !isNaN(startWeightNum) &&
    startWeightNum >= 40 &&
    startWeightNum <= 300;

  // Goal weight is optional but must be valid if provided
  const goalWeightNum = parseFloat(goalWeight);
  const isGoalWeightValid =
    goalWeight.length === 0 ||
    (!isNaN(goalWeightNum) &&
      goalWeightNum >= 40 &&
      goalWeightNum <= 300 &&
      goalWeightNum < startWeightNum);

  const isValid = isStartWeightValid && isGoalWeightValid;

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="proud"
      heading="Almost there!"
      subheading="Let's set up your weight tracking"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
      isLoading={isLoading}
      nextLabel="Continue"
    >
      <View>
        {/* Error Message */}
        {error && (
          <View className="bg-red-500/20 rounded-xl p-4 mb-6">
            <Text className="text-white text-center font-medium">{error}</Text>
          </View>
        )}

        {/* Weight Unit Toggle */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-l-xl border-2 ${
              weightUnit === 'lbs'
                ? 'bg-white border-white'
                : 'bg-transparent border-white/40'
            }`}
            onPress={() => onWeightUnitChange('lbs')}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold text-base ${
                weightUnit === 'lbs' ? 'text-teal-600' : 'text-white'
              }`}
            >
              lbs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-r-xl border-2 border-l-0 ${
              weightUnit === 'kg'
                ? 'bg-white border-white'
                : 'bg-transparent border-white/40'
            }`}
            onPress={() => onWeightUnitChange('kg')}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold text-base ${
                weightUnit === 'kg' ? 'text-teal-600' : 'text-white'
              }`}
            >
              kg
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weight Inputs */}
        <View className="gap-4">
          <InputLight
            ref={startWeightRef}
            label="Current Weight"
            placeholder={weightUnit === 'lbs' ? '200' : '90'}
            value={startWeight}
            onChangeText={onStartWeightChange}
            keyboardType="decimal-pad"
            returnKeyType="next"
            onSubmitEditing={() => goalWeightRef.current?.focus()}
          />

          <InputLight
            ref={goalWeightRef}
            label="Goal Weight (optional)"
            placeholder={weightUnit === 'lbs' ? '160' : '72'}
            value={goalWeight}
            onChangeText={onGoalWeightChange}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={isValid ? onNext : undefined}
          />
        </View>

        {/* Hint for goal weight validation */}
        {goalWeight.length > 0 && !isGoalWeightValid && (
          <Text className="text-red-200 text-sm mt-2">
            Goal weight should be less than current weight
          </Text>
        )}
      </View>
    </WizardStep>
  );
}

export default WeightStep;
