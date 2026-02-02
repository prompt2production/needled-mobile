import React from 'react';
import { View, Text } from 'react-native';
import { WizardStep } from '../WizardStep';
import { ChipSelector, ChipOption } from '../../ui/ChipSelector';
import { Medication } from '../../../types/api';
import { MEDICATION_DOSAGES, getDosageOptions } from '../../../constants/dosages';

export interface DosageStepProps {
  medication: Medication;
  dosage: number | null;
  onDosageChange: (dosage: number) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function DosageStep({
  medication,
  dosage,
  onDosageChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: DosageStepProps) {
  const dosageOptions: ChipOption<number>[] = getDosageOptions(medication);
  const isValid = dosage !== null;

  // Get medication display name
  const medicationName = medication.charAt(0) + medication.slice(1).toLowerCase();

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading="What's your starting dosage?"
      subheading={`Select your current ${medicationName} dose`}
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
    >
      <View>
        <ChipSelector
          options={dosageOptions}
          value={dosage}
          onChange={onDosageChange}
          variant="light"
        />

        <Text className="text-white/60 text-sm mt-6 text-center">
          This helps us track your titration journey
        </Text>
      </View>
    </WizardStep>
  );
}

export default DosageStep;
