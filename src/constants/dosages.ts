/**
 * Medication Dosage Constants
 * Dosages in mg for each GLP-1 medication
 */

import type { Medication } from '@/types/api';

export const MEDICATION_DOSAGES: Record<Medication, number[]> = {
  OZEMPIC: [0.25, 0.5, 1, 2],
  WEGOVY: [0.25, 0.5, 1, 1.7, 2.4],
  MOUNJARO: [2.5, 5, 7.5, 10, 12.5, 15],
  ZEPBOUND: [2.5, 5, 7.5, 10, 12.5, 15],
  OTHER: [], // Skip dosage tracking for OTHER
};

/**
 * Check if a medication supports dosage tracking
 */
export function hasDosageTracking(medication: Medication): boolean {
  return MEDICATION_DOSAGES[medication].length > 0;
}

/**
 * Get dosage options formatted for display
 */
export function getDosageOptions(medication: Medication): { label: string; value: number }[] {
  return MEDICATION_DOSAGES[medication].map((dose) => ({
    label: `${dose} mg`,
    value: dose,
  }));
}

/**
 * Get the starting (lowest) dosage for a medication
 */
export function getStartingDosage(medication: Medication): number | null {
  const dosages = MEDICATION_DOSAGES[medication];
  return dosages.length > 0 ? dosages[0] : null;
}
