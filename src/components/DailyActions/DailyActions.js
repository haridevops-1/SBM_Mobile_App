import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, Scale, X } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/DailyActions.styles';
import DailyQuestionsModal from './DailyQuestionsModal';

export const DailyActions = () => {
  const { 
    todayEffortLogged, 
    todayWeightLogged, 
    loggedWeight, 
    todayEffortScore,
    userId,
    fetchDashboardData,
    logWeight 
  } = useUser();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(loggedWeight.toString());
  const [modalVisible, setModalVisible] = useState(false);

  // SVG parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  // Dynamically calculate gauges from user scores
  const todayEffortPercent = todayEffortScore;
  const last7DaysEffortPercent = todayEffortLogged ? Math.min(100, Math.round(todayEffortScore * 0.15)) : 0;
  const strokeDashoffset = circumference - (todayEffortPercent / 100) * circumference;

  const handleLogEffortClick = () => {
    if (!todayEffortLogged) {
      setModalVisible(true);
    }
  };

  const handleWeightSubmit = async () => {
    if (weightInputValue.trim() !== '') {
      try {
        const response = await fetch('https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/log-weight', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain', // Bypass preflight CORS checks
          },
          body: JSON.stringify({
            userId: userId,
            weight: Number(weightInputValue)
          })
        });

        const data = await response.json();
        if (response.ok && data.status === 'success') {
          // Weight saved inside cloud weight_history. Sync locally
          logWeight(weightInputValue);
          setShowWeightInput(false);
          fetchDashboardData();
        } else {
          alert("Error logging weight: " + (data.message || "Catalyst database rejected the transaction."));
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
            <Text style={styles.splitValue}>69%</Text>
            <Text style={styles.splitLabel}>Pre-SBM effort</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.splitStatBox}>
            <Text style={styles.splitValue}>{last7DaysEffortPercent}%</Text>
            <Text style={styles.splitLabel}>Last 7 days effort</Text>
          </View>
        </View>
      </View>

      {/* Inline Weight Logger Card (Rendered ABOVE the actions log buttons) */}
      {showWeightInput && !todayWeightLogged && (
        <View style={[styles.inlineWeightCard, { marginBottom: 16 }]}>
          <TouchableOpacity 
            style={styles.closeInlineBtn} 
            onPress={() => setShowWeightInput(false)}
          >
            <X size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.weightModalForm}>
            <Text style={styles.modalPromptText}>
              Enter today's weight to keep your log updated.
            </Text>

            <View style={styles.weightInputWrapper}>
              <TextInput 
                style={styles.weightInput}
                keyboardType="numeric"
                value={weightInputValue}
                onChangeText={setWeightInputValue}
                placeholder="Enter your weight (kg)"
                placeholderTextColor="#999999"
                autoFocus
              />
            </View>

            <View style={styles.saveBtnContainer}>
              <LinearGradient
                colors={theme.colors.gradients.purpleButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={styles.saveBtn} 
                  onPress={handleWeightSubmit}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      )}

      <Text style={styles.trackerSubheading}>Daily Actions</Text>

      <View style={styles.actionButtonsStack}>
        {/* Log Effort Button */}
        <View style={styles.actionBtnContainer}>
          <LinearGradient
            colors={todayEffortLogged ? theme.colors.gradients.redButton : theme.colors.gradients.greenButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.actionBtn} 
              onPress={handleLogEffortClick}
              disabled={todayEffortLogged}
            >
              <View style={styles.btnIconBox}>
                <Check size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.btnText}>
                {todayEffortLogged ? "Today's effort logged!" : "Log today's effort"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Log Weight Button */}
        <View style={styles.actionBtnContainer}>
          <LinearGradient
            colors={todayWeightLogged ? theme.colors.gradients.redButton : theme.colors.gradients.greenButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.actionBtn} 
              onPress={() => {
                if (!todayWeightLogged) {
                  setWeightInputValue(loggedWeight ? loggedWeight.toString() : '');
                  setShowWeightInput(!showWeightInput);
                }
              }}
              disabled={todayWeightLogged}
            >
              <View style={styles.btnIconBox}>
                <Scale size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.btnText}>
                {todayWeightLogged ? `Today's weight logged (${loggedWeight} kg)` : "Log today's weight"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* Daily 10-Questionnaire Modal Overlay */}
      <DailyQuestionsModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default DailyActions;
