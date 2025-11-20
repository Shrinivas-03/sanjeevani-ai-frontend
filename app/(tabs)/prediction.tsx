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
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* =============================================================
   Single-file Prediction Screen
   - Uses useAuth() to get logged-in user's email
   - Reads API base URL from process.env.EXPO_PUBLIC_API_BASE_URL
   - Calls POST /predict and receives feedback_id
   - Shows compact result + accordion explanation
   - Shows Modal for feedback and calls POST /feedback/update
   - All components included inline (no external files)
   - Animated confidence visuals + smooth UX
   ============================================================= */

/* -------------------------
   Small reusable helpers
   ------------------------- */
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

/* -------------------------
   Animated Confidence Bar
   ------------------------- */
const ConfidenceBar = ({ percent, theme }: { percent: number; theme: any }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const isDark = theme === "dark";

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamp(percent, 0, 100),
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
        backgroundColor: isDark ? "#222" : "#e6f0ff",
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{ width, height: "100%", backgroundColor: barColor }}
      />
    </View>
  );
};

/* -------------------------
   Circular Confidence Badge
   ------------------------- */
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
      toValue: clamp(percent, 0, 100),
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
        borderColor: isDark ? "#333" : "#e6eefc",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "900",
          color: isDark ? "#fff" : "#111",
        }}
      >
        {display}%
      </Text>
      <Text style={{ fontSize: 10, color: isDark ? "#9aa" : "#666" }}>
        confidence
      </Text>
    </View>
  );
};

/* -------------------------
   Accordion (scroll-friendly)
   ------------------------- */
const Accordion = ({ title, children, theme }: any) => {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const isDark = theme === "dark";

  const toggle = () => {
    Animated.timing(anim, {
      toValue: open ? 0 : 1,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  return (
    <View style={{ marginTop: 14 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggle}
        style={{
          backgroundColor: isDark ? "#111" : "#f0f8ff",
          padding: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: isDark ? "#333" : "#cfe6ff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              color: isDark ? "#fff" : "#0b3d91",
              fontSize: 15,
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
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
            opacity: anim,
          }}
        >
          <View
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: isDark ? "#181a1b" : "#fff",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDark ? "#333" : "#e6eefc",
            }}
          >
            {children}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

/* -------------------------
   PrettyExplanation -> format LLM text
   ------------------------- */
const PrettyExplanation = ({ text, theme }: { text: string; theme: any }) => {
  const isDark = theme === "dark";
  if (!text) {
    return (
      <Text style={{ color: isDark ? "#aaa" : "#666" }}>
        No explanation available.
      </Text>
    );
  }

  const raw = text.replace(/\r/g, "");
  const parts = raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <View>
      {parts.map((p, idx) => {
        if (/^(\*|-|\d+\.)/m.test(p)) {
          const lines = p
            .split(/\n/)
            .map((l) => l.replace(/^[\*\-\d\.\)\s]+/, "").trim());
          return (
            <View key={idx} style={{ marginBottom: 8 }}>
              {lines.map((l, i) => (
                <View key={i} style={{ flexDirection: "row", marginBottom: 6 }}>
                  <Text
                    style={{ width: 8, color: isDark ? "#9aa" : "#3b4b6b" }}
                  >
                    •
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      color: isDark ? "#ccc" : "#333",
                      lineHeight: 20,
                    }}
                  >
                    {l}
                  </Text>
                </View>
              ))}
            </View>
          );
        }
        return (
          <Text
            key={idx}
            style={{
              marginBottom: 10,
              color: isDark ? "#ccc" : "#333",
              lineHeight: 20,
            }}
          >
            {p}
          </Text>
        );
      })}
    </View>
  );
};

/* -------------------------
   Small inputs (inline)
   ------------------------- */
