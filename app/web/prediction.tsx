// app/(tabs)/prediction.tsx
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

import PredictionExplanation from "@/components/web/prediction-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const genderOptions = ["Male", "Female", "Other"];

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

  // UI refs for scrollIntoView when focusing
  const medicalRef = useRef<any>(null);
  const symptomsRef = useRef<any>(null);
  const scrollRef = useRef<any>(null);

  // Animated values
  const confAnim = useRef(new Animated.Value(0)).current; // 0..100
  const confBadgeAnim = useRef(new Animated.Value(0)).current;

  // API
  const API_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";
  const PREDICT_ENDPOINT = `${API_URL}/predict`;
  const FEEDBACK_ENDPOINT = `${API_URL}/predict/feedback`;

  // If platform not web, hide this component (preserves app behaviour)
  if (Platform.OS !== "web") return null;

  // utility: animate confidence values (0-100)
  const animateConfidence = (percent: number) => {
    const p = Math.max(0, Math.min(100, percent));
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

  // parse server response but handle non-json responses gracefully
  async function safeParseResponse(res: Response) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return res.json();
    }
    // fallback: try text and parse if possible
    const txt = await res.text();
    try {
      return JSON.parse(txt);
    } catch {
      // return raw text wrapped
      return { __raw_text: txt };
    }
  }

  // parse explanation text into sections
  // Looks for lines that end with ':' and treat them as headings.
  // Returns an ordered array of { heading, body }.
  function parseExplanationSections(rawText: string | undefined) {
    const out: { heading: string; body: string }[] = [];
    if (!rawText || !rawText.trim()) return out;

    // Normalize CRLF
    const text = rawText.replace(/\r/g, "");
    // Regex to find headings: a line that ends with ':' (allow typical headings)
    const headingRegex = /^([A-Za-z0-9 \-&'()]{3,80}):\s*$/gm;
    let match;
    const indices: { idx: number; heading: string }[] = [];

    // gather heading indices
    while ((match = headingRegex.exec(text)) !== null) {
      indices.push({ idx: match.index, heading: match[1].trim() });
    }

    if (indices.length === 0) {
      // No explicit headings found.
      // Heuristic: split by two or more newlines into paragraphs and produce gentle sections
      const parts = text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length <= 1) {
        out.push({ heading: "Explanation", body: text.trim() });
      } else {
        // create generic numbered headings but preserve original paragraphs
        parts.forEach((p, i) =>
          out.push({ heading: `Part ${i + 1}`, body: p }),
        );
      }
      return out;
    }

    // If headings found, slice text accordingly
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i].idx;
      const heading = indices[i].heading;
      const bodyStart = text.indexOf("\n", start) + 1; // after heading line
      const end = i + 1 < indices.length ? indices[i + 1].idx : text.length;
      const body = text.slice(bodyStart, end).trim();
      out.push({ heading, body });
    }

    return out;
  }

  // submit predict
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
      symptoms: symptoms,
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
        // Helpful debug message
        console.error("Predict failed", data);
        const errMsg =
          data?.error ||
          data?.__raw_text ||
          "Prediction endpoint returned an error.";
        Alert.alert("Prediction failed", String(errMsg));
        return;
      }

      // Normalise fields from backend
      const normalized = {
        Predicted_Disease:
          data?.Predicted_Disease || data?.predicted_disease || "Unknown",
        Confidence:
          typeof data?.Confidence === "number"
            ? data.Confidence
            : (data?.confidence ?? 0),
        Explanation: data?.Explanation || data?.explanation || "",
        feedback_id: data?.feedback_id ?? data?.feedbackId ?? null,
        rag_metadata: data?.rag_metadata ?? {},
      };

      setPredictionResult(normalized);

      // animate confidence (backend might return 0..1 or 0..100)
      const rawC = Number(normalized.Confidence ?? 0);
      const percent = rawC <= 1 ? Math.round(rawC * 100) : Math.round(rawC);
      animateConfidence(percent);

      // scroll result into view
      setTimeout(() => {
        if (scrollRef.current?.scrollTo) {
          scrollRef.current.scrollTo({ y: 0, animated: true });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 120);
    } catch (err) {
      console.error("Prediction network error", err);
      Alert.alert(
        "Network error",
        "Could not reach the prediction server. Check backend or network.",
      );
    } finally {
      setLoadingPredict(false);
    }
  };

  // submit feedback
  const submitFeedback = async () => {
    if (!predictionResult || !predictionResult.feedback_id) {
      Alert.alert("Feedback error", "Missing feedback id; cannot submit.");
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
        console.error("Feedback error", data);
        const errMsg = data?.error || data?.__raw_text || "Server error";
        Alert.alert("Feedback failed", String(errMsg));
      } else {
        Alert.alert("Thanks!", "Your feedback has been recorded.");
        // update local UI
        setPredictionResult((prev: any) => ({
          ...prev,
          is_correct: body.is_correct,
        }));
      }
    } catch (err) {
      console.error("Feedback network error", err);
      Alert.alert(
        "Network error",
        "Could not reach the feedback endpoint. Check backend or network.",
      );
    } finally {
      setFeedbackSubmitting(false);
      setFeedbackModalVisible(false);
      setFeedbackChoice(null);
    }
  };

  // helper to scroll a ref into view (web)
  const scrollFieldIntoView = (r: any) => {
    if (!r || !r.current) return;
    const node = r.current;
    if (node && node.scrollIntoView) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (node && node.focus) {
      try {
        node.focus();
      } catch {}
    }
  };

  // derived UI confidence percent for text display
  const displayedPercent = (() => {
    if (!predictionResult) return 0;
    const c = Number(predictionResult.Confidence ?? 0);
    return c <= 1 ? Math.round(c * 100) : Math.round(c);
  })();

  // Animated style helpers
  const barWidth = confAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const badgeValue = confBadgeAnim; // used to render number via listener below
  const [badgeDisplay, setBadgeDisplay] = useState(0);
  useEffect(() => {
    const id = badgeValue.addListener(({ value }) =>
      setBadgeDisplay(Math.round(value)),
    );
    return () => badgeValue.removeListener(id);
  }, [badgeValue]);

  // parse explanation sections (avoid duplication)
  const explanationSections = parseExplanationSections(
    predictionResult?.Explanation,
  );

  // If parse returned multiple sections, find common headings we want to show
  // We'll attempt to map: "Why the model predicted" and "Ayurvedic Home Remedies & Lifestyle"
  const getSectionByHeading = (candidates: string[]) => {
    if (!explanationSections || explanationSections.length === 0) return null;
    const lowCandidates = candidates.map((s) => s.toLowerCase());
    for (const sec of explanationSections) {
      const h = sec.heading.toLowerCase();
      for (const cand of lowCandidates) {
        if (h.includes(cand)) return sec.body;
      }
    }
    return null;
  };

  // get the two main bodies if present
  const whyBody =
    getSectionByHeading([
      "why the model predicted",
      "why the model",
      "why predicted",
    ]) || (explanationSections.length > 0 ? explanationSections[0].body : null);

  const remediesBody =
    getSectionByHeading([
      "ayurvedic",
      "remedies",
      "home remedies",
      "lifestyle",
    ]) ||
    // pick second section if different from first
    (explanationSections.length > 1 ? explanationSections[1].body : null);

  // If both are equal, only show once
  const showRemedies =
    remediesBody &&
    remediesBody.trim() &&
    remediesBody.trim() !== (whyBody || "").trim();

  // UI
  return (
    <View style={styles.container}>
      <BrandHeader subtitle="Get personalized predictions" />

      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef as any}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 16 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
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

              <View style={styles.colHalf}>
                <Text style={styles.label}>
                  Gender <Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowGenderDropdown(!showGenderDropdown)}
                >
                  <Text style={styles.dropdownText}>
                    {gender || "Select Gender"}
                  </Text>
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
              ref={medicalRef as any}
              style={[styles.input, styles.textarea]}
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={3}
              onFocus={() => scrollFieldIntoView(medicalRef)}
            />

            <Text style={styles.sectionTitle}>Symptoms</Text>
            <TextInput
              ref={symptomsRef as any}
              style={[styles.input, styles.textarea]}
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
              numberOfLines={3}
              onFocus={() => scrollFieldIntoView(symptomsRef)}
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

            {/* Result */}
            {predictionResult && (
              <View style={styles.resultBox}>
                <View style={styles.resultRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>Prediction Result</Text>
                    <Text style={styles.resultLine}>
                      <Text style={styles.bold}>Disease:</Text>{" "}
                      {predictionResult.Predicted_Disease}
                    </Text>
                    <Text style={styles.resultLine}>
                      <Text style={styles.bold}>Confidence:</Text>{" "}
                      {displayedPercent}%
                    </Text>
                  </View>

                  <View style={styles.confidenceCol}>
                    <View style={styles.badge}>
                      <Text style={styles.badgePercent}>{badgeDisplay}%</Text>
                      <Text style={styles.badgeLabel}>confidence</Text>
                    </View>

                    <View style={{ width: 180, marginTop: 12 }}>
                      <View
                        style={[
                          styles.confBarBackground,
                          { backgroundColor: "#e6f0ff" },
                        ]}
                      >
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

                <View style={{ height: 12 }} />
                <View style={styles.explanationSection}>
                  {/* WHY */}
                  <Text style={styles.explainHeader}>
                    Why the model predicted
                  </Text>
                  {whyBody ? (
                    <PredictionExplanation text={whyBody} theme={theme} />
                  ) : (
                    <PredictionExplanation
                      text={predictionResult.Explanation}
                      theme={theme}
                    />
                  )}

                  {/* REMEDIES (only if different) */}
                  {showRemedies && (
                    <>
                      <View style={{ height: 10 }} />
                      <Text style={styles.explainHeader}>
                        Ayurvedic Home Remedies & Lifestyle
                      </Text>
                      <PredictionExplanation
                        text={remediesBody!}
                        theme={theme}
                      />
                    </>
                  )}

                  {/* If there were additional parsed sections beyond why/remedies, render them */}
                  {explanationSections.length > 2 && (
                    <>
                      <View style={{ height: 10 }} />
                      {explanationSections.slice(2).map((s, idx) => (
                        <View key={idx} style={{ marginTop: 10 }}>
                          <Text
                            style={[styles.explainHeader, { fontSize: 16 }]}
                          >
                            {s.heading}
                          </Text>
                          <PredictionExplanation text={s.body} theme={theme} />
                        </View>
                      ))}
                    </>
                  )}

                  {/* Feedback buttons */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      marginTop: 14,
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
                      style={[
                        styles.smallBtn,
                        { borderColor: "#f39c12", backgroundColor: "#fff" },
                      ]}
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

      {/* Feedback modal */}
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

/* ---------------------------
   STYLES
   --------------------------- */
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
      marginTop: 2,
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
      marginBottom: 12,
      width: "100%",
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
      fontSize: 15,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
    },
    dropdown: {
      backgroundColor: isDark ? "#181a1b" : "#f5f6f7",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: "center",
    },
    dropdownText: {
      color: isDark ? "#fff" : "#222",
      fontSize: 15,
    },
    dropdownList: {
      position: "absolute",
      top: 44,
      left: 0,
      right: 0,
      backgroundColor: isDark ? "#222" : "#fff",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      zIndex: 10,
    },
    dropdownItem: {
      padding: 10,
    },
    textarea: {
      minHeight: 80,
      textAlignVertical: "top",
      marginBottom: 8,
    },
    predictButton: {
      backgroundColor: "#2ecc40",
      borderRadius: 8,
      paddingVertical: 14,
      marginTop: 16,
      marginBottom: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    predictButtonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 18,
    },
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

    // confidence column
    resultRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      width: "100%",
    },
    confidenceCol: {
      alignItems: "center",
      marginLeft: 12,
    },
    badge: {
      width: 84,
      height: 84,
      borderRadius: 44,
      backgroundColor: isDark ? "#0b0b0b" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#e6eefc",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    badgePercent: {
      fontSize: 20,
      fontWeight: "900",
      color: isDark ? "#fff" : "#111",
    },
    badgeLabel: {
      fontSize: 11,
      color: isDark ? "#9aa" : "#666",
    },
    confBarBackground: {
      height: 12,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#e6f0ff",
    },
    confBarFill: {
      height: "100%",
      width: "0%",
    },
    explanationSection: {
      marginTop: 8,
    },
    explainHeader: {
      fontWeight: "800",
      marginBottom: 8,
      color: isDark ? "#fff" : "#111",
    },
    smallBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: "transparent",
    },
  });
}

// modal styles
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
    maxWidth: 480,
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
