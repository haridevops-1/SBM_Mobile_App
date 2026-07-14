import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { UserProvider, useUser } from './src/context/UserContext';
import AuthScreen from './src/screens/Auth/Auth';
import AppNavigator from './src/navigation/AppNavigator';

function MainApp() {
  const { isLoggedIn } = useUser();

  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="light" />
      <MainApp />
    </UserProvider>
  );
}
