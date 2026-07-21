/**
 * ============================================================================
 * FILE: SbmCards.js
 * PATH: C:\SBM_Mobile_App\src\components\SbmCards\SbmCards.js
 * 
 * PURPOSE:
 * Renders the top 3 core metric cards on the Tracker (Home) screen:
 * 1. Consistency Score (e.g. 1/1, 2/3)
 * 2. Today's Effort Score (% score calculated from daily questions)
 * 3. Body Weight (current logged weight vs start weight)
 * ============================================================================
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Flame, Zap, Scale } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import styles from '../../styles/components/SbmCards.styles';

export const SbmCards = () => {
  const {
    todayEffortScore,
    startWeight,
    loggedWeight,
    consistencyLogged,
    consistencyTotal,
  } = useUser();

  // ── Consistency: days logged / total calendar days elapsed ──────────────────
  // e.g. Day 1 logged = 1/1, Day 2 missed = 1/2, Day 3 logged = 2/3
  const consistencyScore = consistencyTotal > 0
    ? `${consistencyLogged} / ${consistencyTotal}`
    : '0 / 0';

  // ── Effort: today's raw score → percentage (backend max is 9 per question)
  // If nothing logged today yet → show 0%
  const effortPercent = todayEffortScore > 0
    ? Math.min(100, Math.max(0, Math.round((todayEffortScore / 9) * 100)))
    : 0;
  const effortScore = `${effortPercent}%`;

  // ── Weight Change ───────────────────────────────────────────────────────────
  const weightDiff        = (loggedWeight - startWeight).toFixed(1);
  const weightChangeScore = parseFloat(weightDiff) >= 0
    ? `+${weightDiff} Kg`
    : `${weightDiff} Kg`;

  const cardsData = [
    {
      id: 1,
      score: consistencyScore,
      title: 'Consistency',
      icon:  <Flame size={18} color="#B085F5" />,
      iconBg: 'rgba(123, 31, 162, 0.15)',
    },
    {
      id: 2,
      score: effortScore,
      title: 'Effort',
      icon:  <Zap size={18} color="#29B6F6" />,
      iconBg: 'rgba(41, 182, 246, 0.15)',
    },
    {
      id: 3,
      score: weightChangeScore,
      title: 'Weight Change',
      icon:  <Scale size={18} color="#4CAF50" />,
      iconBg: 'rgba(76, 175, 80, 0.15)',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your Progress</Text>
      <View style={styles.grid}>
        {cardsData.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: card.iconBg }]}>
              {card.icon}
            </View>
            <Text style={styles.scoreValue}>{card.score}</Text>
            <Text style={styles.cardTitle}>{card.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SbmCards;
