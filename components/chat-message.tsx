import React from "react";
import { StyleSheet, Text, View } from "react-native";

const ChatMessage = ({ text }) => {
  const renderText = () => {
    const parts = text.split(/(\n|\*\*.*?\*\*|\*.*?\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <Text key={index} style={styles.bold}>
            {part.slice(2, -2)}
          </Text>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <Text key={index} style={styles.italic}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part === "\n") {
        return <Text key={index}>{"\n"}</Text>;
      }
      return part;
    });
  };

  return <Text style={styles.text}>{renderText()}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  bold: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
  },
  italic: {
    fontStyle: "italic",
  },
});

export default ChatMessage;
