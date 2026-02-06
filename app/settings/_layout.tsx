import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#14B8A6",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="preferences" options={{ title: "Preferences" }} />
      <Stack.Screen name="pen-dosing" options={{ title: "Pen & Dosing" }} />
    </Stack>
  );
}
