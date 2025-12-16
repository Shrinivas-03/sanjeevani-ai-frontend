import BrandHeader from "@/components/brand-header";
import { sendMessage } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

type Msg = {
  id: string;
  sender: "user" | "assistant";
  text: string;
};

export default function WebChatPage() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const styles = getStyles(theme);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const scrollViewRef = useRef<ScrollView>(null);

  /* ================= RESET CHAT ON TAB FOCUS ================= */
  useFocusEffect(
    useCallback(() => {
      setMessages([]);
      setInput("");
      setConversationId(undefined);
      setLoading(false);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [])
  );

  /* ================= Message appear animation ================= */
  const animMap = useRef<Record<string, Animated.Value>>({}).current;

  const getAnim = (id: string) => {
    if (!animMap[id]) {
      animMap[id] = new Animated.Value(0);
      Animated.timing(animMap[id], {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
    return animMap[id];
  };

  /* ================= Thinking animation ================= */
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) return;

    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 350,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 120);
    const a3 = pulse(dot3, 240);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [loading]);

  /* Auto scroll */
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || !user?.email) return;

    const text = input.trim();
    setInput("");

    setMessages((p) => [...p, { id: Date.now().toString(), sender: "user", text }]);
    setLoading(true);

    try {
      const res = await sendMessage(user.email, text, conversationId);
      setConversationId(res.conversation_id);

      setMessages((p) => [
        ...p,
        {
          id: Date.now().toString() + "_a",
          sender: "assistant",
          text: res.response ?? "No response available",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <BrandHeader />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 70}
      >
        <View style={styles.chatContainer}>
          <Image source={watermarkLogo} style={styles.chatLogoBg} />

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollArea}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              const anim = getAnim(msg.id);

              return (
                <Animated.View
                  key={msg.id}
                  style={[
                    styles.msgWrapper,
                    isUser ? styles.rightMsg : styles.leftMsg,
                    {
                      opacity: anim,
                      transform: [
                        {
                          translateY: anim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [12, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.icon}>{isUser ? "👤" : "🤖"}</Text>

                  <View
                    style={[
                      styles.chatBubble,
                      isUser ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text style={isUser ? styles.userText : styles.assistantText}>
                      {msg.text}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}

            {loading && (
              <View style={[styles.msgWrapper, styles.leftMsg]}>
                <Text style={styles.icon}>🤖</Text>
                <View style={styles.assistantBubble}>
                  <View style={styles.thinkingRow}>
                    <Animated.View style={[styles.dot, { opacity: dot1 }]} />
                    <Animated.View style={[styles.dot, { opacity: dot2 }]} />
                    <Animated.View style={[styles.dot, { opacity: dot3 }]} />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputWrapper}>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Message Sanjeevani AI..."
                placeholderTextColor={theme === "dark" ? "#86c49d" : "#bfead1"}
                multiline
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ======================= STYLES ======================= */

function getStyles(theme: string) {
  const isDark = theme === "dark";

  return StyleSheet.create({
    wrapper: { flex: 1, backgroundColor: isDark ? "#020617" : "#dae5e5ff" },
    chatContainer: { flex: 1, paddingHorizontal: 8 },

    chatLogoBg: {
      position: "absolute",
      top: "30%",
      alignSelf: "center",
      width: 220,
      height: 220,
      opacity: isDark ? 0.06 : 0.04,
      resizeMode: "contain",
    },

    scrollArea: { paddingVertical: 12, paddingBottom: 20 },

    msgWrapper: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginVertical: 6,
      maxWidth: "85%",
    },

    leftMsg: { alignSelf: "flex-start" },
    rightMsg: { alignSelf: "flex-end", flexDirection: "row-reverse" },

    icon: { fontSize: 22, marginHorizontal: 6 },

    chatBubble: { paddingHorizontal: 14, paddingVertical: 14 },

    userBubble: {
      backgroundColor: isDark ? "#1d8faf4c" : "#20603df4",
      borderRadius: 18,
      borderTopRightRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "#6c5ad4f5" : "#dce8e0ff",
    },

    assistantBubble: {
      backgroundColor: isDark ? "#1d8faf4c" : "#20603df4",
      borderRadius: 18,
      borderTopLeftRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "#6c5ad4f5" : "#bbf7d0",
    },

    userText: { color: "#ffffff", fontWeight: "600", fontSize: 15.5 },
    assistantText: { color: isDark ? "#dcffee" : "#e2eeefff", fontSize: 15.5 },

    thinkingRow: { flexDirection: "row", alignItems: "center" },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? "#dcffee" : "#064e3b",
      marginHorizontal: 3,
    },

    inputWrapper: { paddingVertical: 8 },
    inputBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(42,183,222,0.35)" : "rgba(3,42,6,0.9)",
      borderRadius: 28,
      paddingLeft: 18,
      borderWidth: 1.5,
      borderColor: isDark ? "#45c7c7ff" : "#bbf7d0",
    },
    input: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 8,
      color: isDark ? "#e1f9e5" : "#e9fff1",
    },
    sendBtn: {
      width: 44,
      height: 44,
      backgroundColor: "#22c55e",
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
    },
    sendIcon: { color: "#fff", fontSize: 22, fontWeight: "800" },
  });
}
