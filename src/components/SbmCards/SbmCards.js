import React from 'react';
import { View, Text } from 'react-native';
import { Flame, Zap, Scale } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/SbmCards.styles';

export const SbmCards = () => {
  const { todayEffortLogged, todayEffortScore, startWeight, loggedWeight } = useUser();

  // Dynamic calculations
  const consistencyScore = todayEffortLogged ? "6 / 108" : "5 / 108";
  
  const weightDiff = (loggedWeight - startWeight).toFixed(1);
  const weightChangeScore = parseFloat(weightDiff) >= 0 ? `+${weightDiff} Kg` : `${weightDiff} Kg`;

  const cardsData = [
    {
      id: 1,
      score: consistencyScore,
      title: "Consistency",
      icon: <Flame size={18} color="#B085F5" />,
      iconBg: 'rgba(123, 31, 162, 0.15)',
    },
    {
      id: 2,
      score: `${todayEffortScore}%`,
      title: "Effort",
      icon: <Zap size={18} color="#29B6F6" />,
      iconBg: 'rgba(41, 182, 246, 0.15)',
    },
    {
      id: 3,
      score: weightChangeScore,
      title: "Weight Change",
      icon: <Scale size={18} color="#4CAF50" />,
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
