import React, { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { ApiErrorResponse } from '../../services/api';
import { Medication, InjectionDay, WeightUnit, RegisterRequest, DosingMode } from '../../types/api';
import { NameStep } from './steps/NameStep';
import { EmailStep } from './steps/EmailStep';
import { PasswordStep } from './steps/PasswordStep';
import { MedicationDayStep } from './steps/MedicationDayStep';
import { DosageConfigStep } from './steps/DosageConfigStep';
import { WeightStep } from './steps/WeightStep';
import { HeightStep } from './steps/HeightStep';
import { DosingModeStep } from './steps/DosingModeStep';
import { GoldenDoseStep } from './steps/GoldenDoseStep';
import { PenPositionStep } from './steps/PenPositionStep';
import { DEFAULT_DOSES_PER_PEN, calculateDosesPerPen } from '../../constants/dosages';

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

  // Pen & Dosing Settings
  dosingMode: DosingMode | null;
  penStrengthMg: number | null;
  doseAmountMg: number | null;
  tracksGoldenDose: boolean | null;
  currentDoseInPen: number | null;
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

  // Pen & Dosing Settings
  dosingMode: null,
  penStrengthMg: null,
  doseAmountMg: null,
  tracksGoldenDose: null,
  currentDoseInPen: null,
};

export function WizardContainer() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(initialData);
  const [error, setError] = useState<string | null>(null);

  // Calculate doses per pen based on dosing mode and settings
  const dosesPerPen = useMemo(() => {
    if (data.dosingMode === 'MICRODOSE' && data.penStrengthMg && data.doseAmountMg) {
      return calculateDosesPerPen(data.penStrengthMg, data.doseAmountMg);
    }
    return DEFAULT_DOSES_PER_PEN;
  }, [data.dosingMode, data.penStrengthMg, data.doseAmountMg]);

  // Step order: Name → Email → Password → DosingMode → MedicationDay → DosageConfig → GoldenDose → PenPosition → Weight → Height
  const stepNames = [
    'name',
    'email',
    'password',
    'dosingMode',      // Choose standard vs microdosing first
    'medicationDay',   // Medication + injection day
    'dosageConfig',    // Dosage (standard) or pen config (microdose)
    'goldenDose',
    'penPosition',
    'weight',
    'height',
  ];

  const totalSteps = stepNames.length;
  const currentStepName = stepNames[currentStep] || 'unknown';

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

        // Pen & Dosing Settings
        dosingMode: data.dosingMode ?? 'STANDARD',
        penStrengthMg: data.dosingMode === 'MICRODOSE' ? data.penStrengthMg ?? undefined : undefined,
        doseAmountMg: data.dosingMode === 'MICRODOSE' ? data.doseAmountMg ?? undefined : undefined,
        dosesPerPen: dosesPerPen,
        tracksGoldenDose: data.tracksGoldenDose ?? false,
        currentDoseInPen: data.currentDoseInPen ?? 1,
      };

      await register(registerData);
      // Navigation is handled by AuthGate in _layout.tsx
      // New users will be redirected to onboarding screen
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message || 'Registration failed. Please try again.');
    }
  };

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

    case 'dosingMode':
      return (
        <DosingModeStep
          dosingMode={data.dosingMode}
          onDosingModeChange={(value) => updateData('dosingMode', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'medicationDay':
      return (
        <MedicationDayStep
          medication={data.medication}
          injectionDay={data.injectionDay}
          onMedicationChange={(value) => updateData('medication', value)}
          onInjectionDayChange={(value) => updateData('injectionDay', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'dosageConfig':
      return (
        <DosageConfigStep
          dosingMode={data.dosingMode!}
          medication={data.medication!}
          // Standard mode fields
          dosage={data.startingDosage}
          onDosageChange={(value) => updateData('startingDosage', value)}
          // Microdose mode fields
          penStrengthMg={data.penStrengthMg}
          doseAmountMg={data.doseAmountMg}
          onPenStrengthChange={(value) => updateData('penStrengthMg', value)}
          onDoseAmountChange={(value) => updateData('doseAmountMg', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'goldenDose':
      return (
        <GoldenDoseStep
          tracksGoldenDose={data.tracksGoldenDose}
          onTracksGoldenDoseChange={(value) => updateData('tracksGoldenDose', value)}
          onNext={goNext}
          onBack={goBack}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
      );

    case 'penPosition':
      return (
        <PenPositionStep
          currentDoseInPen={data.currentDoseInPen}
          dosesPerPen={dosesPerPen}
          tracksGoldenDose={data.tracksGoldenDose ?? false}
          onCurrentDoseChange={(value) => updateData('currentDoseInPen', value)}
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
