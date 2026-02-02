import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput } from 'react-native';
import { WizardStep } from '../WizardStep';
import { InputLight } from '../../ui/InputLight';
import { getPasswordStrength } from '../../../lib/validation';

export interface PasswordStepProps {
  password: string;
  onPasswordChange: (password: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function PasswordStep({
  password,
  onPasswordChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: PasswordStepProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const isValid = password.length >= 8;

  // Map strength color to teal-friendly colors for visibility
  const getStrengthColor = () => {
    if (passwordStrength.label === 'weak') return '#FCA5A5'; // red-300
    if (passwordStrength.label === 'medium') return '#FCD34D'; // yellow-300
    return '#86EFAC'; // green-300
  };

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="encouraging"
      heading="Let's secure your account"
      subheading="Create a password"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
    >
      <View>
        <InputLight
          ref={inputRef}
          placeholder="Min. 8 characters"
          value={password}
          onChangeText={onPasswordChange}
          secureTextEntry
          autoComplete="new-password"
          returnKeyType="next"
          onSubmitEditing={isValid ? onNext : undefined}
        />

        {/* Password Strength Indicator */}
        {password.length > 0 && (
          <View className="mt-4">
            <View className="flex-row gap-1">
              {[0, 1, 2, 3, 4].map((index) => (
                <View
                  key={index}
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      index < passwordStrength.score
                        ? getStrengthColor()
                        : 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              ))}
            </View>
            <Text
              className="text-sm mt-2 capitalize font-medium"
              style={{ color: getStrengthColor() }}
            >
              {passwordStrength.label}
            </Text>
          </View>
        )}
      </View>
    </WizardStep>
  );
}

export default PasswordStep;
