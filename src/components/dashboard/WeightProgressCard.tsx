import React from "react";
import { View, Text } from "react-native";
import { Card, ProgressBar } from "@/components/ui";
import { WeightUnit } from "@/types/api";

export interface WeightProgressCardProps {
  currentWeight: number;
  startWeight: number;
  goalWeight: number | null;
  totalLost: number;
  weekChange: number | null;
  progressPercent: number;
  weightUnit: WeightUnit;
}

export function WeightProgressCard({
  currentWeight,
  startWeight,
  goalWeight,
  totalLost,
  weekChange,
  progressPercent,
  weightUnit,
}: WeightProgressCardProps) {
  const formatWeight = (w: number) => `${w.toFixed(1)} ${weightUnit}`;

  const weekChangeText =
    weekChange !== null
      ? `${weekChange > 0 ? "+" : ""}${weekChange.toFixed(1)} ${weightUnit}`
      : "—";

  const weekChangeColor =
    weekChange !== null && weekChange < 0
      ? "text-success"
      : weekChange !== null && weekChange > 0
        ? "text-coral"
        : "text-gray-500";

  return (
    <Card className="mb-4">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Current Weight
          </Text>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {formatWeight(currentWeight)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            This week
          </Text>
          <Text className={`text-lg font-semibold ${weekChangeColor} mt-1`}>
            {weekChangeText}
          </Text>
        </View>
      </View>

      {goalWeight && (
        <>
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              Progress to goal
            </Text>
            <Text className="text-sm font-medium text-teal-600 dark:text-teal-400">
              {progressPercent.toFixed(0)}%
            </Text>
          </View>
          <ProgressBar
            progress={progressPercent}
            variant="teal"
            size="md"
            className="mb-3"
          />
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Start: {formatWeight(startWeight)}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Goal: {formatWeight(goalWeight)}
            </Text>
          </View>
        </>
      )}

      <View className="flex-row mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-success">
            {totalLost.toFixed(1)}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {weightUnit} lost total
          </Text>
        </View>
      </View>
    </Card>
  );
}

export default WeightProgressCard;
