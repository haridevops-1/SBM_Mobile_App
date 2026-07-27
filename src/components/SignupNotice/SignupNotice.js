import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, CheckCircle2, X } from "lucide-react-native";
import { useUser } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SignupNotice = () => {
  const { signupDate, hideNotice, setHideNotice, todayEffortLogged, isLogPeriodActive, userId } = useUser();

  if (hideNotice) return null;

  const isActive = isLogPeriodActive(signupDate);
  let noticeTitle = "";
  let noticeDesc = "";
  let isSuccess = false;

  if (!isActive) {
    // User signed up before 6 PM and it's not 6 PM yet
    noticeTitle = "Logging Opens at 6:00 PM";
    noticeDesc = "Your daily effort log will unlock at 6:00 PM today. Explore your dashboard metrics below!";
    isSuccess = false;
  } else if (todayEffortLogged) {
    // User already logged for the current 6 PM - 6 PM period
    noticeTitle = "Today's Effort Logged!";
    noticeDesc = "Great job! You have logged your effort for today. Your next window opens at 6:00 PM.";
    isSuccess = true;
  } else {
    // Logging is active and user hasn't logged yet -> No notice banner required
    return null;
  }

  const dismiss = async () => {
    setHideNotice(true);
    if (userId) {
      await AsyncStorage.setItem(`sbm_hide_notice_${userId}`, "true");
    } else {
      await AsyncStorage.setItem("sbm_hide_notice", "true");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          isSuccess
            ? ["rgba(27, 94, 32, 0.4)", "rgba(13, 40, 15, 0.6)"]
            : ["rgba(81, 45, 168, 0.4)", "rgba(33, 16, 75, 0.6)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.banner,
          { borderColor: isSuccess ? "rgba(76, 175, 80, 0.35)" : "rgba(176, 133, 245, 0.35)" }
        ]}
      >
        <View style={styles.contentRow}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: isSuccess ? "rgba(76, 175, 80, 0.2)" : "rgba(176, 133, 245, 0.2)" }
            ]}
          >
            {isSuccess ? (
              <CheckCircle2 size={18} color="#81C784" />
            ) : (
              <Clock size={18} color="#B085F5" />
            )}
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.titleText, { color: isSuccess ? "#A5D6A7" : "#E1BEE7" }]}>
              {noticeTitle}
            </Text>
            <Text style={styles.descText}>{noticeDesc}</Text>
          </View>

          <TouchableOpacity
            onPress={dismiss}
            style={styles.closeBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  banner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  descText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});
