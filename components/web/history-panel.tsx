import { listConversations } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onStartNewConversation: () => void;
};

export default function HistoryPanel({ onStartNewConversation }: Props) {
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email) {
      listConversations(user.email)
        .then((data) => setConversations(data.conversations))
        .catch(console.error);
    }
  }, [user?.email]);

  return (
    <View
      style={{
        width: 300,
        height: "100%",
        backgroundColor: isDark ? "#151718" : "#f5f6f7",
        paddingTop: 60,
        paddingHorizontal: 20,
        borderRightWidth: 1,
        borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
      }}
    >
      <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 24 }}>
        History
      </Text>
      <TouchableOpacity
        onPress={onStartNewConversation}
        style={{
          marginVertical: 10,
          padding: 10,
          backgroundColor: isDark ? "#004D40" : "#D1FADF",
          borderRadius: 5,
        }}
      >
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          Start New Conversation
        </Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversation_id}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ paddingVertical: 10 }}>
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              {item.preview}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
