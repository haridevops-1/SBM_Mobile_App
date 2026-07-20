import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Bell, ChevronDown, Scale, ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path, Circle, Line, Text as SvgText, Polygon as SvgPolygon } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);
  // Spider chart week selectors
  const [spider1DropOpen, setSpider1DropOpen] = useState(false);
  const [spider2DropOpen, setSpider2DropOpen] = useState(false);
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
  // Real weight points starting strictly from user's first logged weight date
  let rawWeightPoints = [];
  if (overviewData && overviewData.chartData && overviewData.chartData.length > 0) {
    rawWeightPoints = overviewData.chartData;
  } else if (loggedWeight && loggedWeight > 0) {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    if (startWeight && startWeight > 0 && startWeight !== loggedWeight) {
      rawWeightPoints = [
        { day: 'Start', val: startWeight },
        { day: todayStr, val: loggedWeight }
      ];
    } else {
      rawWeightPoints = [
        { day: todayStr, val: loggedWeight }
      ];
    }
  } else {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    rawWeightPoints = [
      { day: todayStr, val: startWeightVal }
    ];
  }

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

  // All 20 weeks available for selection (W0 to W19)
  const allWeeks = Array.from({ length: 20 }, (_, i) => `W${i}`);

  // Create empty mindset data initialized to 0 for all weeks
  const createEmptyMindset = () => {
    const initial = {};
    for (let i = 0; i <= 19; i++) {
      initial[`W${i}`] = { learning: 0, food: 0, selfKindness: 0, control: 0, confidence: 0 };
    }
    return initial;
  };

  const [mindsetWeeklyData, setMindsetWeeklyData] = useState(createEmptyMindset);
  const [loggedWeeksSet, setLoggedWeeksSet] = useState(new Set());

  // Default spider chart week selectors: W0 vs W1
  const [spiderWeek1, setSpiderWeek1] = useState('W0');
  const [spiderWeek2, setSpiderWeek2] = useState('W1');

  // Fetch real Sunday tracker mindset scores from Catalyst backend & local storage
  useEffect(() => {
    const fetchSundayData = async () => {
      try {
        const stored = await AsyncStorage.getItem('sbm_sunday_scores');
        let localScores = stored ? JSON.parse(stored) : {};

        if (userId) {
          try {
            const res = await fetch(`https://sbm-mobile-app-906714478.development.catalystserverless.com/api/sunday_tracker?userId=${userId}`);
            const data = await res.json();
            if (res.ok && data.status === 'success' && data.data) {
              localScores = { ...localScores, ...data.data };
            }
          } catch (e) {
            console.warn('Sunday tracker API fetch notice:', e);
          }
        }

        const newLoggedSet = new Set();
        setMindsetWeeklyData(prev => {
          const updated = { ...prev };
          Object.keys(localScores).forEach(wKey => {
            if (updated[wKey]) {
              const entry = localScores[wKey];
              const hasVal = entry && (entry.learning > 0 || entry.food > 0 || entry.selfKindness > 0 || entry.self_kindness > 0 || entry.control > 0 || entry.confidence > 0 || entry.enjoying > 0);
              if (hasVal) {
                newLoggedSet.add(wKey);
              }
              updated[wKey] = {
                learning: entry.learning ?? 0,
                food: entry.food ?? 0,
                selfKindness: entry.selfKindness ?? entry.self_kindness ?? 0,
                control: entry.control ?? 0,
                confidence: entry.confidence ?? entry.enjoying ?? 0,
              };
            }
          });
          return updated;
        });
        setLoggedWeeksSet(newLoggedSet);
      } catch (err) {
        console.error('Error loading Sunday mindset data:', err);
      }
    };

    fetchSundayData();
  }, [userId]);

  // The 5 mindset dimensions
  const mindsetDimensions = [
    { key: 'learning',     label: 'Learning',               color: '#29B6F6' },
    { key: 'food',         label: 'Relationship with food',  color: '#FF4081' },
    { key: 'selfKindness', label: 'Self-kindness',           color: '#FFD600' },
    { key: 'control',      label: 'Feeling in control',      color: '#00E676' },
    { key: 'confidence',   label: 'Confidence',              color: '#B085F5' },
  ];

  // Build array of {week, value, isLogged} for each dimension across W0-W19
  const buildDimData = (key) =>
    allWeeks.map(w => ({
      week: w,
      value: mindsetWeeklyData[w]?.[key] ?? 0,
      isLogged: loggedWeeksSet.has(w)
    }));

  // Spider chart helper — convert radar data to SVG polygon points
  const buildSpiderPoints = (weekKey, cx, cy, radius) => {
    const data = mindsetWeeklyData[weekKey];
    if (!data) return null;
    const keys = ['learning', 'food', 'selfKindness', 'control', 'confidence'];
    const n = keys.length;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;
    return keys.map((k, i) => {
      const ratio = (data[k] || 0) / 3;
      const angle = startAngle + i * angleStep;
      const x = cx + radius * ratio * Math.cos(angle);
      const y = cy + radius * ratio * Math.sin(angle);
      return { x, y };
    });
  };

  const metricColor = activeSet.color;
  const initialLetter = username ? username.charAt(0).toUpperCase() : 'H';

  // Inline MiniLineChart with Vertical Line View (Blank at first, shows line only for logged weeks)
  const MiniLineChart = ({ data, color, chartW }) => {
    const chartH = 75;
    const padX = 14;
    const padY = 10;
    const n = data.length;
    if (n < 2) return null;

    const pts = data.map((d, i) => {
      const x = padX + (i / (n - 1)) * (chartW - 2 * padX);
      const y = padY + (chartH - 2 * padY) - (d.value / 3) * (chartH - 2 * padY);
      return { x, y, value: d.value, week: d.week, isLogged: d.isLogged };
    });

    const activePts = pts.filter(p => p.isLogged);

    const linePth = activePts.length >= 2
      ? activePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      : '';
    const areaPth = activePts.length >= 2
      ? `${linePth} L ${activePts[activePts.length - 1].x.toFixed(1)} ${chartH - padY} L ${activePts[0].x.toFixed(1)} ${chartH - padY} Z`
      : '';
    const gradId = `mg-${color.replace('#', '')}`;

    return (
      <Svg width={chartW} height={chartH}>
        <Defs>
          <SvgLinearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </SvgLinearGradient>
        </Defs>

        {/* Vertical Grid Lines View across all week columns */}
        {pts.map((p, i) => (
          <Line
            key={`vgrid-${i}`}
            x1={p.x}
            y1={padY}
            x2={p.x}
            y2={chartH - padY}
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        ))}

        {/* Only render line path and gradient area if 2+ logged weeks exist */}
        {activePts.length >= 2 && (
          <>
            <Path d={areaPth} fill={`url(#${gradId})`} />
            <Path d={linePth} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {/* Only render circle node dots for logged weeks */}
        {activePts.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
        ))}
      </Svg>
    );
  };


  // Spider/Radar chart SVG renderer
  const SpiderChart = ({ weekKey1, weekKey2 }) => {
    const size = 220;
    const cx = size / 2;
    const cy = size / 2;
    const radius = 76;
    const n = 5;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;
    const labels = ['Learning', 'Relationship\nwith food', 'Self-kindness', 'Feeling in\ncontrol', 'Confidence'];
    const labelDist = radius + 22;
    const axisPoints = Array.from({ length: n }, (_, i) => {
      const a = startAngle + i * angleStep;
      return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
    });
    const labelPoints = Array.from({ length: n }, (_, i) => {
      const a = startAngle + i * angleStep;
      return { x: cx + labelDist * Math.cos(a), y: cy + labelDist * Math.sin(a) };
    });
    const gridRings = [1, 2, 3].map(level => {
      const r = (level / 3) * radius;
      return Array.from({ length: n }, (_, i) => {
        const a = startAngle + i * angleStep;
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
      });
    });
    const pts1 = buildSpiderPoints(weekKey1, cx, cy, radius);
    const pts2 = weekKey2 ? buildSpiderPoints(weekKey2, cx, cy, radius) : null;
    const polyStr = (pts) => pts ? pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') : '';
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridRings.map((ring, ri) => (
          <Path key={`r-${ri}`}
            d={ring.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'}
            fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        ))}
        {axisPoints.map((ap, i) => (
          <Line key={`ax-${i}`} x1={cx} y1={cy} x2={ap.x} y2={ap.y}
            stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        ))}
        {pts1 && (
          <>
            <SvgPolygon points={polyStr(pts1)} fill="rgba(176,133,245,0.20)" stroke="#B085F5" strokeWidth="2" />
            {pts1.map((p, i) => <Circle key={`p1-${i}`} cx={p.x} cy={p.y} r={4} fill="#B085F5" />)}
          </>
        )}
        {pts2 && (
          <>
            <SvgPolygon points={polyStr(pts2)} fill="rgba(41,182,246,0.20)" stroke="#29B6F6" strokeWidth="2" />
            {pts2.map((p, i) => <Circle key={`p2-${i}`} cx={p.x} cy={p.y} r={4} fill="#29B6F6" />)}
          </>
        )}
        {labelPoints.map((lp, i) => (
          <SvgText key={`lbl-${i}`} x={lp.x} y={lp.y}
            fill="rgba(255,255,255,0.55)" fontSize="7" textAnchor="middle" fontWeight="600">
            {labels[i]}
          </SvgText>
        ))}
      </Svg>
    );
  };



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

        {/* ─── Section 2: Your Progress Overview ─── */}
        <View style={styles.overviewSection}>
          <Text style={styles.overviewSectionTitle}>Your Progress Overview</Text>

          {mindsetDimensions.map((dim) => {
            const dimData = buildDimData(dim.key);
            const chartW = Math.max(screenWidth - 100, allWeeks.length * 42);
            const padX = 14;

            return (
              <View key={dim.key} style={styles.miniChartCard}>
                <Text style={styles.miniChartLabel}>{dim.label}</Text>

                {/* Y-axis + chart area */}
                <View style={styles.miniChartRow}>
                  {/* Y-axis labels 3,2,1,0 */}
                  <View style={styles.miniYAxis}>
                    {[3, 2, 1, 0].map(v => (
                      <Text key={v} style={styles.miniYLabel}>{v}</Text>
                    ))}
                  </View>

                  {/* Scrollable line chart */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingRight: 12 }}
                  >
                    <View style={{ width: chartW }}>
                      <MiniLineChart
                        data={dimData}
                        color={dim.color}
                        chartW={chartW}
                      />
                      {/* X-axis week labels */}
                      <View style={styles.miniXAxis}>
                        {allWeeks.map((w, i) => {
                          const xPos = padX + (i / (allWeeks.length - 1)) * (chartW - 2 * padX);
                          const labelText = w === 'W1' ? '1' : w;
                          return (
                            <Text
                              key={w}
                              style={[
                                styles.miniXLabel,
                                { left: xPos - 12, width: 24, textAlign: 'center' }
                              ]}
                            >{labelText}</Text>
                          );
                        })}
                      </View>
                    </View>
                  </ScrollView>
                </View>
              </View>
            );
          })}
        </View>


        {/* ─── Section 3: A Snapshot of Your Mindset (Spider Chart) ─── */}
        <View style={styles.spiderSection}>
          <Text style={styles.spiderSectionTitle}>A Snapshot of Your Mindset</Text>

          {/* Spider chart canvas */}
          <View style={styles.spiderChartContainer}>
            <SpiderChart weekKey1={spiderWeek1} weekKey2={spiderWeek2} />
          </View>

          {/* Legend */}
          <View style={styles.spiderLegend}>
            <View style={styles.spiderLegendItem}>
              <View style={[styles.spiderLegendDot, { backgroundColor: '#B085F5' }]} />
              <Text style={styles.spiderLegendText}>{spiderWeek1 || 'Week 1'}</Text>
            </View>
            {spiderWeek2 ? (
              <View style={styles.spiderLegendItem}>
                <View style={[styles.spiderLegendDot, { backgroundColor: '#29B6F6' }]} />
                <Text style={styles.spiderLegendText}>{spiderWeek2}</Text>
              </View>
            ) : null}
          </View>

          {/* Week pickers row */}
          <View style={styles.spiderPickerRow}>
            {/* Week 1 picker */}
            <View style={styles.spiderPickerWrapper}>
              <TouchableOpacity
                style={styles.spiderPickerBtn}
                activeOpacity={0.8}
                onPress={() => { setSpider1DropOpen(!spider1DropOpen); setSpider2DropOpen(false); }}
              >
                <Text style={styles.spiderPickerText}>{spiderWeek1 || 'W1'}</Text>
                <ChevronDown size={12} color="#FFFFFF" />
              </TouchableOpacity>
              {spider1DropOpen && (
                <View style={styles.spiderDropMenu}>
                  <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                    {allWeeks.map(w => (
                      <TouchableOpacity
                        key={w}
                        style={[styles.spiderDropItem, spiderWeek1 === w && styles.spiderDropItemActive]}
                        onPress={() => { setSpiderWeek1(w); setSpider1DropOpen(false); }}
                      >
                        <Text style={[styles.spiderDropItemText, spiderWeek1 === w && { color: '#B085F5' }]}>{w}</Text>
                        {spiderWeek1 === w && <Text style={{ color: '#B085F5', fontSize: 10 }}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={styles.spiderVsText}>VS</Text>

            {/* Week 2 picker */}
            <View style={styles.spiderPickerWrapper}>
              <TouchableOpacity
                style={[styles.spiderPickerBtn, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)' }]}
                activeOpacity={0.8}
                onPress={() => { setSpider2DropOpen(!spider2DropOpen); setSpider1DropOpen(false); }}
              >
                <Text style={[styles.spiderPickerText, { color: spiderWeek2 ? '#FFFFFF' : 'rgba(255,255,255,0.3)' }]}>
                  {spiderWeek2 || 'Select'}
                </Text>
                <ChevronDown size={12} color={spiderWeek2 ? '#FFFFFF' : 'rgba(255,255,255,0.3)'} />
              </TouchableOpacity>
              {spider2DropOpen && (
                <View style={[styles.spiderDropMenu, { right: 0, left: 'auto' }]}>
                  <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                    {allWeeks.map(w => (
                      <TouchableOpacity
                        key={w}
                        style={[styles.spiderDropItem, spiderWeek2 === w && styles.spiderDropItemActive]}
                        onPress={() => { setSpiderWeek2(w); setSpider2DropOpen(false); }}
                      >
                        <Text style={[styles.spiderDropItemText, spiderWeek2 === w && { color: '#29B6F6' }]}>{w}</Text>
                        {spiderWeek2 === w && <Text style={{ color: '#29B6F6', fontSize: 10 }}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Compare button */}
            <TouchableOpacity
              style={styles.compareBtn}
              activeOpacity={0.8}
              onPress={() => { setSpider1DropOpen(false); setSpider2DropOpen(false); }}
            >
              <Text style={styles.compareBtnText}>Compare</Text>
            </TouchableOpacity>
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
