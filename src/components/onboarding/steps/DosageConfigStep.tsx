import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { WizardStep } from '../WizardStep';
import { ChipSelector } from '../../ui/ChipSelector';
import { Medication, DosingMode } from '../../../types/api';
import {
  useDosageOptions,
  useHasDosageTracking,
  usePenStrengthOptions,
  useSuggestedMicrodoseAmounts,
} from '../../../hooks/useMedicationConfig';
import { calculateDosesPerPen, getDoseRemainder } from '../../../constants/dosages';

export interface DosageConfigStepProps {
  dosingMode: DosingMode;
  medication: Medication;
  // Standard mode fields
  dosage: number | null;
  onDosageChange: (dosage: number) => void;
  // Microdose mode fields
  penStrengthMg: number | null;
  doseAmountMg: number | null;
  onPenStrengthChange: (value: number) => void;
  onDoseAmountChange: (value: number) => void;
  // Navigation
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function DosageConfigStep({
  dosingMode,
  medication,
  dosage,
  onDosageChange,
  penStrengthMg,
  doseAmountMg,
  onPenStrengthChange,
  onDoseAmountChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: DosageConfigStepProps) {
  const isStandardMode = dosingMode === 'STANDARD';
  const isMicrodoseMode = dosingMode === 'MICRODOSE';

  // Track scroll position for fade indicators
  const [scrollInfo, setScrollInfo] = useState({ atStart: true, atEnd: false });
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const atStart = contentOffset.x <= 5;
    const atEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 5;
    setScrollInfo({ atStart, atEnd });
    setContentWidth(contentSize.width);
    setContainerWidth(layoutMeasurement.width);
  }, []);

  const showFadeIndicators = contentWidth > containerWidth;

  // Use hooks for dynamic medication config
  const hasDosageTrackingForMed = useHasDosageTracking(medication);
  const dosageOptions = useDosageOptions(medication);
  const penStrengthOptions = usePenStrengthOptions(medication);
  const microdoseOptions = useSuggestedMicrodoseAmounts(penStrengthMg);

  // Standard mode: dosage options
  const showDosageForStandard = isStandardMode && hasDosageTrackingForMed;

  const dosesPerPen = useMemo(() => {
    if (!penStrengthMg || !doseAmountMg) return null;
    return calculateDosesPerPen(penStrengthMg, doseAmountMg);
  }, [penStrengthMg, doseAmountMg]);

  const remainder = useMemo(() => {
    if (!penStrengthMg || !doseAmountMg) return 0;
    return getDoseRemainder(penStrengthMg, doseAmountMg);
  }, [penStrengthMg, doseAmountMg]);

  const hasRemainder = remainder > 0;

  // Check if any of the visible options have a remainder (for showing the asterisk legend)
  const hasAnyRemainder = useMemo(() => {
    return microdoseOptions.some((option) => option.hasRemainder);
  }, [microdoseOptions]);

  // Validation based on mode
  const isValid = useMemo(() => {
    if (isStandardMode) {
      // Standard mode: dosage required if medication supports it
      if (showDosageForStandard && dosage === null) {
        return false;
      }
      return true;
    }

    if (isMicrodoseMode) {
      // Microdose mode: pen strength and dose amount required, and must result in at least 1 dose
      if (penStrengthMg === null || doseAmountMg === null) {
        return false;
      }
      if (dosesPerPen === null || dosesPerPen < 1) {
        return false;
      }
      return true;
    }

    return false;
  }, [isStandardMode, isMicrodoseMode, showDosageForStandard, dosage, penStrengthMg, doseAmountMg, dosesPerPen]);

  // Dynamic heading based on mode
  const heading = isStandardMode
    ? "What's your current dosage?"
    : 'Configure your microdosing';

  const subheading = isStandardMode
    ? 'This helps us track your progress'
    : 'Set up your pen and dose amounts';

  // For standard mode with OTHER medication, auto-advance
  const shouldSkip = isStandardMode && !showDosageForStandard;

