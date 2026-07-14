import React from 'react';
import { View, Text } from 'react-native';
import { Power, Zap, Target, Trophy } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme/theme';
import styles from './SbmCards.styles';

export const SbmCards = () => {
  const cardsData = [
    {
      id: 1,
      score: "68%",
      title: "Pre-SBM Score",
      icon: <Power size={18} color="#B085F5" />,
      colors: theme.colors.gradients.purple,
      iconBg: 'rgba(123, 31, 162, 0.15)',
    },
    {
      id: 2,
      score: "81%",
      title: "Effort Score",
      icon: <Zap size={18} color="#29B6F6" />,
      colors: theme.colors.gradients.blue,
      iconBg: 'rgba(41, 182, 246, 0.15)',
    },
    {
      id: 3,
      score: "76%",
      title: "Consistency",
      icon: <Target size={18} color="#4CAF50" />,
      colors: theme.colors.gradients.green,
      iconBg: 'rgba(76, 175, 80, 0.15)',
    },
    {
      id: 4,
      score: "75%",
      title: "SBM Score",
      icon: <Trophy size={18} color="#FF9800" />,
      colors: theme.colors.gradients.orange,
      iconBg: 'rgba(255, 152, 0, 0.15)',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>SBM Score</Text>
      <View style={styles.grid}>
        {cardsData.map((card) => (
          <View key={card.id} style={styles.card}>
            <LinearGradient
              colors={card.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 4 }}
            >
              <View style={[styles.iconWrapper, { backgroundColor: card.iconBg }]}>
                {card.icon}
              </View>
              <Text style={styles.scoreValue}>{card.score}</Text>
              <Text style={styles.cardTitle}>{card.title}</Text>
            </LinearGradient>
          </View>
        ))}
      </View>
    </View>
  );
};

export default SbmCards;
