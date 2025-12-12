import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

export default function SanjeevaniSplash() {
  /** LEAF GROW ANIMATION */
  const leafGrow = useRef(new Animated.Value(0.1)).current;

  /** RING PULSE */
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringGlow = useRef(new Animated.Value(0)).current;

  /** TITLE ARC ANIMATION */
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(40)).current;

  /** LOGO FADE-IN */
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo fade + scale intro
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),

      // Leaf grows upward
      Animated.timing(leafGrow, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      // Title arc reveal
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // Ring glowing pulse loop
      Animated.loop(
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(ringGlow, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]),
      ),
    ]).start();
  }, []);

  const ringShadow = ringGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 20],
  });

  return (
    <View style={styles.container}>
      {/* 🔥 Ring Pulse */}
      <Animated.View
        style={[
          styles.ring,
          {
            transform: [{ scale: ringScale }],
            shadowRadius: ringShadow,
            shadowColor: "#FFD700",
            shadowOpacity: 0.8,
          },
        ]}
      />

      {/* 🌿 LEAF GROW ANIMATION (Mask) */}
      <Animated.View
        style={{
          overflow: "hidden",
          transform: [{ scaleY: leafGrow }],
        }}
      >
        <Animated.Image
          source={require("../assets/sanjeevani_logo.png")}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* ✨ ARC TITLE ANIMATION */}
      <Animated.View
        style={[
          styles.titleWrapper,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          },
        ]}
      >
        <Text style={styles.arcText}>SANJEEVANI AI</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070A0E",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 330,
    height: 330,
  },

  ring: {
    position: "absolute",
    width: 360,
    height: 360,
    borderWidth: 3,
    borderColor: "#FFD700",
    borderRadius: 200,
  },

  titleWrapper: {
    position: "absolute",
    top: "20%",
  },

  arcText: {
    fontSize: 24,
    color: "#FFD700",
    fontWeight: "bold",
    letterSpacing: 4,
    transform: [{ rotate: "-8deg" }],
  },
});
