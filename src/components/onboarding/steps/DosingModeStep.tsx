import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { WizardStep } from '../WizardStep';
import { DosingMode } from '../../../types/api';

export interface DosingModeStepProps {
  dosingMode: DosingMode | null;
  onDosingModeChange: (mode: DosingMode) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

interface ModeOption {
  value: DosingMode;
  icon: string;
  title: string;
  description: string;
}

const DOSING_MODES: ModeOption[] = [
  {
    value: 'STANDARD',
    icon: '💉',
    title: 'Standard Dosing',
    description: 'I use the pre-set doses my pen provides',
  },
  {
    value: 'MICRODOSE',
    icon: '🔬',
    title: 'Microdosing',
    description: 'I take smaller amounts to stretch my pen',
  },
];

export function DosingModeStep({
  dosingMode,
  onDosingModeChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: DosingModeStepProps) {
  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading="How do you dose your GLP-1?"
      subheading="This helps us track your pen usage accurately"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={dosingMode === null}
    >
      <View className="gap-4">
        {DOSING_MODES.map((option) => {
          const isSelected = dosingMode === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onDosingModeChange(option.value)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                padding: 20,
                borderWidth: 2,
                borderColor: isSelected ? 'white' : 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <View className="flex-row items-center">
                <Text style={{ fontSize: 28, marginRight: 16 }}>{option.icon}</Text>
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '700',
                      color: isSelected ? '#0D9488' : 'white',
                      marginBottom: 4,
                    }}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isSelected ? '#6B7280' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {option.description}
                  </Text>
                </View>
                {isSelected && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: '#0D9488',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </WizardStep>
  );
}

export default DosingModeStep;
