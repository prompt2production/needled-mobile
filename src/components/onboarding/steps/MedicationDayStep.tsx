import React from 'react';
import { View, Text } from 'react-native';
import { WizardStep } from '../WizardStep';
import { ChipSelector, ChipOption } from '../../ui/ChipSelector';
import { Medication, InjectionDay } from '../../../types/api';
import { useMedicationOptions } from '../../../hooks/useMedicationConfig';

const DAYS: ChipOption<InjectionDay>[] = [
  { value: 0, label: 'Mon' },
  { value: 1, label: 'Tue' },
  { value: 2, label: 'Wed' },
  { value: 3, label: 'Thu' },
  { value: 4, label: 'Fri' },
  { value: 5, label: 'Sat' },
  { value: 6, label: 'Sun' },
];

export interface MedicationDayStepProps {
  medication: Medication | null;
  injectionDay: InjectionDay | null;
  onMedicationChange: (medication: Medication) => void;
  onInjectionDayChange: (day: InjectionDay) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function MedicationDayStep({
  medication,
  injectionDay,
  onMedicationChange,
  onInjectionDayChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: MedicationDayStepProps) {
  const medicationOptions = useMedicationOptions();
  const isValid = medication !== null && injectionDay !== null;

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
          <Text className="text-white/80 text-base mb-4 font-medium">
            Your medication
          </Text>
          <ChipSelector
            options={medicationOptions}
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
      </View>
    </WizardStep>
  );
}

export default MedicationDayStep;
