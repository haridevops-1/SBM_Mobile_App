import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Calendar, Utensils, Dumbbell, Moon, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Efforts.styles';

export const Efforts = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [activeCategory, setActiveCategory] = useState('nutrition');
  
  const overallScrollRef = useRef(null);
  const detailScrollRef = useRef(null);

  // Date Picker states
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Overall progress fetched state
  const [effortData, setEffortData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Aspect breakdown fetched state
  const [aspectData, setAspectData] = useState([]);
  const [aspectLoading, setAspectLoading] = useState(false);

  const { 
    todayEffortLogged,
    todayEffortScore,
    nutritionScore,
    movementScore,
    recoveryScore,
    historyLogs,
    setIsProfileOpen,
    username,
    userId
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

  // Fetch overall progress details dynamically from the Catalyst API Gateway route
  useEffect(() => {
    const fetchEffortsProgress = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const url = `https://sbm-mobile-app-906714478.development.catalystserverless.com/api/efforts/overall-progress?user_id=${userId}&date=${selectedDate}&view_type=${activeTimeframe.toLowerCase()}`;
        const response = await fetch(url);
        const rawResult = await response.json();
        
        // Handle Basic I/O wrapping
        const result = rawResult.output ? JSON.parse(rawResult.output) : rawResult;
        
        if (result && result.status === 'success') {
          setEffortData(result.data);
        } else {
          console.warn("Failed to fetch efforts progress:", result);
        }
      } catch (err) {
        console.error("Error fetching efforts progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEffortsProgress();
  }, [userId, selectedDate, activeTimeframe]);

  // Compute metrics dynamically based on Day, Week, Month timeframe
  const displayEffort = effortData ? effortData.summary.effort_percentage : 0;
  const displayNutrition = effortData ? effortData.summary.nutrition_display : '0/9';
  const displayMovement = effortData ? effortData.summary.movement_display : '0/9';
  const displayRecovery = effortData ? effortData.summary.recovery_display : '0/9';

  const overallMetrics = [
    { label: 'Effort Score', value: `${displayEffort}%` },
    { label: 'Nutrition', value: displayNutrition },
    { label: 'Movement', value: displayMovement },
    { label: 'Recovery', value: displayRecovery }
  ];

  // Dynamic Overall Progress chart based on the fetched chart_data from API
  const overallChartData = [];
  if (effortData && effortData.chart_data && effortData.chart_data.length > 0) {
    effortData.chart_data.forEach((item, idx) => {
      overallChartData.push({
        day: item.label,
        percentage: item.effort_score,
        isToday: item.date === selectedDate
      });
    });
  } else {
    for (let i = 0; i < 7; i++) {
      overallChartData.push({
        day: `Day ${i + 1}`,
        percentage: 0,
        isToday: false
      });
    }
  }

  // Helper to parse percentages from fraction displays like '4.5/9'
  const parsePercentFromDisplay = (displayStr) => {
    if (!displayStr) return 0;
    const parts = displayStr.split('/');
    if (parts.length === 2) {
      const num = parseFloat(parts[0]) || 0;
      const den = parseFloat(parts[1]) || 9;
      return Math.min(100, Math.max(0, Math.round((num / den) * 100)));
    }
    return 0;
  };

  const nutritionPercent = effortData ? parsePercentFromDisplay(effortData.summary.nutrition_display) : 0;
  const movementPercent = effortData ? parsePercentFromDisplay(effortData.summary.movement_display) : 0;
  const recoveryPercent = effortData ? parsePercentFromDisplay(effortData.summary.recovery_display) : 0;

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

  // Fetch aspect breakdown details dynamically from the Catalyst API Gateway route
  useEffect(() => {
    const fetchAspectBreakdown = async () => {
      if (!userId) return;
      setAspectLoading(true);
      try {
        const url = `https://sbm-mobile-app-906714478.development.catalystserverless.com/api/efforts/aspect-breakdown?user_id=${userId}&date=${selectedDate}&aspect=${activeCategory}&view_type=${activeTimeframe.toLowerCase()}`;
        const response = await fetch(url);
        const rawResult = await response.json();
        
        // Handle Basic I/O wrapping
        const result = rawResult.output ? JSON.parse(rawResult.output) : rawResult;
        
        if (result && result.status === 'success') {
          setAspectData(result.data || []);
        } else {
          console.warn("Failed to fetch aspect breakdown:", result);
        }
      } catch (err) {
        console.error("Error fetching aspect breakdown:", err);
      } finally {
        setAspectLoading(false);
      }
    };

    fetchAspectBreakdown();
  }, [userId, selectedDate, activeCategory, activeTimeframe]);

  // Dynamic aspect details chart based on fetched aspectData
  const activeDetailData = aspectData && aspectData.length > 0
    ? aspectData.map((item) => ({
        day: item.label,
        percentage: item.percentage
      }))
    : Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        percentage: 0
      }));

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

              {/* Horizontally Scrollable Bars */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={overallScrollRef}
                onContentSizeChange={() => overallScrollRef.current?.scrollToEnd({ animated: true })}
                contentContainerStyle={styles.scrollableBarsContent}
              >
                {overallChartData.map((data, idx) => (
                  <View key={idx} style={styles.scrollBarColumn}>
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
              </ScrollView>
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

                {/* Horizontally Scrollable Bars */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ref={detailScrollRef}
                  onContentSizeChange={() => detailScrollRef.current?.scrollToEnd({ animated: true })}
                  contentContainerStyle={styles.scrollableBarsContent}
                >
                  {activeDetailData.map((data, idx) => (
                    <View key={idx} style={styles.scrollBarColumn}>
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
                </ScrollView>
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
