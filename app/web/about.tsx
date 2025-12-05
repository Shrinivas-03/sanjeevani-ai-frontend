import BrandHeader from "@/components/brand-header";
import { useAppTheme } from "@/context/theme";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Decorative blob SVG
function BlobBackground({ style }) {
  return (
    <View
      style={[{ position: "absolute", top: -80, left: -90, zIndex: -1 }, style]}
    >
      <svg width="600" height="320" viewBox="0 0 600 320" fill="none">
        <ellipse
          cx="300"
          cy="120"
          rx="300"
          ry="120"
          fill="url(#grad)"
          fillOpacity=".13"
        />
        <defs>
          <linearGradient
            id="grad"
            x1="0"
            y1="0"
            x2="600"
            y2="320"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2ecc40" />
            <stop offset="0.82" stopColor="#0c7a35" />
          </linearGradient>
        </defs>
      </svg>
    </View>
  );
}

// Section divider
function WavyDivider({ color = "#2ecc40" }) {
  return (
    <View style={{ width: "100%", height: 50, overflow: "hidden" }}>
      <svg width="100%" height="50" viewBox="0 0 1440 50">
        <path
          fill={color}
          fillOpacity="0.07"
          d="M0,0 C700,100 1000,-40 1440,30 L1440,50 L0,50Z"
        />
      </svg>
    </View>
  );
}

