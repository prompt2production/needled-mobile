import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pip, PipState } from '../pip/Pip';
import { ProgressDots } from './ProgressDots';
import { Button } from '../ui/Button';

export interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  pipState: PipState;
  heading: string;
  subheading: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  showBackButton?: boolean;
}

export function WizardStep({
  currentStep,
  totalSteps,
  pipState,
  heading,
  subheading,
  children,
  onNext,
  onBack,
  nextLabel = 'Continue',
  isNextDisabled = false,
  isLoading = false,
  showBackButton = true,
}: WizardStepProps) {
  const handleNext = () => {
    Keyboard.dismiss();
    onNext();
  };

  return (
    <SafeAreaView className="flex-1 bg-teal-500">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1">
          {/* Header with back button and progress dots */}
          <View className="flex-row items-center justify-between px-4 pt-2 pb-4">
            {showBackButton && onBack ? (
              <TouchableOpacity
                onPress={onBack}
                className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <View className="w-10" />
            )}

            <ProgressDots totalSteps={totalSteps} currentStep={currentStep} />

            <View className="w-10" />
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Pip Mascot */}
            <View className="items-center mt-4 mb-6">
              <Pip state={pipState} size="lg" />
            </View>

            {/* Heading & Subheading */}
            <View className="px-6 mb-8">
              <Text className="text-2xl font-bold text-white text-center mb-2">
                {heading}
              </Text>
              <Text className="text-lg text-white/80 text-center">
                {subheading}
              </Text>
            </View>

            {/* Content */}
            <View className="px-6">
              {children}
            </View>

            {/* Next Button - inside ScrollView, below content */}
            <View className="px-6 pt-8 pb-6">
              <Button
                onPress={handleNext}
                variant="secondary"
                size="lg"
                fullWidth
                disabled={isNextDisabled}
                loading={isLoading}
              >
                {nextLabel}
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default WizardStep;
