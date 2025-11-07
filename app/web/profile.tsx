import BrandHeader from "@/components/brand-header";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAccessToken } from "@/constants/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function WebProfilePage() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme || "light");
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
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch user details");
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
      if (!response.ok)
        throw new Error(data.error || "Failed to update profile");
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (Platform.OS !== "web") return null;

  return (
    <View style={styles.pageBg}>
      <BrandHeader subtitle="Your health, your journey" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          {/* Avatar and Status */}
          <View style={styles.avatarSection}>
            <Image
              source={require("../../assets/images/profile-avatar.png")}
              style={styles.avatar}
            />
            <Text style={styles.cardName}>{fullName}</Text>
            <Text style={styles.cardEmail}>{email}</Text>
            <View style={styles.statusWrapper}>
              <Text style={styles.statusLabel}>Active</Text>
            </View>
          </View>
          {/* Profile details */}
          <View style={styles.detailsSection}>
            <ProfileRow
              label="Full Name"
              value={fullName}
              editable={isEditing}
              onChangeText={setFullName}
              styles={styles}
            />
            <ProfileRow
              label="Email"
              value={email}
              editable={isEditing}
              onChangeText={setEmail}
              styles={styles}
            />
            <ProfileRow
              label="Blood Group"
              value={bloodGroup}
              editable={isEditing}
              onChangeText={setBloodGroup}
              styles={styles}
            />
            <ProfileRow
              label="Existing Diseases (if any)"
              value={diseases}
              editable={isEditing}
              onChangeText={setDiseases}
              styles={styles}
              multiline
            />
          </View>
          {/* Action */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              if (isEditing) updateUserProfile();
              else setIsEditing(true);
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() =>
              Alert.alert("Log out", "Are you sure you want to log out?", [
                { text: "Cancel", style: "cancel" },
                { text: "Log out", style: "destructive", onPress: logout },
              ])
            }
            activeOpacity={0.9}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
          <View style={styles.linksRow}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace("/web/about")}
              activeOpacity={0.9}
            >
              <Text style={styles.linkButtonText}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace("/web/features")}
              activeOpacity={0.9}
            >
              <Text style={styles.linkButtonText}>Features</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Details Row subcomponent
function ProfileRow({
  label,
  value,
  editable,
  onChangeText,
  styles,
  multiline,
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <TextInput
        style={styles.detailInput}
        value={value}
        editable={editable}
        multiline={!!multiline}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function getStyles(theme) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    pageBg: {
      flex: 1,
      minHeight: "100vh",
      backgroundColor: isDark ? "#181a1b" : "#e6e9ec",
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      paddingTop: 45,
      paddingBottom: 45,
    },
    profileCard: {
      width: "100%",
      maxWidth: 370,
      backgroundColor: isDark ? "#23272b" : "#fff",
      borderRadius: 14,
      padding: 28,
      boxShadow: "0 2px 26px 0 rgba(44,204,64,0.15)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.17,
      shadowRadius: 16,
      borderWidth: 1.5,
      borderColor: isDark ? "#222c" : "#dbeedb",
      alignItems: "center",
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: 18,
    },
    avatar: {
      width: 78,
      height: 78,
      borderRadius: 39,
      borderWidth: 3,
      borderColor: "#2ecc40",
      backgroundColor: isDark ? "#151718" : "#ededf7",
      marginBottom: 7,
    },
    cardName: {
      fontSize: 20,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#222",
      marginBottom: 0,
    },
    cardEmail: {
      fontSize: 14,
      color: isDark ? "#67d085" : "#058138",
      marginBottom: 7,
    },
    statusWrapper: {
      marginBottom: 2,
    },
    statusLabel: {
      fontSize: 13,
      color: "#2ecc40",
      fontWeight: "bold",
      backgroundColor: isDark ? "#233a2c" : "#cbfcd4",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 3,
      alignSelf: "center",
    },
    detailsSection: {
      width: "100%",
      marginBottom: 10,
    },
    detailRow: {
      width: "100%",
      marginBottom: 13,
    },
    detailLabel: {
      fontSize: 14,
      color: isDark ? "#ccc" : "#333",
      fontWeight: "600",
      marginBottom: 3,
      letterSpacing: 0.1,
    },
    detailInput: {
      backgroundColor: isDark ? "#232729" : "#f5f7fb",
      color: isDark ? "#fff" : "#222",
      borderRadius: 7,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontSize: 15,
      borderWidth: 1,
      borderColor: isDark ? "#344d3c" : "#e4efe7",
      marginBottom: 0,
    },
    editButton: {
      backgroundColor: "#2ecc40",
      borderRadius: 8,
      width: "100%",
      alignItems: "center",
      paddingVertical: 11,
      marginTop: 6,
      marginBottom: 7,
    },
    editButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.2,
    },
    logoutButton: {
      backgroundColor: isDark ? "#4c2523" : "#e95454",
      borderRadius: 8,
      paddingVertical: 10,
      width: "100%",
      alignItems: "center",
      marginBottom: 7,
    },
    logoutButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.1,
    },
    linksRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      gap: 18,
      marginTop: 12,
    },
    linkButton: {
      backgroundColor: "#2ecc40",
      borderRadius: 6,
      paddingVertical: 8,
      paddingHorizontal: 18,
      marginHorizontal: 3,
    },
    linkButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 14,
    },
  });
}