export default function WebAboutPage() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  if (Platform.OS !== "web") return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <BrandHeader mode="landing" />

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <BlobBackground />
        <View style={styles.heroContent}>
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
      </View>

      <WavyDivider />

      {/* Mission Section */}
      <View style={styles.missionSection}>
        <BlobBackground
          style={{
            top: "auto",
            bottom: -140,
            left: -40,
            opacity: 0.18,
            transform: [{ scaleX: 0.9 }, { scaleY: 1.2 }],
          }}
        />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.missionText}>
            At Sanjeevani AI, we believe the ancient wisdom of Ayurveda together
            with modern artificial intelligence can provide unprecedented
            insights into health and wellness. Our mission is to make
            personalized, preventive healthcare accessible and empowering
            through intelligent, caring technology.
          </Text>
        </View>
      </View>

      <WavyDivider color="#eeaa3b" />

      {/* Values Section */}
      <View style={styles.valuesSection}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Values</Text>
          <View style={styles.valuesGrid}>
            {[
              {
                icon: "🌿",
                title: "Ancient Wisdom",
                desc: "We honor and preserve traditional Ayurvedic knowledge while making it accessible through modern technology.",
                tag: "Ayurveda",
              },
              {
                icon: "🔬",
                title: "Scientific Approach",
                desc: "Our AI algorithms are built on rigorous research and validated through clinical studies.",
                tag: "AI",
              },
              {
                icon: "🔒",
                title: "Privacy First",
                desc: "Your health data is sacred. We employ enterprise-grade security and privacy.",
                tag: "Security",
              },
              {
                icon: "🎯",
                title: "Personalization",
                desc: "Every individual is unique. We create recommendations based on your profile.",
                tag: "Personal",
              },
            ].map((v) => (
              <View key={v.title} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Text style={styles.valueEmoji}>{v.icon}</Text>
                </View>
                <Text style={styles.valueTitle}>
                  {v.title} <Text style={styles.valueTag}>{v.tag}</Text>
                </Text>
                <Text style={styles.valueDescription}>{v.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <WavyDivider />

      {/* Team Section */}
      <View style={styles.teamSection}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <Text style={styles.teamDescription}>
            Our multidisciplinary team brings together Ayurveda, AI, software
            engineering, and healthcare expertise. We are passionate about
            building accessible health technologies for everyone.
          </Text>
          <View style={styles.teamGrid}>
            {[
              {
                name: "Basavaraj H G",
                role: "Data Analyst ",
                img: require("@/assets/images/basu.png"),
              },
              {
                name: "Samrudhi",
                role: "Backend Engineer",
                img: require("@/assets/images/sam.png"),
              },
              {
                name: "Meenakshi Jajee",
                role: "Data Analyst",
                img: require("@/assets/images/sonu.png"),
              },
              {
                name: "Shrinivas Nadager",
                role: "Full-Stack AI Developer",
                img: require("@/assets/images/shri.png"),
              },
            ].map((mem) => (
              <View key={mem.name} style={styles.teamCard}>
                <Image source={mem.img} style={styles.teamAvatar} />
                <Text style={styles.teamName}>{mem.name}</Text>
                <Text style={styles.teamRole}>{mem.role}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogoCircle}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.footerLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.footerBrandText}>Sanjeevani AI</Text>
          </View>
          <View style={styles.footerLinks}>
            {["Privacy Policy", "Terms of Service", "Support", "Contact"].map(
              (link) => (
                <TouchableOpacity key={link} style={styles.footerLink}>
                  <Text style={styles.footerLinkText}>{link}</Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
        <Text style={styles.copyright}>
          © 2024 Sanjeevani AI. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

function getStyles(theme) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#151718" : "#f7fafc",
    },
    // Hero
    heroSection: {
      paddingHorizontal: 40,
      paddingTop: 90,
      paddingBottom: 70,
      backgroundColor: isDark ? "#191b1e" : "#f8fffa",
      alignItems: "center",
      position: "relative",
    },
    heroContent: {
      maxWidth: 800,
      width: "100%",
      alignItems: "center",
    },
    heroCard: {
      backgroundColor: isDark ? "#222428dd" : "#ffffff",
      borderRadius: 30,
      padding: 60,
      alignItems: "center",
      shadowColor: "#2ecc40",
      shadowOpacity: 0.09,
      shadowRadius: 22,
      elevation: 4,
      width: "100%",
      position: "relative",
      zIndex: 2,
    },
    heroLogo: {
      marginBottom: 24,
    },
    logoCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 4,
      borderColor: isDark ? "#1e2022" : "#ffffff",
    },
    heroLogoImage: {
      width: 50,
      height: 50,
    },
    heroAccent: {
      color: "#eeaa3b",
      fontWeight: "bold",
      fontSize: 42,
    },
    heroTitle: {
      fontSize: 42,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#222",
      marginBottom: 14,
      textAlign: "center",
      letterSpacing: 0.13,
      lineHeight: 50,
    },
    heroSubtitle: {
      fontSize: 20,
      color: isDark ? "#b9fbd6" : "#258d44",
      lineHeight: 28,
      textAlign: "center",
      maxWidth: 600,
    },
    // Mission
    missionSection: {
      paddingHorizontal: 40,
      paddingTop: 62,
      paddingBottom: 75,
      backgroundColor: isDark ? "#222" : "#ffffff",
      position: "relative",
    },
    sectionContainer: {
      maxWidth: 1100,
      alignSelf: "center",
      width: "100%",
    },
    sectionTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: isDark ? "#2ecc40" : "#2ecc40",
      textAlign: "center",
      marginBottom: 32,
      letterSpacing: 0.07,
    },
    missionText: {
      fontSize: 18,
      color: isDark ? "#ccc" : "#666",
      lineHeight: 28,
      textAlign: "center",
      maxWidth: 900,
      alignSelf: "center",
    },
    // Values
    valuesSection: {
      paddingHorizontal: 40,
      paddingTop: 65,
      paddingBottom: 60,
      backgroundColor: isDark ? "#151718" : "#f7fafc",
    },
    valuesGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 29,
    },
    valueCard: {
      backgroundColor: isDark ? "#232529ee" : "#ffffff",
      borderRadius: 18,
      paddingVertical: 29,
      paddingHorizontal: 21,
      width: 270,
      borderWidth: 1.5,
      borderColor: isDark ? "#234d33" : "#e0e0e0",
      shadowColor: "#23cc40",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
      marginBottom: 10,
      alignItems: "center",
      position: "relative",
    },
    valueIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 13,
    },
    valueEmoji: {
      fontSize: 29,
    },
    valueTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDark ? "#258d44" : "#258d44",
      marginBottom: 8,
      letterSpacing: 0.02,
      textAlign: "center",
    },
    valueTag: {
      fontSize: 12,
      backgroundColor: "#eeaa3b",
      color: "#fff",
      borderRadius: 7,
      paddingHorizontal: 7,
      paddingVertical: 1,
      marginLeft: 6,
      fontWeight: "600",
      overflow: "hidden",
    },
    valueDescription: {
      fontSize: 14,
      color: isDark ? "#d7e7d1" : "#558535",
      lineHeight: 22,
      textAlign: "center",
    },
    // Team
    teamSection: {
      paddingHorizontal: 40,
      paddingTop: 80,
      paddingBottom: 90,
      backgroundColor: isDark ? "#17191b" : "#f7fafc",
    },
    teamDescription: {
      fontSize: 18,
      color: isDark ? "#cccccc" : "#666666",
      lineHeight: 28,
      textAlign: "center",
      maxWidth: 900,
      alignSelf: "center",
      marginBottom: 28,
    },
    teamGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 34,
    },
    teamCard: {
      backgroundColor: isDark ? "#1c1f29" : "#fcfcfc",
      borderRadius: 17,
      padding: 23,
      alignItems: "center",
      width: 240,
      borderWidth: 1,
      borderColor: isDark ? "#223d2b" : "#dfdfdf",
    },
    teamAvatar: {
      width: 120,
      height: 120,
      borderRadius: 55,
      marginBottom: 14,
      borderWidth: 4,
      borderColor: "#2ecc40",
    },

    teamName: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDark ? "#2ecc40" : "#258d44",
      marginBottom: 2,
    },
    teamRole: {
      fontSize: 14,
      color: isDark ? "#ccd" : "#958535",
      fontWeight: "600",
    },

    // Footer
    footer: {
      backgroundColor: isDark ? "#222" : "#333333",
      paddingHorizontal: 40,
      paddingVertical: 48,
    },
    footerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      maxWidth: 1200,
      alignSelf: "center",
      width: "100%",
    },
    footerBrand: {
      flexDirection: "row",
      alignItems: "center",
    },
    footerLogoCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#ffffff",
      marginRight: 10,
    },
    footerLogo: {
      width: 20,
      height: 20,
    },
    footerBrandText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#ffffff",
    },
    footerLinks: {
      flexDirection: "row",
      gap: 32,
    },
    footerLink: {
      paddingVertical: 4,
    },
    footerLinkText: {
      color: "#ffffff",
      fontSize: 14,
      opacity: 0.82,
    },
    copyright: {
      color: "#cccccc",
      fontSize: 12,
      textAlign: "center",
      opacity: 0.6,
    },
  });
}
