import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal, FlatStyle } from 'react-native';
import { Calendar, Utensils, Dumbbell, Moon, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Efforts.styles';

export const Efforts = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [activeCategory, setActiveCategory] = useState('nutrition');
  
  // Date Picker states
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { 
    todayEffortLogged,
    todayEffortScore,
    nutritionScore,
    movementScore,
    recoveryScore,
    historyLogs,
    setIsProfileOpen,
    username
  } = useUser();

  const timeframes = ['Day', 'Week', 'Month'];

  // Helper to generate recent 14 dates for picker list
  const getRecentDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Yesterday';
      else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${d.getDate()} ${months[d.getMonth()]}`;
      }
      dates.push({ iso, label });
    }
    return dates;
  };

  // Find daily log details for the selectedDate
  const selectedDayLog = (historyLogs || []).find(log => log.date === selectedDate);

  // Compute metrics dynamically based on Day, Week, Month timeframe
  let displayEffort = 0;
  let displayNutrition = 0;
  let displayMovement = 0;
  let displayRecovery = 0;

  if (activeTimeframe === 'day') {
    // Exact selected day log values
    if (selectedDayLog) {
      displayEffort = Math.round(selectedDayLog.effort);
      displayNutrition = selectedDayLog.nutrition;
      displayMovement = selectedDayLog.movement;
      displayRecovery = selectedDayLog.recovery;
    }
  } else if (activeTimeframe === 'week') {
    // 7-day average of available logs
    const logsCount = (historyLogs || []).length;
    if (logsCount > 0) {
      const sumEffort = historyLogs.reduce((acc, l) => acc + l.effort, 0);
      const sumNutrition = historyLogs.reduce((acc, l) => acc + l.nutrition, 0);
      const sumMovement = historyLogs.reduce((acc, l) => acc + l.movement, 0);
      const sumRecovery = historyLogs.reduce((acc, l) => acc + l.recovery, 0);

      displayEffort = Math.round(sumEffort / logsCount);
      displayNutrition = Math.round((sumNutrition / logsCount) * 10) / 10;
      displayMovement = Math.round((sumMovement / logsCount) * 10) / 10;
      displayRecovery = Math.round((sumRecovery / logsCount) * 10) / 10;
    }
  } else {
    // Monthly average (approximated here using all historical logs)
    const logsCount = (historyLogs || []).length;
    if (logsCount > 0) {
      const sumEffort = historyLogs.reduce((acc, l) => acc + l.effort, 0);
      const sumNutrition = historyLogs.reduce((acc, l) => acc + l.nutrition, 0);
      const sumMovement = historyLogs.reduce((acc, l) => acc + l.movement, 0);
      const sumRecovery = historyLogs.reduce((acc, l) => acc + l.recovery, 0);

      displayEffort = Math.round(sumEffort / logsCount);
      displayNutrition = Math.round((sumNutrition / logsCount) * 10) / 10;
      displayMovement = Math.round((sumMovement / logsCount) * 10) / 10;
      displayRecovery = Math.round((sumRecovery / logsCount) * 10) / 10;
    }
  }

  const overallMetrics = [
    { label: 'Effort Score', value: `${displayEffort}` },
    { label: 'Nutrition', value: `${displayNutrition}/9` },
    { label: 'Movement', value: `${displayMovement}/9` },
    { label: 'Recovery', value: `${displayRecovery}/9` }
  ];

  // Dynamic Overall Progress chart based on the last 7 daily logs from the database
  const overallChartData = [];
  const totalBarsCount = 7;
  const historyLen = historyLogs ? historyLogs.length : 0;

  for (let i = 0; i < totalBarsCount; i++) {
    if (i < totalBarsCount - historyLen) {
      // Pad empty bars at the start for new users
      overallChartData.push({
        day: `Day ${i + 1}`,
        percentage: 0,
        isToday: false
      });
    } else {
      const logIdx = i - (totalBarsCount - historyLen);
      const log = historyLogs[logIdx];
      
      // Caps raw scores to 0-100 percentage for overall chart
      const percentageVal = Math.min(100, Math.max(0, log.effort));
      overallChartData.push({
        day: `Day ${i + 1}`,
        percentage: percentageVal,
        isToday: log.date === selectedDate
      });
    }
  }

  // Calculate dynamic aspect scores as percentages for Section 2 category cards
  const nutritionPercent = Math.min(100, Math.max(0, Math.round((nutritionScore / 9) * 100)));
  const movementPercent = Math.min(100, Math.max(0, Math.round((movementScore / 9) * 100)));
  const recoveryPercent = Math.min(100, Math.max(0, Math.round((recoveryScore / 9) * 100)));

  // Define categories (only Nutrition, Movement, Recovery) with percentages
  const categories = [
    {
      id: 'nutrition',
      label: 'Nutrition',
      score: `${nutritionPercent}%`,
      icon: (color) => <Utensils size={18} color={color} />,
      iconBg: 'rgba(76, 175, 80, 0.15)',
      accentColor: '#4CAF50',
      titleFull: 'Nutrition & Meals'
    },
    {
      id: 'movement',
      label: 'Movement',
      score: `${movementPercent}%`,
      icon: (color) => <Dumbbell size={18} color={color} />,
      iconBg: 'rgba(41, 182, 246, 0.15)',
      accentColor: '#29B6F6',
      titleFull: 'Movement & Exercise'
    },
    {
      id: 'recovery',
      label: 'Recovery',
      score: `${recoveryPercent}%`,
      icon: (color) => <Moon size={18} color={color} />,
      iconBg: 'rgba(123, 31, 162, 0.15)',
      accentColor: '#B085F5',
      titleFull: 'Recovery & Sleep'
    }
  ];

  // Dynamic aspect details chart with "Day 1, Day 2..." X-axis labels
  const activeDetailData = [];
  for (let i = 0; i < totalBarsCount; i++) {
    if (i < totalBarsCount - historyLen) {
      activeDetailData.push({
        day: `Day ${i + 1}`,
        percentage: 0
      });
    } else {
      const logIdx = i - (totalBarsCount - historyLen);
      const log = historyLogs[logIdx];
      
      let aspectScore = 0;
      if (activeCategory === 'nutrition') aspectScore = log.nutrition;
      else if (activeCategory === 'movement') aspectScore = log.movement;
      else if (activeCategory === 'recovery') aspectScore = log.recovery;
      
      const percentageVal = Math.min(100, Math.max(0, Math.round((aspectScore / 9) * 100)));
      activeDetailData.push({
        day: `Day ${i + 1}`,
        percentage: percentageVal
      });
    }
  }

  const selectedCategoryObj = categories.find(cat => cat.id === activeCategory);
  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.effortsHeader}>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={() => setIsProfileOpen(true)}
            >
              <LinearGradient
                colors={theme.colors.gradients.avatar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerProfileAvatar}
              >
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Efforts</Text>
            <TouchableOpacity 
              style={styles.headerActionBtn}
              onPress={() => setIsDatePickerVisible(true)}
            >
              <Calendar size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Keep pushing your limits! 💪</Text>
        </View>

        {/* Section 1: Overall Progress */}
        <View style={styles.overallProgressCard}>
          <View style={styles.progressCardHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <View style={styles.timeframeSelector}>
              {timeframes.map(tf => {
                const isActive = activeTimeframe === tf.toLowerCase();
                return (
                  <TouchableOpacity
                    key={tf}
                    activeOpacity={0.8}
                    style={[styles.timeframeBtn, isActive && styles.activeTimeframeBtn]}
                    onPress={() => setActiveTimeframe(tf.toLowerCase())}
                  >
                    <Text style={[styles.timeframeBtnText, isActive && styles.activeTimeframeBtnText]}>
                      {tf}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {overallMetrics.map((metric, i) => (
              <View key={i} style={styles.metricBox}>
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>

          {/* Bar Chart */}
          <View style={styles.chartWrapper}>
            <View style={styles.yAxis}>
              {['100%', '80%', '60%', '40%', '20%', '0%'].map((lbl, idx) => (
                <Text key={idx} style={styles.yAxisText}>{lbl}</Text>
              ))}
            </View>
            
            <View style={styles.chartAreaContainer}>
              {/* Grid Lines */}
              <View style={styles.gridLines}>
                {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                  <View key={idx} style={styles.gridLine} />
                ))}
              </View>

              {/* Bars */}
              <View style={styles.barsContainer}>
                {overallChartData.map((data, idx) => (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View 
                        style={[
                          styles.barFill, 
                          data.isToday ? styles.highlightFill : styles.standardFill,
                          { height: `${data.percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.barLabel}>{data.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Daily Questions */}
        <View style={styles.dailyQuestionsSection}>
          <View style={styles.questionsHeader}>
            <Text style={styles.questionsTitle}>Daily Questions</Text>
          </View>

          {/* Categories Row */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              const iconColor = isSelected ? '#FFFFFF' : cat.accentColor;
              const iconBg = isSelected ? cat.accentColor : cat.iconBg;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.8}
                  style={[styles.categoryToggleCard, isSelected && styles.selectedCard]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: iconBg }]}>
                    {cat.icon(iconColor)}
                  </View>
                  <View style={styles.categoryMeta}>
                    <Text style={styles.categoryName}>{cat.label}</Text>
                    <Text style={styles.categoryScore}>{cat.score}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section 3: Dynamic Category Details */}
        {selectedCategoryObj && (
          <View style={styles.categoryDetailsCard}>
            <View style={styles.detailsHeader}>
              <View style={styles.detailsTitleWrapper}>
                <View style={[styles.detailsIconCircle, { backgroundColor: selectedCategoryObj.iconBg }]}>
                  {selectedCategoryObj.icon(selectedCategoryObj.accentColor)}
                </View>
                <Text style={styles.detailsTitle}>{selectedCategoryObj.titleFull}</Text>
              </View>
            </View>

            {/* 7-Day Chart */}
            <View style={styles.chartWrapper}>
              <View style={styles.yAxis}>
                {['100%', '75%', '50%', '25%', '0%'].map((lbl, idx) => (
                  <Text key={idx} style={styles.yAxisText}>{lbl}</Text>
                ))}
              </View>

              <View style={styles.chartAreaContainer}>
                {/* Grid Lines */}
                <View style={[styles.gridLines, { justifyContent: 'space-between' }]}>
                  {[1, 2, 3, 4, 5].map((_, idx) => (
                    <View key={idx} style={styles.gridLine} />
                  ))}
                </View>

                {/* Bars */}
                <View style={styles.barsContainer}>
                  {activeDetailData.map((data, idx) => (
                    <View key={idx} style={styles.barColumn}>
                      <View style={styles.barTrack}>
                        <View 
                          style={[
                            styles.barFill,
                            { 
                              backgroundColor: selectedCategoryObj.accentColor,
                              height: `${data.percentage}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.barLabel}>{data.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modal Backdrop Overlay */}
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDatePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Log Date</Text>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => setIsDatePickerVisible(false)}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {getRecentDates().map(item => {
                const isSelected = selectedDate === item.iso;
                return (
                  <TouchableOpacity
                    key={item.iso}
                    activeOpacity={0.8}
                    style={[styles.modalListItem, isSelected && styles.modalListItemActive]}
                    onPress={() => {
                      setSelectedDate(item.iso);
                      setIsDatePickerVisible(false);
                    }}
                  >
                    <Text style={[styles.modalListItemText, isSelected && styles.modalListItemTextActive]}>
                      {item.label}
                    </Text>
                    {isSelected && <Check size={18} color="#B085F5" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Profile navigation drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Efforts;
