import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Keyboard,
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
import { sendMessage, startConversation } from "@/constants/api";

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

  // Animation for "Thinking..."
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

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Core conversation logic
  const handleSend = async () => {
    if (!input.trim() || loading || !user?.email) return;
    const userText = input.trim();
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}`, sender: "user", text: userText },
    ]);
    setInput("");
    setLoading(true);
    try {
      const data = await sendMessage(user.email, userText, conversationId);
      setConversationId(data.conversation_id);
      const assistantText = data.response ?? "No response text.";
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}-a`, sender: "assistant", text: assistantText },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-e`,
          sender: "assistant",
          text: "Sorry, I could not fetch a remedy at this time.",
        },
      ]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  function renderChatMessages() {
    return (
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={{ flex: 1, alignItems: "center", marginVertical: 36 }}>
            <Text style={styles.placeholderText}>Start a conversation!</Text>
          </View>
        )}
        {messages.map((msg, idx) => (
          <View
            key={msg.id}
            style={[
              styles.bubbleRow,
              msg.sender === "assistant"
                ? styles.bubbleLeft
                : styles.bubbleRight,
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
  }

  const mainChat = (
    <SafeAreaView style={styles.outerBg}>
      <BrandHeader />
      <View style={styles.flexBox}>
        <KeyboardAvoidingView
          style={styles.innerBoxNoGap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={styles.chatArea}>{renderChatMessages()}</View>
          {/* Input bar absolutely at the bottom, no extra margin */}
          <View style={styles.inputBarOuter}>
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
                activeOpacity={0.82}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );

  return mainChat;
}

function getStyles(theme: string) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    outerBg: {
      flex: 1,
      backgroundColor: isDark ? "#17191b" : "#f6f7fa",
      alignItems: "stretch",
      justifyContent: "flex-end",
      minHeight: "100%",
      width: "100%",
    },
    flexBox: {
      flex: 1,
      width: "100%",
      alignItems: "stretch",
      justifyContent: "flex-end",
    },
    innerBoxNoGap: {
      flex: 1,
      width: "100%",
      justifyContent: "flex-end",
      alignItems: "stretch",
    },
    chatArea: {
      flex: 1,
      width: "100%",
      maxWidth: 610,
      alignSelf: "center",
      paddingBottom: 0,
      marginBottom: 0,
      justifyContent: "flex-end",
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "flex-end",
      paddingTop: 20,
      paddingHorizontal: 10,
      paddingBottom: 8,
    },
    placeholderText: {
      color: isDark ? "#b2c8b6" : "#689c77",
      fontSize: 17,
      fontWeight: "500",
      opacity: 0.85,
      marginTop: 8,
      textAlign: "center",
    },
    bubbleRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 15,
      paddingHorizontal: 3,
      maxWidth: "100%",
    },
    bubbleLeft: {
      justifyContent: "flex-start",
      alignSelf: "flex-start",
    },
    bubbleRight: {
      flexDirection: "row-reverse",
      alignSelf: "flex-end",
      justifyContent: "flex-end",
    },
    bubble: {
      paddingHorizontal: 16,
      paddingVertical: 11,
      minWidth: 55,
      borderRadius: 18,
      maxWidth: "82%",
      elevation: 2,
      marginHorizontal: 4,
    },
    bubbleAssistant: {
      backgroundColor: isDark ? "#28292f" : "#ececf0",
      borderTopLeftRadius: 7,
      borderBottomLeftRadius: 7,
      alignSelf: "flex-start",
    },
    bubbleUser: {
      backgroundColor: isDark
        ? "rgba(203,120,255,0.22)"
        : "rgba(150,105,250,0.18)",
      borderTopRightRadius: 7,
      borderBottomRightRadius: 7,
      alignSelf: "flex-end",
    },
    bubbleAssistantText: {
      color: isDark ? "#f3f7ea" : "#23282b",
      fontSize: 16.3,
      fontWeight: "500",
      lineHeight: 23,
    },
    bubbleUserText: {
      color: isDark ? "#fcf6fd" : "#453054",
      fontSize: 16.3,
      fontWeight: "500",
      lineHeight: 23,
    },
    bubbleAvatar: {
      width: 24,
      height: 24,
      borderRadius: 16,
      marginLeft: 2,
      marginRight: 2,
    },
    inputBarOuter: {
      width: "100%",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingBottom: 2, // Remove any extra padding or margin!
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#232435" : "#f7fafc",
      borderRadius: 28,
      paddingLeft: 16,
      paddingRight: 4,
      paddingVertical: 6,
      width: "97%",
      alignSelf: "center",
      elevation: 3,
      shadowColor: "#111",
      shadowOpacity: 0.08,
      shadowRadius: 5,
    },
    input: {
      flex: 1,
      backgroundColor: "transparent",
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 10,
      fontSize: 16.5,
      color: isDark ? "#f2f8f1" : "#222a2c",
      marginRight: 6,
      borderWidth: 0,
    },
    sendButton: {
      backgroundColor: "#9654fa",
      borderRadius: 22,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 1,
    },
    sendActive: { opacity: 1 },
    sendDisabled: { opacity: 0.38 },
    sendButtonText: {
      color: "#fff",
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 0,
      letterSpacing: 0.5,
    },
  });
}
