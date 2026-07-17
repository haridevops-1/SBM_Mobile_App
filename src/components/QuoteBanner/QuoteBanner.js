import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const storage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {}
    return global[key] || null;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val);
        return;
      }
    } catch (e) {}
    global[key] = val;
  }
};

export const QuoteBanner = () => {
  const [activeQuote, setActiveQuote] = useState("Every small effort today brings you closer to a stronger tomorrow.");

  useEffect(() => {
    const loadQuote = async () => {
      let quotesList = FALLBACK_QUOTES;

      try {
        const response = await fetch('https://sbm-mobile-app-906714478.development.catalystserverless.com/get-quotes');
        const data = await response.json();
        if (response.ok && data.status === 'success' && Array.isArray(data.quotes) && data.quotes.length > 0) {
          quotesList = data.quotes;
        }
      } catch (err) {
        console.log("Using local quotes fallback:", err.message);
      }

      // Check current expiry and active quote index
      const storedExpiry = storage.getItem('sbm_daily_quote_expiry');
      const storedQuoteText = storage.getItem('sbm_daily_quote_text');
      const now = Date.now();

      if (storedExpiry && storedQuoteText && now < parseInt(storedExpiry, 10)) {
        setActiveQuote(storedQuoteText);
      } else {
        // Expired or not set! Increment quote index
        const storedIndex = storage.getItem('sbm_daily_quote_index');
        let nextIndex = 0;
        if (storedIndex !== null) {
          nextIndex = (parseInt(storedIndex, 10) + 1) % quotesList.length;
        }

        const nextQuote = quotesList[nextIndex];
        const newExpiry = now + 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        storage.setItem('sbm_daily_quote_index', nextIndex.toString());
        storage.setItem('sbm_daily_quote_text', nextQuote);
        storage.setItem('sbm_daily_quote_expiry', newExpiry.toString());

        setActiveQuote(nextQuote);
      }
    };

    loadQuote();
  }, []);

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
