import React from 'react';
import { View, Text } from 'react-native';
import { WizardStep } from '../WizardStep';
import { ChipSelector, ChipOption } from '../../ui/ChipSelector';
import { Medication, InjectionDay } from '../../../types/api';
import { getDosageOptions, hasDosageTracking } from '../../../constants/dosages';

const MEDICATIONS: ChipOption<Medication>[] = [
  { value: 'OZEMPIC', label: 'Ozempic' },
  { value: 'WEGOVY', label: 'Wegovy' },
  { value: 'MOUNJARO', label: 'Mounjaro' },
  { value: 'ZEPBOUND', label: 'Zepbound' },
  { value: 'OTHER', label: 'Other' },
];

const DAYS: ChipOption<InjectionDay>[] = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
];

export interface MedicationStepProps {
  medication: Medication | null;
  injectionDay: InjectionDay | null;
  dosage: number | null;
  onMedicationChange: (medication: Medication) => void;
  onInjectionDayChange: (day: InjectionDay) => void;
  onDosageChange: (dosage: number) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function MedicationStep({
  medication,
  injectionDay,
  dosage,
  onMedicationChange,
  onInjectionDayChange,
  onDosageChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: MedicationStepProps) {
  const showDosage = medication !== null && hasDosageTracking(medication);
  const dosageOptions = medication ? getDosageOptions(medication) : [];

  // Validation: medication and injection day required, dosage required only if applicable
  const isValid = medication !== null &&
    injectionDay !== null &&
    (!showDosage || dosage !== null);

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading="Which medication are you taking?"
      subheading="This helps us personalize your experience"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
    >
      <View>
        {/* Medication Selection */}
        <View className="mb-6">
          <ChipSelector
            options={MEDICATIONS}
            value={medication}
            onChange={onMedicationChange}
            variant="light"
          />
        </View>

        {/* Injection Day Selection - shows after medication is selected */}
        {medication && (
          <View className="mb-6">
            <Text className="text-white/80 text-base mb-4 font-medium">
              Which day do you usually inject?
            </Text>
            <ChipSelector
              options={DAYS}
              value={injectionDay}
              onChange={onInjectionDayChange}
              variant="light"
              scrollable
            />
          </View>
        )}

        {/* Dosage Selection - shows after injection day is selected (only for medications with dosage tracking) */}
        {medication && injectionDay !== null && showDosage && (
          <View>
            <Text className="text-white/80 text-base mb-4 font-medium">
              What's your current dosage?
            </Text>
            <ChipSelector
              options={dosageOptions}
              value={dosage}
              onChange={onDosageChange}
              variant="light"
            />
          </View>
        )}
      </View>
    </WizardStep>
  );
}

export default MedicationStep;
