// app/screens/HistoryScreen.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import BrandHeader from "@/components/brand-header";
import { useAppTheme } from "@/context/theme";
import { useAuth } from "@/context/auth";
import {
  listConversations,
  getConversation,
  deleteConversation,
  deleteAllConversations,
} from "@/constants/api";
import { Ionicons } from "@expo/vector-icons";

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
    if (!user?.email || !selectedConvo) return;
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
              await deleteConversation(user.email, selectedConvo);
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
    if (!user?.email) return;
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
              await deleteAllConversations(user.email);
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
      const data: any = await sendMessageToAi(
        user.email,
        textToSend,
        selectedConvo,
      );

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

  // Theme colors
  const primary = "#2ecc40";
  const accent = theme === "dark" ? "#6ee7b7" : "#388e3c";

  // UPDATED BACKGROUND COLOR (MATCH SIGNIN / SIGNUP)
  const bgLight = theme === "dark" ? "#0f0f10" : "#f6f7fa";

  const cardBg = theme === "dark" ? "#222428" : "#fff";

  return (
    <View style={{ flex: 1, backgroundColor: bgLight }}>
      <BrandHeader />

      {/* List/History View */}
      {!selectedConvo ? (
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: accent,
              textAlign: "center",
              fontSize: 21,
              fontWeight: "bold",
              marginTop: 28,
              letterSpacing: 0.2,
            }}
          >
            Your Chat History
          </Text>

          <Pressable
            style={{
              alignSelf: "center",
              backgroundColor: "#E53935",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 22,
              marginTop: 12,
              marginBottom: 8,
              elevation: 3,
            }}
            onPress={handleDeleteAll}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
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
              contentContainerStyle={{
                paddingHorizontal: 18,
                paddingBottom: 20,
              }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    marginVertical: 9,
                    borderRadius: 18,
                    backgroundColor:
                      selectedConvo === item.conversation_id ? primary : cardBg,
                    elevation: 3,
                    shadowColor: "#222",
                    shadowOpacity: 0.07,
                    shadowRadius: 3,
                    borderWidth: 1.5,
                    borderColor:
                      selectedConvo === item.conversation_id
                        ? primary
                        : theme === "dark"
                          ? "#333"
                          : "#e8efea",
                  }}
                  onPress={() => handleSelectConversation(item.conversation_id)}
                  activeOpacity={0.82}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 18,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: primary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 11,
                      }}
                    >
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={22}
                        color="#fff"
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color:
                            selectedConvo === item.conversation_id
                              ? "#fff"
                              : accent,
                          fontSize: 16,
                          fontWeight:
                            selectedConvo === item.conversation_id
                              ? "bold"
                              : "600",
                        }}
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
                <Text
                  style={{
                    color: theme === "dark" ? "#fff" : "#666",
                    textAlign: "center",
                    opacity: 0.7,
                    marginTop: 50,
                  }}
                >
                  No chat conversations yet.
                </Text>
              }
            />
          )}
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: bgLight }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={120}
        >
          {/* Top bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              paddingHorizontal: 18,
              borderBottomWidth: 1,
              borderBottomColor: theme === "dark" ? "#222" : "#e0e0e0",
              backgroundColor:
                theme === "dark" ? "rgba(44,204,64,0.13)" : "#e9fbee",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                onPress={handleBack}
                style={{
                  marginRight: 7,
                  padding: 7,
                  borderRadius: 25,
                  backgroundColor: theme === "dark" ? primary : "#cdf3e4",
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={23}
                  color={theme === "dark" ? "#fff" : accent}
                />
              </Pressable>

              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: accent,
                  marginLeft: 3,
                }}
              >
                Conversation
              </Text>
            </View>

            <Pressable
              onPress={handleDeleteConvo}
              style={{
                paddingHorizontal: 17,
                paddingVertical: 7,
                borderRadius: 22,
                backgroundColor: "#E53935",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
                <Ionicons name="trash-bin-outline" size={15} /> Delete
              </Text>
            </Pressable>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, padding: 14, backgroundColor: bgLight }}
            contentContainerStyle={{
              paddingBottom: 100,
            }}
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
              <Text
                style={{
                  color: theme === "dark" ? "#fff" : "#444",
                  textAlign: "center",
                  opacity: 0.7,
                  marginTop: 56,
                }}
              >
                No messages in this thread.
              </Text>
            )}

            {messages.map((m, idx) => (
              <View
                key={idx}
                style={{
                  marginBottom: 16,
                  padding: 14,
                  borderRadius: 15,
                  backgroundColor:
                    m.role === "user"
                      ? theme === "dark"
                        ? "#263238"
                        : "#cdeee2"
                      : m.role === "assistant"
                        ? theme === "dark"
                          ? "#17803b"
                          : "#fff"
                        : theme === "dark"
                          ? "#333"
                          : "#e7e7e7",
                  borderLeftWidth: 5,
                  borderLeftColor:
                    m.role === "assistant"
                      ? primary
                      : m.role === "user"
                        ? "#0288D1"
                        : "#9e9e9e",
                }}
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
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      fontWeight: "bold",
                      color:
                        m.role === "user"
                          ? "#0288D1"
                          : m.role === "assistant"
                            ? primary
                            : "#9e9e9e",
                    }}
                  >
                    {m.role === "assistant"
                      ? "Assistant"
                      : m.role.charAt(0).toUpperCase() + m.role.slice(1)}
                  </Text>
                </View>

                <Text
                  style={{
                    color: theme === "dark" ? "#fff" : "#1a242a",
                    fontSize: 16,
                    lineHeight: 22,
                    marginTop: 3,
                  }}
                >
                  {m.message}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input bar */}
          <View
            style={{
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: theme === "dark" ? "#122" : "#e6eef4",
              backgroundColor: theme === "dark" ? "#071815" : "#fff",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message..."
                placeholderTextColor={theme === "dark" ? "#9aa" : "#9aa"}
                style={{
                  flex: 1,
                  backgroundColor: theme === "dark" ? "#071a12" : "#f6fbf8",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 22,
                  fontSize: 15,
                  color: theme === "dark" ? "#fff" : "#0b3a28",
                }}
                multiline
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (inputText.trim()) handleSendMessage();
                }}
              />

              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={sending || inputText.trim().length === 0}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    inputText.trim().length === 0 ? "#9ee6b1" : primary,
                  opacity: inputText.trim().length === 0 ? 0.6 : 1,
                }}
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
