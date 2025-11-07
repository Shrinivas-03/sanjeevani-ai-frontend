import BrandHeader from '@/components/brand-header';
import { useAppTheme } from '@/context/theme';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WebContactPage() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  if (Platform.OS !== 'web') {
    return null; // Only render on web
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <BrandHeader mode="landing" />
      
      {/* Contact Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.heroCard}>
            <View style={styles.heroLogo}>
              <View style={styles.logoCircle}>
                <Image source={require('@/assets/images/logo.png')} style={styles.heroLogoImage} resizeMode="contain" />
              </View>
            </View>
            <Text style={styles.heroTitle}>Contact Us</Text>
            <Text style={styles.heroSubtitle}>
              Have questions about Sanjeevani AI? We're here to help. 
              Reach out to our team for support, partnerships, or general inquiries.
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Form & Info Section */}
      <View style={styles.contactSection}>
        <View style={styles.sectionContainer}>
          <View style={styles.contactGrid}>
            
            {/* Contact Form */}
            <View style={styles.contactForm}>
              <Text style={styles.formTitle}>Send us a Message</Text>
              <Text style={styles.formSubtitle}>
                Fill out the form below and we'll get back to you within 24 hours.
              </Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={styles.placeholder.color}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="Enter your email address"
                  placeholderTextColor={styles.placeholder.color}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput 
                  style={styles.input}
                  placeholder="What is this regarding?"
                  placeholderTextColor={styles.placeholder.color}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]}
                  placeholder="Tell us more about your inquiry..."
                  placeholderTextColor={styles.placeholder.color}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              
              <TouchableOpacity style={[styles.button, styles.primaryButton]}>
                <Text style={styles.buttonText}>Send Message</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Information */}
            <View style={styles.contactInfo}>
              <Text style={styles.infoTitle}>Get in Touch</Text>
              <Text style={styles.infoSubtitle}>
                We're here to answer your questions and help you on your health journey.
              </Text>
              
              <View style={styles.contactDetails}>
                <View style={styles.contactItem}>
                  <View style={styles.contactIcon}>
                    <Text style={styles.contactEmoji}>📧</Text>
                  </View>
                  <View style={styles.contactText}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>support@sanjeevani-ai.com</Text>
                  </View>
                </View>
                
                <View style={styles.contactItem}>
                  <View style={styles.contactIcon}>
                    <Text style={styles.contactEmoji}>📱</Text>
                  </View>
                  <View style={styles.contactText}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
                  </View>
                </View>
                
                <View style={styles.contactItem}>
                  <View style={styles.contactIcon}>
                    <Text style={styles.contactEmoji}>📍</Text>
                  </View>
                  <View style={styles.contactText}>
                    <Text style={styles.contactLabel}>Address</Text>
                    <Text style={styles.contactValue}>
                      123 Health Tech Boulevard{'\n'}
                      San Francisco, CA 94105{'\n'}
                      United States
                    </Text>
                  </View>
                </View>
                
                <View style={styles.contactItem}>
                  <View style={styles.contactIcon}>
                    <Text style={styles.contactEmoji}>🕒</Text>
                  </View>
                  <View style={styles.contactText}>
                    <Text style={styles.contactLabel}>Support Hours</Text>
                    <Text style={styles.contactValue}>
                      Monday - Friday: 9:00 AM - 6:00 PM PST{'\n'}
                      Saturday: 10:00 AM - 4:00 PM PST{'\n'}
                      Sunday: Closed
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.socialLinks}>
                <Text style={styles.socialTitle}>Follow Us</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialEmoji}>📘</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialEmoji}>🐦</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialEmoji}>💼</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialEmoji}>📷</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          <View style={styles.faqGrid}>
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>How accurate are the health predictions?</Text>
              <Text style={styles.faqAnswer}>
                Our AI models achieve over 85% accuracy in disease prediction, continuously 
                improving through machine learning and clinical validation.
              </Text>
            </View>
            
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Is my health data secure?</Text>
              <Text style={styles.faqAnswer}>
                Yes, we use enterprise-grade encryption and comply with HIPAA standards 
                to ensure your health information remains private and secure.
              </Text>
            </View>
            
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>Can I use this app as a medical diagnosis?</Text>
              <Text style={styles.faqAnswer}>
                Our app provides insights and predictions but should not replace professional 
                medical advice. Always consult healthcare providers for medical decisions.
              </Text>
            </View>
            
            <View style={styles.faqCard}>
              <Text style={styles.faqQuestion}>How does the Ayurvedic integration work?</Text>
              <Text style={styles.faqAnswer}>
                We combine traditional Ayurvedic principles with modern AI to provide 
                personalized recommendations based on your unique constitution and health profile.
              </Text>
            </View>
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
    logoCircle: {
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
      textAlign: 'center',
      maxWidth: 600,
    },
    
    // Contact Section
    contactSection: {
      paddingHorizontal: 40,
      paddingVertical: 80,
      backgroundColor: isDark ? '#222' : '#ffffff',
    },
    sectionContainer: {
      maxWidth: 1200,
      alignSelf: 'center',
      width: '100%',
    },
    contactGrid: {
      flexDirection: 'row',
      gap: 40,
      alignItems: 'flex-start',
    },
    
    // Contact Form
    contactForm: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
      borderRadius: 16,
      padding: 32,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e0e0e0',
    },
    formTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    formSubtitle: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      marginBottom: 32,
      lineHeight: 20,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      color: isDark ? '#ffffff' : '#333333',
      backgroundColor: isDark ? '#222' : '#ffffff',
    },
    textArea: {
      height: 120,
      paddingTop: 12,
    },
    placeholder: {
      color: isDark ? '#999' : '#9ca3af',
    },
    
    // Contact Info
    contactInfo: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
      borderRadius: 16,
      padding: 32,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e0e0e0',
    },
    infoTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    infoSubtitle: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      marginBottom: 32,
      lineHeight: 20,
    },
    contactDetails: {
      gap: 24,
      marginBottom: 32,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    contactIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#2ecc40',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactEmoji: {
      fontSize: 20,
    },
    contactText: {
      flex: 1,
    },
    contactLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 4,
    },
    contactValue: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      lineHeight: 20,
    },
    
    // Social Links
    socialLinks: {
      borderTopWidth: 1,
      borderTopColor: isDark ? '#333' : '#e0e0e0',
      paddingTop: 24,
    },
    socialTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 16,
    },
    socialButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    socialButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#333' : '#e0e0e0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    socialEmoji: {
      fontSize: 18,
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
    buttonText: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    
    // FAQ Section
    faqSection: {
      paddingHorizontal: 40,
      paddingVertical: 80,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
    },
    sectionTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      textAlign: 'center',
      marginBottom: 48,
    },
    faqGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 24,
      justifyContent: 'center',
    },
    faqCard: {
      backgroundColor: isDark ? '#222' : '#ffffff',
      borderRadius: 12,
      padding: 24,
      width: 280,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e0e0e0',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    faqQuestion: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#333333',
      marginBottom: 12,
      lineHeight: 22,
    },
    faqAnswer: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      lineHeight: 20,
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