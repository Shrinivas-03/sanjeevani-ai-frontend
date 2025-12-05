// app/web/chat.tsx
import BrandHeader from "@/components/brand-header";
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
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "@/context/auth";

const assistantAvatar = require("../../assets/images/icon.png");
const userAvatar = require("../../assets/images/logo.png");

// ---------------------------
// API helpers (INTERNAL)
// ---------------------------

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
const RAG_BASE = `${API_BASE}/api/rag`;

/**
 * Safe JSON/text parser for fetch responses.
 */
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

/**
 * List conversations for an email
 * Returns { conversations: [{ conversation_id, preview }, ...] }
 */
export async function listConversationsAPI(email: string) {
  const url = `${RAG_BASE}/conversations?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { method: "GET" });
  return safeParseResponse(res);
}

/**
 * Get full conversation messages
 * Returns { messages: [{ role, message }, ...] }
 */
export async function getConversationAPI(
  email: string,
  conversation_id: string,
) {
  const url = `${RAG_BASE}/conversation/${encodeURIComponent(conversation_id)}?email=${encodeURIComponent(
    email,
  )}`;
  const res = await fetch(url, { method: "GET" });
  return safeParseResponse(res);
}

/**
 * Start or create a new conversation (use ai-remedy endpoint, backend will return conversation_id)
 * Returns { conversation_id, response }
 */
export async function startConversationAPI(email: string) {
  const url = `${RAG_BASE}/ai-remedy`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, query: "", conversation_id: null }),
  });
  return safeParseResponse(res);
}

/**
 * Send a message and get assistant reply (use ai-remedy)
 * Returns { conversation_id, response }
 */
export async function sendMessageAPI(
  email: string,
  message: string,
  conversation_id?: string | null,
) {
  const url = `${RAG_BASE}/ai-remedy`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      query: message,
      conversation_id: conversation_id ?? null,
    }),
  });
  return safeParseResponse(res);
}

/**
 * Delete conversation
 */
export async function deleteConversationAPI(
  email: string,
  conversation_id: string,
) {
  const url = `${RAG_BASE}/conversation/${encodeURIComponent(conversation_id)}?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { method: "DELETE" });
  return safeParseResponse(res);
}

/**
 * Delete all conversations
 */
export async function deleteAllConversationsAPI(email: string) {
  const url = `${RAG_BASE}/conversations?email=${encodeURIComponent(email)}`;
  const res = await fetch(url, { method: "DELETE" });
  return safeParseResponse(res);
}

// ---------------------------
// Inline Enhanced HistoryPanel
// ---------------------------

type HistoryItem = { conversation_id: string; preview?: string };

