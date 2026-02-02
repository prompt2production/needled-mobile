import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';
import { WizardStep } from '../WizardStep';
import { InputLight } from '../../ui/InputLight';
import { isValidEmail } from '../../../lib/validation';

export interface EmailStepProps {
  name: string;
  email: string;
  onEmailChange: (email: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function EmailStep({
  name,
  email,
  onEmailChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: EmailStepProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  const firstName = name.split(' ')[0] || 'there';
  const isValid = isValidEmail(email);

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading={`Nice to meet you, ${firstName}!`}
      subheading="What's your email address?"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
    >
      <InputLight
        ref={inputRef}
        placeholder="you@example.com"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={isValid ? onNext : undefined}
      />
    </WizardStep>
  );
}

export default EmailStep;
