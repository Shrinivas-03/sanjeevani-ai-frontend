import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  SafeAreaView,
} from "react-native";
import { useAppTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import BrandHeader from "@/components/brand-header";
import { sendMessage } from "@/constants/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const assistantAvatar = require("../../assets/images/icon.png");
const userAvatar = require("../../assets/images/logo.png");

type Msg = { id: string; sender: "user" | "assistant"; text: string };

export default function WebChatPage() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<ScrollView | null>(null);

  // -----------------------------
  // Typing / Thinking Animation
  // -----------------------------
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 3,
            duration: 900,
            useNativeDriver: false,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }
    return () => dotAnim.stopAnimation();
  }, [loading]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // -----------------------------
  // Send Message
  // -----------------------------
  const handleSend = async () => {
    if (!input.trim() || loading || !user?.email) return;

    const userText = input.trim();

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: userText },
    ]);

    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(user.email, userText, conversationId);
      setConversationId(data.conversation_id);

      const assistantReply = data.response || "No response.";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-a",
          sender: "assistant",
          text: assistantReply,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-e",
          sender: "assistant",
          text: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Render Messages
  // -----------------------------
  const renderMessages = () => (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.messagesContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Placeholder */}
      {messages.length === 0 && (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={styles.placeholder}>Start a conversation...</Text>
        </View>
      )}

      {/* Chat Messages */}
      {messages.map((msg) => (
        <View
          key={msg.id}
          style={[
            styles.row,
            msg.sender === "assistant" ? styles.rowLeft : styles.rowRight,
          ]}
        >
          {msg.sender === "assistant" && (
            <Image source={assistantAvatar} style={styles.avatar} />
          )}

          <View
            style={[
              styles.bubble,
              msg.sender === "assistant"
                ? styles.assistantBubble
                : styles.userBubble,
            ]}
          >
            <Text
              style={
                msg.sender === "assistant"
                  ? styles.assistantText
                  : styles.userText
              }
            >
              {msg.text}
            </Text>
          </View>

          {msg.sender === "user" && (
            <Image source={userAvatar} style={styles.avatar} />
          )}
        </View>
      ))}

      {/* Typing Animation */}
      {loading && (
        <View style={[styles.row, styles.rowLeft]}>
          <Image source={assistantAvatar} style={styles.avatar} />
          <View style={[styles.bubble, styles.assistantBubble]}>
            <Animated.Text style={styles.assistantText}>
              {"Thinking" + ".".repeat(dotAnim.__getValue() % 4)}
            </Animated.Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.page}>
      <BrandHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
      >
        <View style={styles.chatWrapper}>{renderMessages()}</View>

        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom }]}>
          <View style={styles.inputBar}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor={isDark(theme) ? "#A5C8A6" : "#4F8F63"}
              style={styles.input}
              onSubmitEditing={handleSend}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || loading}
              style={[
                styles.sendBtn,
                input.trim() ? styles.sendEnabled : styles.sendDisabled,
              ]}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const isDark = (t: string) => t === "dark";

// -----------------------------
// NEW DESIGN STYLES APPLIED
// -----------------------------
function getStyles(theme: string) {
  const dark = isDark(theme);

  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: dark ? "#0c0f0d" : "#eef5ef",
    },

    chatWrapper: {
      flex: 1,
      maxWidth: 600,
      width: "100%",
      alignSelf: "center",
    },

    messagesContainer: {
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 20,
    },

    placeholder: {
      color: dark ? "#9EBCA0" : "#5F8B65",
      fontSize: 16,
      fontWeight: "500",
    },

    row: {
      flexDirection: "row",
      marginBottom: 14,
      alignItems: "flex-end",
    },
    rowLeft: { alignSelf: "flex-start" },
    rowRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },

    avatar: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1.2,
      borderColor: dark ? "#2ECC71" : "#0F7A38",
    },

    bubble: {
      maxWidth: "78%",
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20,
      marginHorizontal: 8,
      shadowColor: dark ? "#0aff71" : "#3BBF78",
      shadowOpacity: dark ? 0.22 : 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },

    assistantBubble: {
      backgroundColor: dark ? "#1a1d1c" : "#f0f5f1",
      borderWidth: 1,
      borderColor: dark ? "#213329" : "#d8f3df",
    },

    userBubble: {
      backgroundColor: dark ? "rgba(60,200,90,0.22)" : "rgba(34,197,94,0.18)",
      borderWidth: 1,
      borderColor: dark ? "#1f5d39" : "#b8ebc8",
    },

    assistantText: {
      color: dark ? "#e7ffe9" : "#2a3d31",
      fontSize: 16,
      lineHeight: 22,
    },

    userText: {
      color: dark ? "#ffffff" : "#0a4225",
      fontSize: 16,
      lineHeight: 22,
    },

    inputWrapper: {
      paddingHorizontal: 14,
      backgroundColor: dark ? "#0c0f0d" : "#eef5ef",
    },

    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: dark ? "#0e1310" : "#ffffff",
      borderRadius: 30,
      borderWidth: 1.6,
      borderColor: dark ? "#1f3b26" : "#7ed9a0",
      paddingLeft: 18,
      paddingRight: 6,
      paddingVertical: 8,
      shadowColor: "#2ECC71",
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 5,
    },

    input: {
      flex: 1,
      color: dark ? "#e8ffe1" : "#1c362a",
      fontSize: 16.5,
      paddingVertical: 8,
    },

    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#22c55e",
    },

    sendEnabled: { opacity: 1 },
    sendDisabled: { opacity: 0.45 },

    sendIcon: {
      color: "#fff",
      fontSize: 20,
      fontWeight: "bold",
    },
  });
}
