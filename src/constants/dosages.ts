/**
 * Medication Dosage Constants
 * Dosages in mg for each GLP-1 medication
 *
 * NOTE: These constants are now primarily used as fallback data when the
 * /api/medications endpoint is unavailable. The app should prefer using
 * the useMedicationConfig hook for dynamic configuration.
 */

import type { Medication, MedicationConfigResponse } from '@/types/api';

// Standard dosage levels available for each medication (for standard dosing mode)
export const MEDICATION_DOSAGES: Record<Medication, number[]> = {
  OZEMPIC: [0.25, 0.5, 1, 2],
  WEGOVY: [0.25, 0.5, 1, 1.7, 2.4],
  MOUNJARO: [2.5, 5, 7.5, 10, 12.5, 15],
  ZEPBOUND: [2.5, 5, 7.5, 10, 12.5, 15],
  OTHER: [], // Skip dosage tracking for OTHER
};

// Pen strengths available for each medication (total mg in a pen)
// Used for microdosing mode to calculate doses per pen
export const MEDICATION_PEN_STRENGTHS: Record<Medication, number[]> = {
  OZEMPIC: [2, 4, 8], // 2mg, 4mg, 8mg pens
  WEGOVY: [2.4, 4, 6.8, 10, 17], // Various pen sizes
  MOUNJARO: [5, 10, 15, 20, 25, 30], // 2.5mg×4=10, 5mg×4=20, etc.
  ZEPBOUND: [5, 10, 15, 20, 25, 30], // Same as Mounjaro
  OTHER: [],
};

// Common microdose amounts (in mg) - suggestions for the dose amount field
export const COMMON_MICRODOSE_AMOUNTS: number[] = [
  0.25, 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.75, 5, 6.25, 7.5,
];

// Default doses per pen for standard mode
export const DEFAULT_DOSES_PER_PEN = 4;

/**
 * Fallback medication configuration
 * Used when API is unavailable or while loading
 */
export const FALLBACK_MEDICATION_CONFIG: MedicationConfigResponse = {
  medications: [
    {
      code: 'OZEMPIC',
      name: 'Ozempic',
      manufacturer: 'Novo Nordisk',
      dosages: [0.25, 0.5, 1, 2],
      penStrengths: [2, 4, 8],
      supportsMicrodosing: true,
    },
    {
      code: 'WEGOVY',
      name: 'Wegovy',
      manufacturer: 'Novo Nordisk',
      dosages: [0.25, 0.5, 1, 1.7, 2.4],
      penStrengths: [2.4, 4, 6.8, 10, 17],
      supportsMicrodosing: true,
    },
    {
      code: 'MOUNJARO',
      name: 'Mounjaro',
      manufacturer: 'Eli Lilly',
      dosages: [2.5, 5, 7.5, 10, 12.5, 15],
      penStrengths: [5, 10, 15, 20, 25, 30],
      supportsMicrodosing: true,
    },
    {
      code: 'ZEPBOUND',
      name: 'Zepbound',
      manufacturer: 'Eli Lilly',
      dosages: [2.5, 5, 7.5, 10, 12.5, 15],
      penStrengths: [5, 10, 15, 20, 25, 30],
      supportsMicrodosing: true,
    },
    {
      code: 'OTHER',
      name: 'Other',
      manufacturer: null,
      dosages: [],
      penStrengths: [],
      supportsMicrodosing: false,
    },
  ],
  microdoseAmounts: [0.25, 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.75, 5, 6.25, 7.5],
  defaultDosesPerPen: 4,
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

/**
 * Get pen strength options for a medication
 */
export function getPenStrengthOptions(medication: Medication): { label: string; value: number }[] {
  return MEDICATION_PEN_STRENGTHS[medication].map((strength) => ({
    label: `${strength} mg`,
    value: strength,
  }));
}

/**
 * Check if a medication supports pen strength selection (for microdosing)
 */
export function hasPenStrengthOptions(medication: Medication): boolean {
  return MEDICATION_PEN_STRENGTHS[medication].length > 0;
}

/**
 * Calculate doses per pen based on pen strength and dose amount
 * Returns the number of full doses, rounded down
 */
export function calculateDosesPerPen(penStrengthMg: number, doseAmountMg: number): number {
  if (doseAmountMg <= 0) return 0;
  return Math.floor(penStrengthMg / doseAmountMg);
}

/**
 * Check if the dose amount divides evenly into the pen strength
 * Returns the remainder if uneven
 */
export function getDoseRemainder(penStrengthMg: number, doseAmountMg: number): number {
  if (doseAmountMg <= 0) return 0;
  return penStrengthMg % doseAmountMg;
}

/**
 * Get suggested microdose amounts for a given pen strength
 * Returns amounts that divide evenly or with small remainders
 */
export function getSuggestedMicrodoseAmounts(
  penStrengthMg: number
): { label: string; value: number; doses: number; hasRemainder: boolean }[] {
  return COMMON_MICRODOSE_AMOUNTS
    .filter((amount) => amount < penStrengthMg)
    .map((amount) => ({
      label: `${amount} mg`,
      value: amount,
      doses: calculateDosesPerPen(penStrengthMg, amount),
      hasRemainder: getDoseRemainder(penStrengthMg, amount) > 0,
    }))
    .filter((option) => option.doses >= 1);
}

/**
 * Get the total doses available in a pen (including golden dose if enabled)
 */
export function getTotalDosesWithGolden(
  dosesPerPen: number,
  tracksGoldenDose: boolean
): number {
  return tracksGoldenDose ? dosesPerPen + 1 : dosesPerPen;
}

/**
 * Get dose display text (e.g., "Dose 2 of 4 + Golden Dose" or "Golden Dose ✨")
 */
export function getDoseDisplayText(
  currentDose: number,
  dosesPerPen: number,
  isGoldenDose: boolean,
  tracksGoldenDose: boolean
): string {
  if (isGoldenDose) {
    return 'Golden Dose ✨';
  }
  const goldenText = tracksGoldenDose ? ' + ✨' : '';
  return `Dose ${currentDose} of ${dosesPerPen}${goldenText}`;
}

/**
 * Get doses remaining text
 */
export function getDosesRemainingText(
  dosesRemaining: number,
  isGoldenDoseAvailable: boolean,
  tracksGoldenDose: boolean
): string {
  if (isGoldenDoseAvailable) {
    return 'Golden Dose available ✨';
  }
  if (tracksGoldenDose && dosesRemaining === 0) {
    return 'Golden Dose left ✨';
  }
  const goldenText = tracksGoldenDose ? ' + ✨' : '';
  return `${dosesRemaining} Dose${dosesRemaining !== 1 ? 's' : ''} Left${goldenText}`;
}
