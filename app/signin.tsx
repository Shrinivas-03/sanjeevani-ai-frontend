import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
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
  const { login } = useAuth();
  const router = require("expo-router").useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ---------------------
  // LOGIN
  // ---------------------
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

        if (Platform.OS === "web") router.replace("/web/prediction");
        else router.replace("/(tabs)/prediction");
      } else if (data?.message?.toLowerCase().includes("verify")) {
        if (Platform.OS === "web") {
          router.push({ pathname: "/otp-verification", params: { email } });
        } else {
          Alert.alert("Email Not Verified", "Please verify your email.");
        }
      } else {
        Alert.alert("Error", data?.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Error", "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // SKIP LOGIN
  const handleSkip = async () => {
    await login();
    Platform.OS === "web"
      ? router.replace("/web/prediction")
      : router.replace("/(tabs)/prediction");
  };

  // HOME
  const handleHomePress = () => {
    Platform.OS === "web" ? router.replace("/web") : router.replace("/signin");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity style={styles.homeButton} onPress={handleHomePress}>
        <Text style={styles.homeButtonText}>Home</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerWrapper}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            {/* Logo Overlap */}
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your health journey.
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
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
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonGhost, loading && { opacity: 0.7 }]}
              onPress={handleSkip}
            >
              <Text style={styles.buttonGhostText}>Skip for now</Text>
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
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(isDark: boolean) {
  const primary = "#22c55e";

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? "#020617" : "#e2f3ea",
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingVertical: 32,
    },
    centerWrapper: {
      width: "100%",
      alignItems: "center",
    },

    logoWrapper: {
      position: "absolute",
      top: -48,
      width: 95,
      height: 95,
      borderRadius: 48,
      borderWidth: 2,
      borderColor: primary,
      backgroundColor: isDark ? "#020617" : "#ecfdf3",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      alignSelf: "center",
    },

    logo: { width: "80%", height: "80%" },

    card: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: isDark
        ? "rgba(15,23,42,0.98)"
        : "rgba(255,255,255,0.98)",
      paddingVertical: 24,
      paddingHorizontal: 22,
      paddingTop: 70,
      borderRadius: 26,
      marginTop: 80,
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 14 },
      elevation: 12,
      borderWidth: 1,
      borderColor: isDark ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.25)",
    },

    title: {
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      color: isDark ? "#e5e7eb" : "#0f172a",
    },
    subtitle: {
      fontSize: 13,
      textAlign: "center",
      marginBottom: 18,
      color: isDark ? "#9ca3af" : "#6b7280",
    },

    formGroup: { marginBottom: 14 },
    label: {
      fontSize: 13,
      fontWeight: "500",
      marginBottom: 6,
      color: isDark ? "#e5e7eb" : "#111827",
    },
    input: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? "#1f2937" : "#e5e7eb",
      backgroundColor: isDark ? "#020617" : "#f8fafc",
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 15,
      color: isDark ? "#f9fafb" : "#0f172a",
    },

    buttonPrimary: {
      backgroundColor: primary,
      borderRadius: 999,
      paddingVertical: 12,
      marginTop: 12,
      shadowColor: primary,
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 4,
    },
    buttonPrimaryText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 16,
      textAlign: "center",
    },

    buttonGhost: {
      borderRadius: 999,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: isDark ? "#374151" : "#d1d5db",
      backgroundColor: isDark ? "rgba(15,23,42,0.7)" : "rgba(248,250,252,0.9)",
      marginTop: 8,
    },
    buttonGhostText: {
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#e5e7eb" : "#111827",
    },

    signupText: {
      textAlign: "center",
      marginTop: 12,
      color: isDark ? "#9ca3af" : "#6b7280",
    },
    signupLink: {
      color: primary,
      fontWeight: "700",
    },

    homeButton: {
      position: "absolute",
      top: 16,
      left: 16,
      zIndex: 100,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: isDark
        ? "rgba(15,23,42,0.95)"
        : "rgba(255,255,255,0.95)",
      borderColor: isDark ? "#1f2937" : "#e5e7eb",
    },
    homeButtonText: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#e5e7eb" : "#111827",
    },
  });
}
