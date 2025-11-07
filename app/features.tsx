import BrandHeader from "@/components/brand-header";
import { useAppTheme } from "@/context/theme";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function FeaturesScreen() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme || "light");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
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
          <Text style={styles.heroTitle}>Powerful Features</Text>
          <Text style={styles.heroSubtitle}>
            Discover the comprehensive suite of AI-powered tools designed to
            enhance your health journey with personalized insights and
            recommendations.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🔍</Text>
            </View>
            <Text style={styles.featureTitle}>Disease Prediction</Text>
            <Text style={styles.featureDescription}>
              Our advanced AI algorithms analyze your symptoms, medical history,
              and health data to provide accurate disease predictions and risk
              assessments.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Symptom analysis</Text>
              <Text style={styles.detailItem}>• Risk assessment</Text>
              <Text style={styles.detailItem}>• Early detection</Text>
              <Text style={styles.detailItem}>
                • Preventive care recommendations
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🌿</Text>
            </View>
            <Text style={styles.featureTitle}>Ayurvedic Remedies</Text>
            <Text style={styles.featureDescription}>
              Access a comprehensive database of traditional Ayurvedic
              treatments and natural remedies backed by thousands of years of
              wisdom.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• 5000+ natural remedies</Text>
              <Text style={styles.detailItem}>• Herb identification</Text>
              <Text style={styles.detailItem}>• Dosage recommendations</Text>
              <Text style={styles.detailItem}>• Preparation instructions</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>💬</Text>
            </View>
            <Text style={styles.featureTitle}>AI Chat Assistant</Text>
            <Text style={styles.featureDescription}>
              Get instant health advice and answers to your questions from our
              intelligent AI assistant trained on vast medical knowledge.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• 24/7 availability</Text>
              <Text style={styles.detailItem}>• Instant responses</Text>
              <Text style={styles.detailItem}>• Multi-language support</Text>
              <Text style={styles.detailItem}>
                • Context-aware conversations
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>📊</Text>
            </View>
            <Text style={styles.featureTitle}>Health Analytics</Text>
            <Text style={styles.featureDescription}>
              Track your health progress with detailed analytics, visual
              reports, and personalized insights to optimize your wellness
              journey.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Progress tracking</Text>
              <Text style={styles.detailItem}>• Visual dashboards</Text>
              <Text style={styles.detailItem}>• Trend analysis</Text>
              <Text style={styles.detailItem}>• Goal setting & monitoring</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🍽️</Text>
            </View>
            <Text style={styles.featureTitle}>Diet & Nutrition</Text>
            <Text style={styles.featureDescription}>
              Receive personalized dietary recommendations based on your
              constitution, health goals, and Ayurvedic principles.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Personalized meal plans</Text>
              <Text style={styles.detailItem}>• Recipe suggestions</Text>
              <Text style={styles.detailItem}>• Nutritional guidance</Text>
              <Text style={styles.detailItem}>
                • Food compatibility analysis
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>🧘</Text>
            </View>
            <Text style={styles.featureTitle}>Lifestyle Recommendations</Text>
            <Text style={styles.featureDescription}>
              Get personalized lifestyle advice including yoga, meditation,
              sleep patterns, and daily routines aligned with Ayurvedic wisdom.
            </Text>
            <View style={styles.featureDetails}>
              <Text style={styles.detailItem}>• Yoga & meditation guides</Text>
              <Text style={styles.detailItem}>• Sleep optimization</Text>
              <Text style={styles.detailItem}>• Stress management</Text>
              <Text style={styles.detailItem}>• Daily routine planning</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#151718" : "#f5f6f7",
    },
    heroCard: {
      backgroundColor: isDark ? "#222" : "#fff",
      borderRadius: 20,
      padding: 24,
      margin: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      alignItems: "center",
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
    heroTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#2ecc40",
      marginBottom: 8,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 16,
      color: isDark ? "#aaa" : "#666",
      textAlign: "center",
      lineHeight: 24,
    },
    featuresContainer: {
      paddingHorizontal: 20,
    },
    featureCard: {
      backgroundColor: isDark ? "#222" : "#fff",
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    featureIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? "#2a2d2e" : "#f0f9f4",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    featureEmoji: {
      fontSize: 32,
    },
    featureTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#222",
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 15,
      color: isDark ? "#aaa" : "#666",
      lineHeight: 22,
      marginBottom: 12,
    },
    featureDetails: {
      marginTop: 8,
    },
    detailItem: {
      fontSize: 14,
      color: isDark ? "#bbb" : "#555",
      lineHeight: 22,
      marginBottom: 4,
    },
  });
}
