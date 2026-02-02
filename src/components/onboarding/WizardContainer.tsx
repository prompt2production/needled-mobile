import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { ApiErrorResponse } from '../../services/api';
import { Medication, InjectionDay, WeightUnit, RegisterRequest } from '../../types/api';
import { NameStep } from './steps/NameStep';
import { EmailStep } from './steps/EmailStep';
import { PasswordStep } from './steps/PasswordStep';
import { MedicationStep } from './steps/MedicationStep';
import { WeightStep } from './steps/WeightStep';
import { HeightStep } from './steps/HeightStep';

// Steps: Name → Email → Password → Medication (with dosage) → Weight → Height = 6 total
const TOTAL_STEPS = 6;

export interface WizardData {
  name: string;
  email: string;
  password: string;
  medication: Medication | null;
  injectionDay: InjectionDay | null;
  startingDosage: number | null;
  weightUnit: WeightUnit;
  startWeight: string;
  goalWeight: string;
  height: string; // Stored in cm
}

const initialData: WizardData = {
  name: '',
  email: '',
  password: '',
  medication: null,
  injectionDay: null,
  startingDosage: null,
  weightUnit: 'lbs',
  startWeight: '',
  goalWeight: '',
  height: '',
};

export function WizardContainer() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(initialData);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = TOTAL_STEPS;

  const updateData = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    setError(null);

    // Final validation
    const startWeightNum = parseFloat(data.startWeight);
    if (isNaN(startWeightNum) || startWeightNum < 40 || startWeightNum > 300) {
      setError('Please enter a valid weight (40-300)');
      return;
    }

    let goalWeightNum: number | undefined;
    if (data.goalWeight) {
      goalWeightNum = parseFloat(data.goalWeight);
      if (isNaN(goalWeightNum) || goalWeightNum < 40 || goalWeightNum > 300) {
        setError('Please enter a valid goal weight (40-300)');
        return;
      }
      if (goalWeightNum >= startWeightNum) {
        setError('Goal weight should be less than current weight');
        return;
      }
    }

    if (!data.medication || data.injectionDay === null) {
      setError('Please complete all required fields');
      return;
    }

    // Parse height (optional)
    let heightNum: number | undefined;
    if (data.height) {
      heightNum = parseFloat(data.height);
      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        heightNum = undefined; // Invalid height, skip it
      }
    }

    try {
      const registerData: RegisterRequest = {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        startWeight: startWeightNum,
        goalWeight: goalWeightNum,
        weightUnit: data.weightUnit,
        medication: data.medication,
        injectionDay: data.injectionDay,
        startingDosage: data.startingDosage ?? undefined,
        height: heightNum,
      };

      await register(registerData);
      // Navigation is handled by AuthGate in _layout.tsx
      // New users will be redirected to onboarding screen
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message || 'Registration failed. Please try again.');
    }
  };

  // Step order: Name → Email → Password → Medication (with dosage) → Weight → Height
  const STEP_NAMES = ['name', 'email', 'password', 'medication', 'weight', 'height'];
  const currentStepName = STEP_NAMES[currentStep] || 'unknown';

  // Render current step based on step name
  switch (currentStepName) {
    case 'name':
      return (
        <NameStep
          name={data.name}
          onNameChange={(value) => updateData('name', value)}
          onNext={goNext}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'email':
      return (
        <EmailStep
          name={data.name}
          email={data.email}
          onEmailChange={(value) => updateData('email', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'password':
      return (
        <PasswordStep
          password={data.password}
          onPasswordChange={(value) => updateData('password', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'medication':
      return (
        <MedicationStep
          medication={data.medication}
          injectionDay={data.injectionDay}
          dosage={data.startingDosage}
          onMedicationChange={(value) => updateData('medication', value)}
          onInjectionDayChange={(value) => updateData('injectionDay', value)}
          onDosageChange={(value) => updateData('startingDosage', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'weight':
      return (
        <WeightStep
          weightUnit={data.weightUnit}
          startWeight={data.startWeight}
          goalWeight={data.goalWeight}
          onWeightUnitChange={(value) => updateData('weightUnit', value)}
          onStartWeightChange={(value) => updateData('startWeight', value)}
          onGoalWeightChange={(value) => updateData('goalWeight', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'height':
      return (
        <HeightStep
          height={data.height}
          onHeightChange={(value) => updateData('height', value)}
          onNext={handleRegister}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
          isLoading={isLoading}
          error={error}
        />
      );

    default:
      return null;
  }
}

export default WizardContainer;
