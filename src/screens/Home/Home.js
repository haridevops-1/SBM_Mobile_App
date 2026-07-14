import React from 'react';
import { ScrollView, View, Text, SafeAreaView } from 'react-native';
import { Calendar } from 'lucide-react-native';
import Header from '../../components/Header/Header';
import QuoteBanner from '../../components/QuoteBanner/QuoteBanner';
import InProgressCard from '../../components/InProgressCard/InProgressCard';
import SbmCards from '../../components/SbmCards/SbmCards';
import DailyActions from '../../components/DailyActions/DailyActions';
import ProfileDrawer from '../../components/ProfileDrawer/ProfileDrawer';
import theme from '../../theme/theme';
import styles from './Home.styles';

export const Home = () => {
  const dateString = "Sunday, 13 July 2025";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <Header />

        {/* Quote Banner */}
        <QuoteBanner />

        {/* Date Row */}
        <View style={styles.dateRow}>
          <Calendar size={14} color={theme.colors.textSecondary} style={styles.calendarIcon} />
          <Text style={styles.dateText}>{dateString}</Text>
        </View>

        {/* Today's Progress Card */}
        <InProgressCard />

        {/* SBM Score Section */}
        <SbmCards />

        {/* Daily Actions Grid */}
        <DailyActions />
      </ScrollView>

      {/* Hamburger Navigation Drawer overlay */}
      <ProfileDrawer />
    </SafeAreaView>
  );
};

export default Home;
