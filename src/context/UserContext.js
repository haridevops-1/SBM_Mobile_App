import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Shared user states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');
  const [todayEffortLogged, setTodayEffortLogged] = useState(false);
  const [todayEffortScore, setTodayEffortScore] = useState(0);
  const [todayWeightLogged, setTodayWeightLogged] = useState(false);
  
  // Weight parameters (Start vs Current)
  const [startWeight, setStartWeight] = useState(70.0);
  const [loggedWeight, setLoggedWeight] = useState(70.0);
  
  // Streak
  const [streakDays, setStreakDays] = useState(0);

  // Daily questions completion count
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

  // Actions to mutate states dynamically
  const toggleTodayEffort = () => {
    if (!todayEffortLogged) {
      setTodayEffortLogged(true);
      setStreakDays(1); // streak increases
      
      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = 78; // Friday becomes 78%
      setWeeklyEfforts(updatedEfforts);

      setNutritionScore(8);
      setMovementScore(7);
    } else {
      setTodayEffortLogged(false);
      setStreakDays(0); // revert streak
      
      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = 0; // Friday goes back to 0
      setWeeklyEfforts(updatedEfforts);

      setNutritionScore(7);
      setMovementScore(6);
    }
  };

  const logTodayEffort = (score) => {
    const num = parseInt(score, 10);
    if (!isNaN(num)) {
      setTodayEffortScore(num);
      setTodayEffortLogged(true);
      setStreakDays(1);
      
      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = num;
      setWeeklyEfforts(updatedEfforts);

      if (num >= 80) {
        setNutritionScore(9);
        setMovementScore(8);
        setRecoveryScore(8);
        setMindsetScore(8);
        setHydrationScore(9);
      } else if (num >= 55) {
        setNutritionScore(7);
        setMovementScore(6);
        setRecoveryScore(7);
        setMindsetScore(6);
        setHydrationScore(7);
      } else {
        setNutritionScore(4);
        setMovementScore(3);
        setRecoveryScore(5);
        setMindsetScore(4);
        setHydrationScore(4);
      }
    }
  };

  const logWeight = (weightValue) => {
    const numericWeight = parseFloat(weightValue);
    if (!isNaN(numericWeight)) {
      setLoggedWeight(numericWeight);
      setTodayWeightLogged(true);
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
      setStartWeight(numericWeight); // Start matches current
    }

    if (details.gender) setGender(details.gender);
    if (details.age) setAge(parseInt(details.age, 10));
    if (details.height) setHeight(parseFloat(details.height));
    if (details.mealPreference) setMealPreference(details.mealPreference);
    if (details.timezone) setTimezone(details.timezone);
    if (details.userGoal) setUserGoal(details.userGoal);

    setIsLoggedIn(true);
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
  };

  return (
    <UserContext.Provider value={{
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
      setUserGoal,
      toggleTodayEffort,
      logTodayEffort,
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
