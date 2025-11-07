import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [titleLetters, setTitleLetters] = useState('');
  const [showTagline, setShowTagline] = useState(false);
  const logoAnim = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background gradient animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(backgroundAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Glow effect animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();

    // Logo entrance with enhanced animations
    Animated.sequence([
      // Initial flash
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      // Logo appearance with rotation and scale
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.7)),
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.exp),
        }),
      ]),
    ]).start();

    // Pulse effect after logo appears
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ])
      ).start();
    }, 1000);

    // Letter-by-letter animation for title with enhanced timing
    const title = 'Sanjeevani AI';
    let i = 0;
    const interval = setInterval(() => {
      setTitleLetters(title.slice(0, i + 1));
      i++;
      if (i === title.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowTagline(true);
          Animated.spring(taglineAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, 400);
        // Hide splash after all animations with fade out
        setTimeout(() => {
          Animated.timing(logoAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.in(Easing.exp),
          }).start(() => {
            setVisible(false);
            onFinish();
          });
        }, 3000);
      }
    }, 4000 / title.length);
    return () => clearInterval(interval);
  }, [logoAnim, flashAnim, taglineAnim, pulseAnim, rotateAnim, backgroundAnim, glowAnim, onFinish]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: backgroundAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['#f7fafc', '#e8f4f8'],
          }),
        },
      ]}
    >
      {/* Glow effect behind the logo */}
      <Animated.View
        style={{
          position: 'absolute',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 0.8],
          }),
          transform: [
            {
              scale: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.2],
              }),
            },
          ],
        }}
      >
        <View style={styles.glowEffect} />
      </Animated.View>

      <Animated.View
        style={{
          opacity: logoAnim,
          transform: [
            {
              scale: Animated.multiply(
                logoAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.7, 1],
                }),
                pulseAnim
              ),
            },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        <Animated.View
          style={{
            opacity: flashAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.2],
            }),
          }}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
      <View style={{ marginTop: 32 }}>
        <Text style={styles.title}>{titleLetters}</Text>
      </View>
      {showTagline && (
        <Animated.View style={{ opacity: taglineAnim, marginTop: 24 }}>
          <View style={styles.flaskContainer}>
            {/* Simple flask icon using SVG path or emoji for demo */}
            <Text style={styles.flaskIcon}>🧪</Text>
            <Text style={styles.tagline}>A personal HealthCare from Ayurveda</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 32,
    // All shadow and elevation removed for a clear logo
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a7ea4',
    textAlign: 'center',
    letterSpacing: 1,
  },
  flaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  flaskIcon: {
    fontSize: 24,
    marginRight: 6,
  },
  tagline: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  glowEffect: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#0a7ea4',
    opacity: 0.1,
  },
});
