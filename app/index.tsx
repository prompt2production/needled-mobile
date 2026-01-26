import { Redirect } from "expo-router";

// For now, redirect directly to the main tabs
// Later, this will check auth state and redirect appropriately
export default function Index() {
  // TODO: Check auth state
  // const { isAuthenticated, isLoading } = useAuth();
  // if (isLoading) return <SplashScreen />;
  // if (!isAuthenticated) return <Redirect href="/(auth)/welcome" />;

  return <Redirect href="/(tabs)" />;
}
