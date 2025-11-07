import WebLandingPage from '@/components/web-landing-page';
import { useAppTheme } from '@/context/theme';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function WebHomePage() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  if (Platform.OS !== 'web') {
    return null; // Only render on web
  }

  return (
    <View style={styles.container}>
      {/* Use the complete landing page component which includes navigation */}
      <WebLandingPage />
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
    },
  });
}