import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../pages/Home/Home';
import EffortsScreen from '../pages/Efforts/Efforts';
import ResultsScreen from '../pages/Results/Results';
import ResourcesScreen from '../pages/Resources/Resources';
import SupportScreen from '../pages/Support/Support';
import BottomNav from '../components/BottomNav/BottomNav';

const Tab = createBottomTabNavigator();

export const AppRouter = () => {
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

export default AppRouter;
