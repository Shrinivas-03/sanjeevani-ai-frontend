import { useAppTheme } from "@/context/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={styles.btn}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{theme === "dark" ? "☀️" : "🌙"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#2ecc40",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
