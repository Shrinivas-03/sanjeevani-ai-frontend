import { listConversations } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onStartNewConversation: () => void;
};

export default function HistoryDrawer({
  isVisible,
  onClose,
  onStartNewConversation,
}: Props) {
  const { theme } = useAppTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (isVisible && user?.email) {
      listConversations(user.email)
        .then((data) => setConversations(data.conversations))
        .catch(console.error);
    }
  }, [isVisible, user?.email]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-start",
          }}
        >
          <View
            style={{
              width: "80%",
              height: "100%",
              backgroundColor: isDark ? "#151718" : "#f5f6f7",
              paddingTop: 60,
              paddingHorizontal: 20,
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
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
