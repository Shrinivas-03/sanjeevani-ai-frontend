import SplashScreen from '@/components/splash-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';

export default function WebLayout() {
  const [showSplash, setShowSplash] = useState(true);
  
  if (Platform.OS !== 'web') {
    return null; // Only render on web
  }

  const color = useColorScheme();

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider value={color === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signin" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="prediction" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="about" />
        <Stack.Screen name="features" />
        <Stack.Screen name="contact" />
      </Stack>
    </ThemeProvider>
  );
}