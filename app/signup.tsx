import { API_BASE_URL } from '@/constants/api';
import { useAuth } from '@/context/auth';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export default function SignUpScreen({ onLogin }: { onLogin?: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [diseases, setDiseases] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const styles = getStyles();
  const router = require('expo-router').useRouter();
  
  const handleHomePress = () => {
    if (Platform.OS === 'web') {
      router.replace('/web');
    } else {
      router.replace('/signin');
    }
  };
  
  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Email, Password)');
      return;
    }

    setLoading(true);
    try {
      const requestData: any = {
        fullName: fullName,
        email: email,
        password: password,
      };
      
      // Only include optional fields if they have values
      if (bloodGroup) {
        requestData.bloodGroup = bloodGroup;
      }
      
      if (diseases) {
        requestData.existingDiseases = diseases;
      }
      
      console.log('Sending signup request:', { ...requestData, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to OTP verification. On web, do it immediately because Alert button callbacks are not supported.
        const navigateToOtp = () =>
          router.push({ pathname: '/otp-verification', params: { email } });

        if (Platform.OS === 'web') {
          navigateToOtp();
          Alert.alert('Success', 'Account created! Please check your email for the verification code.');
        } else {
          Alert.alert(
            'Success',
            'Account created! Please check your email for the verification code.',
            [
              {
                text: 'OK',
                onPress: navigateToOtp,
              },
            ]
          );
        }
      } else {
        // Log the full error response for debugging
        console.error('Signup failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data
        });
        Alert.alert('Error', data.message || data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}> 
              <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.brandTitle}>Sanjeevani AI</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to manage your health better.</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name <Text style={{ color: '#dc2626' }}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="John Doe" 
              placeholderTextColor="#888"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address <Text style={{ color: '#dc2626' }}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="you@example.com" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password <Text style={{ color: '#dc2626' }}>*</Text></Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter a secure password" 
              secureTextEntry 
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Blood Group <Text style={{ color: '#dc2626' }}>*</Text></Text>
            <View style={styles.selectWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Select Blood Group"
                value={bloodGroup}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
                onChangeText={text => {
                  setSearchText(text);
                  setBloodGroup(text);
                  setShowDropdown(true);
                }}
                placeholderTextColor="#888"
                editable={true}
              />
              {showDropdown && (
                <View style={styles.dropdown}>
                  <ScrollView showsVerticalScrollIndicator={true}>
                    {(searchText
                      ? BLOOD_GROUPS.filter(bg => bg.toLowerCase().startsWith(searchText.toLowerCase()))
                      : BLOOD_GROUPS
                    ).map(bg => (
                      <TouchableOpacity
                        key={bg}
                        onPress={() => {
                          setBloodGroup(bg);
                          setSearchText('');
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItem}>{bg}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Existing Diseases (if any)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="e.g., Diabetes, Hypertension"
              multiline
              numberOfLines={2}
              placeholderTextColor="#888"
              value={diseases}
              onChangeText={setDiseases}
            />
          </View>
          <TouchableOpacity 
            style={[styles.button, loading && { opacity: 0.6 }]} 
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text 
              style={styles.loginLink} 
              onPress={() => onLogin ? onLogin() : router.replace('/signin')}
            >
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function getStyles() {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#151718',
      padding: 16,
    },
    headerText: {
      fontSize: 20,
      fontWeight: '600',
      color: '#fff',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    card: {
      alignSelf: 'center',
      width: '100%',
      maxWidth: 360,
      backgroundColor: '#222',
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
      borderColor: '#222',
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
      color: '#aaa',
      textAlign: 'center',
      marginBottom: 18,
    },
    formGroup: {
      marginBottom: 14,
    },
    label: {
      fontSize: 15,
      color: '#eee',
      marginBottom: 6,
    },
    input: {
      backgroundColor: '#181a1b',
      color: '#fff',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'web' ? 10 : 8,
      fontSize: 15,
      borderWidth: 1,
      borderColor: '#333',
    },
    selectWrapper: {
      position: 'relative',
    },
    dropdown: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      backgroundColor: '#222',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#333',
      zIndex: 10,
    },
    dropdownItem: {
      padding: 10,
      fontSize: 15,
      color: '#fff',
    },
    textarea: {
      minHeight: 48,
      textAlignVertical: 'top',
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
    loginText: {
      textAlign: 'center',
      color: '#aaa',
      fontSize: 15,
      marginTop: 8,
    },
    loginLink: {
      color: '#2ecc40',
      fontWeight: 'bold',
    },
    homeButton: {
      position: 'absolute',
      top: 16,
      left: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#1f2937',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#2a2d2e',
      zIndex: 10,
    },
    homeButtonText: {
      color: '#e5e7eb',
      fontWeight: '600',
      fontSize: 15,
    },
  });
}
 
