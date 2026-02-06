import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { WizardStep } from '../WizardStep';

export interface PenPositionStepProps {
  currentDoseInPen: number | null;
  dosesPerPen: number;
  tracksGoldenDose: boolean;
  onCurrentDoseChange: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

// Special value for "starting new pen" which means dose 1
const GOLDEN_DOSE_VALUE = -1; // We'll use this to indicate golden dose selection

export function PenPositionStep({
  currentDoseInPen,
  dosesPerPen,
  tracksGoldenDose,
  onCurrentDoseChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: PenPositionStepProps) {
  // Generate dose options based on dosesPerPen
  const doseOptions = useMemo(() => {
    const options: { value: number; label: string; sublabel?: string }[] = [];

    // Starting new pen option
    options.push({
      value: 1,
      label: 'Starting a new pen',
      sublabel: 'Dose 1',
    });

    // Standard doses (2 through dosesPerPen)
    for (let i = 2; i <= dosesPerPen; i++) {
      options.push({
        value: i,
        label: `Dose ${i}`,
        sublabel: `${dosesPerPen - i + 1} more in this pen`,
      });
    }

    // Golden dose option (if enabled)
    if (tracksGoldenDose) {
      options.push({
        value: dosesPerPen + 1, // Golden dose is one past the last standard dose
        label: 'Golden dose',
        sublabel: 'Last bit of medication',
      });
    }

    return options;
  }, [dosesPerPen, tracksGoldenDose]);

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="cheerful"
      heading="Which dose are you on?"
      subheading="This helps us track your pen progress accurately"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={currentDoseInPen === null}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="gap-3">
          {doseOptions.map((option) => {
            const isSelected = currentDoseInPen === option.value;
            const isGolden = option.value > dosesPerPen;

            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onCurrentDoseChange(option.value)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: isSelected
                    ? 'rgba(255, 255, 255, 1)'
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: isSelected
                    ? 'white'
                    : isGolden
                    ? 'rgba(252, 211, 77, 0.4)'
                    : 'rgba(255, 255, 255, 0.3)',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {/* Dose indicator */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isSelected
                      ? '#0D9488'
                      : isGolden
                      ? 'rgba(252, 211, 77, 0.2)'
                      : 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  {isGolden ? (
                    <Text style={{ fontSize: 18 }}>✨</Text>
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)',
                      }}
                    >
                      {option.value}
                    </Text>
                  )}
                </View>

                {/* Label */}
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: isSelected ? '#0D9488' : isGolden ? '#FCD34D' : 'white',
                    }}
                  >
                    {option.label}
                  </Text>
                  {option.sublabel && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: isSelected ? '#6B7280' : 'rgba(255, 255, 255, 0.6)',
                        marginTop: 2,
                      }}
                    >
                      {option.sublabel}
                    </Text>
                  )}
                </View>

                {/* Selected indicator */}
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
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Visual pen progress preview */}
        {currentDoseInPen !== null && (
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 14,
              padding: 16,
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              Your pen progress will look like this:
            </Text>
            <View className="flex-row justify-center items-center gap-2">
              {Array.from({ length: dosesPerPen }).map((_, index) => {
                const doseNum = index + 1;
                const isFilled = doseNum < currentDoseInPen;
                const isCurrent = doseNum === currentDoseInPen;

                return (
                  <View
                    key={doseNum}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isFilled || isCurrent
                        ? '#14B8A6'
                        : 'rgba(255, 255, 255, 0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: isCurrent ? 2 : 0,
                      borderColor: 'white',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: isFilled || isCurrent ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {doseNum}
                    </Text>
                  </View>
                );
              })}
              {tracksGoldenDose && (
                <>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.4)' }}>—</Text>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor:
                        currentDoseInPen > dosesPerPen
                          ? '#FCD34D'
                          : 'rgba(252, 211, 77, 0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: currentDoseInPen > dosesPerPen ? 2 : 0,
                      borderColor: 'white',
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>✨</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </WizardStep>
  );
}

export default PenPositionStep;
