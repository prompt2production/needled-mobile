import React from "react";
import { View, Text } from "react-native";
import { Pip, PipState } from "./Pip";

export interface PipWithBubbleProps {
  state?: PipState;
  message: string;
  size?: "sm" | "md" | "lg";
}

export function PipWithBubble({
  state = "cheerful",
  message,
  size = "md",
}: PipWithBubbleProps) {
  return (
    <View className="flex-row items-end">
      <Pip state={state} size={size} />
      <View className="flex-1 ml-3 mb-4">
        <View className="bg-white dark:bg-dark-card rounded-2xl rounded-bl-md p-4 shadow-sm">
          <Text className="text-gray-800 dark:text-white text-base leading-relaxed">
            {message}
          </Text>
        </View>
        {/* Speech bubble pointer */}
        <View
          className="absolute -left-2 bottom-0 w-0 h-0"
          style={{
            borderTopWidth: 8,
            borderRightWidth: 12,
            borderBottomWidth: 0,
            borderLeftWidth: 0,
            borderTopColor: "white",
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        />
      </View>
    </View>
  );
}

export default PipWithBubble;
