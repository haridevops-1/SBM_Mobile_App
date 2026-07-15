import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check, Scale, X } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/DailyActions.styles';

export const DailyActions = () => {
  const { 
    todayEffortLogged, 
    todayWeightLogged, 
    loggedWeight, 
    toggleTodayEffort, 
    logWeight 
  } = useUser();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(loggedWeight.toString());

  // SVG parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const todayEffortPercent = todayEffortLogged ? 100 : 0;
  const last7DaysEffortPercent = todayEffortLogged ? 14 : 0;
  const strokeDashoffset = circumference - (todayEffortPercent / 100) * circumference;

  const handleLogEffortClick = () => {
    if (!todayEffortLogged) {
      toggleTodayEffort();
    }
  };

  const handleWeightSubmit = () => {
    if (weightInputValue.trim() !== '') {
      logWeight(weightInputValue);
      setShowWeightInput(false);
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
                  setWeightInputValue(loggedWeight.toString());
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

      {/* Inline Weight Logger Card */}
      {showWeightInput && !todayWeightLogged && (
        <View style={styles.inlineWeightCard}>
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
    </View>
  );
};

export default DailyActions;
