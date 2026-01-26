import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";
import { Button } from "@/components/ui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
        <Text className="text-6xl mb-4">🤔</Text>
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button>Go to Home</Button>
        </Link>
      </View>
    </>
  );
}
