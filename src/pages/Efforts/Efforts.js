/**
 * ============================================================================
 * FILE: Efforts.js
 * PATH: C:\SBM_Mobile_App\src\pages\Efforts\Efforts.js
 * 
 * PURPOSE:
 * Renders the Efforts screen. Displays:
 * 1. Overall Progress bar chart across Day / Week / Phase timeframes.
 * 2. Aspect cards (Nutrition, Movement, Recovery) evaluated on an independent 100% scale.
 * 3. Detailed aspect breakdown bar charts connecting to Catalyst backend (/api/efforts/overall-progress 
 *    and /api/efforts/aspect-breakdown).
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Utensils, Dumbbell, Moon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Efforts.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_VIEWPORT_WIDTH = Math.max(220, SCREEN_WIDTH - 100);

export const Efforts = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('day');
  const [activeCategory, setActiveCategory] = useState('nutrition');
  
  const overallScrollRef = useRef(null);
  const detailScrollRef = useRef(null);

  // Always anchored dynamically to Today's ISO date
  const selectedDate = new Date().toISOString().split('T')[0];

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

  const timeframes = ['Day', 'Week', 'Phase'];

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

  // Auto-scroll charts to Today (the rightmost day) on data load
  useEffect(() => {
    if (effortData) {
      setTimeout(() => {
        overallScrollRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [effortData]);

  useEffect(() => {
    if (aspectData) {
      setTimeout(() => {
        detailScrollRef.current?.scrollToEnd({ animated: false });
      }, 50);
    }
  }, [aspectData]);

  // Compute metrics dynamically based on Day, Week, Month timeframe
  const displayEffort = effortData ? effortData.summary.effort_percentage : 0;
  const displayNutrition = effortData ? effortData.summary.nutrition_display : '0/9';
  const displayMovement = effortData ? effortData.summary.movement_display : '0/9';
  const displayRecovery = effortData ? effortData.summary.recovery_display : '0/9';

  // Dynamic Overall Progress chart (Sequential Day 1 to Day N order)
  const rawChartData = (effortData && effortData.chart_data && effortData.chart_data.length > 0)
    ? effortData.chart_data
    : (todayEffortLogged
        ? [{ label: 'Day 1', effort_score: todayEffortScore, date: selectedDate }]
        : [{ label: 'Day 1', effort_score: 0, date: selectedDate }]
      );

  const overallChartData = rawChartData.map((item, idx) => ({
    day: `Day ${idx + 1}`,
    percentage: Math.min(100, Math.max(0, Math.round(item.effort_score !== undefined ? item.effort_score : (item.percentage !== undefined ? item.percentage : 0)))),
    isToday: item.date === selectedDate || idx === rawChartData.length - 1
  }));

  // Calculate width for 5-bar viewport (max 5 days visible on screen at a time, scrollable for 5+ days)
  const chartAreaWidth = Math.max(220, SCREEN_WIDTH - 90);
  const barColumnWidth = Math.floor(chartAreaWidth / 5);


  // Helper to parse percentages from aspect displays like '5/5', '3/3', '4/5', '2.34/3'
  // Evaluates each aspect independently on its own 100% scale (e.g. 5/5 = 100%, 3/3 = 100%, 4/5 = 80%)
  const parsePercentFromDisplay = (displayVal, defaultMax = 3) => {
    if (displayVal === undefined || displayVal === null) return 0;
    
    // If string fraction like '5/5', '3/3', '4/5', or '2.34/3'
    if (typeof displayVal === 'string' && displayVal.includes('/')) {
      const parts = displayVal.split('/');
      const num = parseFloat(parts[0]) || 0;
      const den = parseFloat(parts[1]) || defaultMax;
      if (den <= 0) return 0;
      return Math.min(100, Math.max(0, Math.round((num / den) * 100)));
    }

    const num = parseFloat(displayVal);
    if (isNaN(num)) return 0;

    // If raw score <= 10 (e.g. 3 out of 3, 5 out of 5), convert to percentage based on defaultMax
    if (num <= 10) {
      const maxScore = defaultMax > 0 ? defaultMax : 3;
      return Math.min(100, Math.max(0, Math.round((num / maxScore) * 100)));
    }

    // Already a percentage 0-100
    return Math.min(100, Math.max(0, Math.round(num)));
  };

  const nutritionPercent = effortData && effortData.summary && effortData.summary.nutrition_display
    ? parsePercentFromDisplay(effortData.summary.nutrition_display, 3)
    : parsePercentFromDisplay(nutritionScore, 3);

  const movementPercent = effortData && effortData.summary && effortData.summary.movement_display
    ? parsePercentFromDisplay(effortData.summary.movement_display, 3)
    : parsePercentFromDisplay(movementScore, 3);

  const recoveryPercent = effortData && effortData.summary && effortData.summary.recovery_display
    ? parsePercentFromDisplay(effortData.summary.recovery_display, 3)
    : parsePercentFromDisplay(recoveryScore, 3);

  // Define categories (only Nutrition, Movement, Recovery) with percentages evaluated to 100%
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

  // Dynamic aspect details chart (Standard Chronological Order: Day 1 to Day N)
  const activeDetailData = (aspectData || []).map((item) => {
    let pct = 0;
    if (item.percentage !== undefined && item.percentage > 10) {
      pct = Math.min(100, Math.max(0, Math.round(item.percentage)));
    } else if (item.display !== undefined) {
      pct = parsePercentFromDisplay(item.display, 3);
    } else if (item.percentage !== undefined) {
      pct = parsePercentFromDisplay(item.percentage, 3);
    } else if (item.score !== undefined) {
      const maxScore = item.max_score || 3;
      pct = parsePercentFromDisplay(`${item.score}/${maxScore}`, maxScore);
    }
    return {
      day: item.label || item.day || 'Day',
      percentage: pct
    };
  });


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
            <View style={{ width: 32 }} />
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

              {/* Horizontally Scrollable Bars (Max 5 days visible, drag left/right for 5+ days) */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                ref={overallScrollRef}
                onContentSizeChange={() => overallScrollRef.current?.scrollToEnd({ animated: false })}
                onLayout={() => overallScrollRef.current?.scrollToEnd({ animated: false })}
                contentContainerStyle={styles.scrollableBarsContent}
              >
                {overallChartData.map((data, idx) => (
                  <View key={idx} style={[styles.scrollBarColumn, { width: barColumnWidth }]}>
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
                  onContentSizeChange={() => detailScrollRef.current?.scrollToEnd({ animated: false })}
                  onLayout={() => detailScrollRef.current?.scrollToEnd({ animated: false })}
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

      {/* Profile navigation drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Efforts;
