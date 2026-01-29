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

// GLP-1 pens contain 4 doses
export type DoseNumber = 1 | 2 | 3 | 4;

// User
export interface User {
  id: string;
  name: string;
  email: string;
  startWeight: number;
  goalWeight: number | null;
  weightUnit: WeightUnit;
  medication: Medication;
  injectionDay: InjectionDay;
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
    date: string;
    notes: string | null;
  } | null;
  suggestedSite: InjectionSite;
  currentDose: DoseNumber | null;
  nextDose: DoseNumber;
  dosesRemaining: number;
}

export interface CreateInjectionRequest {
  userId: string;
  site: InjectionSite;
  doseNumber?: DoseNumber;
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
  weightUnit: WeightUnit;
  medication: Medication;
  injectionDay: InjectionDay;
}

export interface UpdateProfileRequest {
  name: string;
  goalWeight?: number | null;
  medication: Medication;
  injectionDay: InjectionDay;
}
