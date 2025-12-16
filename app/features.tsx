export const options = { headerShown: false };

import { useAppTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

/* ---------------- HEADER (SAME AS ABOUT) ---------------- */

function FeaturesHeader() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const isDark = theme === "dark";
  const STATUSBAR_HEIGHT =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 30;

  return (
    <View
      style={[
        styles.header,
        { paddingTop: STATUSBAR_HEIGHT + 6 },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        activeOpacity={0.8}
      >
        <Ionicons
          name="arrow-back"
          size={26}
          color={isDark ? "#ffffff" : "#222"}
        />
      </TouchableOpacity>

      <View style={styles.headerBrand}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.headerLogo}
        />
        <Text style={styles.headerTitle}>Sanjeevani AI</Text>
      </View>

      <View style={{ width: 26 }} />
    </View>
  );
}

/* ---------------- SCREEN ---------------- */

export default function FeaturesScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      {/* 🚫 Disable default Expo Router header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Animated Background */}
        <Animated.View style={styles.animatedBg} />

        {/* Custom Header */}
        <FeaturesHeader />

        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* HERO */}
          <Animated.View
            style={[
              styles.glassCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                marginTop: 30,
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={{ width: 44, height: 44 }}
              />
            </View>

            <Text style={styles.heroTitle}>Powerful Features</Text>
            <Text style={styles.heroText}>
              A comprehensive AI-powered ecosystem designed to enhance your
              health journey with intelligence, care, and personalization.
            </Text>
          </Animated.View>

          {/* FEATURES */}
          {[
            {
              icon: "🔍",
              title: "Disease Prediction",
              desc:
                "AI-driven symptom analysis for early disease detection and preventive care.",
              points: [
                "Symptom analysis",
                "Risk assessment",
                "Early detection",
                "Preventive recommendations",
              ],
            },
            {
              icon: "🌿",
              title: "Ayurvedic Remedies",
              desc:
                "Traditional remedies integrated with modern AI validation.",
              points: [
                "Natural remedies",
                "Herb identification",
                "Dosage guidance",
                "Preparation methods",
              ],
            },
            {
              icon: "💬",
              title: "AI Chat Assistant",
              desc:
                "Instant, context-aware health guidance powered by AI.",
              points: [
                "24/7 availability",
                "Smart conversations",
                "Multi-language support",
                "Personalized answers",
              ],
            },
            {
              icon: "📊",
              title: "Health Analytics",
              desc:
                "Track, visualize, and understand your health trends.",
              points: [
                "Progress tracking",
                "Visual dashboards",
                "Trend analysis",
                "Goal monitoring",
              ],
            },
            {
              icon: "🍽️",
              title: "Diet & Nutrition",
              desc:
                "Personalized dietary plans based on Ayurvedic principles.",
              points: [
                "Meal planning",
                "Recipe suggestions",
                "Nutrition balance",
                "Food compatibility",
              ],
            },
            {
              icon: "🧘",
              title: "Lifestyle Guidance",
              desc:
                "Holistic lifestyle recommendations for mind and body balance.",
              points: [
                "Yoga & meditation",
                "Sleep optimization",
                "Stress management",
                "Daily routines",
              ],
            },
          ].map((f, i) => (
            <Animated.View
              key={f.title}
              style={[
                styles.glassCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.add(
                        slideAnim,
                        new Animated.Value(i * 8)
                      ),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.icon}</Text>
              </View>

              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDescription}>{f.desc}</Text>

              <View style={styles.featureDetails}>
                {f.points.map((p) => (
                  <Text key={p} style={styles.detailItem}>
                    • {p}
                  </Text>
                ))}
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  animatedBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.85)",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: "rgba(2,6,23,0.8)",
  },
  backBtn: {
    paddingRight: 12,
    paddingVertical: 6,
  },
  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2ecc40",
  },

  /* GLASS CARD */
  glassCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 26,
    borderRadius: 24,
    backgroundColor: "rgba(15,23,42,0.6)",
    borderWidth: 1,
    borderColor: "rgba(46,204,64,0.25)",
    alignItems: "center",
  },

  logoCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#2ecc40",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2ecc40",
    textAlign: "center",
  },
  heroText: {
    fontSize: 15,
    color: "#b6e7c7",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },

  featureIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(46,204,64,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  featureEmoji: {
    fontSize: 30,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2ecc40",
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 14,
    color: "#c8eedd",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  featureDetails: {
    alignSelf: "stretch",
  },
  detailItem: {
    fontSize: 13,
    color: "#b6e7c7",
    lineHeight: 20,
    marginBottom: 4,
  },
});
