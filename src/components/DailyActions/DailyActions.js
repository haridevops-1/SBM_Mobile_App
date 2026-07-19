import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Check, Scale, X, ChevronsUpDown } from 'lucide-react-native';
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
    streakDays,
    fetchDashboardData,
    logWeight,
    historyLogs
  } = useUser();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInputValue, setWeightInputValue] = useState(loggedWeight ? loggedWeight.toString() : '');
  const [modalVisible, setModalVisible] = useState(false);

  // SVG parameters
  const radius = 45;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  // Dynamically calculate gauges from user scores
  const todayEffortPercent = Math.min(100, Math.max(0, Math.round((todayEffortScore / 9) * 100)));
  
  let last7DaysEffortPercent = 0;
  if (historyLogs && historyLogs.length > 0) {
    const sumEffort = historyLogs.reduce((acc, l) => acc + l.effort, 0);
    last7DaysEffortPercent = Math.min(100, Math.max(0, Math.round((sumEffort / historyLogs.length / 9) * 100)));
  }

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
            'Content-Type': 'text/plain',
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
                setWeightInputValue(loggedWeight ? loggedWeight.toString() : '');
                setShowWeightInput(true);
              }}
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
                  <Text style={[styles.modalTitleText, { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 }]}>
                    Enter today's weight to keep your log updated.
                  </Text>
                  
                  <View style={styles.weightInputWrapper}>
                    <TextInput 
                      style={styles.weightInput}
                      keyboardType="decimal-pad"
                      value={weightInputValue}
                      onChangeText={setWeightInputValue}
                      placeholder="77.78"
                      placeholderTextColor="#7F8C8D"
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
              <View style={{ alignItems: 'center', width: '100%' }}>
                <View style={styles.successCheckIconContainer}>
                  <Check size={28} color="#FFFFFF" strokeWidth={3} />
                </View>
                
                <Text style={styles.successTitleText}>Weight Logged</Text>
                
                <Text style={styles.successPromptText}>
                  You've logged your weight for{"\n"}
                  <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Day {streakDays || 1}</Text>{"\n"}
                  <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#FFFFFF', marginTop: 4, display: 'inline-block' }}>
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

      {/* Daily 10-Questionnaire Modal Overlay */}
      <DailyQuestionsModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default DailyActions;
