import { useRef, useEffect } from "react";
import { View, Text, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { Button } from "../../src/components/ui/Button";
import { Pip } from "../../src/components/pip/Pip";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";

const { width: screenWidth } = Dimensions.get("window");

const FEATURES = [
  {
    icon: "medical" as const,
    title: "Track your GLP-1 injections",
    description: "Never miss a dose with smart reminders",
  },
  {
    icon: "trending-up" as const,
    title: "Monitor your weight progress",
    description: "See your journey with visual charts",
  },
  {
    icon: "checkmark-circle" as const,
    title: "Build healthy daily habits",
    description: "Stay consistent with habit tracking",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuthStore();
  const confettiRef = useRef<any>(null);

  // Trigger confetti on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      confettiRef.current?.start();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <SafeAreaView className="flex-1 bg-teal-500">
      <View className="flex-1 px-6 pt-8 pb-6">
        {/* Pip Mascot */}
        <View className="items-center mb-8">
          <Pip state="celebrating" size="xl" />
        </View>

        {/* Welcome Heading */}
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-white text-center">
            Welcome to Needled,
          </Text>
          <Text className="text-3xl font-bold text-white text-center">
            {firstName}!
          </Text>
        </View>

        {/* Feature Highlights */}
        <View className="bg-white/10 rounded-2xl p-6 mb-8">
          {FEATURES.map((feature, index) => (
            <View
              key={index}
              className={`flex-row items-center ${
                index < FEATURES.length - 1 ? "mb-6" : ""
              }`}
            >
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                <Ionicons name={feature.icon} size={24} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">
                  {feature.title}
                </Text>
                <Text className="text-white/80 text-sm">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Get Started Button */}
        <View className="mt-auto">
          <Button
            onPress={handleGetStarted}
            variant="secondary"
            fullWidth
            size="lg"
          >
            Let's Get Started
          </Button>
        </View>
      </View>

      {/* Confetti celebration */}
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: screenWidth / 2, y: -30 }}
        autoStart={false}
        fadeOut={true}
        fallSpeed={2500}
        explosionSpeed={500}
        colors={["#14B8A6", "#2DD4BF", "#FB7185", "#FBBF24", "#22C55E", "#5EEAD4", "#ffffff"]}
      />
    </SafeAreaView>
  );
}
