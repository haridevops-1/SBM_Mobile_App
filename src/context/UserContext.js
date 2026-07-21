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

import React, { createContext, useState, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Session loading state — true until session is validated on app mount
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  // Shared user states (All start at 0 / false to display default tracker states)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');
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
  const [phaseName, setPhaseName] = useState('Plan Based');
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
  const [userEmail, setUserEmail] = useState('');
  const [userGoal, setUserGoal] = useState('Select Goal');
  const [userId, setUserId] = useState('');

  // Custom Signup Fields
  const [gender, setGender] = useState('Select Gender');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [mealPreference, setMealPreference] = useState('Select Diet');
  const [timezone, setTimezone] = useState('Select Time Zone');

  // Token
  const [userToken, setUserToken] = useState('');

  // Quote state — persisted in context to prevent flicker on tab switch
  const [activeQuote, setActiveQuote] = useState('Every small effort today brings you closer to a stronger tomorrow.');

  // Security app background state lock tracking
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());

  // Session timeout: auto-logout if app is backgrounded for more than 30 minutes
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background') {
        // Record the time user left the app
        setLastActiveTime(Date.now());
      } else if (nextAppState === 'active') {
        const elapsed = Date.now() - lastActiveTime;
        // Auto-logout ONLY if backgrounded for more than 30 minutes
        if (isLoggedIn && elapsed > SESSION_TIMEOUT_MS) {
          logoutUser();
          alert("Session expired. Please log in again.");
        }
        // If returned within 30 minutes — session stays intact, no action needed
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, lastActiveTime]);

  // Restore session state on app mount with validation
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Load cached quote first for instant display
        const cachedQuote = await AsyncStorage.getItem('sbm_active_quote');
        if (cachedQuote) {
          setActiveQuote(cachedQuote);
        }

        const session = await AsyncStorage.getItem('sbm_user_session');
        if (session) {
          const { name, currentWeightVal, details } = JSON.parse(session);

          // Load pre-sbm score (non-user-specific, ok as only one user per device typically)
          try {
            const storedPreSbm = await AsyncStorage.getItem('sbm_pre_sbm_score');
            if (storedPreSbm !== null) {
              setPreSbmScore(parseInt(storedPreSbm, 10) || 0);
            }
          } catch (_) {}

          // Validate session by checking if userId exists and backend responds
          if (details && details.userId) {
            try {
              const response = await fetch(
                `https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/dashboard?userId=${details.userId}`
              );
              const result = await response.json();
              if (response.ok && result.status === 'success') {
                // Session is valid — restore user state (consistency loaded inside loginUser)
                loginUser(name, currentWeightVal, details);
              } else {
                // Backend rejected the userId — session is stale
                console.warn('Session validation failed, clearing stored session.');
                await AsyncStorage.removeItem('sbm_user_session');
                await AsyncStorage.removeItem('sbm_active_quote');
              }
            } catch (networkErr) {
              // Network error — still restore session for offline use
              console.warn('Network error during validation, restoring offline session.');
              loginUser(name, currentWeightVal, details);
            }
          } else {
            // No userId in stored session — invalid, clear it
            await AsyncStorage.removeItem('sbm_user_session');
          }
        }
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
      const response = await fetch(`https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/dashboard?userId=${targetUserId}`);
      const result = await response.json();
      if (response.ok && result.status === 'success') {
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
          // Consistency fields — returned by backend if table is configured
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
        if (average_effort_score !== undefined) setAverageEffortScore(average_effort_score);

        // Sync weekly progress efforts
        const updatedEfforts = [0, 0, 0, 0, today_effort_score];
        setWeeklyEfforts(updatedEfforts);

        // ── Consistency: prefer backend values if present, fallback to AsyncStorage ──
        // Backend may return these as: consistency_logged/consistency_total
        // OR days_logged/days_elapsed OR total_days_logged/total_days_elapsed
        const backendLogged = consistency_logged ?? days_logged ?? total_days_logged;
        const backendTotal  = consistency_total  ?? days_elapsed ?? total_days_elapsed;

        if (backendLogged !== undefined && backendLogged !== null && backendTotal !== undefined && backendTotal !== null) {
          // Backend has real data — use it as source of truth
          const bl = parseInt(backendLogged, 10) || 0;
          const bt = parseInt(backendTotal,  10) || 0;
          setConsistencyLogged(bl);
          setConsistencyTotal(bt);
          // Also cache locally with user-specific key
          const consistencyKey = `sbm_consistency_${targetUserId}`;
          await AsyncStorage.setItem(consistencyKey, JSON.stringify({ logged: bl, total: bt }));
        } else {
          // Backend not returning consistency — fall back to AsyncStorage
          const consistencyKey = `sbm_consistency_${targetUserId}`;
          const stored = await AsyncStorage.getItem(consistencyKey);
          if (stored) {
            const { logged, total } = JSON.parse(stored);
            setConsistencyLogged(logged || 0);
            setConsistencyTotal(total  || 0);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      // On network error — still load consistency from AsyncStorage cache
      const consistencyKey = uid ? `sbm_consistency_${uid}` : (userId ? `sbm_consistency_${userId}` : null);
      if (consistencyKey) {
        try {
          const stored = await AsyncStorage.getItem(consistencyKey);
          if (stored) {
            const { logged, total } = JSON.parse(stored);
            setConsistencyLogged(logged || 0);
            setConsistencyTotal(total  || 0);
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
      if (response.ok && data.status === 'success' && data.quote) {
        setActiveQuote(data.quote);
        // Cache to AsyncStorage for instant display on next mount
        await AsyncStorage.setItem('sbm_active_quote', data.quote);
      }
    } catch (err) {
      console.log('Error loading per-user quote:', err.message);
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
      // Backend sends finalPercentageScore (0-100 percentage already)
      // Store as-is for todayEffortScore display
      setTodayEffortScore(num);
      setTodayEffortLogged(true);
      setStreakDays(prev => prev + 1);

      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = num;
      setWeeklyEfforts(updatedEfforts);

      // Score is already a percentage (0-100) from backend — store directly
      const pct = Math.min(100, Math.max(0, num));

      // Bump consistency: logged one more day out of total days elapsed
      const newLogged = consistencyLogged + 1;
      const newTotal  = consistencyTotal + 1;
      setConsistencyLogged(newLogged);
      setConsistencyTotal(newTotal);

      // Persist to AsyncStorage using USER-SPECIFIC KEY so data survives re-login
      try {
        const consistencyKey = uid ? `sbm_consistency_${uid}` : 'sbm_consistency';
        const lastLogKey     = uid ? `sbm_last_log_date_${uid}` : 'sbm_last_log_date';
        await AsyncStorage.setItem('sbm_pre_sbm_score', String(pct));
        await AsyncStorage.setItem(consistencyKey, JSON.stringify({ logged: newLogged, total: newTotal }));
        await AsyncStorage.setItem(lastLogKey, new Date().toISOString().split('T')[0]);
      } catch (_) {}
    }
  };


  // Called each time the app is opened on a NEW calendar day where the user did NOT log:
  // increments consistencyTotal without incrementing consistencyLogged
  const markMissedDay = async () => {
    const newTotal = consistencyTotal + 1;
    setConsistencyTotal(newTotal);
    try {
      const consistencyKey = userId ? `sbm_consistency_${userId}` : 'sbm_consistency';
      await AsyncStorage.setItem(consistencyKey, JSON.stringify({ logged: consistencyLogged, total: newTotal }));
    } catch (_) {}
  };

  const updateUserProfile = async (updatedFields) => {
    const goalVal = updatedFields.Weight_Goal || updatedFields.weight_goal || updatedFields.weightGoal || updatedFields.userGoal || updatedFields.user_goal || updatedFields.goal;

    if (updatedFields.username !== undefined) setUsername(updatedFields.username);
    if (goalVal !== undefined) setUserGoal(goalVal);
    if (updatedFields.gender !== undefined) setGender(updatedFields.gender);
    if (updatedFields.age !== undefined) setAge(updatedFields.age);
    if (updatedFields.height !== undefined) setHeight(updatedFields.height);
    if (updatedFields.mealPreference !== undefined) setMealPreference(updatedFields.mealPreference);
    if (updatedFields.timezone !== undefined) setTimezone(updatedFields.timezone);

    // Persist to AsyncStorage session
    try {
      const session = await AsyncStorage.getItem('sbm_user_session');
      if (session) {
        const parsed = JSON.parse(session);
        const newSession = {
          ...parsed,
          name: updatedFields.username !== undefined ? updatedFields.username : parsed.name,
          details: {
            ...parsed.details,
            userGoal:       goalVal !== undefined ? goalVal : parsed.details?.userGoal,
            Weight_Goal:    goalVal !== undefined ? goalVal : parsed.details?.Weight_Goal,
            weight_goal:    goalVal !== undefined ? goalVal : parsed.details?.weight_goal,
            gender:         updatedFields.gender !== undefined ? updatedFields.gender : parsed.details?.gender,
            age:            updatedFields.age !== undefined ? updatedFields.age : parsed.details?.age,
            height:         updatedFields.height !== undefined ? updatedFields.height : parsed.details?.height,
            mealPreference: updatedFields.mealPreference !== undefined ? updatedFields.mealPreference : parsed.details?.mealPreference,
            timezone:       updatedFields.timezone !== undefined ? updatedFields.timezone : parsed.details?.timezone,
          }
        };
        await AsyncStorage.setItem('sbm_user_session', JSON.stringify(newSession));
      }
    } catch (e) {
      console.error("Failed to update user session storage:", e);
    }
  };

  const loginUser = (name, currentWeightVal, details = {}) => {

    if (name && name.trim() !== '') {
      setUsername(name);
    } else {
      setUsername('Customer');
    }
    
    if (details.email) setUserEmail(details.email);
    if (details.userId) setUserId(details.userId);
    if (details.token) setUserToken(details.token);

    const numericWeight = parseFloat(currentWeightVal);
    if (!isNaN(numericWeight)) {
      setLoggedWeight(numericWeight);
      setStartWeight(numericWeight);
    }

    const goalVal = details.Weight_Goal || details.weight_goal || details.weightGoal || details.userGoal || details.user_goal || details.goal;

    if (details.gender) setGender(details.gender);
    if (details.age) setAge(parseInt(details.age, 10));
    if (details.height) setHeight(parseFloat(details.height));
    if (details.mealPreference) setMealPreference(details.mealPreference);
    if (details.timezone) setTimezone(details.timezone);
    if (goalVal) setUserGoal(goalVal);

    setIsLoggedIn(true);

    // Save session to AsyncStorage for persistence (properly awaited)
    const saveSession = async () => {
      try {
        await AsyncStorage.setItem('sbm_user_session', JSON.stringify({
          name,
          currentWeightVal,
          details
        }));
      } catch (e) {
        console.error("Failed to save session:", e);
      }
    };
    saveSession();

    // Load user-specific consistency data from AsyncStorage (ensures data survives re-login)
    if (details.userId) {
      // Clear legacy state before loading new user data
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

    // Dynamic initial loading of user metrics and quote from Catalyst database
    if (details.userId) {
      fetchDashboardData(details.userId);
      fetchQuote(details.userId);
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    // Reset states
    setTodayEffortLogged(false);
    setTodayEffortScore(0);
    setTodayWeightLogged(false);
    setUsername('Guest');
    setUserEmail('');
    setUserId('');
    setUserToken('');
    setGender('Select Gender');
    setAge('');
    setHeight('');
    setMealPreference('Select Diet');
    setTimezone('Select Time Zone');
    setUserGoal('Select Goal');
    setLoggedWeight(0.0);
    setStartWeight(0.0);
    setStreakDays(0);
    setConsistencyLogged(0);
    setConsistencyTotal(0);
    setAverageEffortScore(0);
    setNutritionScore(0);
    setMovementScore(0);
    setRecoveryScore(0);
    setMindsetScore(0);
    setHydrationScore(0);
    setWeeklyEfforts([0, 0, 0, 0, 0]);
    setHistoryLogs([]);

    // Reset quote to default
    setActiveQuote('Every small effort today brings you closer to a stronger tomorrow.');

    // Clear session and cached quote from AsyncStorage (properly awaited)
    const clearSession = async () => {
      try {
        await AsyncStorage.removeItem('sbm_user_session');
        await AsyncStorage.removeItem('sbm_active_quote');
        await AsyncStorage.removeItem('sbm_pre_sbm_score');
        await AsyncStorage.removeItem('sbm_consistency');
      } catch (e) {
        console.error("Failed to clear session:", e);
      }
    };
    clearSession();
  };

  // ── Missed day detection: run on app open ───────────────────────────────────
  // Checks last-log-date in AsyncStorage vs today using user-specific key
  const checkAndMarkMissedDays = async () => {
    try {
      const lastLogKey = userId ? `sbm_last_log_date_${userId}` : 'sbm_last_log_date';
      const consistencyKey = userId ? `sbm_consistency_${userId}` : 'sbm_consistency';
      const stored = await AsyncStorage.getItem(lastLogKey);
      const today  = new Date().toISOString().split('T')[0];
      if (stored && stored !== today) {
        // Count calendar days between last log and today (exclusive of today)
        const last     = new Date(stored);
        const todayD   = new Date(today);
        const diffMs   = todayD - last;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          // Missed (diffDays - 1) days between last log and today
          const missed   = diffDays - 1;
          const newTotal = consistencyTotal + missed;
          setConsistencyTotal(newTotal);
          await AsyncStorage.setItem(consistencyKey, JSON.stringify({ logged: consistencyLogged, total: newTotal }));
        }
      }
    } catch (_) {}
  };

  return (
    <UserContext.Provider value={{
      isSessionLoading,
      isLoggedIn,
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
      loginUser,
      logoutUser,
      updateUserProfile,
      markMissedDay,
      checkAndMarkMissedDays,
    }}>

      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
export const useUser = () => useContext(UserContext);
