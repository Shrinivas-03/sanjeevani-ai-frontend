import { Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useAppTheme } from "@/context/theme";

export default function TabLayout() {
  const { theme } = useAppTheme();
  const palette = Colors[theme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.tabIconSelected,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: theme === "dark" ? "#222" : "#eee",
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="prediction"
        options={{
          title: "Prediction",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>📊</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>💬</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>👤</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size || 24, color }}>📖</Text>
          ),
        }}
      />
    </Tabs>
  );
}
