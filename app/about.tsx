import { useAppTheme } from "@/context/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Linking from "expo-linking";
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

/* ---------------- HEADER ---------------- */

function AboutHeader() {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const isDark = theme === "dark";
  const STATUSBAR_HEIGHT =
    Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 30;

  return (
    <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT + 6 }]}>
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
    </View>
  );
}

/* ---------------- SCREEN ---------------- */

export default function AboutScreen() {
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

  const developers = [
    {
      name: "Shrinivas N",
      role: "Data Scientist",
      img: require("@/assets/images/shri.png"),
      linkedin: "https://www.https://www.linkedin.com/in/shrinivas-nadager?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B8WZRnrXkTbym4xNJvVL7Dg%3D%3D.com/in/shrinivas-n/",
    },
    {
      name: "Basavaraj H G",
      role: "Data Analyst | Security Engineer",
      img: require("@/assets/images/Basu.jpeg"),
      linkedin: "https://www.linkedin.com/in/basavaraj-h-gurikar-95b739284?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BSDw9ad7OTf6c2XD8sqZjKw%3D%3D"
     },
    
    {
      name: "Meenakshi",
      role: "ML Engineer",
      img: require("@/assets/images/sonu.png"),
      linkedin: "https://www.linkedin.com/in/meenakshi-mallikarjun-a999b626b?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3B1IdtUvOXRqWKgVm19bxvTA%3D%3D",
    },
    {
      name: "Samruddhi",
      role: "ML Engineer",
      img: require("@/assets/images/sam.png"),
      linkedin: "https://www.linkedin.com/in/samruddhi-bilgundi-993739284?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BNXfB85oMQMeSo6di632jzA%3D%3D",
    },
  ];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        <Animated.View style={styles.animatedBg} />

        <AboutHeader />

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

            <Text style={styles.heroTitle}>
              <Text style={{ color: "#eeaa3b" }}>About </Text>Sanjeevani AI
            </Text>

            <Text style={styles.heroText}>
              Bridging ancient Ayurvedic wisdom with cutting-edge AI technology
              to deliver personalized healthcare for the modern world.
            </Text>
          </Animated.View>

          {/* INFO SECTIONS */}
          {[
            {
              title: "Our Mission",
              emoji: "🎯",
              text:
                "We combine Ayurveda and AI to deliver intelligent, personalized healthcare that respects tradition and innovation equally.",
            },
            {
              title: "Our Story",
              emoji: "👥",
              text:
                "Founded by healthcare professionals and AI engineers, Sanjeevani AI exists to make holistic wellness accessible to everyone.",
            },
            {
              title: "Our Vision",
              emoji: "🌍",
              text:
                "A future where personalized healthcare is a right, not a luxury—powered by ethical AI and ancient wisdom.",
            },
          ].map((sec, i) => (
            <Animated.View
              key={sec.title}
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
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              <Text style={styles.sectionEmoji}>{sec.emoji}</Text>
              <Text style={styles.sectionText}>{sec.text}</Text>
            </Animated.View>
          ))}

          {/* DEVELOPERS */}
          <Animated.View style={[styles.glassCard, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Developers</Text>

            <View style={styles.devGrid}>
              {developers.map((dev) => (
                <View key={dev.name} style={styles.devCard}>
                  <Image source={dev.img} style={styles.devAvatar} />
                  <Text style={styles.devName}>{dev.name}</Text>
                  <Text style={styles.devRole}>{dev.role}</Text>

                  <TouchableOpacity
                    style={styles.linkedinBtn}
                    onPress={() => Linking.openURL(dev.linkedin)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="logo-linkedin"
                      size={22}
                      color="#0A66C2"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Animated.View>
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

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2ecc40",
    marginBottom: 6,
    textAlign: "center",
  },
  sectionEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#c8eedd",
    textAlign: "center",
    lineHeight: 22,
  },

  devGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 14,
  },
  devCard: {
    flexBasis: "48%",
    backgroundColor: "rgba(15,23,42,0.75)",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(46,204,64,0.25)",
  },
  devAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#2ecc40",
    marginBottom: 12,
  },
  devName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2ecc40",
    textAlign: "center",
  },
  devRole: {
    fontSize: 12,
    color: "#c8eedd",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 16,
  },
  linkedinBtn: {
    marginTop: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(10,102,194,0.35)",
  },
});
