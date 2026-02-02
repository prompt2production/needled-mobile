import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { WizardStep } from '../WizardStep';
import { InputLight } from '../../ui/InputLight';

type HeightUnit = 'ft' | 'cm';

export interface HeightStepProps {
  height: string; // Height in cm stored as string
  onHeightChange: (height: string) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  isLoading?: boolean;
  error?: string | null;
}

export function HeightStep({
  height,
  onHeightChange,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  isLoading = false,
  error = null,
}: HeightStepProps) {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('ft');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [cm, setCm] = useState('');

  const feetRef = useRef<TextInput>(null);
  const inchesRef = useRef<TextInput>(null);
  const cmRef = useRef<TextInput>(null);

  // Focus input when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (heightUnit === 'ft') {
        feetRef.current?.focus();
      } else {
        cmRef.current?.focus();
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, []);

  // Convert and update parent when local values change
  useEffect(() => {
    if (heightUnit === 'ft') {
      const feetNum = parseFloat(feet) || 0;
      const inchesNum = parseFloat(inches) || 0;
      if (feetNum > 0 || inchesNum > 0) {
        const totalInches = feetNum * 12 + inchesNum;
        const cmValue = Math.round(totalInches * 2.54);
        onHeightChange(cmValue.toString());
      } else {
        onHeightChange('');
      }
    } else {
      onHeightChange(cm);
    }
  }, [feet, inches, cm, heightUnit]);

  // Convert between units when switching
  const handleUnitChange = (newUnit: HeightUnit) => {
    if (newUnit === heightUnit) return;

    if (newUnit === 'cm' && heightUnit === 'ft') {
      // Convert ft/in to cm
      const feetNum = parseFloat(feet) || 0;
      const inchesNum = parseFloat(inches) || 0;
      if (feetNum > 0 || inchesNum > 0) {
        const totalInches = feetNum * 12 + inchesNum;
        const cmValue = Math.round(totalInches * 2.54);
        setCm(cmValue.toString());
      }
    } else if (newUnit === 'ft' && heightUnit === 'cm') {
      // Convert cm to ft/in
      const cmNum = parseFloat(cm) || 0;
      if (cmNum > 0) {
        const totalInches = cmNum / 2.54;
        const feetVal = Math.floor(totalInches / 12);
        const inchesVal = Math.round(totalInches % 12);
        setFeet(feetVal.toString());
        setInches(inchesVal.toString());
      }
    }

    setHeightUnit(newUnit);

    // Focus appropriate input after switch
    setTimeout(() => {
      if (newUnit === 'ft') {
        feetRef.current?.focus();
      } else {
        cmRef.current?.focus();
      }
    }, 100);
  };

  // Validation
  const heightNum = parseFloat(height);
  const isHeightValid =
    height.length === 0 || // Empty is valid (optional field)
    (!isNaN(heightNum) && heightNum >= 100 && heightNum <= 250); // 100-250cm (about 3'3" to 8'2")

  // Always valid since height is optional
  const isValid = isHeightValid;

  const handleSkip = () => {
    onHeightChange('');
    onNext();
  };

  return (
    <WizardStep
      currentStep={currentStep}
      totalSteps={totalSteps}
      pipState="curious"
      heading="One last thing - your height?"
      subheading="This helps us calculate your BMI"
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!isValid}
      isLoading={isLoading}
      nextLabel="Create Account"
    >
      <View>
        {/* Error Message */}
        {error && (
          <View className="bg-red-500/20 rounded-xl p-4 mb-6">
            <Text className="text-white text-center font-medium">{error}</Text>
          </View>
        )}

        {/* Height Unit Toggle */}
        <View className="flex-row mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-l-xl border-2 ${
              heightUnit === 'ft'
                ? 'bg-white border-white'
                : 'bg-transparent border-white/40'
            }`}
            onPress={() => handleUnitChange('ft')}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold text-base ${
                heightUnit === 'ft' ? 'text-teal-600' : 'text-white'
              }`}
            >
              ft / in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-r-xl border-2 border-l-0 ${
              heightUnit === 'cm'
                ? 'bg-white border-white'
                : 'bg-transparent border-white/40'
            }`}
            onPress={() => handleUnitChange('cm')}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold text-base ${
                heightUnit === 'cm' ? 'text-teal-600' : 'text-white'
              }`}
            >
              cm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Height Input */}
        {heightUnit === 'ft' ? (
          <View className="flex-row gap-4">
            <View className="flex-1">
              <InputLight
                ref={feetRef}
                label="Feet"
                placeholder="5"
                value={feet}
                onChangeText={setFeet}
                keyboardType="number-pad"
                returnKeyType="next"
                onSubmitEditing={() => inchesRef.current?.focus()}
              />
            </View>
            <View className="flex-1">
              <InputLight
                ref={inchesRef}
                label="Inches"
                placeholder="6"
                value={inches}
                onChangeText={setInches}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={isValid ? onNext : undefined}
              />
            </View>
          </View>
        ) : (
          <InputLight
            ref={cmRef}
            label="Height (cm)"
            placeholder="168"
            value={cm}
            onChangeText={setCm}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={isValid ? onNext : undefined}
          />
        )}

        {/* Height validation hint */}
        {height.length > 0 && !isHeightValid && (
          <Text className="text-red-200 text-sm mt-2">
            Please enter a valid height
          </Text>
        )}

        {/* Skip option */}
        <TouchableOpacity
          onPress={handleSkip}
          className="mt-6"
          activeOpacity={0.7}
        >
          <Text className="text-white/70 text-center text-base underline">
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </WizardStep>
  );
}

export default HeightStep;
