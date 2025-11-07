import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ResetPasswordScreen({ onReset }: { onReset?: (password: string, confirm: string) => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const router = require('expo-router').useRouter();
  
  const handleHomePress = () => {
    if (Platform.OS === 'web') {
      router.replace('/web');
    } else {
      router.replace('/signin');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Home Button */}
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={handleHomePress}
        activeOpacity={0.7}
      >
        <Text style={styles.homeButtonText}>← Home</Text>
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password below.</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={isDark ? '#888' : '#aaa'}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              placeholderTextColor={isDark ? '#888' : '#aaa'}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={() => onReset?.(password, confirm)} disabled={!password || !confirm || password !== confirm}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles(isDark: boolean) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#f7fafc',
      padding: 16,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 360,
      backgroundColor: isDark ? '#222' : '#fff',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      marginTop: 'auto',
      marginBottom: 'auto',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#2ecc40',
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: isDark ? '#aaa' : '#687076',
      textAlign: 'center',
      marginBottom: 18,
    },
    formGroup: {
      marginBottom: 14,
    },
    label: {
      fontSize: 15,
      color: isDark ? '#eee' : '#222',
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? '#181a1b' : '#f3f4f6',
      color: isDark ? '#fff' : '#222',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'web' ? 10 : 8,
      fontSize: 15,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e0e0e0',
    },
    button: {
      backgroundColor: '#2ecc40',
      borderRadius: 8,
      paddingVertical: 12,
      marginTop: 10,
      marginBottom: 8,
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 17,
      textAlign: 'center',
    },
    homeButton: {
      position: 'absolute',
      top: 16,
      left: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#2a2d2e' : '#e0e0e0',
      zIndex: 10,
    },
    homeButtonText: {
      color: isDark ? '#e5e7eb' : '#111827',
      fontWeight: '600',
      fontSize: 15,
    },
  });
}
