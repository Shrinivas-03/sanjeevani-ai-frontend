import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PredictionExplanation({ text, theme }) {
  if (!text || typeof text !== "string") return null;

  const styles = getStyles(theme);
  const sections = parseStrictMarkdownSections(text);

  return (
    <View style={styles.wrapper}>
      {sections.map((sec, idx) => (
        <View key={idx} style={{ marginBottom: 18 }}>
          <Text style={styles.sectionTitle}>
            {getEmoji(sec.heading)} {sec.heading}
          </Text>

          {sec.body.split(/\n+/).map((line, i) => (
            <Text key={i} style={styles.sectionContent}>
              {formatBullet(line)}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

/* STRICT MODE PARSER
   Only matches headers like:
   ## **Heading Name**
*/
function parseStrictMarkdownSections(text: string) {
  const blocks = text.split(/##\s+\*\*(.*?)\*\*/g);
  const output: { heading: string; body: string }[] = [];

  for (let i = 1; i < blocks.length; i += 2) {
    const heading = blocks[i].trim();
    const body = (blocks[i + 1] || "").trim();
    output.push({ heading, body });
  }

  // fallback for text with no strict headers
  if (output.length === 0) {
    return [{ heading: "Explanation", body: text.trim() }];
  }

  return output;
}

/* Emojis per heading */
function getEmoji(h: string) {
  const map: any = {
    "Why the model predicted this": "🧠",
    Warnings: "⚠️",
    "Ayurvedic Remedies": "🌿",
    "Lifestyle & Exercise": "🏃‍♂️",
    "Additional Suggestions": "💡",
  };
  return map[h] || "➤";
}

/* Bullet formatter */
function formatBullet(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return "";

  // Bulleted lists
  if (/^[-•]/.test(trimmed)) return "• " + trimmed.replace(/^[-•]\s*/, "");

  // Numbered lists
  if (/^\d+\./.test(trimmed)) return "🔸 " + trimmed.replace(/^\d+\.\s*/, "");

  return trimmed;
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
      fontWeight: "800",
      color: isDark ? "#fff" : "#222",
      marginBottom: 8,
    },

    sectionContent: {
      fontSize: 15,
      color: isDark ? "#ddd" : "#444",
      lineHeight: 22,
      marginBottom: 4,
    },
  });
}
