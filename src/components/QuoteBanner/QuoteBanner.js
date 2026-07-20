import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/QuoteBanner.styles';

const FALLBACK_QUOTES = [
  "You know what to do, you just need to remember to do those things.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Believe in yourself and all that you are.",
  "Every day is a new opportunity to grow.",
  "Discipline is choosing between what you want now and what you want most.",
  "Small progress is still progress.",
  "Your only limit is your mind.",
  "Dream big, work hard, stay focused.",
  "Consistency beats motivation."
];

export const QuoteBanner = () => {
  const { userId } = useUser();
  const [activeQuote, setActiveQuote] = useState("Every small effort today brings you closer to a stronger tomorrow.");

  useEffect(() => {
    if (!userId) return;

    const loadQuote = async () => {
      try {
        const fetchUrl = `https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/get-quotes?type=quotes&userId=${userId}`;
        const response = await fetch(fetchUrl);
        const data = await response.json();
        if (response.ok && data.status === 'success' && data.quote) {
          setActiveQuote(data.quote);
        }
      } catch (err) {
        console.log("Error loading per-user quote:", err.message);
      }
    };

    loadQuote();
  }, [userId]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradients.purple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.starContainer}>
          <Star size={18} fill="#B085F5" color="#B085F5" />
        </View>
        <Text style={styles.quoteText}>
          {activeQuote}
        </Text>
      </LinearGradient>
    </View>
  );
};

export default QuoteBanner;
