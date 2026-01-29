import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { ApiErrorResponse } from "../../src/services/api";
import { isValidEmail } from "../../src/lib/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleForgotPassword = () => {
    Alert.alert(
      "Reset Password",
      "Contact support@needled.app to reset your password.",
      [{ text: "OK" }]
    );
  };

  const handleLogin = async () => {
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigation is handled by AuthGate in _layout.tsx
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message || "Login failed. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-6">
            {/* Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-2">
                Sign in to continue your journey
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
                <Text className="text-red-600 dark:text-red-400 text-center">
                  {error}
                </Text>
              </View>
            )}

            {/* Form */}
            <View className="gap-4">
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />

              <View>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
                <TouchableOpacity onPress={handleForgotPassword} className="mt-2">
                  <Text className="text-teal-600 dark:text-teal-400 text-sm">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <View className="mt-8">
              <Button
                onPress={handleLogin}
                loading={isLoading}
                fullWidth
                size="lg"
              >
                Sign In
              </Button>
            </View>

            {/* Register Link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="text-gray-500 dark:text-gray-400">
                Don't have an account?{" "}
              </Text>
              <Link href="/(auth)/register" asChild>
                <Text className="text-teal-600 dark:text-teal-400 font-semibold">
                  Sign up
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
