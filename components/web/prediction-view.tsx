import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PredictionExplanation({ text, theme }) {
  if (!text) return null;

  const styles = getStyles(theme);

  const sections = text.split(/\*\*(.*?)\*\*/g);

  return (
    <View style={styles.wrapper}>
      {sections.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <Text key={index} style={styles.sectionTitle}>
              {part.trim()}
            </Text>
          );
        } else {
          return part.trim().length > 0 ? (
            <Text key={index} style={styles.sectionContent}>
              {formatBulletPoints(part)}
            </Text>
          ) : null;
        }
      })}
    </View>
  );
}

function formatBulletPoints(text: string) {
  return text.replace(/\n\s*\*\s*/g, "\n• ").replace(/\n\s*\d+\.\s*/g, "\n🔸 ");
}

function getStyles(theme: string) {
  const isDark = theme === "dark";

  return StyleSheet.create({
    wrapper: {
      marginTop: 10,
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? "#1a1a1a" : "#ffffff",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e1e5ea",
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#fff" : "#222",
      marginTop: 16,
      marginBottom: 6,
    },

    sectionContent: {
      fontSize: 15,
      color: isDark ? "#ddd" : "#444",
      lineHeight: 22,
      marginBottom: 8,
    },
  });
}