function HistoryPanel({
  conversations,
  selectedId,
  onSelect,
  onStartNewConversation,
  onRefresh,
  loading,
  theme,
}: {
  conversations: HistoryItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onStartNewConversation: () => void;
  onRefresh: () => void;
  loading: boolean;
  theme: string;
}) {
  const isDark = theme === "dark";

  return (
    <View
      style={[
        historyStyles.container,
        isDark ? historyStyles.containerDark : historyStyles.containerLight,
      ]}
    >
      <View style={historyStyles.headerRow}>
        <Text
          style={[
            historyStyles.headerTitle,
            isDark
              ? historyStyles.headerTitleDark
              : historyStyles.headerTitleLight,
          ]}
        >
          Conversations
        </Text>

        <View style={historyStyles.headerButtons}>
          <TouchableOpacity
            onPress={onRefresh}
            style={[
              historyStyles.iconBtn,
              isDark ? historyStyles.iconBtnDark : historyStyles.iconBtnLight,
            ]}
            accessibilityLabel="Refresh"
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color={isDark ? "#fff" : "#333"}
              />
            ) : (
              <Text style={isDark ? { color: "#fff" } : { color: "#333" }}>
                ⟳
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onStartNewConversation}
            style={[
              historyStyles.newChatBtn,
              isDark
                ? historyStyles.newChatBtnDark
                : historyStyles.newChatBtnLight,
            ]}
          >
            <Text style={historyStyles.newChatBtnText}>+ New Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={historyStyles.listWrap}>
        {conversations.length === 0 && !loading ? (
          <View style={historyStyles.emptyState}>
            <Text
              style={
                isDark
                  ? historyStyles.emptyTextDark
                  : historyStyles.emptyTextLight
              }
            >
              No conversations yet. Click "New Chat" to start.
            </Text>
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {conversations.map((c) => {
              const active = selectedId === c.conversation_id;
              return (
                <TouchableOpacity
                  key={c.conversation_id}
                  onPress={() => onSelect(c.conversation_id)}
                  style={[
                    historyStyles.item,
                    active ? historyStyles.itemActive : {},
                    isDark ? historyStyles.itemDark : historyStyles.itemLight,
                  ]}
                >
                  <View style={historyStyles.itemLeft}>
                    <View
                      style={[
                        historyStyles.avatarCircle,
                        active ? historyStyles.avatarActive : {},
                      ]}
                    >
                      <Text style={historyStyles.avatarLetter}>A</Text>
                    </View>
                  </View>

                  <View style={historyStyles.itemBody}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        historyStyles.itemTitle,
                        active ? historyStyles.itemTitleActive : {},
                      ]}
                    >
                      Conversation
                    </Text>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={historyStyles.itemPreview}
                    >
                      {c.preview || "No messages yet."}
                    </Text>
                  </View>

                  <View style={historyStyles.itemRight}>
                    <Text style={historyStyles.itemTime}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ---------------------------
// Web Chat Page (single-file)
// ---------------------------

type Msg = { id: string; sender: "user" | "assistant"; text: string };

export default function WebChatPage() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const styles = getStyles(theme);

  // chat state
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // conversations / history
  const [conversations, setConversations] = useState<HistoryItem[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(
    undefined,
  );
  const [historyLoading, setHistoryLoading] = useState(false);

  // UI refs / keyboard
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputBarHeight, setInputBarHeight] = useState(56);
  const [isHistoryPanelVisible, setHistoryPanelVisible] = useState(true);

  // Load conversations on mount or user change
  useEffect(() => {
    fetchConvoList();
    // reset selected when user changes
    setSelectedConvo(null);
    setConversationId(undefined);
    setMessages([]);
    setHistoryPanelVisible(true);
  }, [user?.email]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollViewRef.current) {
      try {
        scrollViewRef.current.scrollToEnd({ animated: true });
      } catch {}
    } else {
      try {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      } catch {}
    }
  }, [messages]);

  // Keyboard listeners for native devices (no effect on web)
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

  // ---------------------------
  // API usage inside component
  // ---------------------------

  async function fetchConvoList() {
    if (!user?.email) return;
    setHistoryLoading(true);
    try {
      const data: any = await listConversationsAPI(user.email);
      // Defensive: backend might return object under data.data or direct
      const convs = data?.conversations ?? data?.data?.conversations ?? [];
      // sort newest first if preview contains timestamps — otherwise keep server order
      setConversations(Array.isArray(convs) ? convs : []);
    } catch (e) {
      console.error("fetchConvoList error:", e);
      setConversations([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSelectConversation(convoId: string) {
    setSelectedConvo(convoId);
    setMessages([]);
    setLoading(true);
    // Hide history panel for a focused conversation detail view (mobile-like)
    setHistoryPanelVisible(false);
    try {
      if (!user?.email) return;
      const data: any = await getConversationAPI(user.email, convoId);
      // defensive unwrap
      const msgs = data?.messages ?? data?.data?.messages ?? [];
      // normalize to Msg[]
      const normalized: Msg[] = Array.isArray(msgs)
        ? msgs.map((m: any, idx: number) => ({
            id: `${idx}`,
            sender: m.role === "assistant" ? "assistant" : "user",
            text: m.message,
          }))
        : [];
      setMessages(normalized);
      setConversationId(convoId);

      // ensure scroll to end after messages are set
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch {}
      }, 120);
    } catch (e) {
      console.error("handleSelectConversation error:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartConversation() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const data: any = await startConversationAPI(user.email);
      const cid = data?.conversation_id ?? data?.data?.conversation_id;
      setConversationId(cid);
      setSelectedConvo(cid ?? null);
      setMessages([]);
      // hide panel and focus on new conversation
      setHistoryPanelVisible(false);
      // refresh convo list after creating
      fetchConvoList();
    } catch (e) {
      console.error("startConversation error:", e);
      Alert.alert("Error", "Could not start a new conversation.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || loading || !user?.email) return;
    const userText = input.trim();

    // append user message immediately
    setMessages((m) => [
      ...m,
      { id: `${Date.now()}`, sender: "user", text: userText },
    ]);
    setInput("");
    setLoading(true);

    try {
      const data: any = await sendMessageAPI(
        user.email,
        userText,
        conversationId,
      );
      // backend returns { conversation_id, response }
      const cid = data?.conversation_id ?? data?.data?.conversation_id;
      const assistantText =
        data?.response ?? data?.data?.response ?? "No response.";
      setConversationId(cid);
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}-a`, sender: "assistant", text: assistantText },
      ]);
      // refresh convo list so preview updates
      fetchConvoList();

      // scroll to the latest
      setTimeout(() => {
        try {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        } catch {}
      }, 140);
    } catch (e) {
      console.error("sendMessage error:", e);
      setMessages((m) => [
        ...m,
        {
          id: `${Date.now()}-err`,
          sender: "assistant",
          text: "Sorry — I couldn't reach the server.",
        },
      ]);
      Alert.alert("Network error", "Could not send message. Try again.");
    } finally {
      setLoading(false);
    }
  }

  // delete conversation helper
  async function handleDeleteConversation(cid: string) {
    if (!user?.email) return;
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this conversation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteConversationAPI(user.email, cid);
              await fetchConvoList();
              // reset UI
              setSelectedConvo(null);
              setConversationId(undefined);
              setMessages([]);
              setHistoryPanelVisible(true);
              Alert.alert("Deleted", "Conversation deleted.");
            } catch (e) {
              console.error("deleteConversation error:", e);
              Alert.alert("Error", "Could not delete conversation.");
            }
          },
        },
      ],
    );
  }

  async function handleDeleteAllConversations() {
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
            try {
              await deleteAllConversationsAPI(user.email);
              await fetchConvoList();
              setSelectedConvo(null);
              setConversationId(undefined);
              setMessages([]);
              setHistoryPanelVisible(true);
              Alert.alert("Deleted", "All chat history deleted.");
            } catch (e) {
              console.error("deleteAll error:", e);
              Alert.alert("Error", "Could not delete all conversations.");
            }
          },
        },
      ],
    );
  }

  function handleBackToHistory() {
    setSelectedConvo(null);
    setConversationId(undefined);
    setMessages([]);
    setHistoryPanelVisible(true);
  }

  // ---------------------------
  // Render — mobile vs web
  // ---------------------------

  // Mobile layout
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

  // Web layout with enhanced history panel
  return (
    <View style={styles.container}>
      <BrandHeader onToggleHistory={() => setHistoryPanelVisible((v) => !v)} />
      <View style={{ flex: 1, flexDirection: "row" }}>
        {isHistoryPanelVisible && (
          <View style={historyWrapperStyles.wrapper}>
            <HistoryPanel
              conversations={conversations}
              selectedId={selectedConvo}
              onSelect={handleSelectConversation}
              onStartNewConversation={handleStartConversation}
              onRefresh={fetchConvoList}
              loading={historyLoading}
              theme={theme}
            />
            {/* Delete All placed under history panel for convenience */}
            <View
              style={{
                padding: 12,
                borderTopWidth: 1,
                borderTopColor: "#eef2f6",
              }}
            >
              <TouchableOpacity
                onPress={handleDeleteAllConversations}
                style={{
                  backgroundColor: "#E53935",
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Delete All Chats
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ flex: 1, position: "relative" }}>
          {/* If a conversation is selected, render a top action bar similar to mobile ConversationDetail */}
          {selectedConvo ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#e6eef4",
                backgroundColor: theme === "dark" ? "#08120b" : "#f7fdf6",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  onPress={handleBackToHistory}
                  style={{
                    marginRight: 8,
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: theme === "dark" ? "#07210d" : "#e8fbec",
                  }}
                >
                  <Text
                    style={{ color: theme === "dark" ? "#9ee7b8" : "#2e7d32" }}
                  >
                    ← Back
                  </Text>
                </Pressable>
                <Text
                  style={{
                    fontWeight: "800",
                    color: theme === "dark" ? "#fff" : "#153920",
                  }}
                >
                  Conversation
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() =>
                    selectedConvo && handleDeleteConversation(selectedConvo)
                  }
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: "#E53935",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // When no conversation selected but history panel hidden (user toggled), show small helper header
            !isHistoryPanelVisible && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: "#e6eef4",
                  backgroundColor: theme === "dark" ? "#08120b" : "#f7fdf6",
                }}
              >
                <Text
                  style={{
                    fontWeight: "800",
                    color: theme === "dark" ? "#fff" : "#153920",
                  }}
                >
                  Chat
                </Text>
              </View>
            )
          )}

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.chatContent,
              { paddingBottom: inputBarHeight + 12 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {selectedConvo === null && !isHistoryPanelVisible && (
              <View style={{ padding: 20 }}>
                <Text style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                  No conversation selected. Open one from the left panel or
                  start a new chat.
                </Text>
              </View>
            )}

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

          {/* Input bar always visible so user can reply or start conversation */}
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
                onPress={async () => {
                  // If no conversationId yet, start one automatically
                  if (!conversationId) {
                    if (!user?.email) {
                      Alert.alert(
                        "Sign in",
                        "Please sign in to start a conversation.",
                      );
                      return;
                    }
                    setLoading(true);
                    try {
                      const data: any = await startConversationAPI(user.email);
                      const cid =
                        data?.conversation_id ?? data?.data?.conversation_id;
                      setConversationId(cid);
                      setSelectedConvo(cid ?? null);
                      setHistoryPanelVisible(false);
                    } catch (e) {
                      console.error("auto-start error", e);
                    } finally {
                      setLoading(false);
                    }
                  }
                  handleSend();
                }}
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

// ---------------------------
// Styles
// ---------------------------
const historyStyles = StyleSheet.create({
  container: {
    padding: 14,
    width: "100%",
    height: "100%",
    minHeight: 600,
    display: "flex",
    flexDirection: "column",
  },
  containerLight: {
    backgroundColor: "#fff",
  },
  containerDark: {
    backgroundColor: "#0f1720",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: { fontSize: 16, fontWeight: "800" },
  headerTitleLight: { color: "#0f1720" },
  headerTitleDark: { color: "#fff" },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  iconBtnLight: { backgroundColor: "#f2f4f6" },
  iconBtnDark: { backgroundColor: "#0b1520" },
  newChatBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  newChatBtnLight: {
    backgroundColor: "#eef7f0",
  },
  newChatBtnDark: {
    backgroundColor: "#172922",
  },
  newChatBtnText: { color: "#0b6a35", fontWeight: "700" },
  listWrap: { flex: 1, marginTop: 8 },
  emptyState: { padding: 18 },
  emptyTextLight: { color: "#4b5563" },
  emptyTextDark: { color: "#9aa" },

  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  itemLight: { backgroundColor: "#fff" },
  itemDark: { backgroundColor: "#071014" },
  itemActive: {
    borderWidth: 1,
    borderColor: "#a7f3d0",
    shadowOpacity: 0.12,
  },
  itemLeft: { marginRight: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e6f6f0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarActive: { backgroundColor: "#34d399" },
  avatarLetter: { fontWeight: "800", color: "#065f46" },
  itemBody: { flex: 1 },
  itemTitle: { fontWeight: "800", marginBottom: 4 },
  itemTitleActive: { color: "#065f46" },
  itemPreview: { color: "#475569", fontSize: 13 },
  itemRight: { marginLeft: 8, paddingLeft: 6 },
  itemTime: { color: "#94a3b8", fontWeight: "800" },
});

const historyWrapperStyles = StyleSheet.create({
  wrapper: {
    width: 360,
    borderRightWidth: 1,
    borderRightColor: "#e6eef4",
    minHeight: "100vh",
  },
});

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
