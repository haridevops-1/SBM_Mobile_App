import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SignupNotice = () => {
  const { signupDate, hideNotice, setHideNotice } = useUser();
  if (!signupDate || hideNotice) return null;

  const now = new Date();
  const signup = new Date(signupDate);
  // Align to 6 PM cutoff for the day of signup
  signup.setHours(18, 0, 0, 0);
  const diffMs = now - signup;
  const periods = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const nextOpen = new Date(signup.getTime() + (periods + 1) * 24 * 60 * 60 * 1000);
  const openDateStr = nextOpen.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const openTimeStr = nextOpen.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const dismiss = async () => {
    setHideNotice(true);
    await AsyncStorage.setItem('sbm_hide_notice', 'true');
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Logging will be available on {openDateStr} at {openTimeStr}. Until then you can view your dashboard.
      </Text>
      <TouchableOpacity onPress={dismiss} style={styles.closeBtn}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(30,30,60,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  text: {
    color: '#fff',
    flex: 1,
    fontSize: 14,
  },
  closeBtn: {
    marginLeft: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
  },
});
