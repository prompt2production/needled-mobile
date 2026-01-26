import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useColorScheme } from "react-native";

// Simple icon components (we'll use text-based icons for now)
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: "🏠",
    "check-in": "✓",
    injection: "💉",
    "weigh-in": "⚖️",
    calendar: "📅",
  };

  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || "•"}
    </Text>
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "#1E1E2E" : "#FFFFFF",
          borderTopColor: isDark ? "#374151" : "#E5E7EB",
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: "#14B8A6",
        tabBarInactiveTintColor: isDark ? "#94A3B8" : "#6B7280",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          title: "Check-in",
          tabBarIcon: ({ focused }) => <TabIcon name="check-in" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="injection"
        options={{
          title: "Injection",
          tabBarIcon: ({ focused }) => <TabIcon name="injection" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="weigh-in"
        options={{
          title: "Weigh-in",
          tabBarIcon: ({ focused }) => <TabIcon name="weigh-in" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
