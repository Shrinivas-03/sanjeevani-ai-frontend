import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignInScreen({ onSignUp }: { onSignUp?: () => void }) {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);
  const { login, setUser } = useAuth();
  const router = require("expo-router").useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.access_token) {
        await AsyncStorage.setItem("access_token", data.access_token);
        await AsyncStorage.setItem("refresh_token", data.refresh_token);
        await login(data.user);
        if (Platform.OS === "web") {
          router.replace("/web/prediction");
        } else {
          router.replace("/(tabs)/prediction");
        }
      } else if (data?.message?.toLowerCase().includes("verify")) {
        if (Platform.OS === "web") {
          router.push({ pathname: "/otp-verification", params: { email } });
        } else {
          Alert.alert(
            "Email Not Verified",
            "Please verify your email before logging in.",
          );
        }
      } else {
        Alert.alert("Error", data?.message || "Login failed.");
      }
    } catch (error) {
      console.error("[SignIn] Error:", error);
      Alert.alert("Error", "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Clean skip handler
  const handleSkip = async () => {
    await login();
    if (Platform.OS === "web") {
      router.replace("/web/prediction");
    } else {
      router.replace("/(tabs)/prediction");
    }
  };

  const handleHomePress = () => {
    if (Platform.OS === "web") {
      router.replace("/web");
    } else {
      router.replace("/signin");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View
              style={[
                styles.logoCircle,
                { borderColor: isDark ? "#1e2022" : "#ffffff" },
              ]}
            >
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTitle}>Sanjeevani AI</Text>
          </View>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Log in to continue your health journey.
          </Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={isDark ? "#888" : "#aaa"}
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              placeholderTextColor={isDark ? "#888" : "#aaa"}
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#aaa", marginTop: 8 }]}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
          <Text style={styles.signupText}>
            Don't have an account?{" "}
            <Text
              style={styles.signupLink}
              onPress={() =>
                onSignUp ? onSignUp() : router.replace("/signup")
              }
            >
              Sign up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? "#151718" : "#f7fafc",
      padding: 16,
    },
    headerText: {
      fontSize: 20,
      fontWeight: "600",
      color: isDark ? "#fff" : "#000",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    card: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 360,
      backgroundColor: isDark ? "#222" : "#fff",
      borderRadius: 16,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      marginTop: "auto",
      marginBottom: "auto",
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    logoCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      marginRight: 10,
    },
    logo: {
      width: 26,
      height: 26,
    },
    brandTitle: {
      fontSize: 26,
      fontWeight: "bold",
      color: "#2ecc40",
      letterSpacing: 0.5,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#2ecc40",
      textAlign: "center",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: isDark ? "#aaa" : "#687076",
      textAlign: "center",
      marginBottom: 18,
    },
    formGroup: {
      marginBottom: 14,
    },
    label: {
      fontSize: 15,
      color: isDark ? "#eee" : "#222",
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? "#181a1b" : "#f3f4f6",
      color: isDark ? "#fff" : "#222",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "web" ? 10 : 8,
      fontSize: 15,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e0e0e0",
    },
    button: {
      backgroundColor: "#2ecc40",
      borderRadius: 8,
      paddingVertical: 12,
      marginTop: 10,
      marginBottom: 8,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 17,
      textAlign: "center",
    },
    signupText: {
      textAlign: "center",
      color: isDark ? "#aaa" : "#687076",
      fontSize: 15,
      marginTop: 8,
    },
    signupLink: {
      color: "#2ecc40",
      fontWeight: "bold",
    },
    homeButton: {
      position: "absolute",
      top: 16,
      left: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
      zIndex: 10,
    },
    homeButtonText: {
      color: isDark ? "#e5e7eb" : "#111827",
      fontWeight: "600",
      fontSize: 15,
    },
  });
}
