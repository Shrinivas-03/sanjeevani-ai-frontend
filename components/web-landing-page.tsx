import BrandHeader from '@/components/brand-header';
import { useAuth } from '@/context/auth';
import { useAppTheme } from '@/context/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WebLandingPage() {
  const { theme } = useAppTheme();
  const { isAuthenticated } = useAuth();
  const styles = getStyles(theme);

  if (Platform.OS !== 'web') {
    return null; // Only render on web
  }

  const handleNavigation = (route: string) => {
    if (Platform.OS === 'web') {
      router.push(route as any);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={true}
    >
      {/* Use BrandHeader with mode based on authentication status */}
      <BrandHeader mode={isAuthenticated ? 'authenticated' : 'landing'} />

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.heroCard}>
            <View style={styles.heroLogo}>
              <View style={styles.heroeLogoCircle}>
                <Image source={require('@/assets/images/logo.png')} style={styles.heroLogoImage} resizeMode="contain" />
              </View>
            </View>
            <Text style={styles.heroTitle}>
              {isAuthenticated ? 'Welcome to Sanjeevani AI' : 'Your Personal AI Health Assistant'}
            </Text>
            <Text style={styles.heroSubtitle}>
              Discover the power of Ayurveda combined with modern AI technology. 
              Get personalized health insights, disease predictions, and natural remedies 
              tailored just for you.
            </Text>
            {!isAuthenticated && (
              <View style={styles.heroActions}>
                <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => handleNavigation('/signin')}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => handleNavigation('/signup')}>
                  <Text style={styles.secondaryButtonText}>Create Account</Text>
                </TouchableOpacity>
              </View>
            )}
            {isAuthenticated && (
              <View style={styles.heroActions}>
                <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => handleNavigation('/web/chat')}>
                  <Text style={styles.buttonText}>Start Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => handleNavigation('/web/prediction')}>
                  <Text style={styles.secondaryButtonText}>Get Prediction</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Core Features</Text>
          <Text style={styles.sectionSubtitle}>
            Experience personalized healthcare with our AI-powered platform
          </Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🔍</Text>
              </View>
              <Text style={styles.featureTitle}>Disease Prediction</Text>
              <Text style={styles.featureDescription}>
                Advanced AI algorithms analyze your symptoms and health data to provide 
                accurate disease predictions and risk assessments.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🌿</Text>
              </View>
              <Text style={styles.featureTitle}>Ayurvedic Remedies</Text>
              <Text style={styles.featureDescription}>
                Access thousands of traditional Ayurvedic treatments and natural 
                remedies backed by ancient wisdom and modern science.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>💬</Text>
              </View>
              <Text style={styles.featureTitle}>AI Chat Assistant</Text>
              <Text style={styles.featureDescription}>
                Get instant health advice and answers to your questions from our 
                intelligent AI assistant available 24/7.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>📊</Text>
              </View>
              <Text style={styles.featureTitle}>Health Analytics</Text>
              <Text style={styles.featureDescription}>
                Track your health progress with detailed analytics and personalized 
                insights to optimize your wellness journey.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🎯</Text>
              </View>
              <Text style={styles.featureTitle}>Personalized Plans</Text>
              <Text style={styles.featureDescription}>
                Receive customized health plans including diet, exercise, and lifestyle 
                recommendations based on your unique profile.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>🔒</Text>
              </View>
              <Text style={styles.featureTitle}>Privacy First</Text>
              <Text style={styles.featureDescription}>
                Your health data is protected with enterprise-grade security and 
                privacy measures. Your information stays safe and confidential.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to Transform Your Health?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of users who have improved their health with Sanjeevani AI
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.button, styles.primaryButton, styles.ctaButton]} onPress={() => handleNavigation('/web/signup')}>
              <Text style={styles.buttonText}>Get Started Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton, styles.ctaButton]} onPress={() => handleNavigation('/web/signin')}>
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerBrand}>
            <View style={styles.footerLogoCircle}>
              <Image source={require('@/assets/images/logo.png')} style={styles.footerLogo} resizeMode="contain" />
            </View>
            <Text style={styles.footerBrandText}>Sanjeevani AI</Text>
          </View>
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>About Us</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.copyright}>© 2024 Sanjeevani AI. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

