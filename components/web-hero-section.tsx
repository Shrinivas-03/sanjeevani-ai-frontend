import { useAppTheme } from '@/context/theme';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WebHeroSection() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.heroContainer}>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>Welcome to Sanjeevani AI</Text>
        <Text style={styles.heroSubtitle}>
          Your personalized guide to health and well-being. Discover insights into your health with our advanced Ayurvedic 
          prediction and explore the ancient wisdom of Ayurveda.
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Decorative Elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.floatingCard, styles.card1]}>
          <Text style={styles.cardIcon}>🌿</Text>
          <Text style={styles.cardText}>Ayurvedic Wisdom</Text>
        </View>
        <View style={[styles.floatingCard, styles.card2]}>
          <Text style={styles.cardIcon}>🔬</Text>
          <Text style={styles.cardText}>AI Predictions</Text>
        </View>
        <View style={[styles.floatingCard, styles.card3]}>
          <Text style={styles.cardIcon}>💚</Text>
          <Text style={styles.cardText}>Holistic Health</Text>
        </View>
      </View>
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
    heroContainer: {
      minHeight: 600,
      paddingHorizontal: 40,
      paddingVertical: 80,
      backgroundColor: isDark ? '#0f0f0f' : '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    heroContent: {
      maxWidth: 800,
      alignItems: 'center',
      zIndex: 2,
    },
    heroTitle: {
      fontSize: 56,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#1f2937',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 64,
    },
    heroSubtitle: {
      fontSize: 20,
      color: isDark ? '#d1d5db' : '#6b7280',
      textAlign: 'center',
      lineHeight: 32,
      marginBottom: 48,
      maxWidth: 600,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: '#2ecc40',
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 8,
      shadowColor: '#2ecc40',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryButton: {
      borderWidth: 2,
      borderColor: isDark ? '#ffffff' : '#374151',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 8,
      backgroundColor: 'transparent',
    },
    secondaryButtonText: {
      color: isDark ? '#ffffff' : '#374151',
      fontSize: 16,
      fontWeight: '600',
    },
    decorativeElements: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      zIndex: 1,
    },
    floatingCard: {
      position: 'absolute',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#e5e7eb',
    },
    card1: {
      top: '20%',
      left: '10%',
      transform: [{ rotate: '-5deg' }],
    },
    card2: {
      top: '15%',
      right: '10%',
      transform: [{ rotate: '5deg' }],
    },
    card3: {
      bottom: '20%',
      left: '15%',
      transform: [{ rotate: '3deg' }],
    },
    cardIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    cardText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#374151',
    },
  });
}