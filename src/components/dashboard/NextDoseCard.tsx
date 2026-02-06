import React from "react";
import { View, Text } from "react-native";
import { Card, ProgressBar } from "@/components/ui";
import { DoseNumber } from "@/types/api";
import { getDoseDisplayText, getDosesRemainingText } from "@/constants/dosages";

export interface NextDoseCardProps {
  daysUntil: number;
  injectionDay: string;
  currentDose: DoseNumber | null;
  dosesRemaining: number;
  status: "due" | "done" | "overdue" | "upcoming";
  // New props for flexible pen tracking
  dosesPerPen?: number;
  tracksGoldenDose?: boolean;
  isGoldenDoseAvailable?: boolean;
  isOnGoldenDose?: boolean;
}

export function NextDoseCard({
  daysUntil,
  injectionDay,
  currentDose,
  dosesRemaining,
  status,
  dosesPerPen = 4,
  tracksGoldenDose = false,
  isGoldenDoseAvailable = false,
  isOnGoldenDose = false,
}: NextDoseCardProps) {
  const getStatusText = () => {
    switch (status) {
      case "due":
        return "Today!";
      case "done":
        return "Done this week";
      case "overdue":
        return `${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? "s" : ""} overdue`;
      case "upcoming":
        return `${daysUntil} day${daysUntil > 1 ? "s" : ""} until ${injectionDay}`;
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case "done":
        return "success";
      case "overdue":
        return "coral";
      default:
        return "teal";
    }
  };

  // Calculate progress: if upcoming, show countdown progress
  // 7 days = 0%, 0 days = 100%
  const progressValue =
    status === "done" ? 100 : Math.max(0, ((7 - daysUntil) / 7) * 100);

  // Get dynamic dose display text
  const doseDisplayText = getDoseDisplayText(
    currentDose ?? 1,
    dosesPerPen,
    isOnGoldenDose,
    tracksGoldenDose
  );

  // Get doses remaining text
  const dosesRemainingText = getDosesRemainingText(
    dosesRemaining,
    isGoldenDoseAvailable,
    tracksGoldenDose
  );

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Next Dose
          </Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {getStatusText()}
          </Text>
        </View>
        <View
          className={`px-3 py-1.5 rounded-full ${
            isOnGoldenDose
              ? "bg-yellow-100 dark:bg-yellow-900/30"
              : "bg-teal-100 dark:bg-teal-900/30"
          }`}
        >
          <Text
            className={`font-semibold text-sm ${
              isOnGoldenDose
                ? "text-yellow-700 dark:text-yellow-300"
                : "text-teal-700 dark:text-teal-300"
            }`}
          >
            {doseDisplayText}
          </Text>
        </View>
      </View>

      <ProgressBar
        progress={progressValue}
        variant={getProgressColor() as "teal" | "coral" | "success"}
        size="md"
        className="mb-3"
      />

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {injectionDay}s
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {dosesRemainingText}
        </Text>
      </View>
    </Card>
  );
}

export default NextDoseCard;
