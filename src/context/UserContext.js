/**
 * ============================================================================
 * FILE: UserContext.js
 * PATH: C:\SBM_Mobile_App\src\context\UserContext.js
 *
 * PURPOSE:
 * Central React Context Provider managing global application state.
 * Handles user authentication session, profile metrics (Weight_Goal, weight, height, age, timezone),
 * daily effort logging, consistency score calculation, Sunday mindset scores, and
 * synchronization with Zoho Catalyst backend APIs and local AsyncStorage persistence.
 * ============================================================================
 */

import React, { createContext, useState, useContext, useEffect } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let globalSignupDate = null;
export function getSbmEffectiveDate(dateObj = new Date()) {
  // If a signupDate is stored for the user, use it as the effective date.
  if (globalSignupDate) {
    return globalSignupDate;
  }
  const d = new Date();
  d.setHours(19, 0, 0, 0);
  const pad = (num) => String(num).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Session loading state — true until session is validated on app mount
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Shared user states (All start at 0 / false to display default tracker states)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("user"); // 'user' | 'admin'
  const [username, setUsername] = useState("Guest");
  const [todayEffortLogged, setTodayEffortLogged] = useState(false);
  const [todayEffortScore, setTodayEffortScore] = useState(0);
  const [todayWeightLogged, setTodayWeightLogged] = useState(false);

  // Weight parameters (Start vs Current)
  const [startWeight, setStartWeight] = useState(0.0);
  const [loggedWeight, setLoggedWeight] = useState(0.0);

  // Streak
  const [streakDays, setStreakDays] = useState(0);
  const [averageEffortScore, setAverageEffortScore] = useState(0);

  // Consistency tracking: days effort logged vs calendar days elapsed since program start
  const [consistencyLogged, setConsistencyLogged] = useState(0);
  const [consistencyTotal, setConsistencyTotal] = useState(0);

  // Pre-SBM score: stores the PREVIOUS day's effort % so it shows after next submission
  // Starts at 0 for new users, never shows the legacy 69% hardcode
  const [preSbmScore, setPreSbmScore] = useState(0);

  // Respective Program Week & Phase values
  const [currentWeek, setCurrentWeek] = useState(1);
  const [phaseNumber, setPhaseNumber] = useState(1);
  const [phaseName, setPhaseName] = useState("Plan Based");
  const [historyLogs, setHistoryLogs] = useState([]);

  // Daily questions completion counts (Initialize at 0)
  const [nutritionScore, setNutritionScore] = useState(0);
  const [movementScore, setMovementScore] = useState(0);
  const [recoveryScore, setRecoveryScore] = useState(0);
  const [mindsetScore, setMindsetScore] = useState(0);
  const [hydrationScore, setHydrationScore] = useState(0);

  // Weekly efforts progress data (Mon - Fri)
  const [weeklyEfforts, setWeeklyEfforts] = useState([0, 0, 0, 0, 0]);

  // Profile details states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userGoal, setUserGoal] = useState("Select Goal");
  const [userId, setUserId] = useState("");

  // Custom Signup Fields
  const [gender, setGender] = useState("Select Gender");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [mealPreference, setMealPreference] = useState("Select Diet");
  const [timezone, setTimezone] = useState("Select Time Zone");
  // New: Store the date the user originally signed up.
  const [signupDate, setSignupDate] = useState(null);
  // Control visibility of the top‑of‑screen notice.
  const [hideNotice, setHideNotice] = useState(false);

  // Token
  const [userToken, setUserToken] = useState("");

  // Quote state — persisted in context to prevent flicker on tab switch
  const [activeQuote, setActiveQuote] = useState(
    "Every small effort today brings you closer to a stronger tomorrow.",
  );

  // Security app background state lock tracking
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());

  // Session timeout: auto-logout if app is backgrounded for more than 30 minutes
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "background") {
        // Record the time user left the app
        setLastActiveTime(Date.now());
      } else if (nextAppState === "active") {
        const elapsed = Date.now() - lastActiveTime;
        // Auto-logout ONLY if backgrounded for more than 30 minutes
        if (isLoggedIn && elapsed > SESSION_TIMEOUT_MS) {
          logoutUser();
          alert("Session expired. Please log in again.");
        }
        // If returned within 30 minutes — session stays intact, no action needed
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, lastActiveTime]);

  // Restore session state on app mount with validation
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const cachedQuote = await AsyncStorage.getItem("sbm_active_quote");
        if (cachedQuote) setActiveQuote(cachedQuote);

        const session = await AsyncStorage.getItem("sbm_user_session");
        if (session) {
          const { name, currentWeightVal, details, userRole: savedRole } = JSON.parse(session);
          const activeRole = savedRole || details?.role || "user";
          setUserRole(activeRole);

          if (activeRole === "admin") {
            loginUser(name || "System Admin", currentWeightVal || 70, { ...details, role: "admin" });
          } else if (details && details.userId) {
            try {
              const response = await fetch(`https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/dashboard?userId=${details.userId}`);
              const result = await response.json();
              if (response.ok && result.status === "success") {
                loginUser(name, currentWeightVal, details);
              } else {
                await AsyncStorage.removeItem("sbm_user_session");
                await AsyncStorage.removeItem("sbm_active_quote");
              }
            } catch (networkErr) {
              loginUser(name, currentWeightVal, details);
            }
          } else {
            await AsyncStorage.removeItem("sbm_user_session");
          }
        }

        // Load persisted signupDate and notice hide flag.
        const storedSignup = await AsyncStorage.getItem("sbm_signup_date");
        if (storedSignup) setSignupDate(storedSignup);
        const storedHide = await AsyncStorage.getItem("sbm_hide_notice");
        if (storedHide === "true") setHideNotice(true);
      } catch (e) {
        console.error("Failed to restore session:", e);
      } finally {
        setIsSessionLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Action to fetch live Dashboard Stats from Zoho Catalyst sbm_tracker_function
  const fetchDashboardData = async (uid) => {
    const targetUserId = uid || userId;
    if (!targetUserId) return;
    try {
      const response = await fetch(
        `https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/dashboard?userId=${targetUserId}`,
      );
      const result = await response.json();
      if (response.ok && result.status === "success") {
        const {
          today_effort_logged,
          today_effort_score,
          today_weight_logged,
          current_weight,
          start_weight,
          streak_days,
          current_week,
          phase_number,
          phase_name,
          nutrition_score,
          movement_score,
          recovery_score,
          history_logs,
          average_effort_score,
          consistency_logged,
          consistency_total,
          days_logged,
          days_elapsed,
          total_days_logged,
          total_days_elapsed,
        } = result.data;

        setTodayEffortLogged(today_effort_logged);
        setTodayEffortScore(today_effort_score);
        setTodayWeightLogged(today_weight_logged);
        setLoggedWeight(current_weight);
        setStartWeight(start_weight);
        setStreakDays(streak_days);
        if (current_week !== undefined) setCurrentWeek(current_week);
        if (phase_number !== undefined) setPhaseNumber(phase_number);
        if (phase_name !== undefined) setPhaseName(phase_name);
        if (nutrition_score !== undefined) setNutritionScore(nutrition_score);
        if (movement_score !== undefined) setMovementScore(movement_score);
        if (recovery_score !== undefined) setRecoveryScore(recovery_score);
        if (history_logs !== undefined) setHistoryLogs(history_logs || []);
        if (average_effort_score !== undefined)
          setAverageEffortScore(average_effort_score);

        // Sync weekly progress efforts
        const updatedEfforts = [0, 0, 0, 0, today_effort_score];
        setWeeklyEfforts(updatedEfforts);

        // ── Consistency: prefer backend values if present, fallback to AsyncStorage ──
        const backendLogged =
          consistency_logged ?? days_logged ?? total_days_logged;
        const backendTotal =
          consistency_total ?? days_elapsed ?? total_days_elapsed;

        if (
          backendLogged !== undefined &&
          backendLogged !== null &&
          backendTotal !== undefined &&
          backendTotal !== null
        ) {
          const bl = parseInt(backendLogged, 10) || 0;
          const bt = parseInt(backendTotal, 10) || 0;
          setConsistencyLogged(bl);
          setConsistencyTotal(bt);
          const consistencyKey = `sbm_consistency_${targetUserId}`;
          await AsyncStorage.setItem(
            consistencyKey,
            JSON.stringify({ logged: bl, total: bt }),
          );
        } else {
          const consistencyKey = `sbm_consistency_${targetUserId}`;
          const stored = await AsyncStorage.getItem(consistencyKey);
          if (stored) {
            const { logged, total } = JSON.parse(stored);
            setConsistencyLogged(logged || 0);
            setConsistencyTotal(total || 0);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      const consistencyKey = uid
        ? `sbm_consistency_${uid}`
        : userId
          ? `sbm_consistency_${userId}`
          : null;
      if (consistencyKey) {
        try {
          const stored = await AsyncStorage.getItem(consistencyKey);
          if (stored) {
            const { logged, total } = JSON.parse(stored);
            setConsistencyLogged(logged || 0);
            setConsistencyTotal(total || 0);
          }
        } catch (_) {}
      }
    }
  };

  // Fetch and cache the user's daily quote
  const fetchQuote = async (uid) => {
    const targetUserId = uid || userId;
    if (!targetUserId) return;
    try {
      const fetchUrl = `https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/get-quotes?type=quotes&userId=${targetUserId}`;
      const response = await fetch(fetchUrl);
      const data = await response.json();
      if (response.ok && data.status === "success" && data.quote) {
        setActiveQuote(data.quote);
        // Cache to AsyncStorage for instant display on next mount
        await AsyncStorage.setItem("sbm_active_quote", data.quote);
      }
    } catch (err) {
      console.log("Error loading per-user quote:", err.message);
    }
  };

  const logWeight = (weightValue) => {
    const numericWeight = parseFloat(weightValue);
    if (!isNaN(numericWeight)) {
      setLoggedWeight(numericWeight);
      setTodayWeightLogged(true);
    }
  };

  const logTodayEffort = async (score, currentUserId) => {
    const uid = currentUserId || userId;
    const num = parseInt(score, 10);
    if (!isNaN(num) && num >= 0) {
      setTodayEffortScore(num);
      setTodayEffortLogged(true);
      setStreakDays((prev) => prev + 1);

      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = num;
      setWeeklyEfforts(updatedEfforts);

      const pct = Math.min(100, Math.max(0, num));

      const newLogged = consistencyLogged + 1;
      const newTotal = consistencyTotal + 1;
      setConsistencyLogged(newLogged);
      setConsistencyTotal(newTotal);

      try {
        const consistencyKey = uid
          ? `sbm_consistency_${uid}`
          : "sbm_consistency";
        const preSbmKey = uid
          ? `sbm_pre_sbm_score_${uid}`
          : "sbm_pre_sbm_score";
        const lastLogKey = uid
          ? `sbm_last_log_date_${uid}`
          : "sbm_last_log_date";
        await AsyncStorage.setItem(preSbmKey, String(pct));
        await AsyncStorage.setItem(
          consistencyKey,
          JSON.stringify({ logged: newLogged, total: newTotal }),
        );
        await AsyncStorage.setItem(
          lastLogKey,
          getSbmEffectiveDate(new Date()),
        );
      } catch (_) {}
    }
  };

  const markMissedDay = async () => {
    const newTotal = consistencyTotal + 1;
    setConsistencyTotal(newTotal);
    try {
      const consistencyKey = userId
        ? `sbm_consistency_${userId}`
        : "sbm_consistency";
      await AsyncStorage.setItem(
        consistencyKey,
        JSON.stringify({ logged: consistencyLogged, total: newTotal }),
      );
    } catch (_) {}
  };

  const updateUserProfile = async (updatedFields) => {
    const goalVal =
      updatedFields.Weight_Goal ||
      updatedFields.weight_goal ||
      updatedFields.weightGoal ||
      updatedFields.userGoal ||
      updatedFields.user_goal ||
      updatedFields.goal;

    if (updatedFields.username !== undefined)
      setUsername(updatedFields.username);
    if (goalVal !== undefined) setUserGoal(goalVal);
    if (updatedFields.gender !== undefined) setGender(updatedFields.gender);
    if (updatedFields.age !== undefined) setAge(updatedFields.age);
    if (updatedFields.height !== undefined) setHeight(updatedFields.height);
    if (updatedFields.mealPreference !== undefined)
      setMealPreference(updatedFields.mealPreference);
    if (updatedFields.timezone !== undefined)
      setTimezone(updatedFields.timezone);

    try {
      const session = await AsyncStorage.getItem("sbm_user_session");
      if (session) {
        const parsed = JSON.parse(session);
        const newSession = {
          ...parsed,
          name:
            updatedFields.username !== undefined
              ? updatedFields.username
              : parsed.name,
          details: {
            ...parsed.details,
            userGoal:
              goalVal !== undefined ? goalVal : parsed.details?.userGoal,
            Weight_Goal:
              goalVal !== undefined ? goalVal : parsed.details?.Weight_Goal,
            weight_goal:
              goalVal !== undefined ? goalVal : parsed.details?.weight_goal,
            gender:
              updatedFields.gender !== undefined
                ? updatedFields.gender
                : parsed.details?.gender,
            age:
              updatedFields.age !== undefined
                ? updatedFields.age
                : parsed.details?.age,
            height:
              updatedFields.height !== undefined
                ? updatedFields.height
                : parsed.details?.height,
            mealPreference:
              updatedFields.mealPreference !== undefined
                ? updatedFields.mealPreference
                : parsed.details?.mealPreference,
            timezone:
              updatedFields.timezone !== undefined
                ? updatedFields.timezone
                : parsed.details?.timezone,
          },
        };
        await AsyncStorage.setItem(
          "sbm_user_session",
          JSON.stringify(newSession),
        );
      }
    } catch (e) {
      console.error("Failed to update user session storage:", e);
    }
  };

  const loginUser = (nameOrObj, currentWeightVal, details = {}) => {
    let name = "Customer";
    let weightVal = 70;
    let extraDetails = {};

    if (typeof nameOrObj === "object" && nameOrObj !== null) {
      extraDetails = nameOrObj;
      name = nameOrObj.name || nameOrObj.username || nameOrObj.full_name || "User";
      weightVal = nameOrObj.weight || nameOrObj.start_weight || 70;
      if (nameOrObj.role) setUserRole(nameOrObj.role);
    } else {
      name = typeof nameOrObj === "string" && nameOrObj.trim() !== "" ? nameOrObj : "Customer";
      weightVal = currentWeightVal;
      extraDetails = details || {};
    }

    setUsername(name);
    if (extraDetails.email) setUserEmail(extraDetails.email);
    if (extraDetails.userId || extraDetails.id) setUserId(extraDetails.userId || extraDetails.id);
    if (extraDetails.token) setUserToken(extraDetails.token);
    if (extraDetails.role) setUserRole(extraDetails.role);

    const numericWeight = parseFloat(weightVal);
    if (!isNaN(numericWeight)) {
      setLoggedWeight(numericWeight);
      setStartWeight(numericWeight);
    }

    const goalVal =
      extraDetails.Weight_Goal ||
      extraDetails.weight_goal ||
      extraDetails.weightGoal ||
      extraDetails.userGoal ||
      extraDetails.user_goal ||
      extraDetails.goal;

    if (extraDetails.gender) setGender(extraDetails.gender);
    if (extraDetails.age) setAge(parseInt(extraDetails.age, 10));
    if (extraDetails.height) setHeight(parseFloat(extraDetails.height));
    if (extraDetails.mealPreference) setMealPreference(extraDetails.mealPreference);
    if (extraDetails.timezone) setTimezone(extraDetails.timezone);
    if (goalVal) setUserGoal(goalVal);

    setIsLoggedIn(true);

    const saveSession = async () => {
      try {
        await AsyncStorage.setItem(
          "sbm_user_session",
          JSON.stringify({
            name,
            currentWeightVal: weightVal,
            details: extraDetails,
            userRole: extraDetails.role || "user",
          }),
        );
      } catch (e) {
        console.error("Failed to save session:", e);
      }
    };
    saveSession();

    if (details.userId) {
      setConsistencyLogged(0);
      setConsistencyTotal(0);
      const loadConsistency = async () => {
        try {
          const consistencyKey = `sbm_consistency_${details.userId}`;
          const stored = await AsyncStorage.getItem(consistencyKey);
          if (stored) {
            const { logged, total } = JSON.parse(stored);
            setConsistencyLogged(logged || 0);
            setConsistencyTotal(total || 0);
          }
        } catch (_) {}
      };
      loadConsistency();
    }

    if (details.userId) {
      fetchDashboardData(details.userId);
      fetchQuote(details.userId);
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setUserRole("user");
    setIsProfileOpen(false);
    AsyncStorage.removeItem("sbm_user_session");
    setTodayEffortLogged(false);
    setTodayEffortScore(0);
    setTodayWeightLogged(false);
    setUsername("Guest");
    setUserEmail("");
    setUserId("");
    setUserToken("");
    setGender("Select Gender");
    setAge("");
    setHeight("");
    setMealPreference("Select Diet");
    setTimezone("Select Time Zone");
    setUserGoal("Select Goal");
    setLoggedWeight(0.0);
    setStartWeight(0.0);
    setStreakDays(0);
    setConsistencyLogged(0);
    setConsistencyTotal(0);
    setPreSbmScore(0);
    setAverageEffortScore(0);
    setNutritionScore(0);
    setMovementScore(0);
    setRecoveryScore(0);
    setMindsetScore(0);
    setHydrationScore(0);
    setWeeklyEfforts([0, 0, 0, 0, 0]);
    setHistoryLogs([]);

    setActiveQuote(
      "Every small effort today brings you closer to a stronger tomorrow.",
    );

    const clearSession = async () => {
      try {
        await AsyncStorage.removeItem("sbm_user_session");
        await AsyncStorage.removeItem("sbm_active_quote");
        await AsyncStorage.removeItem("sbm_pre_sbm_score");
        await AsyncStorage.removeItem("sbm_consistency");
      } catch (e) {
        console.error("Failed to clear session:", e);
      }
    };
    clearSession();
  };

  const checkAndMarkMissedDays = async () => {
    try {
      const lastLogKey = userId
        ? `sbm_last_log_date_${userId}`
        : "sbm_last_log_date";
      const consistencyKey = userId
        ? `sbm_consistency_${userId}`
        : "sbm_consistency";
      const stored = await AsyncStorage.getItem(lastLogKey);
      const today = new Date().toISOString().split("T")[0];
      if (stored && stored !== today) {
        const last = new Date(stored);
        const todayD = new Date(today);
        const diffMs = todayD - last;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          const missed = diffDays - 1;
          const newTotal = consistencyTotal + missed;
          setConsistencyTotal(newTotal);
          await AsyncStorage.setItem(
            consistencyKey,
            JSON.stringify({ logged: consistencyLogged, total: newTotal }),
          );
        }
      }
    } catch (_) {}
  };

  return (
    <UserContext.Provider
      value={{
        isSessionLoading,
        isLoggedIn,
        setIsLoggedIn,
        userRole,
        setUserRole,
        username,
        todayEffortLogged,
        todayWeightLogged,
        startWeight,
        loggedWeight,
        streakDays,
        consistencyLogged,
        consistencyTotal,
        preSbmScore,
        nutritionScore,
        movementScore,
        recoveryScore,
        mindsetScore,
        hydrationScore,
        weeklyEfforts,
        currentWeek,
        phaseNumber,
        phaseName,
        historyLogs,
        averageEffortScore,
        isProfileOpen,
        setIsProfileOpen,
        userEmail,
        userGoal,
        userId,
        gender,
        age,
        height,
        mealPreference,
        timezone,
        userToken,
        todayEffortScore,
        activeQuote,
        setUserGoal,
        logTodayEffort,
        fetchDashboardData,
        fetchQuote,
        logWeight,
        isLoggedIn,
        userRole,
        setUserRole,
        username,
        loginUser,
        logoutUser,
        updateUserProfile,
        markMissedDay,
        checkAndMarkMissedDays,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
export const useUser = () => useContext(UserContext);
