import React from 'react';
import { View } from 'react-native';

export interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressDots({ totalSteps, currentStep }: ProgressDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <View
            key={index}
            className={`rounded-full ${
              isActive
                ? 'w-8 h-2 bg-white'
                : isCompleted
                  ? 'w-2 h-2 bg-white/70'
                  : 'w-2 h-2 bg-white/30'
            }`}
          />
        );
      })}
    </View>
  );
}

export default ProgressDots;
