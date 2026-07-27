import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SignupNotice = () => {
  const { signupDate, hideNotice, setHideNotice, todayEffortLogged, isLogPeriodActive } = useUser();

  if (hideNotice) return null;

  const isActive = isLogPeriodActive(signupDate);
  let noticeMessage = "";

  if (!isActive) {
    // User signed up before 6 PM and it's not 6 PM yet
    noticeMessage = "Notice: Daily logging opens at 6:00 PM today. Until then, you can explore your dashboard.";
  } else if (todayEffortLogged) {
    // User already logged for the current 6 PM - 6 PM period
    noticeMessage = "Notice: Effort logged for today! Next log window opens at 6:00 PM.";
  } else {
    // Logging is active and user hasn't logged yet -> No notice banner required
    return null;
  }

  const dismiss = async () => {
    setHideNotice(true);
    await AsyncStorage.setItem('sbm_hide_notice', 'true');
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{noticeMessage}</Text>
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
