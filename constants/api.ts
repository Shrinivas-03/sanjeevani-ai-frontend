// API Configuration
// Read from environment variable, fallback to localhost if not set
import AsyncStorage from "@react-native-async-storage/async-storage";
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
    RESEND_OTP: `${API_BASE_URL}/api/auth/resend-otp`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
    ME: `${API_BASE_URL}/api/auth/me`,
  },
};

type ListConvosRes = {
  conversations: { conversation_id: string; preview: string }[];
};
type GetConvoRes = {
  messages: { role: "user" | "assistant" | "system"; message: string }[];
};
type SendMsgRes = {
  conversation_id: string;
  query: string;
  response: string;
  references: string[];
};
// Helper function to get access token
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("access_token");
  } catch (e) {
    console.error("Failed to get access token", e);
    return null;
  }
};

// Helper function to get refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("refresh_token");
  } catch (e) {
    console.error("Failed to get refresh token", e);
    return null;
  }
};

// Helper function to clear tokens
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
  } catch (e) {
    console.error("Failed to clear tokens", e);
  }
};

// Helper function to make authenticated API calls
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
// Decode JWT payload safely (base64url) and return claims
export const decodeJwtClaims = (
  token: string | null | undefined,
): Record<string, any> | null => {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // Pad if needed
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    let json = "";
    if (typeof atob === "function") {
      json = decodeURIComponent(
        Array.prototype.map
          .call(
            atob(padded),
            (c: string) =>
              "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
          )
          .join(""),
      );
    } else if (typeof Buffer !== "undefined") {
      // Node/Metro fallback
      // @ts-ignore
      json = Buffer.from(padded, "base64").toString("utf8");
    } else {
      return null;
    }
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

// --- Add these below your existing code in api.ts ---

// Start a new chat
export async function startConversation(
  email: string,
): Promise<{ conversation_id: string }> {
  const res = await fetch(`${API_BASE_URL}/api/rag/start-conversation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`Failed to start conversation: ${res.status}`);
  return res.json();
}

// List user chats
export async function listConversations(email: string): Promise<ListConvosRes> {
  const res = await fetch(
    `${API_BASE_URL}/api/rag/conversations?email=${encodeURIComponent(email)}`,
  );
  if (!res.ok) throw new Error(`Failed to get chats: ${res.status}`);
  return res.json();
}

// Load chat history for a conversation
export async function getConversation(
  email: string,
  conversationId: string,
): Promise<GetConvoRes> {
  const res = await fetch(
    `${API_BASE_URL}/api/rag/conversation/${conversationId}?email=${encodeURIComponent(email)}`,
  );
  if (!res.ok) throw new Error(`Failed to load conversation: ${res.status}`);
  return res.json();
}

// Send message (AI remedy/chat)
export async function sendMessage(
  email: string,
  query: string,
  conversation_id?: string,
): Promise<SendMsgRes> {
  const res = await fetch(`${API_BASE_URL}/api/rag/ai-remedy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, query, conversation_id }),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
  return res.json();
}

// Delete a selected conversation (chat) for a user
export async function deleteConversation(
  email: string,
  conversationId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${API_BASE_URL}/api/rag/conversation/${conversationId}?email=${encodeURIComponent(email)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error(`Failed to delete conversation: ${res.status}`);
  return res.json();
}

// Delete all chat history for a user
export async function deleteAllConversations(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${API_BASE_URL}/api/rag/conversations?email=${encodeURIComponent(email)}`,
    { method: "DELETE" },
  );
  if (!res.ok)
    throw new Error(`Failed to delete all conversations: ${res.status}`);
  return res.json();
}
