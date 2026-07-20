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

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background') {
        setLastActiveTime(Date.now());
      } else if (nextAppState === 'active') {
        const elapsed = Date.now() - lastActiveTime;
        // Auto-logout if backgrounded for more than 2 minutes for profile protection
        if (isLoggedIn && elapsed > 120000) {
          logoutUser();
          alert("Session expired for security. Please log in again.");
        }
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
          
          // Validate session by checking if userId exists and backend responds
          if (details && details.userId) {
            try {
              const response = await fetch(
                `https://sbm-mobile-app-906714478.development.catalystserverless.com/tracker/dashboard?userId=${details.userId}`
              );
              const result = await response.json();
              if (response.ok && result.status === 'success') {
                // Session is valid — restore user state
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
          average_effort_score
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
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
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

  const logTodayEffort = (score) => {
    const num = parseInt(score, 10);
    if (!isNaN(num)) {
      setTodayEffortScore(num);
      setTodayEffortLogged(true);
      setStreakDays(prev => prev + 1);
      
      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = num;
      setWeeklyEfforts(updatedEfforts);
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

    if (details.gender) setGender(details.gender);
    if (details.age) setAge(parseInt(details.age, 10));
    if (details.height) setHeight(parseFloat(details.height));
    if (details.mealPreference) setMealPreference(details.mealPreference);
    if (details.timezone) setTimezone(details.timezone);
    if (details.userGoal) setUserGoal(details.userGoal);

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
      } catch (e) {
        console.error("Failed to clear session:", e);
      }
    };
    clearSession();
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
      logoutUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
export const useUser = () => useContext(UserContext);
