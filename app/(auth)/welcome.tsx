import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { Button } from "@/components/ui";
import { Pip } from "@/components/pip";

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-teal-500">
      <View className="flex-1 items-center justify-center p-6">
        {/* Pip mascot with animation */}
        <Pip state="cheerful" size="xl" />

        <Text className="text-3xl font-bold text-white mt-6 text-center">
          Welcome to Needled
        </Text>
        <Text className="text-lg text-teal-100 mt-3 text-center">
          Your GLP-1 journey companion
        </Text>
      </View>

      <View className="p-6 gap-3">
        <Link href="/(auth)/login" asChild>
          <Button variant="secondary" size="lg" fullWidth>
            Log In
          </Button>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Button variant="outline" size="lg" fullWidth className="border-white">
            <Text className="text-white font-semibold">Create Account</Text>
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}
