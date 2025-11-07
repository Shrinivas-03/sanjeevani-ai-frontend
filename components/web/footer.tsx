import { useAppTheme } from '@/context/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WebFooterProps {
  hideNavigation?: boolean;
}

export default function WebFooter({ hideNavigation = false }: WebFooterProps) {
  const { theme } = useAppTheme();
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
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.footerBrand}>
          <View style={styles.footerLogoCircle}>
            <Image source={require('@/assets/images/logo.png')} style={styles.footerLogo} resizeMode="contain" />
          </View>
          <Text style={styles.footerBrandText}>Sanjeevani AI</Text>
        </View>
        {!hideNavigation && (
          <View style={styles.footerLinks}>
            <TouchableOpacity style={styles.footerLink} onPress={() => handleNavigation('/web/about')}>
              <Text style={styles.footerLinkText}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink} onPress={() => handleNavigation('/web/features')}>
              <Text style={styles.footerLinkText}>Features</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink} onPress={() => handleNavigation('/web/contact')}>
              <Text style={styles.footerLinkText}>Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerLink}>
              <Text style={styles.footerLinkText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.copyright}>© 2024 Sanjeevani AI. All rights reserved.</Text>
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
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
      flexWrap: 'wrap',
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