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

// Decorative blob SVG for modern hero/cta backgrounds
function BlobBackground({ style }) {
  return (
    <View
      style={[
        { position: "absolute", top: -80, left: -100, zIndex: -1 },
        style,
      ]}
    >
      <svg width="600" height="320" viewBox="0 0 600 320" fill="none">
        <ellipse
          cx="300"
          cy="120"
          rx="300"
          ry="120"
          fill="url(#grad)"
          fillOpacity=".19"
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
            <stop offset="0.7" stopColor="#068b3f" />
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

export default function WebFeaturesPage() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  if (Platform.OS !== "web") {
    return null;
  }

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
            <Text style={styles.heroTitle}>✨ Powerful Features</Text>
            <Text style={styles.heroSubtitle}>
              Discover the comprehensive suite of AI-powered tools designed to
              enhance your health journey with personalized insights and
              recommendations.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.heroCTA]}
            >
              <Text style={styles.buttonText}>Try Sanjeevani AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <WavyDivider />

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <View style={styles.featuresGrid}>
            {[
              {
                icon: "🔍",
                title: "Disease Prediction",
                desc: "Advanced AI algorithms analyze your symptoms, history, and health data for accurate disease predictions and early risk assessments.",
                details: [
                  "• Symptom analysis",
                  "• Risk assessment",
                  "• Early detection",
                  "• Preventive care",
                ],
                tag: "AI",
              },
              {
                icon: "🌿",
                title: "Ayurvedic Remedies",
                desc: "Explore trusted Ayurvedic treatments and natural remedies validated by modern science.",
                details: [
                  "• 5000+ natural remedies",
                  "• Herb identification",
                  "• Dosage recommendations",
                  "• Preparation instructions",
                ],
              },
              {
                icon: "💬",
                title: "AI Chat Assistant",
                desc: "Instant answers and health tips from our smart chatbot trained in medical and Ayurvedic knowledge.",
                details: [
                  "• 24/7 availability",
                  "• Instant responses",
                  "• Multi-language",
                  "• Context-aware",
                ],
              },
              {
                icon: "📊",
                title: "Health Analytics",
                desc: "Track your progress with analytics, visuals, and personalized insights for optimal wellness.",
                details: [
                  "• Progress tracking",
                  "• Visual reports",
                  "• Trends",
                  "• Goal setting",
                ],
              },
              {
                icon: "🎯",
                title: "Personalized Plans",
                desc: "Customized health, diet, and lifestyle plans based on your unique goals and constitution.",
                details: [
                  "• Custom diets",
                  "• Exercise routines",
                  "• Lifestyle mods",
                  "• Protocols",
                ],
              },
              {
                icon: "🔒",
                title: "Privacy & Security",
                desc: "Your data is safe and confidential with enterprise-grade security and privacy-first design.",
                details: [
                  "• End-to-end encryption",
                  "• HIPAA compliance",
                  "• Secure storage",
                  "• Privacy-first",
                ],
              },
            ].map((f, idx) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                </View>
                <Text style={styles.featureTitle}>
                  {f.title}{" "}
                  {f.tag && <Text style={styles.featureTag}>{f.tag}</Text>}
                </Text>
                <Text style={styles.featureDescription}>{f.desc}</Text>
                <View style={styles.featureDetails}>
                  {f.details.map((d) => (
                    <Text key={d} style={styles.detailItem}>
                      {d}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <WavyDivider color="#eeaa3b" />

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <BlobBackground
          style={{
            left: "auto",
            right: -80,
            top: -20,
            transform: [{ scaleX: 0.7 }, { scaleY: 1.1 }],
          }}
        />
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>
            Ready to Experience These Features?
          </Text>
          <Text style={styles.ctaSubtitle}>
            Start your personalized health journey today with Sanjeevani AI
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, styles.ctaButton]}
          >
            <Text style={styles.buttonText}>Get Started Now</Text>
          </TouchableOpacity>
          {/* Testimonial */}
          <View style={styles.testimonialBlock}>
            <Text style={styles.testimonialQuote}>
              “Sanjeevani AI helped me detect health risks early and guided my
              Ayurvedic wellness – highly recommended!”
            </Text>
            <Text style={styles.testimonialUser}>– User, Bangalore</Text>
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
      backgroundColor: isDark ? "#161818" : "#fafcfd",
    },
    // Hero
    heroSection: {
      paddingHorizontal: 40,
      paddingTop: 95,
      paddingBottom: 70,
      backgroundColor: isDark ? "#191b1e" : "#edf9f1",
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
      shadowOpacity: 0.08,
      shadowRadius: 30,
      elevation: 8,
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
    heroTitle: {
      fontSize: 42,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#222",
      marginBottom: 14,
      textAlign: "center",
      letterSpacing: 0.15,
      lineHeight: 50,
    },
    heroSubtitle: {
      fontSize: 20,
      color: isDark ? "#b9fbd6" : "#258d44",
      lineHeight: 28,
      textAlign: "center",
      maxWidth: 600,
      marginBottom: 20,
    },
    heroCTA: {
      marginTop: 10,
      paddingHorizontal: 28,
      paddingVertical: 14,
      fontSize: 18,
      shadowColor: "#2ecc40",
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 3,
    },

    // Features Section
    featuresSection: {
      paddingHorizontal: 40,
      paddingTop: 60,
      paddingBottom: 90,
      backgroundColor: isDark ? "#202222" : "#ffffff",
    },
    sectionContainer: {
      maxWidth: 1240,
      alignSelf: "center",
      width: "100%",
    },
    sectionTitle: {
      fontSize: 34,
      fontWeight: "bold",
      color: isDark ? "#2ecc40" : "#2ecc40",
      textAlign: "center",
      marginBottom: 48,
      letterSpacing: 0.07,
    },
    featuresGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 28,
    },
    featureCard: {
      backgroundColor: isDark ? "#232529ee" : "#f7fafcdd",
      borderRadius: 18,
      paddingVertical: 34,
      paddingHorizontal: 26,
      width: 370,
      borderWidth: 1.5,
      borderColor: isDark ? "#234d33" : "#e0e0e0",
      shadowColor: "#23cc40",
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 3,
      marginBottom: 10,
      position: "relative",
      transition:
        "transform 0.17s cubic-bezier(.4,1.7,.7,.8), box-shadow 0.17s",
    },
    featureIcon: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: "#2ecc40",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    featureEmoji: {
      fontSize: 32,
    },
    featureTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDark ? "#87e3ac" : "#258d44",
      marginBottom: 13,
      letterSpacing: 0.01,
    },
    featureTag: {
      fontSize: 13,
      backgroundColor: "#eeaa3b",
      color: "#fff",
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 2,
      marginLeft: 7,
      fontWeight: "bold",
      overflow: "hidden",
    },
    featureDescription: {
      fontSize: 15,
      color: isDark ? "#d7e7d1" : "#558535",
      lineHeight: 22,
      marginBottom: 16,
    },
    featureDetails: {
      gap: 6,
    },
    detailItem: {
      fontSize: 13,
      color: isDark ? "#a7ebcd" : "#777777",
      lineHeight: 18,
    },

    // General Button
    button: {
      paddingHorizontal: 24,
      paddingVertical: 11,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.11,
      shadowRadius: 7,
      elevation: 2,
    },
    primaryButton: {
      backgroundColor: "#2ecc40",
    },
    buttonText: {
      fontSize: 16,
      color: "#ffffff",
      fontWeight: "bold",
      letterSpacing: 0.09,
    },

    // CTA Section
    ctaSection: {
      paddingHorizontal: 40,
      paddingTop: 105,
      paddingBottom: 100,
      backgroundColor: isDark ? "#181a1b" : "#e8fdaa",
      alignItems: "center",
      position: "relative",
    },
    ctaCard: {
      backgroundColor: isDark ? "#232a2e" : "#ffffff",
      borderRadius: 28,
      padding: 55,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 18,
      elevation: 7,
      maxWidth: 600,
      width: "100%",
      position: "relative",
      zIndex: 2,
    },
    ctaTitle: {
      fontSize: 30,
      fontWeight: "bold",
      color: isDark ? "#2ecc40" : "#2ecc40",
      textAlign: "center",
      marginBottom: 14,
      letterSpacing: 0.07,
    },
    ctaSubtitle: {
      fontSize: 18,
      color: isDark ? "#b9fbd6" : "#258d44",
      textAlign: "center",
      marginBottom: 30,
      lineHeight: 24,
    },
    ctaButton: {
      paddingHorizontal: 36,
      paddingVertical: 18,
      fontSize: 19,
      shadowColor: "#2ecc40",
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 3,
      marginTop: 10,
    },

    testimonialBlock: {
      marginTop: 30,
      backgroundColor: isDark ? "#222c3b" : "#f7fade",
      borderRadius: 13,
      padding: 15,
      alignItems: "center",
      maxWidth: 450,
    },
    testimonialQuote: {
      fontStyle: "italic",
      color: "#2ecc40",
      fontSize: 15,
      textAlign: "center",
      marginBottom: 6,
    },
    testimonialUser: {
      color: isDark ? "#cdc" : "#777",
      fontSize: 13,
      fontWeight: "bold",
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
