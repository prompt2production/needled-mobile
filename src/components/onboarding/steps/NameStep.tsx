import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { WizardStep } from '../WizardStep';
import { InputLight } from '../../ui/InputLight';

export interface NameStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  currentStep: number;
  totalSteps: number;
}

export function NameStep({
  name,
  onNameChange,
  onNext,
  currentStep,
  totalSteps,
}: NameStepProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  const isValid = name.trim().length > 0;

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="cheerful"
      heading="Let's get started!"
      subheading="What should I call you?"
      onNext={onNext}
      showBackButton={false}
      isNextDisabled={!isValid}
    >
      <InputLight
        ref={inputRef}
        placeholder="Your name"
        value={name}
        onChangeText={onNameChange}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={isValid ? onNext : undefined}
      />
    </WizardStep>
  );
}

export default NameStep;
