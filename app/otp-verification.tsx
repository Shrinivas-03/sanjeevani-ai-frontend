import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OTPVerificationScreen({ onVerify, onResend }: { onVerify?: (otp: string) => void; onResend?: () => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();
  
  // Get email from navigation params
  const email = params.email as string;
  const forPasswordReset = params.forPasswordReset === 'true';

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please try signing up again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        if (Platform.OS === 'web') {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        
        // Call the auth login function
        login();
        
        Alert.alert('Success', 'Email verified successfully!');
        
        if (onVerify) {
          onVerify(otp);
        } else if (forPasswordReset) {
          router.replace('/reset-password');
        } else {
          // Redirect to signin screen after verification
          router.replace('/signin');
        }
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please try signing up again.');
      return;
    }

    setResending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'OTP has been resent to your email.');
      } else {
        Alert.alert('Error', data.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setResending(false);
    }

    if (onResend) {
      onResend();
    }
  };
  
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
          <View style={styles.brandRow}>
            <View style={[styles.logoCircle, { borderColor: isDark ? '#1e2022' : '#ffffff' }]}> 
              <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.brandTitle}>Sanjeevani AI</Text>
          </View>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to {email || 'your email'}.
          </Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>OTP Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              placeholderTextColor={isDark ? '#888' : '#aaa'}
            />
          </View>
          <TouchableOpacity 
            style={[styles.button, (loading || otp.length !== 6) && { opacity: 0.6 }]} 
            onPress={handleVerify} 
            disabled={loading || otp.length !== 6}
          >
            <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#aaa', marginTop: 8 }, resending && { opacity: 0.6 }]} 
            onPress={handleResend}
            disabled={resending || loading}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {resending ? 'Resending...' : 'Resend OTP'}
            </Text>
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
    brandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    logoCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#2ecc40',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      marginRight: 10,
    },
    logo: {
      width: 26,
      height: 26,
    },
    brandTitle: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#2ecc40',
      letterSpacing: 0.5,
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
