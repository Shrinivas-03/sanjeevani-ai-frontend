// API Configuration
// Read from environment variable, fallback to localhost if not set
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
// Prefer environment variable set by Expo/packager. If it's missing (for example when a
// developer accidentally named the file `env` instead of `.env`), try to read an
// `env` or `.env` file from the project root as a fallback (only works in Node
// environment, i.e., when Metro/packager loads this module).
function readEnvFileFallback() {
  try {
    // Require `fs` lazily so code doesn't break in environments where it's not available.
    // This runs when Metro/Node loads the module during development.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    const paths = [".env", "env"];
    for (const p of paths) {
      try {
        const full = require("path").join(process.cwd(), p);
        if (fs.existsSync(full)) {
          const content = fs.readFileSync(full, "utf8");
          const match = content.match(/EXPO_PUBLIC_API_BASE_URL=(.+)/);
          if (match && match[1]) return match[1].trim();
        }
      } catch (e) {
        // ignore and try next
      }
    }
  } catch (e) {
    // fs not available or other error — ignore and fallback later
  }
  return null;
}

const ENV_API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL || readEnvFileFallback() || "http://localhost:5000";

// On Android emulators, `localhost` refers to the emulator itself — map to host machine
// This keeps the default `EXPO_PUBLIC_API_BASE_URL` working across platforms
function resolveApiBaseUrl(base: string) {
  if (
    Platform.OS === "android" &&
    (base.startsWith("http://localhost") || base.startsWith("https://localhost"))
  ) {
    // Android Emulator (default Android) maps localhost -> 10.0.2.2
    const mapped = base.replace("localhost", "10.0.2.2");
    if (typeof console !== "undefined") {
      // Clear hint for developers running on Android emulators
      console.warn(
        `Mapped API base URL for Android emulator: ${base} -> ${mapped}`,
      );
    }
    return mapped;
  }
  return base;
}

export const API_BASE_URL = resolveApiBaseUrl(ENV_API_BASE);

if (typeof console !== "undefined") {
  console.warn("Effective API_BASE_URL:", API_BASE_URL);
}

// Helpful debug helper — call this to detect common network issues.
export const checkBackend = async (path = "/api/auth/me") => {
  try {
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    console.warn("checkBackend: Attempting to fetch:", url);
    const r = await fetch(url, { method: "GET" });
    console.warn("checkBackend: status:", r.status);
    try {
      console.warn("checkBackend: body:", await r.text());
    } catch (e) {
      console.warn("checkBackend: body unavailable", e);
    }
    return r;
  } catch (e) {
    console.error("checkBackend: Network error:", e);
    throw e;
  }
};

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
  conversations?: { conversation_id: string; preview: string }[];
  data?: {
    conversations: { conversation_id: string; preview: string }[];
  };
};
type GetConvoRes = {
  messages?: { role: "user" | "assistant" | "system"; message: string }[];
  data?: {
    messages: { role: "user" | "assistant" | "system"; message: string }[];
  };
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
  } else {
    if (typeof console !== "undefined") {
      console.warn("authenticatedFetch: no access_token found, requests will be unauthenticated for", url);
    }
  }

  // Primary attempt
  try {
    return await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    // Network error — attempt fallbacks
    if (typeof console !== "undefined") {
      console.warn("authenticatedFetch: primary fetch failed, attempting fallbacks", err);
    }
    // Build fallback host list: try emulator loopback, localhost variants, and any env IP
    const parsed = (() => {
      try {
        return new URL(url);
      } catch (_) {
        return null;
      }
    })();

    const hostFallbacks: string[] = [];
    const envHost = (() => {
      try {
        const fallback = ENV_API_BASE;
        if (fallback) return new URL(fallback).host;
      } catch (_) {}
      return null;
    })();
    if (envHost) hostFallbacks.push(envHost);
    // Add common emulator/localhost mappings
    hostFallbacks.push("10.0.2.2:5000", "127.0.0.1:5000", "localhost:5000");

    for (const h of hostFallbacks) {
      try {
        const newUrl = parsed
          ? `${parsed.protocol}//${h}${parsed.pathname}${parsed.search}`
          : `${url.replace(/(https?:\/\/)([^/]+)(.*)/, `$1${h}$3`)}`;
        if (typeof console !== "undefined") {
          console.warn("authenticatedFetch: trying fallback URL:", newUrl);
        }
        const r = await fetch(newUrl, { ...options, headers });
        return r;
      } catch (e) {
        if (typeof console !== "undefined") {
          console.warn("authenticatedFetch: fallback failed for host", h, e);
        }
        // continue to next fallback
      }
    }

    // Re-throw the original error if all fallbacks fail
    throw err;
  }
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
