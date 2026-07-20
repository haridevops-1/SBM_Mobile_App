import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Bell, ChevronDown, Scale, ArrowDownRight, ArrowUpRight, Activity, Dumbbell, ClipboardList, Utensils, Cookie, Plus } from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Results.styles';

const { width: screenWidth } = Dimensions.get('window');

export const Results = ({ navigation }) => {
  const { userId, startWeight, loggedWeight, logWeight, todayEffortLogged, username, setIsProfileOpen } = useUser();

  const [activeMetric, setActiveMetric] = useState('weight');
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState('7days');
  const [headerTimeframe, setHeaderTimeframe] = useState('week');
  const [foodTimeframe, setFoodTimeframe] = useState('week');
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);
  const [foodDropdownOpen, setFoodDropdownOpen] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chartScrollRef = useRef(null);

  // Load Inter font on component mount
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          InterRegular: require('../../assets/fonts/Inter-Regular.ttf'),
          InterBold: require('../../assets/fonts/Inter-Bold.ttf')
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Font load error', e);
        setFontsLoaded(true);
      }
    };
    loadFonts();
  }, []);

  // Fetch Live Weight Overview from Catalyst bodyweight_tracker function
  const fetchOverview = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const daysParam =
        chartTimeframe === '7days' ? 7 :
        chartTimeframe === '30days' ? 30 :
        chartTimeframe === '90days' ? 90 :
        chartTimeframe === '365days' ? 365 : 7;
      let url = `https://sbm-mobile-app-906714478.development.catalystserverless.com/api/weight/overview?user_id=${userId}&days=${daysParam}`;
      let response = await fetch(url);
      if (!response.ok) {
        url = `https://sbm-mobile-app-906714478.development.catalystserverless.com/server/bodyweight_tracker/overview?user_id=${userId}&days=${daysParam}`;
        response = await fetch(url);
      }
      const json = await response.json();
      if (response.ok && json.status === 'success' && json.data) {
        const data = json.data;
        let points = data.chartData || [];
        if (points.length > daysParam) points = points.slice(-daysParam);
        setOverviewData({
          userName: data.userName,
          startWeight: data.startWeight,
          currentWeight: data.currentWeight,
          change: data.change,
          changePercentage: data.changePercentage,
          chartData: points
        });
        setSelectedPointIndex(Math.max(0, points.length - 1));
      }
    } catch (err) {
      console.error('Error fetching weight overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [userId, chartTimeframe]);

  // Handle Log Weight Submit
  const handleLogWeightSubmit = async () => {
    const numWeight = parseFloat(weightInput);
    if (isNaN(numWeight) || numWeight <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight in kg.');
      return;
    }
    setSubmitting(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let url = 'https://sbm-mobile-app-906714478.development.catalystserverless.com/api/weight/log';
      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, weight: numWeight, log_date: todayStr })
      });
      if (!response.ok) {
        url = 'https://sbm-mobile-app-906714478.development.catalystserverless.com/server/bodyweight_tracker/log';
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, weight: numWeight, log_date: todayStr })
        });
      }
      const json = await response.json();
      if (response.ok && json.status === 'success') {
        logWeight(numWeight);
        setIsLogModalOpen(false);
        setWeightInput('');
        await fetchOverview();
      } else {
        Alert.alert('Error', json.message || 'Failed to log weight.');
      }
    } catch (err) {
      console.error('Error logging weight:', err);
      Alert.alert('Error', 'Network error while logging weight.');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics calculations & fallbacks
  const startWeightVal = overviewData ? overviewData.startWeight : (startWeight || 65);
  const currentWeightVal = overviewData ? overviewData.currentWeight : (loggedWeight || 68);
  const netWeightChange = overviewData ? overviewData.change : parseFloat((currentWeightVal - startWeightVal).toFixed(1));
  const pctWeightChange = overviewData ? overviewData.changePercentage : parseFloat(((netWeightChange / (startWeightVal || 1)) * 100).toFixed(1));

  // Dynamic chart points processing for Body Weight
  const rawWeightPoints = (overviewData && overviewData.chartData && overviewData.chartData.length > 0)
    ? overviewData.chartData
    : [
        { day: '11 Jul', val: 71.0 },
        { day: '12 Jul', val: 70.5 },
        { day: '13 Jul', val: 71.0 },
        { day: '14 Jul', val: 72.5 },
        { day: '15 Jul', val: 81.2 },
        { day: '16 Jul', val: 80.5 },
        { day: '17 Jul', val: currentWeightVal }
      ];

  const allVals = rawWeightPoints.map(p => p.val !== undefined ? p.val : (p.value !== undefined ? p.value : currentWeightVal)).concat([startWeightVal, currentWeightVal]);
  const minVal = Math.floor(Math.min(...allVals) - 2);
  const maxVal = Math.ceil(Math.max(...allVals) + 2);
  const valRange = Math.max(1, maxVal - minVal);

  const yStep = valRange / 5;
  const dynamicYLabels = [
    Math.round(maxVal),
    Math.round(maxVal - yStep * 1),
    Math.round(maxVal - yStep * 2),
    Math.round(maxVal - yStep * 3),
    Math.round(maxVal - yStep * 4),
    Math.round(minVal)
  ];

  // Dynamic spacing: minimum 50px per point, ensures readability for large datasets
  const pointSpacing = Math.max(50, rawWeightPoints.length <= 7 ? 320 / Math.max(1, rawWeightPoints.length - 1) : 50);
  const dynamicChartWidth = Math.max(360, (rawWeightPoints.length - 1) * pointSpacing + 80);

  const formattedWeightPoints = rawWeightPoints.map((p, idx) => {
    const val = p.val !== undefined ? p.val : (p.value !== undefined ? p.value : currentWeightVal);
    const x = rawWeightPoints.length > 1 ? Math.round(40 + idx * pointSpacing) : 200;
    const y = Math.round(130 - ((val - minVal) / valRange) * 105);
    return { day: p.day || p.label || 'Day', val, x, y };
  });

  const datasets = {
    weight: {
      title: 'Body Weight (kg)',
      unit: 'kg',
      color: '#B085F5',
      themeClass: 'purple-theme',
      yLabels: dynamicYLabels,
      startValue: `${startWeightVal} kg`,
      currentValue: `${currentWeightVal} kg`,
      change: `${netWeightChange > 0 ? '+' : ''}${netWeightChange} kg`,
      changePercent: `${netWeightChange > 0 ? '+' : ''}${pctWeightChange}%`,
      changeIsNegative: netWeightChange <= 0,
      points: formattedWeightPoints
    },
    fat: {
      title: 'Body Fat (%)',
      unit: '%',
      color: '#FF4081',
      themeClass: 'pink-theme',
      yLabels: [30, 28, 26, 24, 22, 20],
      startValue: '25.0 %',
      currentValue: todayEffortLogged ? '23.4 %' : '23.6 %',
      change: todayEffortLogged ? '-1.6 %' : '-1.4 %',
      changePercent: todayEffortLogged ? '-6.4%' : '-5.6%',
      changeIsNegative: true,
      points: [
        { day: '11 Jul', val: 25.0, x: 40, y: 95 },
        { day: '12 Jul', val: 24.8, x: 95, y: 98 },
        { day: '13 Jul', val: 24.2, x: 150, y: 107 },
        { day: '14 Jul', val: 24.0, x: 205, y: 110 },
        { day: '15 Jul', val: 23.8, x: 260, y: 113 },
        { day: '16 Jul', val: 23.6, x: 315, y: 116 },
        { day: '17 Jul', val: todayEffortLogged ? 23.4 : 23.6, x: 370, y: todayEffortLogged ? 119 : 116 }
      ]
    },
    muscle: {
      title: 'Muscle Mass (kg)',
      unit: 'kg',
      color: '#4CAF50',
      themeClass: 'green-theme',
      yLabels: [60, 58, 56, 54, 52, 50],
      startValue: '54.9 kg',
      currentValue: todayEffortLogged ? '56.1 kg' : '55.9 kg',
      change: todayEffortLogged ? '+1.2 kg' : '+1.0 kg',
      changePercent: todayEffortLogged ? '+2.2%' : '+1.8%',
      changeIsNegative: false,
      points: [
        { day: '11 Jul', val: 54.9, x: 40, y: 120 },
        { day: '12 Jul', val: 55.1, x: 95, y: 117 },
        { day: '13 Jul', val: 55.3, x: 150, y: 114 },
        { day: '14 Jul', val: 55.5, x: 205, y: 110 },
        { day: '15 Jul', val: 55.8, x: 260, y: 105 },
        { day: '16 Jul', val: 56.0, x: 315, y: 102 },
        { day: '17 Jul', val: todayEffortLogged ? 56.1 : 55.9, x: 370, y: todayEffortLogged ? 100 : 102 }
      ]
    }
  };

  const activeSet = datasets[activeMetric];
  const chartPoints = activeSet.points;
  const activeIndex = Math.min(selectedPointIndex, Math.max(0, chartPoints.length - 1));
  const selectedPoint = chartPoints[activeIndex] || chartPoints[0];

  // Dynamic SVG path calculations
  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = chartPoints.length > 0 ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} 140 L ${chartPoints[0].x} 140 Z` : '';

  const progressOverviewList = [
    { id: 'weight', label: 'Body Weight', unit: 'kg', value: `${currentWeightVal} kg`, change: `${netWeightChange > 0 ? '+' : ''}${netWeightChange} kg`, icon: (color) => <Scale size={16} color={color} />, colorClass: 'purple-theme', barHeights: [30, 45, 60, 45, 70, 55], accentColor: '#B085F5', iconBg: 'rgba(123, 31, 162, 0.15)' },
    { id: 'fat', label: 'Body Fat', unit: '%', value: todayEffortLogged ? '23.4 %' : '23.6 %', change: todayEffortLogged ? '-1.6 %' : '-1.4 %', icon: (color) => <Activity size={16} color={color} />, colorClass: 'pink-theme', barHeights: [40, 50, 45, 75, 50, 60], accentColor: '#FF4081', iconBg: 'rgba(255, 64, 129, 0.15)' },
    { id: 'muscle', label: 'Muscle Mass', unit: 'kg', value: todayEffortLogged ? '56.1 kg' : '55.9 kg', change: todayEffortLogged ? '+1.2 kg' : '+1.0 kg', icon: (color) => <Dumbbell size={16} color={color} />, colorClass: 'green-theme', barHeights: [25, 65, 55, 45, 50, 65], accentColor: '#4CAF50', iconBg: 'rgba(76, 175, 80, 0.15)' }
  ];

  const foodData = {
    week: [
      { label: 'Mindful Eating', sublabel: 'Rating', score: '7/10', status: 'Good', percentage: 70, icon: <ClipboardList size={16} color="#FF4081" />, colorClass: 'pinkRating', statusClass: 'statusGood' },
      { label: 'Food Choices', sublabel: 'Rating', score: '6/10', status: 'Average', percentage: 60, icon: <Utensils size={16} color="#FF9800" />, colorClass: 'orangeRating', statusClass: 'statusAverage' },
      { label: 'Cravings Control', sublabel: 'Rating', score: '6/10', status: 'Average', percentage: 60, icon: <Cookie size={16} color="#FF9800" />, colorClass: 'orangeRating', statusClass: 'statusAverage' }
    ],
    month: [
      { label: 'Mindful Eating', sublabel: 'Rating', score: '8/10', status: 'Excellent', percentage: 80, icon: <ClipboardList size={16} color="#FF4081" />, colorClass: 'pinkRating', statusClass: 'statusGood' },
      { label: 'Food Choices', sublabel: 'Rating', score: '7/10', status: 'Good', percentage: 70, icon: <Utensils size={16} color="#FF4081" />, colorClass: 'pinkRating', statusClass: 'statusGood' },
      { label: 'Cravings Control', sublabel: 'Rating', score: '5/10', status: 'Needs Work', percentage: 50, icon: <Cookie size={16} color="#FF9800" />, colorClass: 'orangeRating', statusClass: 'statusAverage' }
    ]
  };

  const activeFoodItems = foodData[foodTimeframe];
  const metricColor = activeSet.color;
  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  // Wait for fonts before rendering UI
  if (!fontsLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsProfileOpen(true)}>
              <LinearGradient colors={theme.colors.gradients.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerProfileAvatar}>
                <Text style={styles.avatarText}>{initialLetter}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notificationBtn}>
              <Bell size={20} color={theme.colors.textPrimary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.headerGreetingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingTitle}>Good Morning, {username}! 👋</Text>
              <Text style={styles.greetingSubtitle}>Let's see your progress and results.</Text>
            </View>

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity activeOpacity={0.8} style={styles.dropdownFilterBtn} onPress={() => setHeaderDropdownOpen(!headerDropdownOpen)}>
                <Text style={styles.dropdownFilterText}>{headerTimeframe === 'week' ? 'This Week' : 'This Month'}</Text>
                <ChevronDown size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              {headerDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setHeaderTimeframe('week'); setHeaderDropdownOpen(false); }}>
                    <Text style={styles.dropdownMenuItemText}>This Week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setHeaderTimeframe('month'); setHeaderDropdownOpen(false); }}>
                    <Text style={styles.dropdownMenuItemText}>This Month</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Section 1: Line Chart Card */}
        <View style={styles.weightGraphCard}>
          <View style={styles.graphCardHeader}>
            <View style={styles.graphTitleWrapper}>
              <View style={[styles.graphIconContainer, { backgroundColor: `${metricColor}1A` }]}> 
                {activeMetric === 'weight' && <Scale size={18} color={metricColor} />}
                {activeMetric === 'fat' && <Activity size={18} color={metricColor} />}
                {activeMetric === 'muscle' && <Dumbbell size={18} color={metricColor} />}
              </View>
              <Text style={styles.graphTitle}>{activeSet.title}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
              {activeMetric === 'weight' && (
                <TouchableOpacity activeOpacity={0.8} style={styles.logWeightBtn} onPress={() => setIsLogModalOpen(true)}>
                  <Plus size={12} color="#B085F5" />
                  <Text style={styles.logWeightBtnText}>Log Weight</Text>
                </TouchableOpacity>
              )}

              <View style={styles.dropdownWrapper}>
                <TouchableOpacity activeOpacity={0.8} style={styles.dropdownFilterBtn} onPress={() => setChartDropdownOpen(!chartDropdownOpen)}>
                  <Text style={styles.dropdownFilterText}>
                    {chartTimeframe === '7days' ? '7 Days' : chartTimeframe === '30days' ? '30 Days' : chartTimeframe === '90days' ? '90 Days' : '1 Year'}
                  </Text>
                  <ChevronDown size={12} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                {chartDropdownOpen && (
                  <View style={[styles.dropdownMenu, { top: 36 }]}>
                    <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setChartTimeframe('7days'); setChartDropdownOpen(false); }}>
                      <Text style={styles.dropdownMenuItemText}>7 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setChartTimeframe('30days'); setChartDropdownOpen(false); }}>
                      <Text style={styles.dropdownMenuItemText}>30 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setChartTimeframe('90days'); setChartDropdownOpen(false); }}>
                      <Text style={styles.dropdownMenuItemText}>90 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setChartTimeframe('365days'); setChartDropdownOpen(false); }}>
                      <Text style={styles.dropdownMenuItemText}>1 Year</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* SVG Graph Drawing Area */}
          <View style={styles.lineChartWrapper}>
            <View style={styles.yAxisLabels}>
              {activeSet.yLabels.map((lbl, idx) => (
                <Text key={idx} style={styles.yAxisLabelText}>{lbl}</Text>
              ))}
            </View>

            <View style={styles.chartDrawingArea}>
              <View style={styles.gridDashedLines}>
                {activeSet.yLabels.map((_, idx) => (
                  <View key={idx} style={styles.chartGridLine} />
                ))}
              </View>

              {loading ? (
                <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color={metricColor} />
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ref={chartScrollRef}
                  onContentSizeChange={() => chartScrollRef.current?.scrollToEnd({ animated: false })}
                  style={{ height: 170 }}
                  contentContainerStyle={{ paddingRight: 10 }}
                >
                  <View style={{ width: dynamicChartWidth, height: 170 }}>
                    <Svg width={dynamicChartWidth} height={150} viewBox={`0 0 ${dynamicChartWidth} 150`}>
                      <Defs>
                        <SvgLinearGradient id={`grad-${activeMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={metricColor} stopOpacity="0.4" />
                          <Stop offset="100%" stopColor={metricColor} stopOpacity="0.0" />
                        </SvgLinearGradient>
                      </Defs>
                      {areaPath ? <Path d={areaPath} fill={`url(#grad-${activeMetric})`} /> : null}
                      {linePath ? <Path d={linePath} fill="none" stroke={metricColor} strokeWidth="3" strokeLinecap="round" /> : null}
                      {chartPoints.map((p, idx) => {
                        const isActive = idx === activeIndex;
                        return (
                          <Circle key={idx} cx={p.x} cy={p.y} r={isActive ? 6 : 4} fill={isActive ? '#FFFFFF' : metricColor} stroke={isActive ? metricColor : 'none'} strokeWidth={isActive ? 2 : 0} onPress={() => setSelectedPointIndex(idx)} />
                        );
                      })}
                    </Svg>

                    {/* X Axis Labels inside scroll */}
                    <View style={{ flexDirection: 'row', height: 20, position: 'relative', width: dynamicChartWidth }}>
                      {chartPoints.map((p, idx) => (
                        <Text key={idx} onPress={() => setSelectedPointIndex(idx)} style={[styles.xAxisLabelText, { left: p.x - 14, color: idx === activeIndex ? '#FFFFFF' : '#666', fontWeight: idx === activeIndex ? '700' : '600' }]}>{p.day}</Text>
                      ))}
                    </View>
                  </View>

                  {/* Tooltip Overlay inside scroll */}
                  {selectedPoint && (
                    <View style={[styles.chartTooltipBox, { position: 'absolute', left: Math.max(10, selectedPoint.x - 45), top: Math.max(0, selectedPoint.y - 48), borderColor: metricColor }]}>
                      <Text style={styles.tooltipDate}>{selectedPoint.day}</Text>
                      <View style={styles.tooltipValueRow}>
                        <View style={[styles.tooltipColorIndicator, { backgroundColor: metricColor }]} />
                        <Text style={styles.tooltipValueText}>{selectedPoint.val} {activeSet.unit}</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.summaryStatsGrid}>
            <View style={styles.summaryStatBox}>
              <View style={[styles.summaryIconCircle, { backgroundColor: `${metricColor}26` }]}>
                {activeMetric === 'weight' && <Scale size={12} color={metricColor} />}
                {activeMetric === 'fat' && <Activity size={12} color={metricColor} />}
                {activeMetric === 'muscle' && <Dumbbell size={12} color={metricColor} />}
              </View>
              <Text style={styles.summaryValue}>{activeSet.startValue}</Text>
              <Text style={styles.summaryLabel}>Start</Text>
            </View>
            <View style={styles.summaryStatBox}>
              <View style={[styles.summaryIconCircle, { backgroundColor: `${metricColor}26` }]}>
                {activeMetric === 'weight' && <Scale size={12} color={metricColor} />}
                {activeMetric === 'fat' && <Activity size={12} color={metricColor} />}
                {activeMetric === 'muscle' && <Dumbbell size={12} color={metricColor} />}
              </View>
              <Text style={styles.summaryValue}>{activeSet.currentValue}</Text>
              <Text style={styles.summaryLabel}>Current</Text>
            </View>
            <View style={styles.summaryStatBox}>
              <View style={[styles.summaryIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                {activeSet.changeIsNegative ? <ArrowDownRight size={12} color="#4CAF50" /> : <ArrowUpRight size={12} color="#4CAF50" />}
              </View>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{activeSet.change}</Text>
              <Text style={styles.summaryLabel}>Change</Text>
            </View>
            <View style={styles.summaryStatBox}>
              <View style={[styles.summaryIconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
                {activeSet.changeIsNegative ? <ArrowDownRight size={12} color="#4CAF50" /> : <ArrowUpRight size={12} color="#4CAF50" />}
              </View>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{activeSet.changePercent}</Text>
              <Text style={styles.summaryLabel}>Change %</Text>
            </View>
          </View>
        </View>

        {/* Section 2: Progress Overview List */}
        <View style={styles.progressOverviewCard}>
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIconContainer}>
              <Activity size={18} color="#B085F5" />
            </View>
            <Text style={styles.overviewTitle}>Your Progress Overview</Text>
          </View>
          <View style={styles.progressRowsList}>
            {progressOverviewList.map((row) => {
              const isSelected = activeMetric === row.id;
              const iconColor = isSelected ? '#FFFFFF' : row.accentColor;
              const iconBg = isSelected ? row.accentColor : row.iconBg;
              return (
                <TouchableOpacity key={row.id} activeOpacity={0.8} style={[styles.progressRowItem, isSelected && styles.selectedRowItem]} onPress={() => { setActiveMetric(row.id); setSelectedPointIndex(Math.max(0, datasets[row.id].points.length - 1)); }}>
                  <View style={styles.rowInfo}>
                    <View style={[styles.rowIconWrapper, { backgroundColor: iconBg }]}>{row.icon(iconColor)}</View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{row.label}</Text>
                      <Text style={styles.rowUnit}>{row.unit}</Text>
                    </View>
                  </View>
                  <View style={styles.miniBarsGraph}>
                    {row.barHeights.map((h, i) => (
                      <View key={i} style={[styles.miniBarFill, { backgroundColor: isSelected ? '#FFFFFF' : row.accentColor, height: `${h}%` }]} />
                    ))}
                  </View>
                  <View style={styles.rowValues}>
                    <Text style={styles.rowCurrentVal}>{row.value}</Text>
                    <Text style={styles.rowChangeVal}>{row.change}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section 3: Food Relationship */}
        <View style={styles.foodRelationshipCard}>
          <View style={styles.foodHeader}>
            <View style={styles.foodTitleWrapper}>
              <View style={styles.foodIconContainer}>
                <Utensils size={18} color="#FF4081" />
              </View>
              <Text style={styles.foodTitle}>Relationship with Food</Text>
            </View>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity activeOpacity={0.8} style={styles.dropdownFilterBtn} onPress={() => setFoodDropdownOpen(!foodDropdownOpen)}>
                <Text style={styles.dropdownFilterText}>{foodTimeframe === 'week' ? 'This Week' : 'This Month'}</Text>
                <ChevronDown size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              {foodDropdownOpen && (
                <View style={[styles.dropdownMenu, { top: 36 }]}>
                  <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setFoodTimeframe('week'); setFoodDropdownOpen(false); }}>
                    <Text style={styles.dropdownMenuItemText}>This Week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setFoodTimeframe('month'); setFoodDropdownOpen(false); }}>
                    <Text style={styles.dropdownMenuItemText}>This Month</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          <View style={styles.foodSlidersList}>
            {activeFoodItems.map((item, idx) => {
              const sliderTrackFillColor = item.colorClass === 'pinkRating' ? '#FF4081' : '#FF9800';
              const statusStyle = item.statusClass === 'statusGood' ? styles.statusGood : styles.statusAverage;
              return (
                <View key={idx} style={styles.foodSliderItem}>
                  <View style={styles.sliderInfo}>
                    <View style={styles.sliderLeft}>
                      <View style={styles.sliderIconBox}>{item.icon}</View>
                      <View style={styles.sliderText}>
                        <Text style={styles.sliderTitle}>{item.label}</Text>
                        <Text style={styles.sliderSublabel}>{item.sublabel}</Text>
                      </View>
                    </View>
                    <View style={styles.sliderRight}>
                      <Text style={styles.sliderScore}>{item.score}</Text>
                      <Text style={[styles.sliderStatus, statusStyle]}>{item.status}</Text>
                    </View>
                  </View>
                  <View style={styles.sliderTrackContainer}>
                    <View style={styles.sliderTrackBg}>
                      <View style={[styles.sliderTrackFill, { backgroundColor: sliderTrackFillColor, width: `${item.percentage}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Log Weight Modal */}
      <Modal visible={isLogModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsLogModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Body Weight</Text>
            <Text style={styles.modalSubtitle}>Enter today's weight to update your progress chart.</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput style={styles.modalInput} placeholder="e.g. 68.5" placeholderTextColor={theme.colors.textMuted} keyboardType="numeric" value={weightInput} onChangeText={setWeightInput} />
              <Text style={styles.modalUnit}>kg</Text>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setIsLogModalOpen(false); setWeightInput(''); }} disabled={submitting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleLogWeightSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalSubmitText}>Submit Log</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile menu drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Results;
