import React from 'react';
import { View, Text } from 'react-native';

export interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressDots({ totalSteps, currentStep }: ProgressDotsProps) {
  return (
    <View className="flex-row items-center justify-center">
      <Text className="text-white/80 font-medium text-sm">
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
}

export default ProgressDots;
