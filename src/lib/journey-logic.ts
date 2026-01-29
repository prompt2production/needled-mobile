/**
 * Journey View Logic
 * Pip state and message determination for calendar journey view
 */

import { PipState } from "@/components/pip/Pip";

export interface JourneyDayData {
  completionPercent: number; // 0, 33, 66, or 100
  hasInjection: boolean;
  hasWeighIn: boolean;
  isMilestone: 7 | 14 | 30 | null;
  streakDay: boolean;
}

/**
 * Get Pip state based on monthly completion percentage
 */
export function getJourneyPipState(completionPercent: number): PipState {
  if (completionPercent >= 80) return "proud";
  if (completionPercent >= 60) return "cheerful";
  if (completionPercent >= 40) return "encouraging";
  if (completionPercent >= 20) return "curious";
  return "cheerful"; // Default friendly state
}

/**
 * Get contextual Pip message for a tapped day
 */
export function getJourneyPipMessage(
  dayData: JourneyDayData | null,
  isToday: boolean,
  dayNumber: number
): string {
  // Today handling
  if (isToday) {
    if (!dayData) {
      return "Today's a fresh start! What will you accomplish?";
    }
    if (dayData.completionPercent === 100) {
      return "You crushed it today! All habits complete!";
    }
    if (dayData.completionPercent >= 66) {
      return "Almost there! One more habit to go!";
    }
    if (dayData.completionPercent >= 33) {
      return "Good progress today! Keep the momentum going!";
    }
    return "Your day is waiting! Let's check off some habits!";
  }

  // Milestone day
  if (dayData?.isMilestone) {
    const milestoneMessages: Record<7 | 14 | 30, string> = {
      7: "A whole week of progress! You built a real habit!",
      14: "Two weeks strong! Your consistency is incredible!",
      30: "30 days! You've proven real commitment!",
    };
    return milestoneMessages[dayData.isMilestone];
  }

  // Perfect day with injection
  if (dayData?.completionPercent === 100 && dayData.hasInjection) {
    return "A perfect day AND you logged your injection!";
  }

  // Perfect day with weigh-in
  if (dayData?.completionPercent === 100 && dayData.hasWeighIn) {
    return "All habits done and you tracked your weight!";
  }

  // Streak day
  if (dayData?.streakDay && dayData.completionPercent === 100) {
    return "Part of your streak! You were on fire!";
  }

  // Past day based on completion
  if (dayData) {
    if (dayData.completionPercent === 100) {
      return "A perfect day! All three habits checked off!";
    }
    if (dayData.completionPercent >= 66) {
      return "Two out of three habits - solid effort!";
    }
    if (dayData.completionPercent >= 33) {
      return "You showed up! One habit is better than none!";
    }
  }

  // Injection only
  if (dayData?.hasInjection && dayData.completionPercent === 0) {
    return "You logged your injection this day!";
  }

  // Weigh-in only
  if (dayData?.hasWeighIn && dayData.completionPercent === 0) {
    return "You tracked your weight this day!";
  }

  // No activity
  return `Let's see what happened on day ${dayNumber}...`;
}

/**
 * Get the default Pip message for the journey header
 */
export function getJourneyHeaderMessage(
  currentStreak: number,
  monthlyCompletion: number,
  perfectDays: number
): string {
  // Active streak
  if (currentStreak >= 7) {
    return `${currentStreak} day streak! You're unstoppable!`;
  }
  if (currentStreak >= 3) {
    return `${currentStreak} days in a row! Keep it going!`;
  }

  // Good month
  if (monthlyCompletion >= 80) {
    return "What an incredible month! You're crushing it!";
  }
  if (monthlyCompletion >= 60) {
    return "Great consistency this month! Keep building!";
  }

  // Perfect days focus
  if (perfectDays >= 10) {
    return `${perfectDays} perfect days this month! Amazing!`;
  }
  if (perfectDays >= 5) {
    return `${perfectDays} perfect days so far! Nice work!`;
  }
  if (perfectDays >= 1) {
    return `${perfectDays} perfect day${perfectDays > 1 ? 's' : ''}! Every one counts!`;
  }

  // Default encouraging
  return "Let's look at your journey! Tap any day to see details.";
}