function InputField({
  label,
  value,
  setValue,
  numeric = false,
  required = false,
  containerStyle = {},
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
        style={[
          stylesGlobal.input,
          isDark && { backgroundColor: "#181a1b", color: "#fff" },
        ]}
      />
    </View>
  );
}

function SectionTextarea({
  label,
  value,
  setValue,
  placeholder,
  required = false,
  theme,
}: any) {
  const isDark = theme === "dark";
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[stylesGlobal.label, isDark && { color: "#eee" }]}>
        {label} {required && <Text style={stylesGlobal.required}>*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        multiline
        numberOfLines={4}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#777" : "#666"}
        style={[
          stylesGlobal.textarea,
          isDark && { backgroundColor: "#181a1b", color: "#fff" },
        ]}
      />
    </View>
  );
}

/* ============================================================
   MAIN SCREEN COMPONENT
   ============================================================ */
export default function PredictionScreen() {
  const { isAuthenticated, loading, user } = useAuth(); // user should contain email
  const router = useRouter();
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  // form states
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

  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<null | boolean>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const genderOptions = ["Male", "Female", "Other"];

  // redirect if not logged in
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/signin");
  }, [isAuthenticated, loading]);

  // keyboard handlers (for bottom offset)
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height),
    );
    const hide = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const bottomOffset = Math.max(0, keyboardHeight - insets.bottom);

  // API urls
  const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const FEEDBACK_ENDPOINT = `${API_URL}/predict/feedback`;
  // Option A endpoint (change if backend uses different path)

  const handlePredict = async () => {
    if (!age || !gender || !symptoms) {
      Alert.alert(
        "Missing required fields",
        "Please provide age, gender and symptoms.",
      );
      return;
    }

    try {
      setLoadingPredict(true);
      setPredictionResult(null);

      const payload = {
        age: Number(age),
        gender,
        height: Number(height) || 0,
        weight: Number(weight) || 0,
        BP_systolic: Number(bpSystolic) || 0,
        BP_diastolic: Number(bpDiastolic) || 0,
        FBS: Number(fbs) || 0,
        PPBS: Number(ppbs) || 0,
        pulse_rate: Number(pulseRate) || 0,
        medical_history: medicalHistory,
        symptoms,
        email: user?.email ?? "unknown@local",
        conversation_id: null,
      };

      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Predict error:", data);
        Alert.alert("Prediction failed", data?.error || "Unknown server error");
        return;
      }

      setPredictionResult(data);
    } catch (err) {
      console.error("Prediction network error:", err);
      Alert.alert(
        "Prediction failed",
        "Network or server error. Check console.",
      );
    } finally {
      setLoadingPredict(false);
    }
  };

  // parse confidence into percent (handles 0..1 and 0..100)
  const confidencePercent = (() => {
    if (!predictionResult || predictionResult.Confidence == null) return 0;
    const c = Number(predictionResult.Confidence);
    return c <= 1 ? Math.round(c * 100) : Math.round(c);
  })();

  // open feedback modal and set desired choice
  const openFeedbackModal = (isCorrect: boolean) => {
    setFeedbackChoice(isCorrect);
    setFeedbackModalVisible(true);
  };

  // submit feedback to backend
  const submitFeedback = async () => {
    if (!predictionResult || !predictionResult.feedback_id) {
      Alert.alert("Cannot send feedback", "Missing feedback id.");
      setFeedbackModalVisible(false);
      return;
    }

    try {
      setFeedbackSubmitting(true);
      const body = {
        feedback_id: predictionResult.feedback_id,
        is_correct: feedbackChoice === true,
      };

      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Feedback error:", data);
        Alert.alert("Feedback failed", data?.error || "Server error");
      } else {
        Alert.alert("Thanks!", "Your feedback was recorded.");
        // Optionally update UI locally
        setPredictionResult((prev: any) => ({
          ...prev,
          is_correct: body.is_correct,
        }));
      }
    } catch (err) {
      console.error("Feedback network error:", err);
      Alert.alert("Feedback failed", "Network or server error");
    } finally {
      setFeedbackSubmitting(false);
      setFeedbackModalVisible(false);
      setFeedbackChoice(null);
    }
  };

  return (
    <View style={styles.container}>
      <BrandHeader subtitle="Get personalized predictions" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomOffset + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
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

              <View style={styles.colHalf}>
                <Text style={stylesGlobal.label}>
                  Gender <Text style={stylesGlobal.required}>*</Text>
                </Text>

                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.dropdownText}>
                    {gender || "Select Gender"}
                  </Text>
                </TouchableOpacity>

                {showGenderDropdown && (
                  <View style={styles.dropdownList}>
                    {genderOptions.map((g) => (
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

            <Text style={styles.sectionTitle}>Optional Data</Text>
            <View style={styles.row}>
              <InputField
                label="Height (cm)"
                numeric
                value={height}
                setValue={setHeight}
                containerStyle={styles.colHalf}
                theme={theme}
              />
              <InputField
                label="Weight (kg)"
                numeric
                value={weight}
                setValue={setWeight}
                containerStyle={styles.colHalf}
                theme={theme}
              />
            </View>

            <View style={styles.row}>
              <InputField
                label="Pulse Rate"
                numeric
                value={pulseRate}
                setValue={setPulseRate}
                containerStyle={styles.colHalf}
                theme={theme}
              />
              <InputField
                label="BP Systolic"
                numeric
                value={bpSystolic}
                setValue={setBpSystolic}
                containerStyle={styles.colHalf}
                theme={theme}
              />
            </View>

            <InputField
              label="BP Diastolic"
              numeric
              value={bpDiastolic}
              setValue={setBpDiastolic}
              theme={theme}
            />
            <InputField
              label="FBS (mg/dl)"
              numeric
              value={fbs}
              setValue={setFbs}
              theme={theme}
            />
            <InputField
              label="PPBS (mg/dl)"
              numeric
              value={ppbs}
              setValue={setPpbs}
              theme={theme}
            />

            <SectionTextarea
              label="Medical History"
              value={medicalHistory}
              setValue={setMedicalHistory}
              placeholder="Describe past conditions..."
              theme={theme}
            />
            <SectionTextarea
              label="Symptoms"
              required
              value={symptoms}
              setValue={setSymptoms}
              placeholder="Describe symptoms like pain, fever, cough..."
              theme={theme}
            />

            <TouchableOpacity
              style={styles.predictButton}
              onPress={handlePredict}
              disabled={loadingPredict}
            >
              {loadingPredict ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.predictButtonText}>📊 Predict</Text>
              )}
            </TouchableOpacity>

            {/* Result card */}
            {predictionResult && (
              <View style={styles.resultBox}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>Prediction Result</Text>
                    <Text style={styles.resultDisease}>
                      {predictionResult.Predicted_Disease}
                    </Text>
                    <Text style={styles.resultSub}>
                      Tap expand to view full explanation & recommendations
                    </Text>
                  </View>

                  <View style={{ alignItems: "center", marginLeft: 12 }}>
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

                {/* Accordion with full explanation */}
                <Accordion
                  title="Why the model predicted & Remedies"
                  theme={theme}
                >
                  <View>
                    <Text
                      style={{
                        fontWeight: "800",
                        marginBottom: 8,
                        color: theme === "dark" ? "#fff" : "#111",
                      }}
                    >
                      Why the model predicted
                    </Text>
                    <PrettyExplanation
                      text={predictionResult.Explanation || ""}
                      theme={theme}
                    />

                    <View style={{ height: 12 }} />

                    <Text
                      style={{
                        fontWeight: "800",
                        marginBottom: 8,
                        color: theme === "dark" ? "#fff" : "#111",
                      }}
                    >
                      Ayurvedic Home Remedies & Lifestyle
                    </Text>
                    <PrettyExplanation
                      text={predictionResult.Explanation || ""}
                      theme={theme}
                    />

                    {/* Feedback row (separate - opens modal) */}
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 18,
                        justifyContent: "flex-end",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => openFeedbackModal(true)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: "#2ecc40",
                          marginRight: 8,
                        }}
                      >
                        <Text style={{ color: "#2ecc40", fontWeight: "700" }}>
                          Mark as correct
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => openFeedbackModal(false)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#f39c12",
                        }}
                      >
                        <Text style={{ color: "#f39c12", fontWeight: "700" }}>
                          Not correct
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Accordion>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Feedback confirmation modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View
            style={[
              modalStyles.card,
              theme === "dark" ? { backgroundColor: "#111" } : {},
            ]}
          >
            <Text
              style={[
                modalStyles.title,
                theme === "dark" ? { color: "#fff" } : {},
              ]}
            >
              {feedbackChoice
                ? "Confirm — Mark as correct"
                : "Confirm — Mark as not correct"}
            </Text>
            <Text
              style={[
                modalStyles.text,
                theme === "dark" ? { color: "#ddd" } : {},
              ]}
            >
              Are you sure you want to submit this feedback? It will help
              improve model performance.
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 18,
              }}
            >
              <Pressable
                onPress={() => {
                  setFeedbackModalVisible(false);
                  setFeedbackChoice(null);
                }}
                style={({ pressed }) => [
                  modalStyles.btn,
                  {
                    marginRight: 10,
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: "#ccc",
                  },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={{ color: "#333", fontWeight: "700" }}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={submitFeedback}
                style={({ pressed }) => [
                  modalStyles.btn,
                  { backgroundColor: "#2ecc40" },
                  pressed && { opacity: 0.8 },
                ]}
              >
                {feedbackSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    Confirm
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================
   Styles
   ============================================================ */
const stylesGlobal = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderColor: "#ccc",
    marginBottom: 8,
    backgroundColor: "#f5f6f7",
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 80,
    borderColor: "#ccc",
    backgroundColor: "#f5f6f7",
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#222",
  },
  required: {
    color: "#e74c3c",
    fontWeight: "700",
  },
});

