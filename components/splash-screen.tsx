import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const splashOpacityAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const titleOpacityAnim = useRef(new Animated.Value(0)).current;
  const titleTranslateAnim = useRef(new Animated.Value(40)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 15 || Math.abs(gesture.dy) > 15,
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > 40 || Math.abs(gesture.dy) > 40) {
          Animated.timing(splashOpacityAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
            easing: Easing.linear,
          }).start(() => {
            onFinish();
          });
        }
      },
    })
  ).current;

  useEffect(() => {
    // Pulsing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();

    // Whip-style title animation
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacityAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(titleTranslateAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]).start();
    }, 600);
  }, []);

  return (
    <Animated.View
      style={[styles.container, { opacity: splashOpacityAnim }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.content}>
        {/* Mixed 2-color glow + logo */}
        <View style={styles.logoGlowContainer}>
          {/* Outer greenish glow */}
          <Animated.View
            style={[
              styles.glowCircleOuter,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.08, 0.25],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Inner golden glow */}
          <Animated.View
            style={[
              styles.glowCircleInner,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.15, 0.4],
                }),
                transform: [
                  {
                    scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.1],
                    }),
                  },
                ],
              },
            ]}
          />

          {/* Pure logo (no white border) */}
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Title with whip animation */}
        <Animated.View
          style={[
            styles.titleWrapper,
            {
              opacity: titleOpacityAnim,
              transform: [{ translateY: titleTranslateAnim }],
            },
          ]}
        >
          <Text style={styles.title}>SANJEEVANI AI</Text>
        </Animated.View>

        {/* Tagline */}
        <View style={styles.taglineWrapper}>
          <Text style={styles.tagline}>
            Your Personal Ayurveda Health Companion
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
    zIndex: 10,
  },

  logoGlowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 🔻 Reduced radius + 2-color mixed glow
  glowCircleOuter: {
    position: 'absolute',
    width: 250,         // reduced from 290
    height: 250,
    borderRadius: 125,
    backgroundColor: '#22c55e', // herbal green glow
  },
  glowCircleInner: {
    position: 'absolute',
    width: 220,         // smaller, closer to logo
    height: 220,
    borderRadius: 110,
    backgroundColor: '#fbbf24', // golden glow
  },

  logoWrapper: {
    width: 230,
    height: 230,
    borderRadius: 115,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    elevation: 10,
  },

  logo: {
    width: 210,
    height: 210,
    borderRadius: 105,
  },

  titleWrapper: {
    marginTop: 32,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 3,
    textAlign: 'center',
  },

  taglineWrapper: {
    marginTop: 10,
    paddingHorizontal: 20,
  },

  tagline: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
  },
});

