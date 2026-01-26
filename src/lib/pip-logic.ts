import { DashboardData } from "@/types/api";
import { PipState } from "@/components/pip/Pip";

export interface PipStateResult {
  state: PipState;
  message: string;
}

const greetings = {
  morning: [
    "Good morning! Ready to crush it today?",
    "Rise and shine! Let's make today count!",
    "Morning! Time to check in on your progress!",
  ],
  afternoon: [
    "Good afternoon! How's your day going?",
    "Hey there! Hope you're staying on track!",
    "Afternoon check-in time!",
  ],
  evening: [
    "Good evening! How did today treat you?",
    "Evening! Let's see how you did today!",
    "Hey! Winding down? Let's review your day!",
  ],
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function determinePipState(data: DashboardData): PipStateResult {
  const hour = new Date().getHours();

  // Late night/early morning - sleeping Pip
  if (hour < 6) {
    return {
      state: "sleeping",
      message: "Zzz... Early bird or night owl? Either way, rest up!",
    };
  }

  // Celebration triggers - all habits complete
  if (data.habits.todayCompleted === data.habits.todayTotal) {
    return {
      state: "celebrating",
      message: "All habits done today! You're absolutely crushing it!",
    };
  }

  // Proud - weight loss this week
  if (data.weight.weekChange && data.weight.weekChange < 0) {
    const unit = data.user.weightUnit;
    const loss = Math.abs(data.weight.weekChange).toFixed(1);
    return {
      state: "proud",
      message: `Down ${loss} ${unit} this week! Your hard work is paying off!`,
    };
  }

  // Proud - good streak
  if (data.habits.streak && data.habits.streak >= 7) {
    return {
      state: "proud",
      message: `${data.habits.streak} day streak! You're on fire!`,
    };
  }

  // Encouraging - some progress
  if (data.habits.todayCompleted > 0) {
    const remaining = data.habits.todayTotal - data.habits.todayCompleted;
    return {
      state: "encouraging",
      message: `Great start! Just ${remaining} more habit${remaining > 1 ? "s" : ""} to go!`,
    };
  }

  // Curious - checking in on missed habits
  if (data.habits.weeklyCompletionPercent < 50) {
    return {
      state: "curious",
      message: "Hey! Ready to build some healthy habits today?",
    };
  }

  // Default - cheerful greeting based on time of day
  const timeOfDay = getTimeOfDay();
  return {
    state: "cheerful",
    message: getRandomItem(greetings[timeOfDay]),
  };
}

// Get Pip state for injection day
export function getInjectionDayPipState(
  status: "due" | "done" | "overdue" | "upcoming"
): PipStateResult {
  switch (status) {
    case "due":
      return {
        state: "encouraging",
        message: "It's injection day! You've got this!",
      };
    case "done":
      return {
        state: "celebrating",
        message: "Injection logged! See you next week! You're doing amazing!",
      };
    case "overdue":
      return {
        state: "curious",
        message: "Looks like you missed your injection day. Ready to catch up?",
      };
    case "upcoming":
      return {
        state: "cheerful",
        message: "Your injection day is coming up soon!",
      };
    default:
      return {
        state: "cheerful",
        message: "Keep up the great work!",
      };
  }
}

export default determinePipState;
