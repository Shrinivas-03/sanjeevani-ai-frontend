export const options = { headerShown: false }; // For Expo Router or Next/Expo stack navigation

import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useAppTheme } from "@/context/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// CUSTOM HEADER - only this will show, no native nav-bar!
function AboutHeader() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const isDark = theme === "dark";
  const STATUSBAR_HEIGHT =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 30;
  const headerStyles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 15,
      paddingBottom: 7,
      backgroundColor: isDark ? "#151718" : "#f5f6f7",
      paddingTop: STATUSBAR_HEIGHT + 2,
    },
    backBtn: {
      padding: 7,
      borderRadius: 24,
      backgroundColor: "transparent",
    },
    headerBrand: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      marginLeft: -32,
    },
    brandLogo: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 10,
    },
    brandText: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#2ecc40",
      letterSpacing: 0.12,
    },
  });
  return (
    <View style={headerStyles.header}>
      <TouchableOpacity
        style={headerStyles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.87}
      >
        <Ionicons
          name="arrow-back"
          size={26}
          color={isDark ? "#fafafa" : "#222"}
        />
      </TouchableOpacity>
      <View style={headerStyles.headerBrand}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={headerStyles.brandLogo}
        />
        <Text style={headerStyles.brandText}>Sanjeevani AI</Text>
      </View>
      <View style={{ width: 30 }} />
    </View>
  );
}

export default function AboutScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme || "light");

  return (
    <View style={styles.container}>
      <AboutHeader />
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroLogo}>
              <View style={styles.logoCircle}>
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={styles.heroLogoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.heroTitle}>
              <Text style={styles.heroAccent}>About </Text>
              Sanjeevani AI
            </Text>
            <Text style={styles.heroSubtitle}>
              Bridging ancient Ayurvedic wisdom with cutting-edge AI technology
              to revolutionize personalized healthcare and wellness for the
              modern world.
            </Text>
          </View>
        </View>
        {/* Mission Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionEmoji}>🎯</Text>
          </View>
          <Text style={styles.sectionText}>
            At Sanjeevani AI, we believe that the ancient wisdom of Ayurveda
            joined with modern artificial intelligence can provide unprecedented
            insights into health. Our mission is to make personalized healthcare
            accessible for everyone—intelligent technology that understands your
            unique constitution and needs.
          </Text>
        </View>
        {/* Values Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesGrid}>
            {[
              {
                emoji: "🌿",
                title: "Ancient Wisdom",
                desc: "We honor and preserve Ayurvedic knowledge, making it accessible via modern tools.",
              },
              {
                emoji: "🔬",
                title: "Scientific Approach",
                desc: "Our AI is built on rigorous scientific research and validated clinically.",
              },
              {
                emoji: "🔒",
                title: "Privacy First",
                desc: "Your health data is sacred—protected by enterprise-grade security.",
              },
              {
                emoji: "🎯",
                title: "Personalization",
                desc: "Every individual is unique. Our AI gives recommendations built for you, not just for all.",
              },
            ].map((v) => (
              <View key={v.title} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Text style={styles.valueEmoji}>{v.emoji}</Text>
                </View>
                <Text style={styles.valueTitle}>{v.title}</Text>
                <Text style={styles.valueDescription}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>
        {/* Story Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Story</Text>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionEmoji}>👥</Text>
          </View>
          <Text style={styles.sectionText}>
            Sanjeevani AI was founded by healthcare professionals, AI
            researchers, and Ayurvedic specialists committed to blending
            traditional medicine with modern technology. Our team includes
            experts from medicine, computer science, and ancient
            therapies—united to build a revolutionary platform.
          </Text>
          <Text style={styles.sectionText}>
            Our journey began with one question: What if Ayurvedic wisdom could
            become universally accessible? Sanjeevani AI is our answer—a
            personalized wellness companion, supporting your health journey, and
            learning from you.
          </Text>
        </View>
        {/* Vision Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <View style={styles.sectionIcon}>
            <Text style={styles.sectionEmoji}>🌍</Text>
          </View>
          <Text style={styles.sectionText}>
            We envision a world where personalized healthcare isn't luxury—it's
            a right. Tradition and innovation should work together so everyone
            can live healthier, happier lives. Sanjeevani AI is building the
            future of wellness—one that respects history while driving progress.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function getStyles(theme) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#151718" : "#f5f6f7",
    },
    heroSection: {
      paddingTop: 32,
      paddingBottom: 28,
      alignItems: "center",
      backgroundColor: isDark ? "#181a1b" : "#f7fafc",
    },
    heroCard: {
      backgroundColor: isDark ? "#222428ee" : "#fff",
      borderRadius: 26,
      padding: 40,
      marginHorizontal: 24,
      marginBottom: 10,
      shadowColor: "#2ecc40",
      shadowOpacity: 0.09,
      shadowRadius: 18,
      elevation: 5,
      alignItems: "center",
      width: "100%",
      maxWidth: 600,
    },
    heroLogo: {
      marginBottom: 16,
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: isDark ? "#1e2022" : "#ffffff",
    },
    heroLogoImage: {
      width: 48,
      height: 48,
    },
    heroAccent: {
      color: "#eeaa3b",
      fontWeight: "bold",
      fontSize: 28,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#2ecc40",
      marginBottom: 8,
      textAlign: "center",
      letterSpacing: 0.07,
    },
    heroSubtitle: {
      fontSize: 16,
      color: isDark ? "#9be2b5" : "#258d44",
      textAlign: "center",
      lineHeight: 24,
      marginTop: 8,
    },
    sectionCard: {
      backgroundColor: isDark ? "#222428" : "#fff",
      borderRadius: 22,
      padding: 28,
      marginHorizontal: 24,
      marginVertical: 14,
      shadowColor: "#2ecc40",
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
      alignItems: "center",
      maxWidth: 650,
      alignSelf: "center",
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#2ecc40",
      marginBottom: 6,
      letterSpacing: 0.04,
      textAlign: "center",
    },
    sectionIcon: {
      marginBottom: 8,
      marginTop: 2,
    },
    sectionEmoji: {
      fontSize: 32,
    },
    sectionText: {
      fontSize: 15,
      color: isDark ? "#adb" : "#555",
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 10,
    },
    valuesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      marginTop: 15,
      gap: 18,
    },
    valueCard: {
      backgroundColor: isDark ? "#232529ee" : "#f7fafc",
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 18,
      minWidth: 138,
      width: "44%",
      maxWidth: 180,
      marginHorizontal: 4,
      marginBottom: 8,
      alignItems: "center",
      borderWidth: 1.2,
      borderColor: isDark ? "#234d33" : "#e0e0e0",
    },
    valueIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 5,
    },
    valueEmoji: {
      fontSize: 21,
    },
    valueTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: "#258d44",
      marginBottom: 4,
      letterSpacing: 0.01,
      textAlign: "center",
    },
    valueDescription: {
      fontSize: 13,
      color: isDark ? "#b4e6c9" : "#6e8572",
      lineHeight: 18,
      textAlign: "center",
    },
  });
}
