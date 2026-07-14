import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Calendar, Utensils, Dumbbell, Moon, Brain, Droplet, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from './Efforts.styles';

export const Efforts = () => {
  const [activeTimeframe, setActiveTimeframe] = useState('week');
  const [activeCategory, setActiveCategory] = useState('nutrition');

  const { 
    todayEffortLogged,
    nutritionScore,
    movementScore,
    recoveryScore,
    mindsetScore,
    hydrationScore,
    weeklyEfforts,
    setIsProfileOpen,
    username
  } = useUser();

  const timeframes = ['Week', 'Month', 'Year'];

  const overallMetrics = [
    { label: 'Effort Score', value: todayEffortLogged ? '78%' : '68%' },
    { label: 'Completed', value: todayEffortLogged ? '8/9' : '7/9' },
    { label: 'Consistency', value: todayEffortLogged ? '78%' : '68%' },
    { label: 'Points', value: todayEffortLogged ? '780' : '680' }
  ];

  const overallChartData = [
    { day: 'Mon', percentage: weeklyEfforts[0], isToday: false },
    { day: 'Tue', percentage: weeklyEfforts[1], isToday: false },
    { day: 'Wed', percentage: weeklyEfforts[2], isToday: false },
    { day: 'Thu', percentage: weeklyEfforts[3], isToday: false },
    { day: 'Fri', percentage: weeklyEfforts[4], isToday: true }
  ];

  const categories = [
    {
      id: 'nutrition',
      label: 'Nutrition',
      score: `${nutritionScore}/9`,
      icon: (color) => <Utensils size={18} color={color} />,
      iconBg: 'rgba(76, 175, 80, 0.15)',
      accentColor: '#4CAF50',
      titleFull: 'Nutrition & Meals'
    },
    {
      id: 'movement',
      label: 'Movement',
      score: `${movementScore}/9`,
      icon: (color) => <Dumbbell size={18} color={color} />,
      iconBg: 'rgba(41, 182, 246, 0.15)',
      accentColor: '#29B6F6',
      titleFull: 'Movement & Exercise'
    },
    {
      id: 'recovery',
      label: 'Recovery',
      score: `${recoveryScore}/9`,
      icon: (color) => <Moon size={18} color={color} />,
      iconBg: 'rgba(123, 31, 162, 0.15)',
      accentColor: '#B085F5',
      titleFull: 'Recovery & Sleep'
    },
    {
      id: 'mindset',
      label: 'Mindset',
      score: `${mindsetScore}/9`,
      icon: (color) => <Brain size={18} color={color} />,
      iconBg: 'rgba(255, 152, 0, 0.15)',
      accentColor: '#FF9800',
      titleFull: 'Mindset & Focus'
    },
    {
      id: 'hydration',
      label: 'Hydration',
      score: `${hydrationScore}/9`,
      icon: (color) => <Droplet size={18} color={color} />,
      iconBg: 'rgba(33, 150, 243, 0.15)',
      accentColor: '#2196F3',
      titleFull: 'Hydration & Water'
    }
  ];

  const categoryDetailsData = {
    nutrition: [
      { day: 'Mon', percentage: 75 },
      { day: 'Tue', percentage: 45 },
      { day: 'Wed', percentage: 80 },
      { day: 'Thu', percentage: 45 },
      { day: 'Fri', percentage: 85 },
      { day: 'Sat', percentage: 35 },
      { day: 'Sun', percentage: 78 }
    ],
    movement: [
      { day: 'Mon', percentage: 50 },
      { day: 'Tue', percentage: 80 },
      { day: 'Wed', percentage: 60 },
      { day: 'Thu', percentage: 75 },
      { day: 'Fri', percentage: 90 },
      { day: 'Sat', percentage: 40 },
      { day: 'Sun', percentage: 30 }
    ],
    recovery: [
      { day: 'Mon', percentage: 90 },
      { day: 'Tue', percentage: 85 },
      { day: 'Wed', percentage: 70 },
      { day: 'Thu', percentage: 80 },
      { day: 'Fri', percentage: 85 },
      { day: 'Sat', percentage: 95 },
      { day: 'Sun', percentage: 90 }
    ],
    mindset: [
      { day: 'Mon', percentage: 60 },
      { day: 'Tue', percentage: 75 },
      { day: 'Wed', percentage: 80 },
      { day: 'Thu', percentage: 70 },
      { day: 'Fri', percentage: 65 },
      { day: 'Sat', percentage: 50 },
      { day: 'Sun', percentage: 85 }
    ],
    hydration: [
      { day: 'Mon', percentage: 80 },
      { day: 'Tue', percentage: 90 },
      { day: 'Wed', percentage: 75 },
      { day: 'Thu', percentage: 85 },
      { day: 'Fri', percentage: 90 },
      { day: 'Sat', percentage: 60 },
      { day: 'Sun', percentage: 70 }
    ]
  };

  const selectedCategoryObj = categories.find(cat => cat.id === activeCategory);
  const activeDetailData = categoryDetailsData[activeCategory];
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
            <TouchableOpacity style={styles.headerActionBtn}>
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
            <TouchableOpacity>
              <Text style={styles.viewAllBtn}>View All</Text>
            </TouchableOpacity>
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
              <TouchableOpacity style={styles.viewDetailsLink}>
                <Text style={styles.viewDetailsLinkText}>View Details</Text>
                <ArrowUpRight size={12} color="#B085F5" />
              </TouchableOpacity>
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

      {/* Profile navigation drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Efforts;
