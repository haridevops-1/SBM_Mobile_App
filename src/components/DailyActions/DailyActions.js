/**
 * ============================================================================
 * FILE: DailyActions.js
 * PATH: C:\SBM_Mobile_App\src\components\DailyActions\DailyActions.js
 *
 * PURPOSE:
 * Renders the Daily Action Cards section on the Tracker (Home) screen.
 * Displays "Log Today's Effort" button (triggering DailyQuestionsModal) and
 * "Log Today's Weight" button (triggering Weight Log modal popup).
 * Provides immediate visual feedback modals when effort or weight is already logged.
 * ============================================================================
 */

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Modal } from "react-native";
import { Check, Scale, X, ChevronsUpDown } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../context/UserContext";
import theme from "../../theme/theme";
import styles from "../../styles/components/DailyActions.styles";
import DailyQuestionsModal from "./DailyQuestionsModal";

export const DailyActions = () => {
  const {
    todayEffortLogged,
    todayWeightLogged,
    loggedWeight,
    todayEffortScore,
    userId,
    streakDays,
    fetchDashboardData,
    logWeight,
    historyLogs,
    preSbmScore,
    checkAndMarkMissedDays,
  } = useUser();

  // On mount: detect any missed days since last log and update consistencyTotal
  useEffect(() => {
    checkAndMarkMissedDays();
  }, []);

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(
    loggedWeight ? loggedWeight.toString() : "",
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [showEffortSuccessModal, setShowEffortSuccessModal] = useState(false);

  // SVG parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;

  // todayEffortScore is already a percentage (0-100) from backend
  const todayEffortPercent = Math.min(
    100,
    Math.max(0, Math.round(todayEffortScore)),
  );

  let last7DaysEffortPercent = 0;
  if (historyLogs && historyLogs.length > 0) {
    const sumEffort = historyLogs.reduce((acc, l) => acc + (l.effort || 0), 0);
    last7DaysEffortPercent = Math.min(
      100,
      Math.max(0, Math.round(sumEffort / historyLogs.length)),
    );
  }

  const strokeDashoffset =
    circumference - (todayEffortPercent / 100) * circumference;

  const handleLogEffortClick = () => {
    if (!todayEffortLogged) {
      setModalVisible(true);
    } else {
      setShowEffortSuccessModal(true);
    }
  };

  const handleWeightInputChange = (text) => {
    // Only allow numbers and a single decimal point
    let sanitized = text.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    // Restrict to max 2 decimal digits after dot
    if (parts.length === 2 && parts[1].length > 2) {
      sanitized = parts[0] + "." + parts[1].slice(0, 2);
    }
    setWeightInputValue(sanitized);
  };

  const handleWeightSubmit = async () => {
    if (weightInputValue.trim() !== "") {
      const parsedWeight = parseFloat(weightInputValue);
      if (isNaN(parsedWeight) || parsedWeight <= 0) {
        alert("Please enter a valid weight value.");
        return;
      }

      // Format weight strictly to 2 decimal places (e.g. 78.89)
      const roundedWeight = parseFloat(parsedWeight.toFixed(2));

      try {
        const response = await fetch(
          "https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/log-weight",
          {
            method: "POST",
            headers: {
              "Content-Type": "text/plain",
            },
            body: JSON.stringify({
              userId: userId,
              weight: roundedWeight,
            }),
          },
        );

        const data = await response.json();
        if (response.ok && data.status === "success") {
          // Weight saved inside cloud weight_history. Sync locally
          logWeight(roundedWeight);
          fetchDashboardData();
          setShowWeightInput(false);
        } else {
          alert(
            "Error logging weight: " +
              (data.message || "Catalyst database rejected the transaction."),
          );
        }
      } catch (err) {
        console.error(err);
        alert("Network Error: Could not connect to Catalyst to log weight.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.trackerSubheading}>Your Effort Scores</Text>

      <View style={styles.effortScoresCard}>
        <View style={styles.effortGaugeWrapper}>
          <Svg style={styles.effortGaugeSvg} viewBox="0 0 120 120">
            <Circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#7B1FA2"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              origin="60, 60"
              rotation="-90"
            />
          </Svg>
          <View style={styles.gaugeCenterText}>
            <Text style={styles.gaugePercent}>{todayEffortPercent}%</Text>
            <Text style={styles.gaugeLabel}>Today's Effort</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.effortSplitStats}>
          <View style={styles.splitStatBox}>
            <Text style={styles.splitValue}>{preSbmScore}%</Text>
            <Text style={styles.splitLabel}>Pre-SBM effort</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.splitStatBox}>
            <Text style={styles.splitValue}>{last7DaysEffortPercent}%</Text>
            <Text style={styles.splitLabel}>Last 7 days effort</Text>
          </View>
        </View>
      </View>

      <Text style={styles.trackerSubheading}>Daily Actions</Text>

      <View style={styles.actionButtonsStack}>
        {/* Log Effort Button */}
        <View style={styles.actionBtnContainer}>
          <LinearGradient
            colors={
              todayEffortLogged
                ? theme.colors.gradients.redButton
                : theme.colors.gradients.greenButton
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionBtn}
              onPress={handleLogEffortClick}
            >
              <View style={styles.btnIconBox}>
                <Check size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.btnText}>
                {todayEffortLogged
                  ? "Today's effort logged!"
                  : "Log today's effort"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Log Weight Button */}
        <View style={styles.actionBtnContainer}>
          <LinearGradient
            colors={
              todayWeightLogged
                ? theme.colors.gradients.redButton
                : theme.colors.gradients.greenButton
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionBtn}
              onPress={() => {
                setWeightInputValue(
                  loggedWeight ? loggedWeight.toString() : "",
                );
                setShowWeightInput(true);
              }}
            >
              <View style={styles.btnIconBox}>
                <Scale size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.btnText}>
                {todayWeightLogged
                  ? `Today's weight logged (${parseFloat(loggedWeight || 0).toFixed(2)} kg)`
                  : "Log today's weight"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* Centered Weight Logger Popup Modal Overlay */}
      <Modal
        transparent={true}
        visible={showWeightInput}
        onRequestClose={() => setShowWeightInput(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.centeredWeightCard}>
            {/* If weight is NOT logged today yet: show input form */}
            {!todayWeightLogged ? (
              <>
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setShowWeightInput(false)}
                >
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={styles.weightModalForm}>
                  <Text
                    style={[
                      styles.modalTitleText,
                      {
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#FFFFFF",
                        marginBottom: 20,
                      },
                    ]}
                  >
                    Enter today's weight to keep your log updated.
                  </Text>

                  <View style={styles.weightInputWrapper}>
                    <TextInput
                      style={styles.weightInput}
                      keyboardType="decimal-pad"
                      value={weightInputValue}
                      onChangeText={handleWeightInputChange}
                      placeholder="78.89"
                      placeholderTextColor="#7F8C8D"
                      maxLength={7}
                      autoFocus
                    />
                    <ChevronsUpDown size={18} color="#7F8C8D" />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.saveBtn}
                    onPress={handleWeightSubmit}
                  >
                    <Text style={styles.saveBtnText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              /* If weight IS logged today: show success card */
              <View style={{ alignItems: "center", width: "100%" }}>
                <View style={styles.successCheckIconContainer}>
                  <Check size={28} color="#FFFFFF" strokeWidth={3} />
                </View>

                <Text style={styles.successTitleText}>Weight Logged</Text>

                <Text style={styles.successPromptText}>
                  You've logged your weight for{"\n"}
                  <Text style={{ fontWeight: "bold", color: "#FFFFFF" }}>
                    Day {streakDays || 1}
                  </Text>
                  {"\n"}
                  <Text
                    style={{
                      fontWeight: "bold",
                      fontSize: 18,
                      color: "#FFFFFF",
                      marginTop: 4,
                    }}
                  >
                    {loggedWeight} kg
                  </Text>
                </Text>

                <Text style={styles.successSubPromptText}>
                  Come back tomorrow to log the{"\n"}next entry 💪
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.successCloseBtn}
                  onPress={() => setShowWeightInput(false)}
                >
                  <Text style={styles.successCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Centered Effort Logged Success Modal */}
      <Modal
        transparent={true}
        visible={showEffortSuccessModal}
        onRequestClose={() => setShowEffortSuccessModal(false)}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.centeredWeightCard}>
            <View style={{ alignItems: "center", width: "100%" }}>
              <View style={styles.successCheckIconContainer}>
                <Check size={28} color="#FFFFFF" strokeWidth={3} />
              </View>

              <Text style={styles.successTitleText}>Effort Logged</Text>

              <Text style={styles.successPromptText}>
                You've logged your effort for{"\n"}
                <Text style={{ fontWeight: "bold", color: "#FFFFFF" }}>
                  Day {streakDays || 1}
                </Text>
                {"\n"}
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    color: "#FFFFFF",
                    marginTop: 4,
                  }}
                >
                  {todayEffortPercent}%
                </Text>
              </Text>

              <Text style={styles.successSubPromptText}>
                Come back tomorrow to log the{"\n"}next entry 💪
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.successCloseBtn}
                onPress={() => setShowEffortSuccessModal(false)}
              >
                <Text style={styles.successCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Daily 10-Questionnaire Modal Overlay */}
      <DailyQuestionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default DailyActions;