  // If we should skip, call onNext immediately after first render
  React.useEffect(() => {
    if (shouldSkip) {
      onNext();
    }
  }, [shouldSkip, onNext]);

  // Don't render if skipping
  if (shouldSkip) {
    return null;
  }

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading={heading}
      subheading={subheading}
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STANDARD MODE: Dosage Selection */}
        {isStandardMode && showDosageForStandard && (
          <View className="mb-6">
            <Text className="text-white/80 text-base mb-4 font-medium">
              Select your dose
            </Text>
            <ChipSelector
              options={dosageOptions}
              value={dosage}
              onChange={onDosageChange}
              variant="light"
            />
          </View>
        )}

        {/* MICRODOSE MODE: Pen Strength Selection */}
        {isMicrodoseMode && (
          <View className="mb-6">
            <Text className="text-white/80 text-base mb-4 font-medium">
              What pen strength do you use?
            </Text>
            {penStrengthOptions.length > 0 ? (
              <ChipSelector
                options={penStrengthOptions}
                value={penStrengthMg}
                onChange={onPenStrengthChange}
                variant="light"
                scrollable
              />
            ) : (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Pen strength options not available for this medication.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* MICRODOSE MODE: Dose Amount Selection - shows after pen strength */}
        {isMicrodoseMode && penStrengthMg !== null && (
          <View className="mb-6">
            <Text className="text-white/80 text-base mb-4 font-medium">
              What dose do you take per injection?
            </Text>
            {microdoseOptions.length > 0 ? (
              <View className="relative">
                {/* Left fade gradient indicator */}
                {showFadeIndicators && !scrollInfo.atStart && (
                  <View
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 24,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                      }}
                    >
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0.9)' }} />
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0.6)' }} />
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0.3)' }} />
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0)' }} />
                    </View>
                  </View>
                )}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {microdoseOptions.map((option) => {
                      const isSelected = doseAmountMg === option.value;
                      return (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => onDoseAmountChange(option.value)}
                          activeOpacity={0.7}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            borderWidth: 2,
                            backgroundColor: isSelected ? 'white' : 'transparent',
                            borderColor: isSelected ? 'white' : 'rgba(255, 255, 255, 0.4)',
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: '600',
                              fontSize: 14,
                              color: isSelected ? '#0D9488' : 'white',
                            }}
                          >
                            {option.label}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              color: isSelected ? '#6B7280' : 'rgba(255, 255, 255, 0.6)',
                              marginTop: 2,
                            }}
                          >
                            {option.doses} dose{option.doses !== 1 ? 's' : ''}/pen
                            {option.hasRemainder ? ' *' : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Right fade gradient indicator */}
                {showFadeIndicators && !scrollInfo.atEnd && (
                  <View
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 24,
                      zIndex: 10,
                      pointerEvents: 'none',
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                      }}
                    >
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0)' }} />
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0.3)' }} />
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0.6)' }} />
                      <View style={{ flex: 1, backgroundColor: 'rgba(20,184,166,0.9)' }} />
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                  Select a pen strength first
                </Text>
              </View>
            )}

            {/* Asterisk legend */}
            {hasAnyRemainder && microdoseOptions.length > 0 && (
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: 12,
                  marginTop: 8,
                }}
              >
                * Partial dose remaining in pen
              </Text>
            )}
          </View>
        )}

        {/* MICRODOSE MODE: Calculated Result */}
        {isMicrodoseMode && dosesPerPen !== null && dosesPerPen >= 1 && (
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 16,
              padding: 16,
              marginTop: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>✨</Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                That's {dosesPerPen} dose{dosesPerPen !== 1 ? 's' : ''} per pen!
              </Text>
            </View>

            {hasRemainder && (
              <View
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#FCD34D',
                    textAlign: 'center',
                  }}
                >
                  ⚠️ {penStrengthMg}mg ÷ {doseAmountMg}mg leaves {remainder.toFixed(2)}mg remaining.
                  {'\n'}You may have some leftover medication.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </WizardStep>
  );
}

export default DosageConfigStep;
