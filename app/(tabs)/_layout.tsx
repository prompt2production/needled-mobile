import React, { useState, useCallback } from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";

import { CustomTabBar, LogActionSheet } from "@/components/navigation";

export default function TabsLayout() {

  // Log action sheet state
  const [logSheetVisible, setLogSheetVisible] = useState(false);

  const handleLogPress = useCallback(() => {
    setLogSheetVisible(true);
  }, []);

  const handleLogSheetClose = useCallback(() => {
    setLogSheetVisible(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            display: "none", // Hide default tab bar, we use custom
          },
        }}
        tabBar={(props) => (
          <CustomTabBar {...props} onLogPress={handleLogPress} />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="check-in"
          options={{
            title: "Habits",
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
          }}
        />
        <Tabs.Screen
          name="results"
          options={{
            title: "Results",
          }}
        />
        {/* Hide the old injection and weigh-in tabs */}
        <Tabs.Screen
          name="injection"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="weigh-in"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Log Action Sheet */}
      <LogActionSheet
        visible={logSheetVisible}
        onClose={handleLogSheetClose}
      />
    </View>
  );
}
