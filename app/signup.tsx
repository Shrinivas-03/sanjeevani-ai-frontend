import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/context/auth";
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

  const { login } = useAuth();
  const styles = getStyles();
  const router = require("expo-router").useRouter();

  /* ---------------------------------------------
     VALIDATION FUNCTIONS
  ----------------------------------------------*/

  const validateName = (name: string) => {
    if (name.trim().length < 3)
      return "Full Name must be at least 3 characters.";
    if (!/^[A-Za-z ]+$/.test(name))
      return "Full Name should contain only letters and spaces.";
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
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("1 uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("1 lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("1 number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push("1 special character");

    if (errors.length > 0) {
      return `Password must include: ${errors.join(", ")}`;
    }
    return null;
  };

  const validateBloodGroup = (bg: string) => {
    return BLOOD_GROUPS.includes(bg)
      ? null
      : "Please select a valid blood group.";
  };

  /* ---------------------------------------------
     SIGNUP HANDLER WITH VALIDATION
  ----------------------------------------------*/

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
      const requestData: any = {
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim(),
        bloodGroup: bloodGroup,
        ...(diseases ? { existingDiseases: diseases.trim() } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        const navigateToOtp = () =>
          router.push({ pathname: "/otp-verification", params: { email } });

        if (Platform.OS === "web") {
          navigateToOtp();
          Alert.alert(
            "Success",
            "Account created! Check your email for verification.",
          );
        } else {
          Alert.alert("Success", "Account created! Verify your email.", [
            { text: "OK", onPress: navigateToOtp },
          ]);
        }
      } else {
        Alert.alert("Error", data.message || data.error || "Signup failed");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------
     UI RENDER
  ----------------------------------------------*/

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Image
                source={require("../assets/images/logo.png")}
                style={styles.logo}
              />
            </View>
            <Text style={styles.brandTitle}>Sanjeevani AI</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us to manage your health better.
          </Text>

          {/* FULL NAME */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* EMAIL */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* PASSWORD */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a secure password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* BLOOD GROUP */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Blood Group *</Text>
            <View style={styles.selectWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Select Blood Group"
                placeholderTextColor="#888"
                value={bloodGroup}
                onFocus={() => setShowDropdown(true)}
                onChangeText={(text) => {
                  setSearchText(text);
                  setBloodGroup(text);
                  setShowDropdown(true);
                }}
              />
              {showDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView>
                    {(searchText
                      ? BLOOD_GROUPS.filter((bg) =>
                          bg.toLowerCase().startsWith(searchText.toLowerCase()),
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Existing Diseases</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="e.g., Diabetes, Hypertension"
              placeholderTextColor="#888"
              multiline
              value={diseases}
              onChangeText={setDiseases}
            />
          </View>

          {/* SIGNUP BUTTON */}
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.5 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text
              style={styles.loginLink}
              onPress={() => router.replace("/signin")}
            >
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------------------------------------
   STYLES
----------------------------------------------*/
function getStyles() {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: "#151718", padding: 16 },
    card: {
      alignSelf: "center",
      width: "100%",
      maxWidth: 360,
      backgroundColor: "#222",
      borderRadius: 16,
      padding: 24,
      marginTop: "auto",
      marginBottom: "auto",
    },
    brandRow: {
      flexDirection: "row",
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
      marginRight: 10,
    },
    logo: { width: 26, height: 26 },
    brandTitle: { fontSize: 26, fontWeight: "bold", color: "#2ecc40" },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#2ecc40",
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      color: "#aaa",
      textAlign: "center",
      marginBottom: 18,
    },
    formGroup: { marginBottom: 14 },
    label: { fontSize: 15, color: "#eee", marginBottom: 6 },
    input: {
      backgroundColor: "#181a1b",
      color: "#fff",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === "web" ? 10 : 8,
      fontSize: 15,
      borderWidth: 1,
      borderColor: "#333",
    },
    selectWrapper: { position: "relative" },
    dropdown: {
      position: "absolute",
      top: 40,
      left: 0,
      right: 0,
      backgroundColor: "#222",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#333",
      zIndex: 10,
    },
    dropdownItem: { padding: 10, fontSize: 15, color: "#fff" },
    textarea: { minHeight: 50, textAlignVertical: "top" },
    button: {
      backgroundColor: "#2ecc40",
      borderRadius: 8,
      paddingVertical: 12,
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 17,
    },
    loginText: { textAlign: "center", color: "#aaa", marginTop: 8 },
    loginLink: { color: "#2ecc40", fontWeight: "bold" },
  });
}
