import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Flame, Target, TrendingDown, ChevronRight } from 'lucide-react-native';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useUser } from '../../context/UserContext';
import styles from './InProgressCard.styles';

export const InProgressCard = () => {
  const { streakDays, todayEffortLogged, startWeight, loggedWeight } = useUser();
  
  const score = todayEffortLogged ? 78 : 0;
  const streak = streakDays;
  const weightChange = parseFloat((loggedWeight - startWeight).toFixed(1));
  
  // SVG Circle parameters
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>In Progress</Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.viewDetailsBtn}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <ChevronRight size={14} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.progressCircleWrapper}>
          <Svg style={styles.progressSvg} viewBox="0 0 120 120">
            <Defs>
              <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#29B6F6" />
                <Stop offset="100%" stopColor="#4CAF50" />
              </LinearGradient>
            </Defs>
            
            {/* Background Track */}
            <Circle
              cx="60"
              cy="60"
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={8}
              fill="none"
            />
            
            {/* Foreground Fill */}
            {score > 0 && (
              <Circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#progressGradient)"
                strokeWidth={8}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                origin="60, 60"
                rotation="-90"
              />
            )}
          </Svg>
          
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressPercentage}>{score}%</Text>
            <Text style={styles.progressLabel}>Today Score</Text>
          </View>
        </View>

        <View style={styles.statsList}>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrapper, styles.orangeIcon]}>
              <Flame size={14} fill="#FF9800" color="#FF9800" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>{streak} Days</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIconWrapper, styles.yellowIcon]}>
              <Target size={14} color="#FFEB3B" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Today Score</Text>
              <Text style={styles.statValue}>{score}%</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIconWrapper, styles.greenIcon]}>
              <TrendingDown size={14} color="#4CAF50" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statLabel}>Weight Change</Text>
              <Text style={styles.statSublabel}>(vs last week)</Text>
              <Text style={[styles.statValue, styles.greenText]}>
                {weightChange > 0 ? `+${weightChange}` : weightChange} kg
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InProgressCard;
