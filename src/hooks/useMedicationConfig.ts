/**
 * Medication Configuration Hook
 * TanStack Query hook for fetching and caching medication configuration
 */

import { useQuery } from '@tanstack/react-query';
import { getMedicationConfig } from '../services/medications';
import { FALLBACK_MEDICATION_CONFIG } from '../constants/dosages';
import type { Medication, MedicationConfig, MedicationConfigResponse } from '../types/api';

// Query key for medication config
export const medicationConfigKeys = {
  all: ['medicationConfig'] as const,
};

/**
 * Main hook for fetching medication configuration
 * Uses fallback data as placeholder while loading or on error
 */
export function useMedicationConfig() {
  return useQuery({
    queryKey: medicationConfigKeys.all,
    queryFn: getMedicationConfig,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - data rarely changes
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep in cache for 7 days
    placeholderData: FALLBACK_MEDICATION_CONFIG, // Use hardcoded as placeholder
    retry: 2,
  });
}

/**
 * Get medication options formatted for ChipSelector
 * Returns array of { value, label } objects
 */
export function useMedicationOptions() {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  return config.medications.map((med) => ({
    value: med.code,
    label: med.name,
  }));
}

/**
 * Get pen strength options for a specific medication
 * Returns array of { value, label } objects
 */
export function usePenStrengthOptions(medication: Medication | null) {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!medication) return [];

  const medConfig = config.medications.find((m) => m.code === medication);
  if (!medConfig) return [];

  return medConfig.penStrengths.map((strength) => ({
    value: strength,
    label: `${strength} mg`,
  }));
}

/**
 * Get dosage options for a specific medication
 * Returns array of { value, label } objects
 */
export function useDosageOptions(medication: Medication | null) {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!medication) return [];

  const medConfig = config.medications.find((m) => m.code === medication);
  if (!medConfig) return [];

  return medConfig.dosages.map((dose) => ({
    value: dose,
    label: `${dose} mg`,
  }));
}

/**
 * Get raw dosage values for a specific medication
 * Returns array of numbers
 */
export function useDosageValues(medication: Medication | null) {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!medication) return [];

  const medConfig = config.medications.find((m) => m.code === medication);
  return medConfig?.dosages ?? [];
}

/**
 * Get microdose amount options
 * Returns array of { value, label } objects
 */
export function useMicrodoseAmounts() {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  return config.microdoseAmounts.map((amount) => ({
    value: amount,
    label: `${amount} mg`,
  }));
}

/**
 * Check if a medication supports dosage tracking
 */
export function useHasDosageTracking(medication: Medication | null) {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!medication) return false;

  const medConfig = config.medications.find((m) => m.code === medication);
  return (medConfig?.dosages?.length ?? 0) > 0;
}

/**
 * Check if a medication supports microdosing
 */
export function useSupportsMicrodosing(medication: Medication | null) {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!medication) return false;

  const medConfig = config.medications.find((m) => m.code === medication);
  return medConfig?.supportsMicrodosing ?? false;
}

/**
 * Get the full config for a specific medication
 */
export function useMedicationConfigByCode(medication: Medication | null): MedicationConfig | null {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!medication) return null;

  return config.medications.find((m) => m.code === medication) ?? null;
}

/**
 * Get default doses per pen value
 */
export function useDefaultDosesPerPen() {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  return config.defaultDosesPerPen;
}

/**
 * Get suggested microdose amounts for a given pen strength
 * Returns amounts that result in at least 1 dose, with dose count info
 */
export function useSuggestedMicrodoseAmounts(penStrengthMg: number | null) {
  const { data } = useMedicationConfig();
  const config = data ?? FALLBACK_MEDICATION_CONFIG;

  if (!penStrengthMg) return [];

  return config.microdoseAmounts
    .filter((amount) => amount < penStrengthMg)
    .map((amount) => {
      const doses = Math.floor(penStrengthMg / amount);
      const remainder = penStrengthMg % amount;
      return {
        value: amount,
        label: `${amount} mg`,
        doses,
        hasRemainder: remainder > 0,
      };
    })
    .filter((option) => option.doses >= 1);
}
