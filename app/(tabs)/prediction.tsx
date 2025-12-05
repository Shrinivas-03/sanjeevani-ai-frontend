// app/(tabs)/prediction.tsx
import BrandHeader from "@/components/brand-header";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* UTIL */
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

/* CONFIDENCE BAR */
const ConfidenceBar = ({ percent, theme }: { percent: number; theme: any }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const isDark = theme === "dark";

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamp(percent),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const width = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const barColor =
    percent > 70 ? "#27ae60" : percent > 40 ? "#f1c40f" : "#e74c3c";

  return (
    <View
      style={{
        height: 12,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: isDark ? "#222" : "#e6f0ff",
      }}
    >
      <Animated.View
        style={{ width, height: "100%", backgroundColor: barColor }}
      />
    </View>
  );
};

/* CONFIDENCE BADGE */
const ConfidenceBadge = ({
  percent,
  theme,
}: {
  percent: number;
  theme: any;
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);
  const isDark = theme === "dark";

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamp(percent),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const id = anim.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => anim.removeListener(id);
  }, [percent]);

  return (
    <View
      style={{
        width: 76,
        height: 76,
        borderRadius: 40,
        backgroundColor: isDark ? "#0b0b0b" : "#fff",
        borderWidth: 1,
        borderColor: isDark ? "#444" : "#e6eefc",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontWeight: "900",
          fontSize: 18,
          color: isDark ? "#fff" : "#111",
        }}
      >
        {display}%
      </Text>
      <Text style={{ fontSize: 10, color: isDark ? "#aaa" : "#555" }}>
        confidence
      </Text>
    </View>
  );
};

