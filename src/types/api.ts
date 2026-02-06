/**
 * API Types
 * Based on docs/API_DOCUMENTATION.md
 */

// Enums
export type WeightUnit = 'kg' | 'lbs';

export type Medication = 'OZEMPIC' | 'WEGOVY' | 'MOUNJARO' | 'ZEPBOUND' | 'OTHER';

export type InjectionSite =
  | 'ABDOMEN_LEFT'
  | 'ABDOMEN_RIGHT'
  | 'THIGH_LEFT'
  | 'THIGH_RIGHT'
  | 'UPPER_ARM_LEFT'
  | 'UPPER_ARM_RIGHT';

export type HabitType = 'water' | 'nutrition' | 'exercise';

export type InjectionStatus = 'due' | 'done' | 'overdue' | 'upcoming';

// 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
export type InjectionDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// Dosing mode for flexible pen tracking
export type DosingMode = 'STANDARD' | 'MICRODOSE';

// Dose type for distinguishing standard doses from golden doses
export type DoseType = 'standard' | 'golden';

// DoseNumber is now dynamic based on dosesPerPen (1-based)
// For standard users: typically 1-4
// For microdosers: varies based on penStrength/doseAmount
// Golden dose is tracked separately via isGoldenDose flag
export type DoseNumber = number;

// User
export interface User {
  id: string;
  name: string;
  email: string;
  startWeight: number;
  goalWeight: number | null;
  goalDate: string | null; // ISO date string - target date to reach goal weight
  weightUnit: WeightUnit;
  medication: Medication;
  injectionDay: InjectionDay;
  currentDosage: number | null; // Current medication dosage in mg
  height: number | null; // Height in cm (for BMI calculation)

  // Pen & Dosing Settings
  dosingMode: DosingMode; // 'standard' or 'microdose'
  penStrengthMg: number | null; // Total mg in pen (for microdosers)
  doseAmountMg: number | null; // Amount per injection (for microdosers)
  dosesPerPen: number; // Calculated: standard=4, micro=penStrength/doseAmount
  tracksGoldenDose: boolean; // Whether user extracts golden dose
  currentDoseInPen: number; // Which dose they're on (1-based)

  createdAt: string;
  updatedAt: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  startWeight: number;
  goalWeight?: number;
  weightUnit: WeightUnit;
  medication: Medication;
  injectionDay: InjectionDay;
  startingDosage?: number; // Starting medication dosage in mg
  height?: number; // Height in cm

  // Pen & Dosing Settings
  dosingMode?: DosingMode; // Defaults to 'standard'
  penStrengthMg?: number; // For microdosers: total mg in pen
  doseAmountMg?: number; // For microdosers: amount per injection
  dosesPerPen?: number; // Calculated or default 4
  tracksGoldenDose?: boolean; // Defaults to false
  currentDoseInPen?: number; // Defaults to 1
}

export interface AuthResponse {
  user: User;
  sessionToken?: string;
}

