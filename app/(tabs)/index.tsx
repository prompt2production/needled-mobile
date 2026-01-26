import { View, Text } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-teal-500">
      <Text className="text-2xl font-bold text-white">
        Needled App
      </Text>
      <Text className="text-white mt-2">
        Project initialized successfully!
      </Text>
    </View>
  );
}
