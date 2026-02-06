import { DashboardData, InjectionStatusResponse } from "@/types/api";

// Mock dashboard data for UI development and testing
export const mockDashboardData: DashboardData = {
  user: {
    id: "mock-user-123",
    name: "Sarah",
    startWeight: 95,
    goalWeight: 75,
    goalDate: "2026-06-15", // Target date to reach goal weight
    weightUnit: "kg",
    medication: "OZEMPIC",
    injectionDay: 2, // Wednesday
    createdAt: "2024-12-01T10:30:00.000Z",
  },
  weight: {
    currentWeight: 89.5,
    previousWeight: 90.2,
    weekChange: -0.7,
    totalLost: 5.5,
    progressPercent: 27.5,
    weighInCount: 8,
    canWeighIn: true,
  },
  habits: {
    weeklyCompletionPercent: 76,
    todayCompleted: 2,
    todayTotal: 3,
    streak: 12,
  },
  journey: {
    weekNumber: 8,
    startDate: "2024-12-01T10:30:00.000Z",
  },
};

export const mockInjectionStatus: InjectionStatusResponse = {
  status: "upcoming",
  daysUntil: 2,
  daysOverdue: 0,
  lastInjection: {
    id: "inj-123",
    site: "ABDOMEN_LEFT",
    doseNumber: 2,
    dosageMg: 0.5,
    isGoldenDose: false,
    date: "2024-01-17T12:00:00.000Z",
    notes: null,
  },
  suggestedSite: "ABDOMEN_RIGHT",
  currentDose: 2,
  nextDose: 3,
  dosesRemaining: 2,
  currentDosageMg: 0.5,
  dosesPerPen: 4,
  tracksGoldenDose: false,
  isGoldenDoseAvailable: false,
  isOnGoldenDose: false,
};

// Mock today's habits (2 of 3 complete - tap Exercise to trigger confetti!)
export const mockTodayHabits = {
  water: true,
  nutrition: true,
  exercise: false,
};

// Day names helper
export const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function getInjectionDayName(dayIndex: number): string {
  return dayNames[dayIndex] || "Unknown";
}

// Format weight with unit
export function formatWeight(
  weight: number,
  unit: "kg" | "lbs",
  showUnit = true
): string {
  const formatted = weight.toFixed(1);
  return showUnit ? `${formatted} ${unit}` : formatted;
}

// Format weight change (positive/negative)
export function formatWeightChange(
  change: number | null,
  unit: "kg" | "lbs"
): string {
  if (change === null) return "—";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)} ${unit}`;
}