function getStyles(theme: any) {
  const isDark = theme === "dark";
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0f0f10" : "#f5f6f7",
    },
    scrollContent: {
      padding: 16,
    },
    card: {
      backgroundColor: isDark ? "#121212" : "#ffffff",
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 6,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 6,
      marginBottom: 12,
      color: isDark ? "#fff" : "#0b3d91",
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    colHalf: {
      flex: 1,
    },
    dropdown: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      borderColor: isDark ? "#333" : "#ccc",
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
    },
    dropdownText: {
      fontSize: 15,
      color: isDark ? "#fff" : "#222",
    },
    dropdownList: {
      marginTop: 6,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "#444" : "#ccc",
      backgroundColor: isDark ? "#181a1b" : "#fff",
    },
    dropdownItem: {
      padding: 12,
    },
    predictButton: {
      marginTop: 14,
      backgroundColor: "#2ecc40",
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    predictButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "800",
    },
    resultBox: {
      marginTop: 20,
      borderRadius: 14,
      padding: 16,
      backgroundColor: isDark ? "#0d0d0d" : "#f3fbff",
      borderWidth: 1,
      borderColor: isDark ? "#222" : "#d7eefc",
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
      marginTop: 6,
      marginBottom: 4,
    },
    resultSub: {
      fontSize: 12,
      color: isDark ? "#9aa" : "#666",
    },
    resultLine: {
      fontSize: 15,
      marginBottom: 6,
      color: isDark ? "#ccc" : "#333",
    },
  });
}

const styles = getStyles({}); // default for inline components to not break types
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(6,10,20,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    elevation: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  text: { fontSize: 14, color: "#444" },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
});

const stylesGlobalRef = stylesGlobal; // keep linter happy (we used stylesGlobal above)
