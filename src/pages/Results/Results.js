import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Bell, ChevronDown, Scale, ArrowDownRight, ArrowUpRight, Activity, Dumbbell, ClipboardList, Utensils, Cookie } from 'lucide-react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Results.styles';

const { width: screenWidth } = Dimensions.get('window');

export const Results = () => {
  const { startWeight, loggedWeight, todayEffortLogged, username, setIsProfileOpen } = useUser();

  const [activeMetric, setActiveMetric] = useState('weight');
  const [selectedPointIndex, setSelectedPointIndex] = useState(6);
  const [chartTimeframe, setChartTimeframe] = useState('7days');
  const [headerTimeframe, setHeaderTimeframe] = useState('week');
  const [foodTimeframe, setFoodTimeframe] = useState('week');

  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [chartDropdownOpen, setChartDropdownOpen] = useState(false);
  const [foodDropdownOpen, setFoodDropdownOpen] = useState(false);

  const netWeightChange = parseFloat((loggedWeight - startWeight).toFixed(1));
  const pctWeightChange = parseFloat(((netWeightChange / startWeight) * 100).toFixed(1));

  // Dynamic coordinate for today's weight node
  const todayWeightY = Math.max(25, Math.min(130, Math.round(100 - ((loggedWeight - 71) / 10.2) * 65)));

  const datasets = {
    weight: {
      title: 'Body Weight (kg)',
      unit: 'kg',
      color: '#B085F5',
      themeClass: 'purple-theme',
      yLabels: [85, 75, 65, 55, 45, 35],
      startValue: `${startWeight} kg`,
      currentValue: `${loggedWeight} kg`,
      change: `${netWeightChange > 0 ? '+' : ''}${netWeightChange} kg`,
      changePercent: `${netWeightChange > 0 ? '+' : ''}${pctWeightChange}%`,
      changeIsNegative: netWeightChange <= 0,
      timeframes: {
        '7days': [
          { day: '11 Jul', val: 71.0, x: 40, y: 100 },
          { day: '12 Jul', val: 70.5, x: 95, y: 105 },
          { day: '13 Jul', val: 71.0, x: 150, y: 100 },
          { day: '14 Jul', val: 72.5, x: 205, y: 88 },
          { day: '15 Jul', val: 81.2, x: 260, y: 35 },
          { day: '16 Jul', val: 80.5, x: 315, y: 40 },
          { day: '17 Jul', val: loggedWeight, x: 370, y: todayWeightY }
        ],
        '30days': [
          { day: '18 Jun', val: 81.0, x: 40, y: 35 },
          { day: '23 Jun', val: 80.2, x: 95, y: 41 },
          { day: '28 Jun', val: 79.5, x: 150, y: 48 },
          { day: '3 Jul', val: 79.0, x: 205, y: 55 },
          { day: '8 Jul', val: 78.2, x: 260, y: 62 },
          { day: '13 Jul', val: 78.5, x: 315, y: 60 },
          { day: '17 Jul', val: loggedWeight, x: 370, y: todayWeightY }
        ]
      }
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
      timeframes: {
        '7days': [
          { day: '11 Jul', val: 25.0, x: 40, y: 95 },
          { day: '12 Jul', val: 24.8, x: 95, y: 98 },
          { day: '13 Jul', val: 24.2, x: 150, y: 107 },
          { day: '14 Jul', val: 24.0, x: 205, y: 110 },
          { day: '15 Jul', val: 23.8, x: 260, y: 113 },
          { day: '16 Jul', val: 23.6, x: 315, y: 116 },
          { day: '17 Jul', val: todayEffortLogged ? 23.4 : 23.6, x: 370, y: todayEffortLogged ? 119 : 116 }
        ],
        '30days': [
          { day: '18 Jun', val: 26.5, x: 40, y: 72 },
          { day: '23 Jun', val: 25.8, x: 95, y: 82 },
          { day: '28 Jun', val: 25.2, x: 150, y: 92 },
          { day: '3 Jul', val: 24.8, x: 205, y: 98 },
          { day: '23 Jun', val: 25.8, x: 95, y: 82 },
          { day: '28 Jun', val: 25.2, x: 150, y: 92 },
          { day: '3 Jul', val: 24.8, x: 205, y: 98 },
          { day: '8 Jul', val: 24.2, x: 260, y: 107 },
          { day: '13 Jul', val: 23.8, x: 315, y: 113 },
          { day: '17 Jul', val: todayEffortLogged ? 23.4 : 23.6, x: 370, y: todayEffortLogged ? 119 : 116 }
        ]
      }
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
      timeframes: {
        '7days': [
          { day: '11 Jul', val: 54.9, x: 40, y: 120 },
          { day: '12 Jul', val: 55.1, x: 95, y: 117 },
          { day: '13 Jul', val: 55.3, x: 150, y: 114 },
          { day: '14 Jul', val: 55.5, x: 205, y: 110 },
          { day: '15 Jul', val: 55.8, x: 260, y: 105 },
          { day: '16 Jul', val: 56.0, x: 315, y: 102 },
          { day: '17 Jul', val: todayEffortLogged ? 56.1 : 55.9, x: 370, y: todayEffortLogged ? 100 : 102 }
        ],
        '30days': [
          { day: '18 Jun', val: 53.5, x: 40, y: 140 },
          { day: '23 Jun', val: 54.2, x: 95, y: 130 },
          { day: '28 Jun', val: 54.8, x: 150, y: 121 },
          { day: '3 Jul', val: 55.2, x: 205, y: 114 },
          { day: '8 Jul', val: 55.5, x: 260, y: 110 },
          { day: '13 Jul', val: 55.8, x: 315, y: 105 },
          { day: '17 Jul', val: todayEffortLogged ? 56.1 : 55.9, x: 370, y: todayEffortLogged ? 100 : 102 }
        ]
      }
    }
  };

  const activeSet = datasets[activeMetric];
  const chartPoints = activeSet.timeframes[chartTimeframe];
  const activeIndex = Math.min(selectedPointIndex, chartPoints.length - 1);
  const selectedPoint = chartPoints[activeIndex];

  // SVG path calculations
  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L 370 140 L 40 140 Z`;

  const progressOverviewList = [
    { id: 'weight', label: 'Body Weight', unit: 'kg', value: `${loggedWeight} kg`, change: `${netWeightChange > 0 ? '+' : ''}${netWeightChange} kg`, icon: (color) => <Scale size={16} color={color} />, colorClass: 'purple-theme', barHeights: [30, 45, 60, 45, 70, 55], accentColor: '#B085F5', iconBg: 'rgba(123, 31, 162, 0.15)' },
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.resultsHeader}>
          <View style={styles.headerTopRow}>
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
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.dropdownFilterBtn}
                onPress={() => setHeaderDropdownOpen(!headerDropdownOpen)}
              >
                <Text style={styles.dropdownFilterText}>
                  {headerTimeframe === 'week' ? 'This Week' : 'This Month'}
                </Text>
                <ChevronDown size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              {headerDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={() => { setHeaderTimeframe('week'); setHeaderDropdownOpen(false); }}
                  >
                    <Text style={styles.dropdownMenuItemText}>This Week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={() => { setHeaderTimeframe('month'); setHeaderDropdownOpen(false); }}
                  >
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

            <View style={styles.dropdownWrapper}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.dropdownFilterBtn}
                onPress={() => setChartDropdownOpen(!chartDropdownOpen)}
              >
                <Text style={styles.dropdownFilterText}>
                  {chartTimeframe === '7days' ? '7 Days' : '30 Days'}
                </Text>
                <ChevronDown size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              {chartDropdownOpen && (
                <View style={[styles.dropdownMenu, { top: 36 }]}>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={() => { setChartTimeframe('7days'); setChartDropdownOpen(false); }}
                  >
                    <Text style={styles.dropdownMenuItemText}>7 Days</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={() => { setChartTimeframe('30days'); setChartDropdownOpen(false); }}
                  >
                    <Text style={styles.dropdownMenuItemText}>30 Days</Text>
                  </TouchableOpacity>
                </View>
              )}
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

              <Svg style={styles.chartSvg} viewBox="0 0 400 150">
                <Defs>
                  <SvgLinearGradient id={`grad-${activeMetric}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={metricColor} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={metricColor} stopOpacity="0.0" />
                  </SvgLinearGradient>
                </Defs>

                {/* Area path */}
                <Path d={areaPath} fill={`url(#grad-${activeMetric})`} />

                {/* Line path */}
                <Path d={linePath} fill="none" stroke={metricColor} strokeWidth="3" strokeLinecap="round" />

                {/* Data point circles */}
                {chartPoints.map((p, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <Circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={isActive ? 6 : 4}
                      fill={isActive ? '#FFFFFF' : metricColor}
                      stroke={isActive ? metricColor : 'none'}
                      strokeWidth={isActive ? 2 : 0}
                      onPress={() => setSelectedPointIndex(idx)}
                    />
                  );
                })}
              </Svg>

              {/* Tooltip Overlay */}
              {selectedPoint && (
                <View 
                  style={[
                    styles.chartTooltipBox, 
                    { 
                      left: selectedPoint.x - 45, 
                      top: selectedPoint.y - 48,
                      borderColor: metricColor
                    }
                  ]}
                >
                  <Text style={styles.tooltipDate}>{selectedPoint.day}</Text>
                  <View style={styles.tooltipValueRow}>
                    <View style={[styles.tooltipColorIndicator, { backgroundColor: metricColor }]} />
                    <Text style={styles.tooltipValueText}>{selectedPoint.val} {activeSet.unit}</Text>
                  </View>
                </View>
              )}

              {/* X Axis Labels */}
              <View style={styles.xAxisLabels}>
                {chartPoints.map((p, idx) => (
                  <Text
                    key={idx}
                    onPress={() => setSelectedPointIndex(idx)}
                    style={[
                      styles.xAxisLabelText,
                      { 
                        left: p.x - 12,
                        color: idx === activeIndex ? theme.colors.textPrimary : theme.colors.textMuted,
                        fontWeight: idx === activeIndex ? '700' : '600'
                      }
                    ]}
                  >
                    {p.day}
                  </Text>
                ))}
              </View>
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
                <TouchableOpacity
                  key={row.id}
                  activeOpacity={0.8}
                  style={[styles.progressRowItem, isSelected && styles.selectedRowItem]}
                  onPress={() => {
                    setActiveMetric(row.id);
                    setSelectedPointIndex(datasets[row.id].timeframes[chartTimeframe].length - 1);
                  }}
                >
                  <View style={styles.rowInfo}>
                    <View style={[styles.rowIconWrapper, { backgroundColor: iconBg }]}>
                      {row.icon(iconColor)}
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowTitle}>{row.label}</Text>
                      <Text style={styles.rowUnit}>{row.unit}</Text>
                    </View>
                  </View>

                  {/* Micro Bar Chart */}
                  <View style={styles.miniBarsGraph}>
                    {row.barHeights.map((h, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.miniBarFill, 
                          { 
                            backgroundColor: isSelected ? '#FFFFFF' : row.accentColor,
                            height: `${h}%` 
                          }
                        ]} 
                      />
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
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.dropdownFilterBtn}
                onPress={() => setFoodDropdownOpen(!foodDropdownOpen)}
              >
                <Text style={styles.dropdownFilterText}>
                  {foodTimeframe === 'week' ? 'This Week' : 'This Month'}
                </Text>
                <ChevronDown size={12} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              {foodDropdownOpen && (
                <View style={[styles.dropdownMenu, { top: 36 }]}>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={() => { setFoodTimeframe('week'); setFoodDropdownOpen(false); }}
                  >
                    <Text style={styles.dropdownMenuItemText}>This Week</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.dropdownMenuItem}
                    onPress={() => { setFoodTimeframe('month'); setFoodDropdownOpen(false); }}
                  >
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
                      <View style={styles.sliderIconBox}>
                        {item.icon}
                      </View>
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
                      <View 
                        style={[
                          styles.sliderTrackFill,
                          { 
                            backgroundColor: sliderTrackFillColor,
                            width: `${item.percentage}%` 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Profile menu drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Results;