/* ACCORDION */
const Accordion = ({ title, children, theme }: any) => {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const isDark = theme === "dark";

  const toggle = () => {
    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  return (
    <View style={{ marginTop: 16 }}>
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.9}
        style={{
          backgroundColor: isDark ? "#111" : "#eef6ff",
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "#333" : "#cfe6ff",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{
              fontWeight: "700",
              fontSize: 15,
              color: isDark ? "#fff" : "#0b3d91",
            }}
          >
            {title}
          </Text>
          <Text style={{ color: isDark ? "#aaa" : "#333" }}>
            {open ? "▲" : "▼"}
          </Text>
        </View>
      </TouchableOpacity>

      {open && (
        <Animated.View
          style={{
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-12, 0],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? "#181a1b" : "#fff",
              padding: 12,
              marginTop: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#dce7f7",
            }}
          >
            {children}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

/* PRETTY EXPLANATION */
const PrettyExplanation = ({ text, theme }: any) => {
  const isDark = theme === "dark";

  if (!text) {
    return (
      <Text style={{ color: isDark ? "#aaa" : "#555" }}>
        No explanation provided.
      </Text>
    );
  }

  const parts = text.replace(/\r/g, "").split(/\n{2,}/);

  return (
    <View>
      {parts.map((p: string, idx: number) => (
        <Text
          key={idx}
          style={{
            color: isDark ? "#ddd" : "#333",
            lineHeight: 20,
            marginBottom: 10,
          }}
        >
          {p}
        </Text>
      ))}
    </View>
  );
};

/* INPUT FIELD */
function InputField({
  label,
  value,
  setValue,
  numeric,
  required,
  containerStyle,
  theme,
}: any) {
  const isDark = theme === "dark";

  return (
    <View style={[{ flex: 1 }, containerStyle]}>
      <Text style={[stylesGlobal.label, isDark && { color: "#eee" }]}>
        {label} {required && <Text style={stylesGlobal.required}>*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType={numeric ? "numeric" : "default"}
        returnKeyType="done"
        blurOnSubmit={true}
        style={[
          stylesGlobal.input,
          isDark && {
            backgroundColor: "#181a1b",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
      />
    </View>
  );
}

/* TEXTAREA */
function SectionTextarea({
  label,
  value,
  setValue,
  placeholder,
  required,
  theme,
}: any) {
  const isDark = theme === "dark";

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[stylesGlobal.label, isDark && { color: "#eee" }]}>
        {label} {required && <Text style={stylesGlobal.required}>*</Text>}
      </Text>
      <TextInput
        multiline
        numberOfLines={3}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#777" : "#666"}
        returnKeyType="done"
        blurOnSubmit={true}
        style={[
          stylesGlobal.textarea,
          isDark && {
            backgroundColor: "#181a1b",
            borderColor: "#333",
            color: "#fff",
          },
        ]}
      />
    </View>
  );
}

/* MAIN SCREEN */
export default function PredictionScreen() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  // Form states
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [pulseRate, setPulseRate] = useState("");
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [fbs, setFbs] = useState("");
  const [ppbs, setPpbs] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // Prediction + UI
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // Feedback
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<boolean | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/signin");
  }, [loading, isAuthenticated]);

  // Dismiss keyboard when screen unmounts
  useEffect(() => {
    return () => {
      Keyboard.dismiss();
    };
  }, []);

  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  /* VALIDATION AND PREDICTION */
  const handlePredict = async () => {
    Keyboard.dismiss();

    if (!name || !age || !gender || !symptoms) {
      return Alert.alert(
        "Missing Required Fields",
        "Please fill in your Name, Age, Gender, and Symptoms.",
      );
    }

    const fieldsToValidate: {
      [key: string]: { value: string; min: number; max: number };
    } = {
      Age: { value: age, min: 1, max: 120 },
      Height: { value: height, min: 20, max: 280 },
      Weight: { value: weight, min: 1, max: 150 },
      "Pulse Rate": { value: pulseRate, min: 30, max: 150 },
      "BP Systolic": { value: bpSystolic, min: 50, max: 280 },
      "BP Diastolic": { value: bpDiastolic, min: 30, max: 240 },
      FBS: { value: fbs, min: 30, max: 600 },
      PPBS: { value: ppbs, min: 30, max: 600 },
    };

    for (const fieldName in fieldsToValidate) {
      const { value, min, max } = fieldsToValidate[fieldName];
      if (value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < min || numValue > max) {
          Alert.alert(
            "Invalid Input",
            `${fieldName} must be a valid number between ${min} and ${max}.`,
          );
          return;
        }
      }
    }

    try {
      setLoadingPredict(true);
      setPredictionResult(null);

      const payload = {
        name,
        age: Number(age),
        gender,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        BP_systolic: bpSystolic ? Number(bpSystolic) : undefined,
        BP_diastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
        FBS: fbs ? Number(fbs) : undefined,
        PPBS: ppbs ? Number(ppbs) : undefined,
        pulse_rate: pulseRate ? Number(pulseRate) : undefined,
        medical_history: medicalHistory,
        symptoms,
        email: user?.email ?? "unknown@local",
      };

      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert("Prediction Failed", data?.error || "Server error");
      }

      setPredictionResult(data);
    } catch (err) {
      Alert.alert("Network Error", "Could not connect to server.");
    } finally {
      setLoadingPredict(false);
    }
  };

  /* SUBMIT FEEDBACK */
  const submitFeedback = async () => {
    try {
      await fetch(`${API_URL}/predict/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_id: predictionResult?.feedback_id,
          is_correct: feedbackChoice,
        }),
      });

      setFeedbackModalVisible(false);
      Alert.alert("Thank you!", "Your feedback helps improve the model.");
    } catch {
      Alert.alert("Error", "Could not submit feedback.");
    }
  };

  const confidencePercent = predictionResult?.Confidence
    ? Math.round(
        Number(predictionResult.Confidence) <= 1
          ? Number(predictionResult.Confidence) * 100
          : Number(predictionResult.Confidence),
      )
    : 0;

  /* RENDER */
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <BrandHeader subtitle="Get personalized predictions" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: predictionResult ? 16 : 140,
            }}
          >
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Required Information</Text>

              <InputField
                label="Name"
                required
                value={name}
                setValue={setName}
                theme={theme}
              />

              <View style={styles.row}>
                <InputField
                  label="Age"
                  required
                  numeric
                  value={age}
                  setValue={setAge}
                  containerStyle={styles.colHalf}
                  theme={theme}
                />

                <View
                  style={[styles.colHalf, { position: "relative", zIndex: 40 }]}
                >
                  <Text
                    style={[
                      stylesGlobal.label,
                      theme === "dark" && { color: "#eee" },
                    ]}
                  >
                    Gender <Text style={stylesGlobal.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowGenderDropdown(!showGenderDropdown);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {gender || "Select Gender"}
                    </Text>
                  </TouchableOpacity>

                  {showGenderDropdown && (
                    <View style={styles.dropdownList}>
                      {["Male", "Female", "Other"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setGender(g);
                            setShowGenderDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownText}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              <Text style={styles.sectionTitle}>Personal Details</Text>

              <View style={styles.row}>
                <InputField
                  label="Height (cm)"
                  value={height}
                  setValue={setHeight}
                  numeric
                  containerStyle={styles.colHalf}
                  theme={theme}
                />
                <InputField
                  label="Weight (kg)"
                  value={weight}
                  setValue={setWeight}
                  numeric
                  containerStyle={styles.colHalf}
                  theme={theme}
                />
              </View>

              <View style={styles.row}>
                <InputField
                  label="Pulse Rate"
                  value={pulseRate}
                  setValue={setPulseRate}
                  numeric
                  containerStyle={styles.colHalf}
                  theme={theme}
                />
                <InputField
                  label="BP Systolic"
                  value={bpSystolic}
                  setValue={setBpSystolic}
                  numeric
                  containerStyle={styles.colHalf}
                  theme={theme}
                />
              </View>

              <InputField
                label="BP Diastolic"
                value={bpDiastolic}
                setValue={setBpDiastolic}
                numeric
                theme={theme}
              />

              <InputField
                label="FBS (mg/dl)"
                value={fbs}
                setValue={setFbs}
                numeric
                theme={theme}
              />

              <InputField
                label="PPBS (mg/dl)"
                value={ppbs}
                setValue={setPpbs}
                numeric
                theme={theme}
              />

              <SectionTextarea
                label="Medical History"
                value={medicalHistory}
                setValue={setMedicalHistory}
                placeholder="Describe any past conditions..."
                theme={theme}
              />
              <SectionTextarea
                label="Symptoms"
                required
                value={symptoms}
                setValue={setSymptoms}
                placeholder="Describe symptoms..."
                theme={theme}
              />

              <TouchableOpacity
                style={styles.predictButton}
                onPress={handlePredict}
                disabled={loadingPredict}
                activeOpacity={0.8}
              >
                {loadingPredict ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.predictButtonText}>📊 Predict</Text>
                )}
              </TouchableOpacity>
            </View>

            {predictionResult && (
              <View style={styles.resultBox}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>Prediction Result</Text>
                    <Text style={styles.resultDisease}>
                      {predictionResult.Predicted_Disease}
                    </Text>
                    <Text style={styles.resultSub}>
                      Tap to expand more info
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <ConfidenceBadge
                      percent={confidencePercent}
                      theme={theme}
                    />
                    <View style={{ width: 140, marginTop: 8 }}>
                      <ConfidenceBar
                        percent={confidencePercent}
                        theme={theme}
                      />
                    </View>
                  </View>
                </View>

                <Accordion title="Explanation & Remedies" theme={theme}>
                  <Text
                    style={{
                      fontWeight: "800",
                      marginBottom: 10,
                      color: theme === "dark" ? "#fff" : "#111",
                    }}
                  >
                    Why the model predicted this:
                  </Text>

                  <PrettyExplanation
                    text={predictionResult.Explanation}
                    theme={theme}
                  />

                  <Text
                    style={{
                      fontWeight: "800",
                      marginTop: 20,
                      marginBottom: 10,
                      color: theme === "dark" ? "#fff" : "#111",
                    }}
                  >
                    Ayurvedic Remedies:
                  </Text>

                  <PrettyExplanation
                    text={predictionResult.Explanation}
                    theme={theme}
                  />

                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 20 }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setFeedbackChoice(true);
                        setFeedbackModalVisible(true);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#2ecc40",
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: "#2ecc40", fontWeight: "700" }}>
                        Correct
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setFeedbackChoice(false);
                        setFeedbackModalVisible(true);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#f39c12",
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: "#f39c12", fontWeight: "700" }}>
                        Not Correct
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Accordion>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={feedbackModalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback
            onPress={() => setFeedbackModalVisible(false)}
          >
            <View style={modalStyles.overlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    modalStyles.card,
                    theme === "dark" && { backgroundColor: "#111" },
                  ]}
                >
                  <Text
                    style={[
                      modalStyles.title,
                      theme === "dark" && { color: "#fff" },
                    ]}
                  >
                    Confirm Feedback
                  </Text>
                  <Text
                    style={[
                      modalStyles.text,
                      theme === "dark" && { color: "#ddd" },
                    ]}
                  >
                    Are you sure you want to mark this as{" "}
                    {feedbackChoice ? "Correct" : "Not Correct"}?
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 20,
                      gap: 10,
                    }}
                  >
                    <Pressable
                      onPress={() => setFeedbackModalVisible(false)}
                      style={[
                        modalStyles.btn,
                        {
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#ccc",
                        },
                      ]}
                    >
                      <Text style={{ fontWeight: "700", color: "#333" }}>
                        Cancel
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={submitFeedback}
                      style={[modalStyles.btn, { backgroundColor: "#2ecc40" }]}
                    >
                      <Text style={{ fontWeight: "700", color: "#fff" }}>
                        Submit
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

/* GLOBAL INPUT STYLES */
const stylesGlobal = StyleSheet.create({
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#222",
    fontWeight: "600",
  },
  required: {
    color: "#e74c3c",
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f5f6f7",
    borderColor: "#ccc",
    marginBottom: 8,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    borderColor: "#ccc",
    backgroundColor: "#f5f6f7",
    fontSize: 15,
    textAlignVertical: "top",
  },
});

/* THEMATIC STYLES */
function getStyles(theme: any) {
  const isDark = theme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0f0f10" : "#f5f6f7",
    },
    card: {
      backgroundColor: isDark ? "#121212" : "#fff",
      padding: 20,
      borderRadius: 16,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#fff" : "#0b3d91",
      marginBottom: 12,
      marginTop: 8,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    colHalf: { flex: 1 },
    dropdown: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
      borderColor: isDark ? "#333" : "#ccc",
    },
    dropdownText: {
      fontSize: 15,
      color: isDark ? "#fff" : "#222",
    },
    dropdownList: {
      position: "absolute",
      top: 52,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#181a1b" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#444" : "#ccc",
      borderRadius: 10,
      overflow: "hidden",
      zIndex: 999,
      elevation: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    dropdownItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#333" : "#f0f0f0",
    },
    predictButton: {
      backgroundColor: "#2ecc40",
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 12,
      elevation: 3,
      shadowColor: "#2ecc40",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    predictButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
    },
    resultBox: {
      marginTop: 16,
      padding: 18,
      borderRadius: 14,
      backgroundColor: isDark ? "#0d0d0d" : "#f0f9ff",
      borderWidth: 1,
      borderColor: isDark ? "#222" : "#d7eefc",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#fff" : "#0b3d91",
    },
    resultDisease: {
      fontSize: 20,
      fontWeight: "900",
      color: isDark ? "#fff" : "#0b3d91",
      marginTop: 4,
      marginBottom: 4,
    },
    resultSub: {
      fontSize: 12,
      color: isDark ? "#aaa" : "#666",
    },
  });
}

/* MODAL STYLE */
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
});
