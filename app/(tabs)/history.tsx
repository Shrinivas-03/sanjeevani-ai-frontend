// app/screens/HistoryScreen.tsx
import BrandHeader from "@/components/brand-header";
import {
  deleteAllConversations,
  deleteConversation,
  getConversation,
  listConversations,
} from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
const AI_REMEDY_ENDPOINT = `${API_BASE}/api/rag/ai-remedy`;

async function safeParseResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return await res.json();
  }
  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    return { __raw_text: txt };
  }
}

async function sendMessageToAi(
  email: string,
  query: string,
  conversation_id?: string | null,
) {
  const payload = {
    email,
    query,
    conversation_id: conversation_id ?? null,
    exclude_prediction_context: true,
  };

  const res = await fetch(AI_REMEDY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return safeParseResponse(res);
}

export default function HistoryScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [convos, setConvos] = useState<
    { conversation_id: string; preview: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant" | "system"; message: string }[]
  >([]);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchConvoList();
  }, [user?.email]);

  useEffect(() => {
    if (scrollViewRef.current && messages.length) {
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch {}
      }, 100);
    }
  }, [messages]);

  const fetchConvoList = async () => {
    setLoading(true);
    try {
      if (user?.email) {
        const data = await listConversations(user.email);
        const convs = data?.conversations ?? data?.data?.conversations ?? [];
        setConvos(Array.isArray(convs) ? convs : []);
      }
    } catch (e) {
      Alert.alert("Error", "Could not load conversations.");
    } finally {
      setLoading(false);
    }
  };

  async function handleSelectConversation(conversation_id: string) {
    setSelectedConvo(conversation_id);
    setMessages([]);
    setLoading(true);
    try {
      if (user?.email) {
        const data = await getConversation(user.email, conversation_id);
        const msgs = data?.messages ?? data?.data?.messages ?? [];

        setMessages(
          Array.isArray(msgs)
            ? msgs.map((m: any) => ({
                role:
                  m.role === "assistant" || m.role === "user"
                    ? m.role
                    : (m.role ?? "assistant"),
                message: m.message ?? m.text ?? "",
              }))
            : [],
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not load chat conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteConvo() {
    const email = user?.email;
    if (!email || !selectedConvo) return;
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this chat?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteConversation(email, selectedConvo);
              setSelectedConvo(null);
              setMessages([]);
              await fetchConvoList();
              Alert.alert("Deleted", "Conversation deleted.");
            } catch (e) {
              Alert.alert("Error", "Could not delete conversation.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

  async function handleDeleteAll() {
    const email = user?.email;
    if (!email) return;
    Alert.alert(
      "Delete All Chats",
      "Delete all chat history for your account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAllConversations(email);
              setSelectedConvo(null);
              setMessages([]);
              await fetchConvoList();
              Alert.alert("Deleted", "All chat history deleted.");
            } catch (e) {
              Alert.alert("Error", "Could not delete all conversations.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  }

  function handleBack() {
    setSelectedConvo(null);
    setMessages([]);
    setInputText("");
  }

  async function handleSendMessage() {
    if (!inputText.trim() || !user?.email || !selectedConvo) return;
    const textToSend = inputText.trim();

    setMessages((prev) => [...prev, { role: "user", message: textToSend }]);
    setInputText("");
    setSending(true);

    try {
      // Send as fresh request (conversation_id = null) to avoid including
      // previous prediction content when generating the assistant reply.
      const data: any = await sendMessageToAi(user.email, textToSend, null);

      const assistantReply =
        data?.response ??
        data?.data?.response ??
        data?.choices?.[0]?.message?.content ??
        data?.reply ??
        data?.message ??
        "";

      if (assistantReply && assistantReply !== "") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", message: String(assistantReply) },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            message:
              "Assistant did not return a reply or returned an unexpected format.",
          },
        ]);
      }
    } catch (e) {
      console.error("sendMessage error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", message: "Sorry — couldn't send message." },
      ]);
    } finally {
      setSending(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 160);
    }
  }

  // THEME TOKENS (matched to chat/prediction)
  const primary = "#22c55e";
  const accent = theme === "dark" ? "#9EBCA0" : "#0b3d91";
  const bgLight = theme === "dark" ? "#020617" : "#eef9f2";
  const cardBg =
    theme === "dark" ? "rgba(26,29,28,0.42)" : "rgba(255,255,255,0.92)";
  const topBarBg = theme === "dark" ? "rgba(44,204,64,0.08)" : "#e9fbee";

  // styles derived for component
  const styles = makeStyles(theme, {
    primary,
    accent,
    bgLight,
    cardBg,
    topBarBg,
  });

  return (
    <View style={styles.screen}>
      <BrandHeader />

      {/* List/History View */}
      {!selectedConvo ? (
        <View style={styles.container}>
          <Text style={styles.title}>Your Chat History</Text>

          <Pressable style={styles.deleteAllBtn} onPress={handleDeleteAll}>
            <Text style={styles.deleteAllText}>
              <Ionicons name="trash-outline" size={16} /> Delete All Chats
            </Text>
          </Pressable>

          {loading && (
            <ActivityIndicator
              size="large"
              style={{ marginTop: 42 }}
              color={primary}
            />
          )}

          {!loading && (
            <FlatList
              data={convos}
              keyExtractor={(item) => item.conversation_id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.convoItem,
                    selectedConvo === item.conversation_id &&
                      styles.convoItemActive,
                  ]}
                  onPress={() => handleSelectConversation(item.conversation_id)}
                  activeOpacity={0.82}
                >
                  <View style={styles.convoInner}>
                    <View style={styles.convoIcon}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={22}
                        color="#fff"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.convoPreview,
                          selectedConvo === item.conversation_id &&
                            styles.convoPreviewActive,
                        ]}
                        numberOfLines={2}
                      >
                        {item.preview}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward-outline"
                      size={21}
                      color="#bbb"
                      style={{ marginLeft: 9 }}
                    />
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No chat conversations yet.</Text>
              }
            />
          )}
        </View>
      ) : (
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: bgLight }]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Top bar */}
          <View style={[styles.topBar, { backgroundColor: topBarBg }]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable onPress={handleBack} style={styles.backBtn}>
                <Ionicons
                  name="arrow-back"
                  size={13}
                  color={theme === "dark" ? "#fff" : accent}
                />
              </Pressable>

              <Text style={styles.conversationTitle}>Conversation</Text>
            </View>

            <Pressable onPress={handleDeleteConvo} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>
                <Ionicons name="trash-bin-outline" size={15} /> Delete
              </Text>
            </Pressable>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, padding: 14, backgroundColor: bgLight }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {loading && (
              <ActivityIndicator
                size="large"
                style={{ marginTop: 28 }}
                color={primary}
              />
            )}

            {!loading && messages.length === 0 && (
              <Text style={styles.noMessagesText}>
                No messages in this thread.
              </Text>
            )}

            {messages.map((m, idx) => (
              <View
                key={idx}
                style={[
                  styles.messageCard,
                  m.role === "user"
                    ? styles.userCard
                    : m.role === "assistant"
                      ? styles.assistantCard
                      : styles.systemCard,
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name={
                      m.role === "assistant"
                        ? "logo-react"
                        : m.role === "user"
                          ? "person"
                          : "help-circle"
                    }
                    size={18}
                    color={
                      m.role === "assistant"
                        ? primary
                        : m.role === "user"
                          ? "#0288D1"
                          : "#9e9e9e"
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.messageRole}>
                    {m.role === "assistant"
                      ? "Assistant"
                      : m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                  </Text>
                </View>

                <Text style={styles.messageText}>{m.message}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <View style={styles.inputRow}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor={theme === "dark" ? "#9aa" : "#7b8b7b"}
                style={styles.input}
                multiline
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (inputText.trim()) handleSendMessage();
                }}
              />

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={sending || inputText.trim().length === 0}
                style={[
                  styles.sendBtn,
                  inputText.trim().length === 0 ? styles.sendBtnDisabled : null,
                ]}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

/* Styles factory so styles update with theme tokens */
function makeStyles(theme: any, tokens: any) {
  const isDark = theme === "dark";
  const { primary, accent, bgLight, cardBg, topBarBg } = tokens;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: bgLight,
    },
    container: {
      flex: 1,
      paddingHorizontal: 6,
    },
    title: {
      color: accent,
      textAlign: "center",
      fontSize: 21,
      fontWeight: "bold",
      marginTop: 28,
      letterSpacing: 0.2,
    },
    deleteAllBtn: {
      alignSelf: "center",
      backgroundColor: "#E53935",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 22,
      marginTop: 12,
      marginBottom: 8,
      elevation: 3,
    },
    deleteAllText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
    },
    listContent: {
      paddingHorizontal: 18,
      paddingBottom: 20,
    },
    convoItem: {
      marginVertical: 9,
      borderRadius: 18,
      backgroundColor: cardBg,
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.12 : 0.04,
      shadowRadius: 6,
      borderWidth: 1,
      borderColor: isDark ? "rgba(33,51,41,0.5)" : "rgba(231,249,237,0.6)",
    },
    convoItemActive: {
      backgroundColor: primary,
      borderColor: primary,
    },
    convoInner: {
      flexDirection: "row",
      alignItems: "center",
      padding: 18,
    },
    convoIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 11,
    },
    convoPreview: {
      color: accent,
      fontSize: 16,
      fontWeight: "600",
    },
    convoPreviewActive: {
      color: "#fff",
      fontWeight: "bold",
    },
    emptyText: {
      color: isDark ? "#fff" : "#666",
      textAlign: "center",
      opacity: 0.75,
      marginTop: 50,
    },

    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#b243e5ff" : "#4bc49aff",
      backgroundColor: topBarBg,
    },
    backBtn: {
      marginRight: 7,
      padding: 7,
      borderRadius: 25,
      backgroundColor: isDark ? primary : "#cdf3e4",
    },
    conversationTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: accent,
      marginLeft: 3,
    },
    deleteBtn: {
      paddingHorizontal: 17,
      paddingVertical: 7,
      borderRadius: 22,
      backgroundColor: "#E53935",
    },
    deleteBtnText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
    },

    noMessagesText: {
      color: isDark ? "#fff" : "#444",
      textAlign: "center",
      opacity: 0.75,
      marginTop: 56,
    },

    messageCard: {
      marginBottom: 16,
      padding: 14,
      borderRadius: 15,
      borderLeftWidth: 5,
    },
    userCard: {
      backgroundColor: isDark ? "rgba(38,50,56,0.6)" : "#cdeee2",
      borderLeftColor: "#0288D1",
    },
    assistantCard: {
      backgroundColor: isDark ? "rgba(23,128,59,0.9)" : "#fff",
      borderLeftColor: primary,
    },
    systemCard: {
      backgroundColor: isDark ? "#333" : "#e7e7e7",
      borderLeftColor: "#9e9e9e",
    },
    messageRole: {
      fontWeight: "700",
      color: isDark ? "#e7ffe9" : primary,
    },
    messageText: {
      color: isDark ? "#fff" : "#1a242a",
      fontSize: 16,
      lineHeight: 22,
      marginTop: 8,
    },

    inputBar: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? "#122" : "#e6eef4",
      backgroundColor: isDark ? "#071815" : "#fff",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: isDark ? "#1f503cea" : "#f6fbf8",
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 22,
      fontSize: 15,
      color: isDark ? "#fff" : "#0b3a28",
    },
    sendBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
    },
    sendBtnDisabled: {
      backgroundColor: "#11e993ff",
      opacity: 0.6,
    },
  });
}
