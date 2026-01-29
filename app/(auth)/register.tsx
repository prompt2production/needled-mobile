import { useState, useMemo } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/authStore";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { ApiErrorResponse } from "../../src/services/api";
import {
  Medication,
  WeightUnit,
  InjectionDay,
  RegisterRequest,
} from "../../src/types/api";
import { isValidEmail, getPasswordStrength } from "../../src/lib/validation";

const MEDICATIONS: { value: Medication; label: string }[] = [
  { value: "OZEMPIC", label: "Ozempic" },
  { value: "WEGOVY", label: "Wegovy" },
  { value: "MOUNJARO", label: "Mounjaro" },
  { value: "ZEPBOUND", label: "Zepbound" },
  { value: "OTHER", label: "Other" },
];

const DAYS: { value: InjectionDay; label: string }[] = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [startWeight, setStartWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [medication, setMedication] = useState<Medication>("OZEMPIC");
  const [injectionDay, setInjectionDay] = useState<InjectionDay>(2); // Wednesday

  const [error, setError] = useState<string | null>(null);

  // Calculate password strength
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleRegister = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!startWeight) {
      setError("Please enter your current weight");
      return;
    }

    const startWeightNum = parseFloat(startWeight);
    if (isNaN(startWeightNum) || startWeightNum < 40 || startWeightNum > 300) {
      setError("Please enter a valid weight (40-300)");
      return;
    }

    let goalWeightNum: number | undefined;
    if (goalWeight) {
      goalWeightNum = parseFloat(goalWeight);
      if (isNaN(goalWeightNum) || goalWeightNum < 40 || goalWeightNum > 300) {
        setError("Please enter a valid goal weight (40-300)");
        return;
      }
      if (goalWeightNum >= startWeightNum) {
        setError("Goal weight should be less than current weight");
        return;
      }
    }

    try {
      const data: RegisterRequest = {
        name: name.trim(),
        email: email.trim(),
        password,
        startWeight: startWeightNum,
        goalWeight: goalWeightNum,
        weightUnit,
        medication,
        injectionDay,
      };

      await register(data);
      // Navigation is handled by AuthGate in _layout.tsx
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError.message || "Registration failed. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-8 pb-6">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Account
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 mt-2">
                Start your weight loss journey today
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
              {/* Basic Info */}
              <Input
                label="Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
              />

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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View className="mt-2">
                    <View className="flex-row gap-1">
                      {[0, 1, 2, 3, 4].map((index) => (
                        <View
                          key={index}
                          className="flex-1 h-1 rounded-full"
                          style={{
                            backgroundColor: index < passwordStrength.score
                              ? passwordStrength.color
                              : '#E5E7EB', // gray-200
                          }}
                        />
                      ))}
                    </View>
                    <Text
                      className="text-xs mt-1 capitalize"
                      style={{ color: passwordStrength.color }}
                    >
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              <Input
                label="Confirm Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
              />

              {/* Weight Section */}
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Weight
                </Text>

                {/* Weight Unit Toggle */}
                <View className="flex-row mb-4">
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-l-xl border-2 ${
                      weightUnit === "lbs"
                        ? "bg-teal-500 border-teal-500"
                        : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700"
                    }`}
                    onPress={() => setWeightUnit("lbs")}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        weightUnit === "lbs"
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      lbs
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-3 rounded-r-xl border-2 border-l-0 ${
                      weightUnit === "kg"
                        ? "bg-teal-500 border-teal-500"
                        : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700"
                    }`}
                    onPress={() => setWeightUnit("kg")}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        weightUnit === "kg"
                          ? "text-white"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      kg
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Input
                      label="Current Weight"
                      placeholder={weightUnit === "lbs" ? "200" : "90"}
                      value={startWeight}
                      onChangeText={setStartWeight}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Input
                      label="Goal Weight (optional)"
                      placeholder={weightUnit === "lbs" ? "160" : "72"}
                      value={goalWeight}
                      onChangeText={setGoalWeight}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Medication Section */}
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Medication
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {MEDICATIONS.map((med) => (
                    <TouchableOpacity
                      key={med.value}
                      className={`px-4 py-2 rounded-full border-2 ${
                        medication === med.value
                          ? "bg-teal-500 border-teal-500"
                          : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700"
                      }`}
                      onPress={() => setMedication(med.value)}
                    >
                      <Text
                        className={`font-medium ${
                          medication === med.value
                            ? "text-white"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {med.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Injection Day Section */}
              <View className="mt-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Injection Day
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {DAYS.map((day) => (
                      <TouchableOpacity
                        key={day.value}
                        className={`px-4 py-2 rounded-full border-2 ${
                          injectionDay === day.value
                            ? "bg-teal-500 border-teal-500"
                            : "bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700"
                        }`}
                        onPress={() => setInjectionDay(day.value)}
                      >
                        <Text
                          className={`font-medium ${
                            injectionDay === day.value
                              ? "text-white"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            {/* Register Button */}
            <View className="mt-8">
              <Button
                onPress={handleRegister}
                loading={isLoading}
                fullWidth
                size="lg"
              >
                Create Account
              </Button>
            </View>

            {/* Login Link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Text className="text-teal-600 dark:text-teal-400 font-semibold">
                  Sign in
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
