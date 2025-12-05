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
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollViewRef = useRef<ScrollView | null>(null);

  // Thinking animation
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
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || loading || !user?.email) return;

    const userText = input.trim();

    setMessages((m) => [
      ...m,
      { id: Date.now().toString(), sender: "user", text: userText },
    ]);

    setInput("");
    setLoading(true);

    try {
      const data = await sendMessage(user.email, userText, conversationId);

      setConversationId(data.conversation_id);
      const assistantText = data.response ?? "No response.";

      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString() + "-a",
          sender: "assistant",
          text: assistantText,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          id: Date.now().toString() + "-e",
          sender: "assistant",
          text: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Render chat bubbles
  const renderChatMessages = () => (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {messages.length === 0 && (
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Text style={styles.placeholderText}>Start a conversation!</Text>
        </View>
      )}

      {messages.map((msg) => (
        <View
          key={msg.id}
          style={[
            styles.bubbleRow,
            msg.sender === "assistant" ? styles.bubbleLeft : styles.bubbleRight,
          ]}
        >
          {msg.sender === "assistant" && (
            <Image source={assistantAvatar} style={styles.bubbleAvatar} />
          )}

          <View
            style={[
              styles.bubble,
              msg.sender === "assistant"
                ? styles.bubbleAssistant
                : styles.bubbleUser,
            ]}
          >
            <Text
              style={
                msg.sender === "assistant"
                  ? styles.bubbleAssistantText
                  : styles.bubbleUserText
              }
            >
              {msg.text}
            </Text>
          </View>

          {msg.sender === "user" && (
            <Image source={userAvatar} style={styles.bubbleAvatar} />
          )}
        </View>
      ))}

      {loading && (
        <View style={[styles.bubbleRow, styles.bubbleLeft]}>
          <Image source={assistantAvatar} style={styles.bubbleAvatar} />
          <View style={[styles.bubble, styles.bubbleAssistant]}>
            <Animated.Text style={styles.bubbleAssistantText}>
              {"Thinking" + ".".repeat(dotAnim.__getValue() % 4)}
            </Animated.Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.outerBg}>
      {/* HEADER OUTSIDE KAV — prevents black screen */}
      <BrandHeader />

      {/* KAV WRAPS ONLY CHAT + INPUT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 60 : 0}
      >
        <View style={styles.chatArea}>{renderChatMessages()}</View>

        <View style={[styles.inputBarOuter, { paddingBottom: insets.bottom }]}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message"
              placeholderTextColor={theme === "dark" ? "#A7B992" : "#67b375"}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                input.trim() ? styles.sendActive : styles.sendDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(theme: string) {
  const isDark = theme === "dark";

  return StyleSheet.create({
    outerBg: {
      flex: 1,
      backgroundColor: isDark ? "#17191b" : "#f6f7fa",
    },

    chatArea: {
      flex: 1,
      maxWidth: 610,
      width: "100%",
      alignSelf: "center",
    },

    scrollContent: {
      paddingHorizontal: 12,
      paddingBottom: 18,
      paddingTop: 20,
    },

    placeholderText: {
      color: isDark ? "#b2c8b6" : "#689c77",
      fontSize: 17,
      fontWeight: "500",
    },

    bubbleRow: {
      flexDirection: "row",
      marginBottom: 15,
      alignItems: "flex-end",
    },

    bubbleLeft: { alignSelf: "flex-start" },
    bubbleRight: { alignSelf: "flex-end", flexDirection: "row-reverse" },

    bubble: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 18,
      maxWidth: "80%",
      marginHorizontal: 6,
    },

    bubbleAssistant: { backgroundColor: isDark ? "#28292f" : "#ececf0" },
    bubbleUser: {
      backgroundColor: isDark
        ? "rgba(203,120,255,0.22)"
        : "rgba(150,105,250,0.18)",
    },

    bubbleAssistantText: {
      color: isDark ? "#f2f7ea" : "#222",
      fontSize: 16.3,
      lineHeight: 22,
    },

    bubbleUserText: {
      color: isDark ? "#fff" : "#432d57",
      fontSize: 16.3,
      lineHeight: 22,
    },

    bubbleAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },

    inputBarOuter: {
      paddingHorizontal: 10,
      backgroundColor: "transparent",
    },

    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#232435" : "#ffffff",
      borderRadius: 30,
      paddingLeft: 16,
      paddingRight: 6,
      paddingVertical: 8,
      elevation: 3,
    },

    input: {
      flex: 1,
      fontSize: 16.5,
      color: isDark ? "#f2f8f1" : "#222a2c",
    },

    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#9654fa",
    },

    sendActive: { opacity: 1 },
    sendDisabled: { opacity: 0.4 },

    sendButtonText: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "bold",
    },
  });
}
