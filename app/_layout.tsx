import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import { useAuthStore } from "../src/stores/authStore";
import { useNotificationsSetup } from "../src/hooks";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// Initialize notifications when user is authenticated
function NotificationsInitializer() {
  useNotificationsSetup();
  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, isNewUser, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    checkSession().catch((err) => {
      console.error("Failed to check session:", err);
    });
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const onOnboardingScreen = segments[1] === "onboarding";

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated and not on auth screens - redirect to welcome
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && isNewUser && !onOnboardingScreen) {
      // Authenticated new user - redirect to onboarding
      router.replace("/(auth)/onboarding");
    } else if (isAuthenticated && !isNewUser && inAuthGroup) {
      // Authenticated existing user on auth screens - redirect to main app
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isInitialized, isNewUser, segments]);

  // Show loading while checking session
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#2C9C91" />
      </View>
    );
  }

  return (
    <>
      {isAuthenticated && <NotificationsInitializer />}
      {children}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen
              name="modals"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
          </Stack>
        </AuthGate>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
