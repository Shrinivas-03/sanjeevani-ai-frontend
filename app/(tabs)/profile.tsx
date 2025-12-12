import BrandHeader from "@/components/brand-header";
import { getAccessToken } from "@/constants/api";
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
      if (!response.ok) throw new Error(data.error);

      setFullName(data.user.full_name);
      setEmail(data.user.email);
      setBloodGroup(data.user.blood_group);
      setDiseases(data.user.existing_diseases);
    } catch (e: any) {
      console.error("Fetch error:", e.message);
    }
  };

  const updateUserProfile = async () => {
    const token = await getAccessToken();
    try {
      const res = await fetch(
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  useEffect(() => {
    fetchUserDetails();
    const show = Keyboard.addListener("keyboardWillShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const bottomOffset = Math.max(0, keyboardHeight - insets.bottom);

  return (
    <View style={styles.container}>
      <BrandHeader subtitle="Manage your account details" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: bottomOffset + 40 }}
        >
          <View style={styles.profileCard}>
            {/* EDIT BUTTON */}
            <TouchableOpacity
              onPress={() =>
                isEditing ? updateUserProfile() : setIsEditing(true)
              }
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>

            {/* AVATAR */}
            <View style={styles.avatarSection}>
              <Image
                source={require("../../assets/images/profile-avatar.png")}
                style={styles.avatar}
              />
              <Text style={styles.nameText}>{fullName}</Text>
              <Text style={styles.emailText}>{email}</Text>
            </View>

            {/* FORM */}
            <View style={styles.formSection}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  editable={isEditing}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  editable={false}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>Blood Group</Text>
                <TextInput
                  value={bloodGroup}
                  onChangeText={setBloodGroup}
                  editable={isEditing}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>Existing Diseases</Text>
                <TextInput
                  value={diseases}
                  onChangeText={setDiseases}
                  editable={isEditing}
                  multiline
                  style={[styles.input, styles.textarea]}
                />
              </View>
            </View>

            {/* LOGOUT */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() =>
                Alert.alert("Logout", "Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Logout", style: "destructive", onPress: logout },
                ])
              }
            >
              <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>

            {/* LINKS */}
            <View style={styles.linkButtonsRow}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/about")}
              >
                <Text style={styles.linkButtonText}>About Us</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => router.push("/features")}
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
      backgroundColor: isDark ? "#020617" : "#eef9f2",
    },

    profileCard: {
      backgroundColor: isDark ? "#020617" : "#ffffff",
      width: "92%",
      borderRadius: 22,
      alignSelf: "center",
      paddingVertical: 30,
      paddingHorizontal: 24,
      marginTop: 26,

      shadowColor: "#22c55e",
      shadowOpacity: isDark ? 0.55 : 0.15,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 10 },
      elevation: 9,
    },

    editButton: {
      position: "absolute",
      top: 16,
      right: 18,
      backgroundColor: "#22c55e",
      paddingVertical: 7,
      paddingHorizontal: 20,
      borderRadius: 999,
    },
    editButtonText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "800",
    },

    avatarSection: {
      alignItems: "center",
      marginTop: 20,
      marginBottom: 26,
    },

    avatar: {
      width: 110,
      height: 110,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: "#22c55e",
      backgroundColor: isDark ? "#030712" : "#eafcf1",
    },

    nameText: {
      fontSize: 21,
      fontWeight: "900",
      marginTop: 10,
      color: isDark ? "#ffffff" : "#034525",
    },

    emailText: {
      marginTop: 2,
      fontSize: 14,
      color: isDark ? "#67e797" : "#099850",
      opacity: 0.85,
    },

    formSection: {
      marginTop: 10,
      marginBottom: 18,
    },

    inputBlock: {
      marginBottom: 12,
    },

    label: {
      fontSize: 14,
      fontWeight: "700",
      marginBottom: 4,
      color: isDark ? "#bbf7d0" : "#0d4d28",
    },

    input: {
      backgroundColor: isDark ? "#071013" : "#ecfdf5",
      borderWidth: 1,
      borderColor: isDark ? "#1f2937" : "#bbf7d0",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 14,
      fontSize: 15,
      color: isDark ? "#fff" : "#033a25",
    },

    textarea: {
      minHeight: 55,
      textAlignVertical: "top",
    },

    logoutButton: {
      backgroundColor: "#fb3f3f",
      paddingVertical: 13,
      borderRadius: 999,
      width: "100%",
      alignItems: "center",
      marginTop: 18,
      marginBottom: 14,
    },
    logoutButtonText: {
      color: "#fff",
      fontSize: 17,
      fontWeight: "800",
    },

    linkButtonsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 2,
    },

    linkButton: {
      flex: 1,
      backgroundColor: "#22c55e",
      paddingVertical: 11,
      borderRadius: 999,
      alignItems: "center",
    },

    linkButtonText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 15,
    },
  });
}
