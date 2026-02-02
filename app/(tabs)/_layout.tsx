import { Tabs, useRouter } from "expo-router";
import { Image, View, useColorScheme, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FloatingActionButton, FABAction } from "@/components/ui";

// Tab bar icons
const tabIcons = {
  home: require("../../media/home.png"),
  "check-in": require("../../media/check-in.png"),
  calendar: require("../../media/calendar.png"),
};

function TabIcon({ name, focused }: { name: keyof typeof tabIcons; focused: boolean }) {
  return (
    <Image
      source={tabIcons[name]}
      style={{
        width: 24,
        height: 24,
        opacity: focused ? 1 : 0.5,
      }}
    />
  );
}

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Calculate bottom offset for FAB - center it vertically within the tab bar
  const TAB_BAR_HEIGHT = 70;
  const FAB_SIZE = 56;
  // Center FAB in tab bar: (TAB_BAR_HEIGHT - FAB_SIZE) / 2 = 7
  const bottomOffset = insets.bottom + (TAB_BAR_HEIGHT - FAB_SIZE) / 2;

  // FAB actions
  const fabActions: FABAction[] = [
    {
      id: "injection",
      label: "Log Injection",
      icon: "medical",
      onPress: () => router.push("/modals/injection"),
    },
    {
      id: "weight",
      label: "Log Weight",
      icon: "scale",
      onPress: () => router.push("/modals/weigh-in"),
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? "#1E1E2E" : "#FFFFFF",
            borderTopColor: isDark ? "#374151" : "#E5E7EB",
            paddingTop: 8,
            paddingBottom: 8,
            height: TAB_BAR_HEIGHT,
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
        {/* Placeholder for FAB - invisible tab that creates center space */}
        <Tabs.Screen
          name="fab-placeholder"
          options={{
            title: "",
            tabBarIcon: () => <View style={{ width: 56 }} />,
            tabBarButton: () => <View style={{ width: 56 }} />,
          }}
          listeners={{
            tabPress: (e) => {
              // Prevent navigation to placeholder
              e.preventDefault();
            },
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="results"
          options={{
            title: "Results",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name="trending-up"
                size={24}
                color={color}
                style={{ opacity: focused ? 1 : 0.5 }}
              />
            ),
          }}
        />
        {/* Hide the old injection and weigh-in tabs */}
        <Tabs.Screen
          name="injection"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
        <Tabs.Screen
          name="weigh-in"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
      </Tabs>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={fabActions}
        bottomOffset={bottomOffset}
      />
    </View>
  );
}
