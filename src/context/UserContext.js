import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Shared user states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Harish');
  const [todayEffortLogged, setTodayEffortLogged] = useState(false);
  const [todayWeightLogged, setTodayWeightLogged] = useState(false);
  
  // Weight parameters (Start vs Current)
  const [startWeight, setStartWeight] = useState(80.8);
  const [loggedWeight, setLoggedWeight] = useState(77.8);
  
  // Streak
  const [streakDays, setStreakDays] = useState(12);

  // Daily questions completion count
  const [nutritionScore, setNutritionScore] = useState(7);
  const [movementScore, setMovementScore] = useState(6);
  const [recoveryScore, setRecoveryScore] = useState(8);
  const [mindsetScore, setMindsetScore] = useState(5);
  const [hydrationScore, setHydrationScore] = useState(7);

  // Weekly efforts progress data (Mon - Fri)
  const [weeklyEfforts, setWeeklyEfforts] = useState([65, 72, 58, 85, 0]);

  // Profile details states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('harish@example.com');
  const [userGoal, setUserGoal] = useState('Fat Loss');
  const [userId, setUserId] = useState('SBM-49021-HR');

  // Custom Signup Fields
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(175);
  const [mealPreference, setMealPreference] = useState('Veg');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // Actions to mutate states dynamically
  const toggleTodayEffort = () => {
    if (!todayEffortLogged) {
      setTodayEffortLogged(true);
      setStreakDays(13); // streak increases
      
      // Update Friday's effort in weekly chart
      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = 78; // Friday becomes 78%
      setWeeklyEfforts(updatedEfforts);

      // Increment completed questions count
      setNutritionScore(8);
      setMovementScore(7);
    } else {
      setTodayEffortLogged(false);
      setStreakDays(12); // revert streak
      
      const updatedEfforts = [...weeklyEfforts];
      updatedEfforts[4] = 0; // Friday goes back to 0
      setWeeklyEfforts(updatedEfforts);

      setNutritionScore(7);
      setMovementScore(6);
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
      setUserEmail(details.email || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`);
      const initials = name.substring(0, 2).toUpperCase();
      setUserId(`SBM-${Math.floor(10000 + Math.random() * 90000)}-${initials}`);
    } else {
      setUsername('Harish');
      setUserEmail('harish@example.com');
      setUserId('SBM-49021-HR');
    }
    const numericWeight = parseFloat(currentWeightVal);
    if (!isNaN(numericWeight)) {
      setLoggedWeight(numericWeight);
      setStartWeight(parseFloat((numericWeight + 3.0).toFixed(1))); // offset start weight
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
    setTodayWeightLogged(false);
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
      setUserGoal,
      toggleTodayEffort,
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