// Weigh-ins
export interface WeighIn {
  id: string;
  userId: string;
  weight: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeighInLatest {
  weighIn: WeighIn | null;
  weekChange: number | null;
  totalChange: number | null;
  canWeighIn: boolean;
  hasWeighedThisWeek: boolean;
}

export interface CreateWeighInRequest {
  userId: string;
  weight: number;
  date?: string;
}

// Injections
export interface Injection {
  id: string;
  userId: string;
  date: string;
  site: InjectionSite;
  doseNumber: DoseNumber;
  dosageMg: number | null; // Medication dosage at time of injection
  isGoldenDose: boolean; // Whether this was a golden dose extraction
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InjectionStatusResponse {
  status: InjectionStatus;
  daysUntil: number;
  daysOverdue: number;
  lastInjection: {
    id: string;
    site: InjectionSite;
    doseNumber: DoseNumber;
    dosageMg: number | null;
    isGoldenDose: boolean;
    date: string;
    notes: string | null;
  } | null;
  suggestedSite: InjectionSite;
  currentDose: DoseNumber | null;
  nextDose: DoseNumber;
  dosesRemaining: number;
  currentDosageMg: number | null; // User's current dosage in mg

  // Pen & Dosing Info
  dosesPerPen: number; // Total doses in pen (4 for standard, variable for micro)
  tracksGoldenDose: boolean; // Whether golden dose tracking is enabled
  isGoldenDoseAvailable: boolean; // True if all standard doses used but golden not yet taken
  isOnGoldenDose: boolean; // True if next dose is the golden dose
}

export interface CreateInjectionRequest {
  userId: string;
  site: InjectionSite;
  doseNumber?: DoseNumber;
  dosageMg?: number; // Medication dosage in mg
  isGoldenDose?: boolean; // True if logging a golden dose
  notes?: string;
  date?: string;
}

// Habits
export interface DailyHabit {
  id: string;
  userId: string;
  date: string;
  water: boolean;
  nutrition: boolean;
  exercise: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ToggleHabitRequest {
  userId: string;
  habit: HabitType;
  value: boolean;
  date?: string;
}

// Dashboard
export interface DashboardData {
  user: {
    id: string;
    name: string;
    startWeight: number;
    goalWeight: number | null;
    goalDate: string | null; // ISO date string - target date to reach goal weight
    weightUnit: WeightUnit;
    medication: Medication;
    injectionDay: InjectionDay;
    createdAt: string;
  };
  weight: {
    currentWeight: number | null;
    previousWeight: number | null;
    weekChange: number | null;
    totalLost: number | null;
    progressPercent: number | null;
    weighInCount: number;
    canWeighIn: boolean;
  };
  habits: {
    weeklyCompletionPercent: number;
    todayCompleted: number;
    todayTotal: number;
    streak?: number;
  };
  journey: {
    weekNumber: number;
    startDate: string;
  };
  injection?: InjectionStatusResponse;
}

// Calendar
export interface CalendarMonth {
  habits: Array<{
    date: string;
    water: boolean;
    nutrition: boolean;
    exercise: boolean;
  }>;
  weighIns: Array<{
    date: string;
    weight: number;
  }>;
  injections: Array<{
    date: string;
    site: InjectionSite;
  }>;
}

export interface CalendarDay {
  date: string;
  habit: {
    water: boolean;
    nutrition: boolean;
    exercise: boolean;
  } | null;
  weighIn: {
    weight: number;
    change: number | null;
  } | null;
  injection: {
    site: InjectionSite;
  } | null;
}

// Notification Preferences
export interface NotificationPreferences {
  id: string;
  userId: string;
  injectionReminder: boolean;
  weighInReminder: boolean;
  habitReminder: boolean;
  reminderTime: string;
  habitReminderTime: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

// Error Response
export interface ApiError {
  error: string | Array<{
    code: string;
    message: string;
    path: string[];
  }>;
}

// Settings
export interface ProfileSettings {
  id: string;
  name: string;
  email: string;
  goalWeight: number | null;
  goalDate: string | null; // ISO date string - target date to reach goal weight
  weightUnit: WeightUnit;
  medication: Medication;
  injectionDay: InjectionDay;
}

export interface UpdateProfileRequest {
  name: string;
  goalWeight?: number | null;
  goalDate?: string | null; // ISO date string - target date to reach goal weight
  medication: Medication;
  injectionDay: InjectionDay;
  currentDosage?: number | null;
  height?: number | null;
}

// Pen & Dosing Settings Update
export interface UpdatePenDosingRequest {
  dosingMode: DosingMode;
  penStrengthMg?: number | null; // For microdosers
  doseAmountMg?: number | null; // For microdosers
  dosesPerPen?: number; // Will be calculated if not provided
  tracksGoldenDose: boolean;
  currentDoseInPen: number;
}

export interface PenDosingSettings {
  dosingMode: DosingMode;
  penStrengthMg: number | null;
  doseAmountMg: number | null;
  dosesPerPen: number;
  tracksGoldenDose: boolean;
  currentDoseInPen: number;
}

// Weight Progress Chart
export type ChartTimeRange = '1M' | '3M' | '6M' | 'ALL';

export interface WeightProgressData {
  weighIns: Array<{
    date: string;
    weight: number;
    dosageMg: number | null;
  }>;
  dosageChanges: Array<{
    date: string;
    fromDosage: number | null;
    toDosage: number;
  }>;
  stats: WeightProgressStats;
}

export interface WeightProgressStats {
  totalChange: number;
  percentChange: number;
  currentBmi: number | null;
  goalProgress: number | null;
  toGoal: number | null;
  weeklyAverage: number | null;
}

// Medication Configuration (from /api/medications endpoint)
export interface MedicationConfig {
  code: Medication;
  name: string;
  manufacturer: string | null;
  dosages: number[];
  penStrengths: number[];
  supportsMicrodosing: boolean;
}

export interface MedicationConfigResponse {
  medications: MedicationConfig[];
  microdoseAmounts: number[];
  defaultDosesPerPen: number;
}
