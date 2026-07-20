import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/components/QuoteBanner.styles';

export const QuoteBanner = () => {
  const { activeQuote } = useUser();

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
