import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/Home';
import EffortsScreen from '../screens/Efforts/Efforts';
import ResultsScreen from '../screens/Results/Results';
import ResourcesScreen from '../screens/Resources/Resources';
import SupportScreen from '../screens/Support/Support';
import BottomNav from '../components/BottomNav/BottomNav';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Tracker" component={HomeScreen} />
      <Tab.Screen name="Efforts" component={EffortsScreen} />
      <Tab.Screen name="Results" component={ResultsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Support" component={SupportScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
