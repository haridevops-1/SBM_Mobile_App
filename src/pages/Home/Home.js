import React, { useEffect } from 'react';
import { ScrollView, View, Text, SafeAreaView } from 'react-native';
import { Calendar } from 'lucide-react-native';
import Header from '../../components/Header/Header';
import QuoteBanner from '../../components/QuoteBanner/QuoteBanner';
import SbmCards from '../../components/SbmCards/SbmCards';
import DailyActions from '../../components/DailyActions/DailyActions';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import { useUser } from '../../context/UserContext';
import theme from '../../theme/theme';
import styles from '../../styles/pages/Home.styles';

export const Home = () => {
  const { isLoggedIn, fetchDashboardData } = useUser();

  // Dynamic dashboard synchronizations upon page render sessions
  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

  // Calculate dynamic date matching original date formats (e.g. "Thursday, 16 July 2026")
  const getDynamicDateString = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = new Date();
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top welcome greeting header */}
        <Header />

        {/* Date Row positioned above the daily quote message */}
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.colors.textSecondary} style={styles.calendarIcon} />
          <Text style={styles.dateText}>{getDynamicDateString()}</Text>
        </View>

        {/* Quote message banner */}
        <QuoteBanner />

        {/* Progress Grid (Consistency, Effort, Weight Change) */}
        <SbmCards />

        {/* Daily Actions & Gauge Section */}
        <DailyActions />
      </ScrollView>

      {/* Hamburger Navigation Drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Home;
