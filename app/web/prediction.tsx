// app/web/prediction.tsx

import BrandHeader from "@/components/brand-header";
import { useAppTheme } from "@/context/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";

import PredictionExplanation from "@/components/web/prediction-view"; // external component
import { useSafeAreaInsets } from "react-native-safe-area-context";

const genderOptions = ["Male", "Female", "Other"];

// strict markdown section parser (MOBILE MATCHED)
function parseMarkdownSections(mdText: string | undefined) {
  if (!mdText || typeof mdText !== "string") return [];

  const lines = mdText.replace(/\r/g, "").split("\n");

  const sections: { title: string; body: string }[] = [];
  let currentTitle = "";
  let buffer: string[] = [];

  const flush = () => {
    if (currentTitle.trim()) {
      sections.push({
        title: currentTitle.trim(),
        body: buffer.join("\n").trim(),
      });
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(/^##\s+\*\*(.*?)\*\*/);
    if (match) {
      flush();
      currentTitle = match[1];
    } else {
      buffer.push(line);
    }
  }

  flush();
  return sections;
}

export default function WebPredictionPage() {
  const { theme } = useAppTheme();
  const styles = getStyles(theme || "light");
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

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  // prediction state
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // feedback modal
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackChoice, setFeedbackChoice] = useState<null | boolean>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // UI refs
  const scrollRef = useRef<any>(null);
  const medicalRef = useRef<any>(null);
  const symptomsRef = useRef<any>(null);
  const genderWrapperRef = useRef<any>(null);

  // Animated confidence
  const confAnim = useRef(new Animated.Value(0)).current;
  const confBadgeAnim = useRef(new Animated.Value(0)).current;

  // Bottom sheet anim
  const sheetAnim = useRef(new Animated.Value(0)).current;

  const API_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
  const PREDICT_ENDPOINT = `${API_URL}/predict`;
  const FEEDBACK_ENDPOINT = `${API_URL}/predict/feedback`;

  if (Platform.OS !== "web") return null;

  const animateConfidence = (percent: number) => {
    const p = Math.min(100, Math.max(0, percent));
    Animated.timing(confAnim, {
      toValue: p,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    Animated.timing(confBadgeAnim, {
      toValue: p,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  // gender sheet animation
  useEffect(() => {
    Animated.timing(sheetAnim, {
      toValue: showGenderDropdown ? 1 : 0,
      duration: showGenderDropdown ? 260 : 200,
      easing: showGenderDropdown
        ? Easing.out(Easing.quad)
        : Easing.in(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [showGenderDropdown]);

  // confidence badge display
  const [badgeDisplay, setBadgeDisplay] = useState(0);
  useEffect(() => {
    const id = confBadgeAnim.addListener(({ value }) => {
      setBadgeDisplay(Math.round(value));
    });
    return () => confBadgeAnim.removeListener(id);
  }, []);
  /* ---------------------------------
     SAFE JSON PARSER
  ----------------------------------- */
  async function safeParseResponse(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();

    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      return { __raw_text: txt };
    }
  }

  /* ---------------------------------
     PREDICT HANDLER
  ----------------------------------- */
  const handlePredict = async () => {
    if (!age || !gender || !symptoms) {
      Alert.alert("Missing fields", "Age, Gender and Symptoms are required.");
      return;
    }

    setPredictionResult(null);
    setLoadingPredict(true);

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
      email: "testuser@sanjeevani.ai",
      conversation_id: null,
    };

    try {
      const res = await fetch(PREDICT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeParseResponse(res);

      if (!res.ok) {
        console.error("Predict failed:", data);
        Alert.alert(
          "Prediction Error",
          data?.error || data?.__raw_text || "Server Error",
        );
        return;
      }

      // Normalize fields
      const normalized = {
        Predicted_Disease: data?.Predicted_Disease || "Unknown",
        Confidence:
          typeof data?.Confidence === "number"
            ? data.Confidence
            : Number(data?.confidence ?? 0),
        Validation_Status: data?.Validation_Status || "confirmed",
        Explanation: data?.Explanation || "",
        feedback_id: data?.feedback_id,
        rag_metadata: data?.rag_metadata || {},
      };

      setPredictionResult(normalized);

      // Confidence animation
      const rawC = Number(normalized.Confidence ?? 0);
      const percent = rawC <= 1 ? Math.round(rawC * 100) : Math.round(rawC);
      animateConfidence(percent);

      // Scroll to top
      setTimeout(() => {
        if (scrollRef.current?.scrollTo)
          scrollRef.current.scrollTo({ y: 0, animated: true });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      }, 120);
    } catch (err) {
      console.error("Network error:", err);
      Alert.alert("Network Error", "Could not reach the prediction server.");
    } finally {
      setLoadingPredict(false);
    }
  };

  /* ---------------------------------
     FEEDBACK HANDLER
  ----------------------------------- */
  const submitFeedback = async () => {
    if (!predictionResult?.feedback_id) {
      Alert.alert("Error", "Missing feedback ID.");
      setFeedbackModalVisible(false);
      return;
    }

    setFeedbackSubmitting(true);

    const body = {
      feedback_id: predictionResult.feedback_id,
      is_correct: feedbackChoice === true,
    };

    try {
      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await safeParseResponse(res);

      if (!res.ok) {
        console.error("Feedback error:", data);
        Alert.alert("Feedback Error", data?.error || "Server Error");
      } else {
        Alert.alert("Thank you!", "Your feedback helps improve the model.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Network Error", "Could not send feedback.");
    } finally {
      setFeedbackSubmitting(false);
      setFeedbackModalVisible(false);
      setFeedbackChoice(null);
    }
  };

  /* ---------------------------------
     CONFIDENCE ANIMATION VALUES
  ----------------------------------- */
  const displayedPercent = (() => {
    if (!predictionResult) return 0;
    const c = Number(predictionResult.Confidence);
    return c <= 1 ? Math.round(c * 100) : Math.round(c);
  })();

  const barWidth = confAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  /* ---------------------------------
     STRICT MARKDOWN → SELECT SECTIONS
  ----------------------------------- */
  const sections = parseMarkdownSections(predictionResult?.Explanation);

  const findSection = (keywords: string[]) => {
    if (!sections.length) return null;
    const keys = keywords.map((k) => k.toLowerCase());
    for (const sec of sections) {
      const t = sec.title.toLowerCase();
      if (keys.some((k) => t.includes(k))) return sec.body;
    }
    return null;
  };

  const whyBody =
    findSection(["why the model predicted", "why", "reason"]) ||
    sections[0]?.body ||
    "";

  const remediesBody =
    findSection(["ayurvedic", "remedies", "lifestyle"]) ||
    sections[1]?.body ||
    "";

  const warningsBody = findSection(["warning", "overlap"]);
  const lifestyleBody = findSection(["lifestyle"]);
  const additionalBody = findSection(["additional", "suggestions"]);
  /* ---------------------------------
     UI RENDER
  ----------------------------------- */
  return (
    <View style={styles.container}>
      <BrandHeader subtitle="Get personalized predictions" />

      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* --- FORM CARD --- */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Required Information</Text>

            <View style={styles.row}>
              <View style={styles.colFull}>
                <Text style={styles.label}>
                  Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.label}>
                  Age <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              <View
                style={[styles.colHalf, { position: "relative" }]}
                ref={genderWrapperRef}
              >
                <Text style={styles.label}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowGenderDropdown(true)}
                >
                  <Text style={styles.dropdownText}>
                    {gender || "Select Gender"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Optional Data</Text>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.colHalf}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.label}>Pulse Rate</Text>
                <TextInput
                  style={styles.input}
                  value={pulseRate}
                  onChangeText={setPulseRate}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.colHalf}>
                <Text style={styles.label}>BP Systolic</Text>
                <TextInput
                  style={styles.input}
                  value={bpSystolic}
                  onChangeText={setBpSystolic}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colFull}>
                <Text style={styles.label}>BP Diastolic</Text>
                <TextInput
                  style={styles.input}
                  value={bpDiastolic}
                  onChangeText={setBpDiastolic}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colFull}>
                <Text style={styles.label}>FBS (mg/dl)</Text>
                <TextInput
                  style={styles.input}
                  value={fbs}
                  onChangeText={setFbs}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.colFull}>
                <Text style={styles.label}>PPBS (mg/dl)</Text>
                <TextInput
                  style={styles.input}
                  value={ppbs}
                  onChangeText={setPpbs}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Medical History</Text>
            <TextInput
              ref={medicalRef}
              style={[styles.input, styles.textarea]}
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.sectionTitle}>Symptoms</Text>
            <TextInput
              ref={symptomsRef}
              style={[styles.input, styles.textarea]}
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={3}
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

            {/* -------------------- RESULT CARD -------------------- */}
            {predictionResult && (
              <View style={styles.resultBox}>
                <View style={styles.resultRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>Prediction Result</Text>

                    <Text style={styles.resultLine}>
                      <Text style={styles.bold}>Condition:</Text>{" "}
                      {predictionResult.Predicted_Disease}
                    </Text>

                    {/* 🔶 Soft Indirect Warnings */}
                    {predictionResult.Validation_Status ===
                      "suspected_wrong" && (
                      <Text
                        style={{
                          marginTop: 8,
                          color: "#e67e22",
                          fontWeight: "700",
                        }}
                      >
                        ⚠ Some of your symptoms may also relate to other common
                        conditions.
                      </Text>
                    )}

                    {predictionResult.Validation_Status === "possible" && (
                      <Text
                        style={{
                          marginTop: 8,
                          color: "#f1c40f",
                          fontWeight: "700",
                        }}
                      >
                        ⚠ Your symptoms can sometimes overlap with other
                        conditions.
                      </Text>
                    )}

                    <Text style={styles.resultLine}>
                      <Text style={styles.bold}>Confidence:</Text>{" "}
                      {displayedPercent}%
                    </Text>
                  </View>

                  {/* Confidence Badge */}
                  <View style={styles.confidenceCol}>
                    <View style={styles.badge}>
                      <Text style={styles.badgePercent}>{badgeDisplay}%</Text>
                      <Text style={styles.badgeLabel}>confidence</Text>
                    </View>

                    <View style={{ width: 180, marginTop: 12 }}>
                      <View style={styles.confBarBackground}>
                        <Animated.View
                          style={[
                            styles.confBarFill,
                            {
                              width: barWidth,
                              backgroundColor:
                                displayedPercent > 70
                                  ? "#27ae60"
                                  : displayedPercent > 40
                                    ? "#f1c40f"
                                    : "#e74c3c",
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* ---------------- EXPLANATION SECTIONS ---------------- */}

                <View style={styles.explanationSection}>
                  {/* WHY */}
                  <Text style={styles.explainHeader}>
                    Why the model predicted this
                  </Text>
                  <PredictionExplanation text={whyBody} theme={theme} />

                  {/* WARNINGS */}
                  {warningsBody && warningsBody.trim().length > 0 && (
                    <>
                      <Text style={styles.explainHeader}>Warnings</Text>
                      <PredictionExplanation
                        text={warningsBody}
                        theme={theme}
                      />
                    </>
                  )}

                  {/* REMEDIES */}
                  {remediesBody && remediesBody.trim().length > 0 && (
                    <>
                      <Text style={styles.explainHeader}>
                        Ayurvedic Remedies
                      </Text>
                      <PredictionExplanation
                        text={remediesBody}
                        theme={theme}
                      />
                    </>
                  )}

                  {/* LIFESTYLE */}
                  {lifestyleBody && lifestyleBody.trim().length > 0 && (
                    <>
                      <Text style={styles.explainHeader}>
                        Lifestyle & Exercise
                      </Text>
                      <PredictionExplanation
                        text={lifestyleBody}
                        theme={theme}
                      />
                    </>
                  )}

                  {/* ADDITIONAL */}
                  {additionalBody && additionalBody.trim().length > 0 && (
                    <>
                      <Text style={styles.explainHeader}>
                        Additional Suggestions
                      </Text>
                      <PredictionExplanation
                        text={additionalBody}
                        theme={theme}
                      />
                    </>
                  )}

                  {/* FEEDBACK BUTTONS */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 16,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setFeedbackChoice(true);
                        setFeedbackModalVisible(true);
                      }}
                      style={[
                        styles.smallBtn,
                        { borderColor: "#2ecc40", marginRight: 8 },
                      ]}
                    >
                      <Text style={{ color: "#2ecc40", fontWeight: "700" }}>
                        Mark as correct
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setFeedbackChoice(false);
                        setFeedbackModalVisible(true);
                      }}
                      style={[styles.smallBtn, { borderColor: "#f39c12" }]}
                    >
                      <Text style={{ color: "#f39c12", fontWeight: "700" }}>
                        Not correct
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* --------------------------------------------
          GENDER BOTTOM SHEET MODAL
      --------------------------------------------- */}
      <Modal
        visible={showGenderDropdown}
        transparent
        animationType="none"
        onRequestClose={() => setShowGenderDropdown(false)}
      >
        {/* Overlay */}
        <Pressable
          style={styles.sheetOverlay}
          onPress={() => setShowGenderDropdown(false)}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: sheetTranslateY }] },
          ]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Select Gender</Text>

          {genderOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.sheetItem}
              onPress={() => {
                setGender(opt);
                setShowGenderDropdown(false);
              }}
            >
              <Text style={styles.sheetItemText}>{opt}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.sheetCancel}
            onPress={() => setShowGenderDropdown(false)}
          >
            <Text style={styles.sheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>

      {/* --------------------------------------------
          FEEDBACK MODAL
      --------------------------------------------- */}
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
              Are you sure you want to submit this feedback? It helps improve
              future predictions.
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              {/* Cancel */}
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

              {/* Confirm */}
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
/* --------------------------------------------
   STYLES (MAIN)
--------------------------------------------- */
function getStyles(theme: string) {
  const isDark = theme === "dark";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#151718" : "#f5f6f7",
    },
    scrollContent: {
      padding: 16,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    card: {
      width: "100%",
      maxWidth: 920,
      backgroundColor: isDark ? "#222" : "#fff",
      borderRadius: 16,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 19,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#222",
      marginBottom: 10,
    },
    label: {
      fontSize: 15,
      color: isDark ? "#eee" : "#222",
      marginBottom: 6,
    },
    required: {
      color: "#e74c3c",
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      gap: 12,
      width: "100%",
      marginBottom: 12,
    },
    colFull: {
      flex: 1,
      minWidth: 180,
    },
    colHalf: {
      flex: 1,
      minWidth: 180,
    },
    input: {
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
      color: isDark ? "#fff" : "#222",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      fontSize: 15,
    },
    dropdown: {
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    dropdownText: {
      color: isDark ? "#fff" : "#222",
      fontSize: 15,
    },

    /* Bottom sheet */
    sheetOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheetContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#111" : "#fff",
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    sheetHandle: {
      width: 40,
      height: 5,
      borderRadius: 4,
      backgroundColor: isDark ? "#333" : "#ccc",
      alignSelf: "center",
      marginBottom: 12,
    },
    sheetTitle: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
      color: isDark ? "#fff" : "#111",
    },
    sheetItem: {
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#222" : "#eee",
    },
    sheetItemText: {
      textAlign: "center",
      fontSize: 16,
      fontWeight: "600",
      color: isDark ? "#fff" : "#111",
    },
    sheetCancel: {
      marginTop: 10,
      alignItems: "center",
    },
    sheetCancelText: {
      color: "#888",
      fontWeight: "700",
    },

    /* Result Box */
    resultBox: {
      marginTop: 20,
      backgroundColor: isDark ? "#111" : "#f0f8ff",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#cde",
      width: "100%",
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 10,
      color: isDark ? "#fff" : "#000",
    },
    resultLine: {
      fontSize: 15,
      marginBottom: 6,
      color: isDark ? "#eee" : "#333",
    },
    bold: { fontWeight: "bold" },

    /* Confidence */
    resultRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    confidenceCol: {
      alignItems: "center",
    },
    badge: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: isDark ? "#0b0b0b" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e6eefc",
      alignItems: "center",
      justifyContent: "center",
    },
    badgePercent: {
      fontSize: 20,
      fontWeight: "900",
      color: isDark ? "#fff" : "#111",
    },
    badgeLabel: {
      fontSize: 11,
      color: isDark ? "#aaa" : "#666",
    },
    confBarBackground: {
      height: 12,
      borderRadius: 12,
      backgroundColor: "#e6f0ff",
      overflow: "hidden",
    },
    confBarFill: {
      height: "100%",
    },

    explanationSection: {
      marginTop: 16,
    },
    explainHeader: {
      fontWeight: "800",
      fontSize: 17,
      marginBottom: 8,
      color: isDark ? "#fff" : "#111",
    },

    smallBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
  });
}
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    color: "#111",
  },
  text: {
    fontSize: 14,
    color: "#444",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
