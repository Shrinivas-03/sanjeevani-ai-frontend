import BrandHeader from "@/components/brand-header";
import { sendMessage } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const watermarkLogo = require("../../assets/images/logo.png");
const assistantAvatar = require("../../assets/images/icon.png");
const userAvatar = require("../../assets/images/logo.png");

type Msg = { id: string; sender: "user" | "assistant"; text: string };

export default function WebChatPage() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const styles = getStyles(theme);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;

  // Thinking animation
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

  // Auto scroll
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // -----------------------------
  // Core conversation logic (kept identical behavior)
  // -----------------------------
  const handleSend = async () => {
    if (!input.trim() || loading || !user?.email) return;

    const text = input.trim();

    // Add user's message to UI
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}`, sender: "user", text },
    ]);

    setInput("");
    setLoading(true);

    try {
      // API call (unchanged)
      const data = await sendMessage(user.email, text, conversationId);

      // persist conversation id returned by API
      setConversationId(data.conversation_id);

      const reply = data.response ?? "No response available";

      // Add assistant reply to UI
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}_assistant`, sender: "assistant", text: reply },
      ]);
    } catch (err) {
      // preserve same error behavior (UI message)
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}_err`,
          sender: "assistant",
          text: "Sorry, I could not process that.",
        },
      ]);
      console.error("sendMessage error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <BrandHeader />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={styles.chatContainer}>
          {/* Transparent logo watermark */}
          <Image source={watermarkLogo} style={styles.chatLogoBg} />

          {/* Messages area */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Start a conversation</Text>
                <Text style={styles.emptySubtitle}>
                  Ask anything about your health and I&apos;ll assist you.
                </Text>
              </View>
            )}

            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.msgRow,
                  msg.sender === "assistant" ? styles.leftAlign : styles.rightAlign,
                ]}
              >
                {msg.sender === "assistant" && (
                  <Image source={assistantAvatar} style={styles.avatar} />
                )}

                <View
                  style={[
                    styles.chatBubble,
                    msg.sender === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatText,
                      msg.sender === "assistant"
                        ? styles.assistantText
                        : styles.userText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>

                {msg.sender === "user" && (
                  <Image source={userAvatar} style={styles.avatar} />
                )}
              </View>
            ))}

            {loading && (
              <View style={[styles.msgRow, styles.leftAlign]}>
                <Image source={assistantAvatar} style={styles.avatar} />
                <View style={[styles.chatBubble, styles.assistantBubble]}>
                  <Text style={styles.assistantText}>
                    Thinking...
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Message Sanjeevani AI..."
                placeholderTextColor={theme === "dark" ? "#86c49d" : "#6b9885"}
                multiline
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={!input.trim() || loading}
                style={[
                  styles.sendBtn,
                  (!input.trim() || loading) && styles.sendDisabled,
                ]}
              >
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getStyles(theme: string) {
  const isDark = theme === "dark";
  // Same accent family as prediction/login
  const primaryGreen = "#22c55e";
  const userBubbleGreen = "#16a34a";

  return StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: isDark ? "#020617" : "#eef9f2", // soft mint for light
    },
    kav: {
      flex: 1,
    },
    chatContainer: {
      flex: 1,
      position: "relative",
      paddingHorizontal: 8,
      paddingBottom: 8,
    },

    // watermark style (transparent, behind content)
    chatLogoBg: {
      position: "absolute",
      top: "28%",
      alignSelf: "center",
      width: 220,
      height: 220,
      opacity: isDark ? 0.06 : 0.04,
      resizeMode: "contain",
      zIndex: 0,
      tintColor: isDark ? undefined : "#a5d6ba",
    },

    scrollArea: {
      paddingHorizontal: 6,
      paddingTop: 10,
      paddingBottom: 12,
    },
    msgRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginVertical: 6,
      width: "100%",
    },
    leftAlign: {
      justifyContent: "flex-start",
    },
    rightAlign: {
      flexDirection: "row-reverse",
      justifyContent: "flex-end",
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginHorizontal: 7,
      backgroundColor: isDark ? "#022c22" : "#e0f7eb",
    },
    chatBubble: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      maxWidth: "78%",
      borderRadius: 18,
    },
    assistantBubble: {
      backgroundColor: isDark ? "#0b1f16" : "#ffffff",
      borderWidth: 1.2,
      borderColor: isDark ? "#22c55e80" : "#bbf7d0",
      borderTopLeftRadius: 8,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    userBubble: {
      backgroundColor: isDark ? primaryGreen : userBubbleGreen,
      borderRadius: 18,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.09,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    chatText: {
      fontSize: 15.5,
      lineHeight: 22,
    },
    assistantText: {
      color: isDark ? "#dcffee" : "#064e3b",
      fontWeight: "500",
    },
    userText: {
      color: "#ffffff",
      fontWeight: "600",
    },

    emptyState: {
      alignItems: "center",
      marginTop: 40,
      marginBottom: 10,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#e5e7eb" : "#064e3b",
      marginBottom: 4,
    },
    emptySubtitle: {
      fontSize: 14,
      color: isDark ? "#9ca3af" : "#6b7280",
      textAlign: "center",
      maxWidth: 320,
    },

    inputWrapper: {
      paddingHorizontal: 4,
      paddingBottom: Platform.OS === "ios" ? 6 : 4,
      paddingTop: 4,
    },
    inputBox: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      backgroundColor: isDark ? "#020817" : "#ffffff",
      borderRadius: 30,
      paddingLeft: 16,
      paddingVertical: 6,
      borderWidth: 1.5,
      borderColor: isDark ? "#14532d" : "#bbf7d0",
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.4 : 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: isDark ? "#e1f9e5" : "#064e3b",
      paddingVertical: 6,
      paddingRight: 8,
    },
    sendBtn: {
      width: 44,
      height: 44,
      backgroundColor: primaryGreen,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 5,
    },
    sendDisabled: {
      opacity: 0.4,
    },
    sendIcon: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 22,
      marginBottom: 1,
    },
  });
}
