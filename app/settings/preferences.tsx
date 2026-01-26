import { View, Text } from "react-native";

export default function PreferencesScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-dark-bg">
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Preferences
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mt-2">
          Coming soon...
        </Text>
      </View>
    </View>
  );
}
