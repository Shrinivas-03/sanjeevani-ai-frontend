import BrandHeader from "@/components/brand-header";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAccessToken } from "@/constants/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme || "light");
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { logout, user } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "");
  const [diseases, setDiseases] = useState(user?.existing_diseases || "");
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserDetails = async () => {
    const token = await getAccessToken();
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/user-details`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user details");
      }
      setFullName(data.user.full_name);
      setEmail(data.user.email);
      setBloodGroup(data.user.blood_group);
      setDiseases(data.user.existing_diseases);
    } catch (error) {
      console.error("Error fetching user details:", error.message);
    }
  };

  const updateUserProfile = async () => {
    const token = await getAccessToken();
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/edit-profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            email,
            bloodGroup,
            existingDiseases: diseases,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    const willShow = Keyboard.addListener("keyboardWillShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const willHide = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardHeight(0),
    );
    const didShow = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const didHide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0),
    );
    return () => {
      willShow.remove();
      willHide.remove();
      didShow.remove();
      didHide.remove();
    };
  }, []);

  const bottomOffset = Math.max(0, keyboardHeight - insets.bottom);

  return (
    <View style={styles.container}>
      <BrandHeader subtitle="Your health, your journey" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 40 + (Platform.OS === "ios" ? bottomOffset : 0),
          }}
        >
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                if (isEditing) updateUserProfile();
                else setIsEditing(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>

            {/* Avatar & Name */}
            <View style={styles.avatarSection}>
              <Image
                source={require("../../assets/images/profile-avatar.png")}
                style={styles.avatar}
              />
              <Text style={styles.nameText}>{fullName}</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Blood Group</Text>
                <TextInput
                  style={styles.input}
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  editable={isEditing}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Existing Diseases (if any)</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={diseases}
                  onChangeText={setDiseases}
                  multiline
                  numberOfLines={2}
                  editable={isEditing}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                Alert.alert("Log out", "Are you sure you want to log out?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Log out",
                    style: "destructive",
                    onPress: () => logout(),
                  },
                ]);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>
            <View style={styles.linkButtonsRow}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/about")}
                activeOpacity={0.8}
              >
                <Text style={styles.linkButtonText}>About Us</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/features")}
                activeOpacity={0.8}
              >
                <Text style={styles.linkButtonText}>Features</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#151718" : "#f5f6f7",
      paddingHorizontal: 0,
    },
    profileCard: {
      backgroundColor: isDark ? "#222428" : "#fff",
      borderRadius: 26,
      padding: 30,
      shadowColor: "#2ecc40",
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 5,
      margin: 30,
      maxWidth: 410,
      alignItems: "center",
      width: "100%",
    },
    editButton: {
      position: "absolute",
      top: 18,
      right: 18,
      backgroundColor: "#2ecc40",
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingVertical: 8,
      zIndex: 10,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    editButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.1,
    },
    avatarSection: {
      alignItems: "center",
      marginTop: 10,
      marginBottom: 25,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 4,
      borderColor: "#2ecc40",
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
      marginBottom: 8,
      shadowColor: "#2ecc40",
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 2,
    },
    nameText: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#222",
      marginBottom: 2,
      letterSpacing: 0.15,
      textAlign: "center",
    },
    emailText: {
      fontSize: 14,
      color: isDark ? "#67d085" : "#058138",
      marginBottom: 10,
      textAlign: "center",
    },
    formSection: {
      width: "100%",
      marginBottom: 16,
    },
    inputBlock: {
      marginBottom: 10,
    },
    label: {
      fontSize: 15,
      color: isDark ? "#eee" : "#222",
      marginBottom: 3,
      fontWeight: "600",
    },
    input: {
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
      color: isDark ? "#fff" : "#222",
      borderRadius: 9,
      paddingHorizontal: 13,
      paddingVertical: 9,
      fontSize: 16,
      borderWidth: 1.5,
      borderColor: isDark ? "#333" : "#dde1e6",
    },
    textarea: {
      minHeight: 48,
      textAlignVertical: "top",
    },
    logoutButton: {
      backgroundColor: isDark ? "#3a3a3a" : "#e95454",
      borderRadius: 10,
      paddingVertical: 13,
      marginTop: 10,
      marginBottom: 10,
      alignItems: "center",
      borderWidth: 2,
      borderColor: isDark ? "#444" : "#e3bcbc",
      width: "100%",
    },
    logoutButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 17,
    },
    linkButtonsRow: {
      flexDirection: "row",
      gap: 16,
      justifyContent: "center",
      width: "100%",
      marginTop: 3,
    },
    linkButton: {
      backgroundColor: "#2ecc40",
      borderRadius: 8,
      paddingVertical: 9,
      paddingHorizontal: 26,
      alignItems: "center",
      marginTop: 0,
      width: "48%",
      marginBottom: 6,
    },
    linkButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.05,
      textAlign: "center",
    },
  });
}
