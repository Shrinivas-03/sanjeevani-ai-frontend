import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
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

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function SignUpScreen({ onLogin }: { onLogin?: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [diseases, setDiseases] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const router = require("expo-router").useRouter();
  const { login } = useAuth();

  // Animation like SignIn page
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

  /* ------------------------
     VALIDATION + SIGNUP LOGIC
  ------------------------- */

  const validateName = (name: string) => {
    if (name.trim().length < 3)
      return "Full Name must be at least 3 characters.";
    if (!/^[A-Za-z ]+$/.test(name))
      return "Full Name should contain only letters.";
    return null;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email)
      ? null
      : "Please enter a valid email address.";
  };

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) errors.push("8 characters");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("1 number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("1 special char");

    return errors.length ? "Password must include: " + errors.join(", ") : null;
  };

  const validateBloodGroup = (bg: string) =>
    BLOOD_GROUPS.includes(bg) ? null : "Select a valid blood group.";

  const handleSignUp = async () => {
    const errors = [];

    const nameErr = validateName(fullName);
    if (nameErr) errors.push(nameErr);

    const emailErr = validateEmail(email);
    if (emailErr) errors.push(emailErr);

    const passErr = validatePassword(password);
    if (passErr) errors.push(passErr);

    const bgErr = validateBloodGroup(bloodGroup);
    if (bgErr) errors.push(bgErr);

    if (errors.length > 0) {
      Alert.alert("Validation Error", errors.join("\n\n"));
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        bloodGroup,
        ...(diseases ? { existingDiseases: diseases.trim() } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        router.push({ pathname: "/otp-verification", params: { email } });
      } else {
        Alert.alert("Error", data.message || "Signup failed");
      }
    } catch {
      Alert.alert("Error", "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------
     UI WITH NEW DESIGN
  ------------------------- */

  const isDark = true; // SIGNUP uses dark theme by default
  const styles = getStyles(isDark);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerWrapper}>
          {/* Glassy animated card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslateY }],
              },
            ]}
          >
            {/* Floating logo */}
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>

            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.subtitle}>
              Join us to manage your health better.
            </Text>

            {/* FULL NAME */}
            <View style={styles.group}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#6b7280"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.group}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#6b7280"
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
              />
            </View>

            {/* PASSWORD */}
            <View style={styles.group}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                secureTextEntry
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* BLOOD GROUP */}
            <View style={styles.group}>
              <Text style={styles.label}>Blood Group *</Text>

              <View style={styles.dropdownHolder}>
                <TextInput
                  style={styles.input}
                  value={bloodGroup}
                  placeholder="Select Blood Group"
                  placeholderTextColor="#6b7280"
                  onFocus={() => setShowDropdown(true)}
                  onChangeText={(t) => {
                    setSearchText(t);
                    setBloodGroup(t);
                    setShowDropdown(true);
                  }}
                />

                {showDropdown && (
                  <View style={styles.dropdown}>
                    <ScrollView>
                      {(searchText
                        ? BLOOD_GROUPS.filter((bg) =>
                            bg
                              .toLowerCase()
                              .startsWith(searchText.toLowerCase()),
                          )
                        : BLOOD_GROUPS
                      ).map((bg) => (
                        <TouchableOpacity
                          key={bg}
                          onPress={() => {
                            setBloodGroup(bg);
                            setSearchText("");
                            setShowDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItem}>{bg}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* EXISTING DISEASES */}
            <View style={styles.group}>
              <Text style={styles.label}>Existing Diseases</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Diabetes, Hypertension"
                placeholderTextColor="#6b7280"
                multiline
                value={diseases}
                onChangeText={setDiseases}
              />
            </View>

            {/* SIGN UP BUTTON */}
            <TouchableOpacity
              style={[styles.buttonPrimary, loading && { opacity: 0.6 }]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>
                {loading ? "Creating..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* LOGIN LINK */}
            <Text style={styles.bottomText}>
              Already have an account?{" "}
              <Text
                style={styles.bottomLink}
                onPress={() => router.replace("/signin")}
              >
                Login
              </Text>
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------------
  STYLES MATCHING SIGN IN DESIGN
------------------------- */

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
      paddingVertical: 36,
    },
    centerWrapper: {
      width: "100%",
      alignItems: "center",
    },

    logoWrapper: {
  position: "absolute",
  top: -45,
  alignSelf: "center",   // ✅ THIS CENTERS THE LOGO
  width: 95,
  height: 95,
  borderRadius: 48,
  backgroundColor: isDark ? "#020617" : "#ecfdf3",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  borderColor: primary,
  zIndex: 10,
  overflow: "hidden",
},

    logo: { width: "85%", height: "85%" },

    card: {
      width: "100%",
      maxWidth: 400,
      backgroundColor: isDark
        ? "rgba(15,23,42,0.98)"
        : "rgba(255,255,255,0.98)",
      borderRadius: 26,
      paddingHorizontal: 22,
      paddingTop: 70,
      paddingBottom: 24,
      marginTop: 80,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.25)",
    },

    title: {
      fontSize: 22,
      fontWeight: "700",
      color: primary,
      textAlign: "center",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 13,
      textAlign: "center",
      color: isDark ? "#9ca3af" : "#6b7280",
      marginBottom: 20,
    },

    group: { marginBottom: 14 },

    label: {
      fontSize: 13,
      fontWeight: "600",
      color: isDark ? "#e2e8f0" : "#111827",
      marginBottom: 6,
    },

    input: {
      backgroundColor: isDark ? "#020617" : "#f4f4f5",
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: isDark ? "#f8fafc" : "#111",
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#d1d5db",
      fontSize: 14,
    },

    textArea: {
      minHeight: 50,
      textAlignVertical: "top",
    },

    dropdownHolder: { position: "relative" },
    dropdown: {
      position: "absolute",
      top: 48,
      width: "100%",
      backgroundColor: isDark ? "#1e293b" : "#fff",
      maxHeight: 140,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#ddd",
      elevation: 6,
      paddingVertical: 6,
      zIndex: 20,
    },
    dropdownItem: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: 14,
      color: isDark ? "#f1f5f9" : "#111",
    },

    buttonPrimary: {
      backgroundColor: primary,
      borderRadius: 999,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 10,
      shadowColor: primary,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    buttonPrimaryText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },

    bottomText: {
      marginTop: 12,
      textAlign: "center",
      color: isDark ? "#9ca3af" : "#444",
    },
    bottomLink: {
      color: primary,
      fontWeight: "700",
    },
  });
}
