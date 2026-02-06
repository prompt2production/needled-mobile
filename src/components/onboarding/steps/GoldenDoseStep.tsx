import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WizardStep } from '../WizardStep';

export interface GoldenDoseStepProps {
  tracksGoldenDose: boolean | null;
  onTracksGoldenDoseChange: (value: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

interface GoldenDoseOption {
  value: boolean;
  icon: string;
  title: string;
  description: string;
}

const GOLDEN_DOSE_OPTIONS: GoldenDoseOption[] = [
  {
    value: true,
    icon: '✨',
    title: 'Yes, I track my golden doses',
    description: 'I extract the leftover medication for an extra shot',
  },
  {
    value: false,
    icon: '❌',
    title: "No, I don't do this",
    description: "I use only the standard doses from my pen",
  },
];

export function GoldenDoseStep({
  tracksGoldenDose,
  onTracksGoldenDoseChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: GoldenDoseStepProps) {
  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading="Do you extract the golden dose?"
      subheading="Many pens have a little extra medication left after the standard doses"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={tracksGoldenDose === null}
    >
      <View>
        {/* Explainer */}
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: 20,
            }}
          >
            The "golden dose" is the leftover medication that remains in the pen after taking all
            the standard doses. Some users extract this for an additional injection using a separate syringe.
          </Text>
        </View>

        {/* Options */}
        <View className="gap-4">
          {GOLDEN_DOSE_OPTIONS.map((option) => {
            const isSelected = tracksGoldenDose === option.value;

            return (
              <TouchableOpacity
                key={String(option.value)}
                onPress={() => onTracksGoldenDoseChange(option.value)}
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
                        fontSize: 16,
                        fontWeight: '700',
                        color: isSelected ? '#0D9488' : 'white',
                        marginBottom: 4,
                      }}
                    >
                      {option.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
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
      </View>
    </WizardStep>
  );
}

export default GoldenDoseStep;
