import React from "react";
import { View, Text } from "react-native";
import { Card, ProgressBar } from "@/components/ui";
import { DoseNumber } from "@/types/api";

export interface NextDoseCardProps {
  daysUntil: number;
  injectionDay: string;
  currentDose: DoseNumber | null;
  dosesRemaining: number;
  status: "due" | "done" | "overdue" | "upcoming";
}

export function NextDoseCard({
  daysUntil,
  injectionDay,
  currentDose,
  dosesRemaining,
  status,
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
        <View className="bg-teal-100 dark:bg-teal-900/30 px-3 py-1.5 rounded-full">
          <Text className="text-teal-700 dark:text-teal-300 font-semibold text-sm">
            Dose {currentDose || 1}/4
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
          {dosesRemaining} doses left in pen
        </Text>
      </View>
    </Card>
  );
}

export default NextDoseCard;