function getStyles(theme: string) {
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
    },
    
    // Navigation Styles
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 20,
      backgroundColor: isDark ? '#222' : '#ffffff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#333' : '#e0e0e0',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    navBrand: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#2ecc40',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: isDark ? '#1e2022' : '#ffffff',
      marginRight: 12,
    },
    navLogo: {
      width: 24,
      height: 24,
    },
    brandText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
    },
    navRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
    },
    navLink: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    navLinkText: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
      fontWeight: '500',
    },
    navButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#2ecc40',
    },
    navButtonText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    
    // Button Styles
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    primaryButton: {
      backgroundColor: '#2ecc40',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#2ecc40',
    },
    buttonText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    secondaryButtonText: {
      fontSize: 16,
      color: '#2ecc40',
      fontWeight: 'bold',
    },
    
    // Hero Section Styles
    heroSection: {
      paddingHorizontal: 40,
      paddingVertical: 80,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
      alignItems: 'center',
    },
    heroContent: {
      maxWidth: 800,
      width: '100%',
      alignItems: 'center',
    },
    heroCard: {
      backgroundColor: isDark ? '#222' : '#ffffff',
      borderRadius: 24,
      padding: 48,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
      width: '100%',
    },
    heroLogo: {
      marginBottom: 24,
    },
    heroeLogoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#2ecc40',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: isDark ? '#1e2022' : '#ffffff',
    },
    heroLogoImage: {
      width: 48,
      height: 48,
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 16,
      textAlign: 'center',
      lineHeight: 44,
    },
    heroSubtitle: {
      fontSize: 18,
      color: isDark ? '#cccccc' : '#666666',
      lineHeight: 28,
      marginBottom: 32,
      textAlign: 'center',
      maxWidth: 600,
    },
    heroActions: {
      flexDirection: 'row',
      gap: 16,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    
    // Features Section Styles
    featuresSection: {
      paddingHorizontal: 40,
      paddingVertical: 80,
      backgroundColor: isDark ? '#222' : '#ffffff',
    },
    sectionContainer: {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    },
    sectionTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      textAlign: 'center',
      marginBottom: 16,
    },
    sectionSubtitle: {
      fontSize: 18,
      color: isDark ? '#cccccc' : '#666666',
      textAlign: 'center',
      marginBottom: 48,
      maxWidth: 600,
      alignSelf: 'center',
    },
    featuresGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 24,
    },
    featureCard: {
      backgroundColor: isDark ? '#151718' : '#f7fafc',
      borderRadius: 16,
      padding: 24,
      width: 320,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e0e0e0',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 3,
    },
    featureIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#2ecc40',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    featureEmoji: {
      fontSize: 32,
    },
    featureTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 12,
      textAlign: 'center',
    },
    featureDescription: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      lineHeight: 22,
      textAlign: 'center',
    },
    
    // CTA Section Styles
    ctaSection: {
      paddingHorizontal: 40,
      paddingVertical: 80,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
      alignItems: 'center',
    },
    ctaCard: {
      backgroundColor: isDark ? '#222' : '#ffffff',
      borderRadius: 24,
      padding: 48,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 8,
      maxWidth: 600,
      width: '100%',
    },
    ctaTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      textAlign: 'center',
      marginBottom: 16,
    },
    ctaSubtitle: {
      fontSize: 16,
      color: isDark ? '#cccccc' : '#666666',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 24,
    },
    ctaButton: {
      paddingHorizontal: 32,
      paddingVertical: 16,
    },
    
    // Footer Styles
    footer: {
      backgroundColor: isDark ? '#222' : '#333333',
      paddingHorizontal: 40,
      paddingVertical: 48,
    },
    footerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    },
    footerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerLogoCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#2ecc40',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#ffffff',
      marginRight: 10,
    },
    footerLogo: {
      width: 20,
      height: 20,
    },
    footerBrandText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    footerLinks: {
      flexDirection: 'row',
      gap: 32,
    },
    footerLink: {
      paddingVertical: 4,
    },
    footerLinkText: {
      color: '#ffffff',
      fontSize: 14,
      opacity: 0.8,
    },
    copyright: {
      color: '#cccccc',
      fontSize: 12,
      textAlign: 'center',
      opacity: 0.6,
    },
  });
}