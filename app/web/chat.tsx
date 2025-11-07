import BrandHeader from "@/components/brand-header";
import HistoryPanel from "@/components/web/history-panel";
import { useAppTheme } from "@/context/theme";
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
} from "react-native";
import { useAuth } from "@/context/auth";
import {
  sendMessage,
  startConversation,
  getConversation,
  listConversations,
} from "@/constants/api";

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
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined,
  );
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputBarHeight, setInputBarHeight] = useState(56);
  const [isHistoryPanelVisible, setHistoryPanelVisible] = useState(true);

  // Load conversation list on mount/user change
  useEffect(() => {
    fetchConvoList();
  }, [user?.email]);

  // Scroll-to-end on new messages
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    const willShow = Keyboard.addListener("keyboardWillShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const willHide = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardHeight(0);
    });
    const didShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const didHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      willShow.remove();
      willHide.remove();
      didShow.remove();
      didHide.remove();
    };
  }, []);

  const bottomOffset = Platform.OS === "web" ? 0 : Math.max(0, keyboardHeight);

  // Fetch list of conversations
  async function fetchConvoList() {
    if (!user?.email) return;
    try {
      const data = await listConversations(user.email);
      setConversations(data.conversations || []);
    } catch (e) {
      setConversations([]);
    }
  }

  // Select and load full conversation thread from history
  async function handleSelectConversation(conversation_id: string) {
    setSelectedConvo(conversation_id);
    setMessages([]);
    setLoading(true);
    try {
      if (user?.email) {
        const data = await getConversation(user.email, conversation_id);
        // Convert backend format to Msg[]
        setMessages(
          (data?.messages || []).map((m: any, idx: number) => ({
            id: idx.toString(),
            sender: m.role === "assistant" ? "assistant" : "user",
            text: m.message,
          })),
        );
        setConversationId(conversation_id);
      }
    } catch (e) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  // Start a new conversation
  const handleStartConversation = async () => {
    if (!user?.email) return;
    try {
      const data = await startConversation(user.email);
      setConversationId(data.conversation_id);
      setMessages([]);
      setSelectedConvo(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Send new message in current or new conversation
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
    } finally {
      setLoading(false);
    }
  };

  // Mobile
  if (Platform.OS !== "web") {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={inputBarHeight}
      >
        <View style={styles.container}>
          <BrandHeader
            onToggleHistory={() => setHistoryPanelVisible((v) => !v)}
          />
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.chatContent,
              { paddingBottom: inputBarHeight + bottomOffset + 8 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === "assistant"
                    ? styles.assistantRow
                    : styles.userRow,
                ]}
              >
                {msg.sender === "assistant" && (
                  <View style={styles.avatarWrapper}>
                    <Image source={assistantAvatar} style={styles.avatar} />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    msg.sender === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{msg.text}</Text>
                </View>
                {msg.sender === "user" && (
                  <View style={styles.avatarWrapper}>
                    <Image source={userAvatar} style={styles.avatar} />
                  </View>
                )}
              </View>
            ))}
            {loading && (
              <Text
                style={[styles.bubbleText, { opacity: 0.65, marginLeft: 16 }]}
              >
                Thinking...
              </Text>
            )}
          </ScrollView>
          <View
            style={styles.inputBarWrapper}
            onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
          >
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message"
                placeholderTextColor={theme === "dark" ? "#bcd" : "#6B7280"}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Web layout: history panel and chat area
  return (
    <View style={styles.container}>
      <BrandHeader onToggleHistory={() => setHistoryPanelVisible((v) => !v)} />
      <View style={{ flex: 1, flexDirection: "row" }}>
        {isHistoryPanelVisible && (
          <View
            style={{
              width: 320,
              borderRightWidth: 1,
              borderRightColor: "#dbe6db",
            }}
          >
            <HistoryPanel
              conversations={conversations}
              selectedId={selectedConvo}
              onSelect={handleSelectConversation}
              onStartNewConversation={handleStartConversation}
            />
          </View>
        )}
        <View style={{ flex: 1, position: "relative" }}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.chatContent,
              { paddingBottom: inputBarHeight + 12 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.sender === "assistant"
                    ? styles.assistantRow
                    : styles.userRow,
                ]}
              >
                {msg.sender === "assistant" && (
                  <View style={styles.avatarWrapper}>
                    <Image source={assistantAvatar} style={styles.avatar} />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    msg.sender === "assistant"
                      ? styles.assistantBubble
                      : styles.userBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{msg.text}</Text>
                </View>
                {msg.sender === "user" && (
                  <View style={styles.avatarWrapper}>
                    <Image source={userAvatar} style={styles.avatar} />
                  </View>
                )}
              </View>
            ))}
            {loading && (
              <Text
                style={[styles.bubbleText, { opacity: 0.65, marginLeft: 16 }]}
              >
                Thinking...
              </Text>
            )}
          </ScrollView>
          <View
            style={styles.inputBarWrapper}
            onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
          >
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type your message"
                placeholderTextColor={theme === "dark" ? "#bcd" : "#6B7280"}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Text style={styles.sendButtonText}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#181a1b" : "#f4f7f9",
    },
    chatContent: {
      padding: 18,
      paddingBottom: 13,
    },
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 14,
    },
    assistantRow: { justifyContent: "flex-start", alignSelf: "flex-start" },
    userRow: {
      justifyContent: "flex-end",
      alignSelf: "flex-end",
      flexDirection: "row-reverse",
    },
    avatarWrapper: { marginHorizontal: 6 },
    avatar: {
      width: 27,
      height: 27,
      borderRadius: 13,
      resizeMode: "contain",
      marginBottom: 2,
    },
    bubble: {
      maxWidth: "77%",
      borderRadius: 14,
      paddingVertical: 13,
      paddingHorizontal: 17,
      marginBottom: 2,
      minWidth: 60,
    },
    assistantBubble: {
      backgroundColor: isDark ? "#253233" : "#eaf6ee",
      borderWidth: 1.7,
      borderColor: "#3fcc8b",
      alignSelf: "flex-start",
    },
    userBubble: {
      backgroundColor: isDark ? "#492267" : "#dbe6ff",
      borderWidth: 1.6,
      borderColor: "#7e82fd",
      alignSelf: "flex-end",
    },
    bubbleText: { fontSize: 16.2, color: isDark ? "#dfeffe" : "#204433" },
    inputBarWrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
      borderTopWidth: 0,
      paddingBottom: 3,
      zIndex: 10,
    },
    inputBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#213e22" : "#fff",
      borderRadius: 24,
      paddingHorizontal: 11,
      paddingVertical: 7,
      elevation: 2,
      shadowColor: "#1a2e1c",
      shadowOpacity: 0.09,
    },
    input: {
      flex: 1,
      backgroundColor: "transparent",
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      color: isDark ? "#cbf8e5" : "#153920",
      marginRight: 8,
      borderWidth: 0,
    },
    sendButton: {
      backgroundColor: "#00c853",
      borderRadius: 22,
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 2,
      opacity: 1,
    },
    sendButtonText: { color: "#fff", fontSize: 25, fontWeight: "bold" },
  });
}
