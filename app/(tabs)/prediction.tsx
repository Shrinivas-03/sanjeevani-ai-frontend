import BrandHeader from '@/components/brand-header';
import { useAuth } from '@/context/auth';
import { useAppTheme } from '@/context/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const genderOptions = ['Male', 'Female', 'Other'];
const medicalHistoryOptions = [
  'Diabetes',
  'Hypertension (BP)',
  'Thyroid',
  'Heart Disease',
  'Other',
];

export default function PredictionScreen() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  React.useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      setTimeout(() => {
        router.replace('/signin');
      }, 0);
    }
  }, [isAuthenticated, loading]);
  const { theme } = useAppTheme();
  const styles = getStyles(theme || 'light');
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [pulseRate, setPulseRate] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [fbs, setFbs] = useState('');
  const [ppbs, setPpbs] = useState('');
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState('');
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  useEffect(() => {
    const willShow = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const willHide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    const didShow = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const didHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      willShow.remove();
      willHide.remove();
      didShow.remove();
      didHide.remove();
    };
  }, []);

  const bottomOffset = Math.max(0, keyboardHeight - insets.bottom);

  return (
    <View style={styles.container}>
    <BrandHeader subtitle="Get personalized predictions" />
  <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
  <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 16 + (Platform.OS === 'ios' ? bottomOffset : 0) }]} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Required Information */}
          <Text style={styles.sectionTitle}>Required Information</Text>
          <View style={styles.row}>
            <View style={styles.colFull}>
              <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownText}>{gender || 'Select Gender'}</Text>
              </TouchableOpacity>
              {showGenderDropdown && (
                <View style={styles.dropdownList}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setGender(option);
                        setShowGenderDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
          {/* Optional Data */}
          <Text style={styles.sectionTitle}>Optional Data</Text>
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.label}>Pulse Rate</Text>
              <TextInput style={styles.input} value={pulseRate} onChangeText={setPulseRate} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.label}>BP Systolic</Text>
              <TextInput style={styles.input} value={bpSystolic} onChangeText={setBpSystolic} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.colFull}>
              <Text style={styles.label}>BP Diastolic</Text>
              <TextInput style={styles.input} value={bpDiastolic} onChangeText={setBpDiastolic} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.colFull}>
              <Text style={styles.label}>FBS (mg/dl)</Text>
              <TextInput style={styles.input} value={fbs} onChangeText={setFbs} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.colFull}>
              <Text style={styles.label}>PPBS (mg/dl)</Text>
              <TextInput style={styles.input} value={ppbs} onChangeText={setPpbs} keyboardType="numeric" placeholder="" placeholderTextColor={styles.inputPlaceholder.color} />
            </View>
          </View>
          {/* Medical History */}
          <Text style={styles.sectionTitle}>Medical History</Text>
          <View style={styles.medicalHistoryGroup}>
            {medicalHistoryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.radioRow}
                onPress={() => {
                  setMedicalHistory((prev) =>
                    prev.includes(option)
                      ? prev.filter((item) => item !== option)
                      : [...prev, option]
                  );
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.radioCircle, medicalHistory.includes(option) && styles.radioCircleSelected]} />
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Symptoms */}
          <Text style={styles.sectionTitle}>Symptoms</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="Please describe your symptoms in free text..."
            placeholderTextColor={styles.inputPlaceholder.color}
            multiline
            numberOfLines={3}
          />
          {/* Predict Button */}
          <TouchableOpacity style={styles.predictButton}>
            <Text style={styles.predictButtonText}>📊 Predict</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function getStyles(theme: string) {
  const isDark = theme === 'dark';
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#f5f6f7',
    },
    header: {
      paddingTop: 48,
      paddingBottom: 8,
      alignItems: 'center',
      backgroundColor: isDark ? '#151718' : '#f5f6f7',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#2ecc40',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 17,
      color: isDark ? '#aaa' : '#888',
      marginBottom: 8,
      textAlign: 'center',
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 16,
    },
    card: {
      backgroundColor: isDark ? '#222' : '#fff',
      borderRadius: 16,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#222',
      marginBottom: 10,
      marginTop: 18,
    },
    label: {
      fontSize: 15,
      color: isDark ? '#eee' : '#222',
      marginBottom: 6,
    },
    required: {
      color: '#e74c3c',
      fontWeight: 'bold',
    },
    row: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    colFull: {
      flex: 1,
    },
    colHalf: {
      flex: 1,
      minWidth: 120,
    },
    input: {
      backgroundColor: isDark ? '#181a1b' : '#f5f6f7',
      color: isDark ? '#fff' : '#222',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: Platform.OS === 'web' ? 10 : 8,
      fontSize: 15,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      marginBottom: 2,
    },
    inputPlaceholder: {
      color: isDark ? '#888' : '#888',
    },
    dropdown: {
      backgroundColor: isDark ? '#181a1b' : '#f5f6f7',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: 'center',
      marginBottom: 2,
    },
    dropdownText: {
      color: isDark ? '#fff' : '#222',
      fontSize: 15,
    },
    dropdownList: {
      position: 'absolute',
      top: 44,
      left: 0,
      right: 0,
      backgroundColor: isDark ? '#222' : '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      zIndex: 10,
    },
    dropdownItem: {
      padding: 10,
    },
    medicalHistoryGroup: {
      marginTop: 8,
      marginBottom: 8,
    },
    radioRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isDark ? '#888' : '#bbb',
      backgroundColor: isDark ? '#222' : '#fff',
      marginRight: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioCircleSelected: {
      borderColor: '#2ecc40',
      backgroundColor: '#2ecc40',
    },
    radioLabel: {
      fontSize: 15,
      color: isDark ? '#eee' : '#222',
    },
    textarea: {
      minHeight: 64,
      textAlignVertical: 'top',
      marginBottom: 8,
    },
    predictButton: {
      backgroundColor: '#2ecc40',
      borderRadius: 8,
      paddingVertical: 14,
      marginTop: 16,
      marginBottom: 8,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    predictButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 18,
      textAlign: 'center',
    },
  });
}
