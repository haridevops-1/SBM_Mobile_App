  import React from 'react';
  import { View, Text, useWindowDimensions, Platform, LogBox, ActivityIndicator } from 'react-native';
  import { NavigationContainer } from '@react-navigation/native';
  import { StatusBar } from 'expo-status-bar';
  import { UserProvider, useUser } from './src/context/UserContext';
  import AuthScreen from './src/pages/Auth/Auth';
  import AppRouter from './src/router/AppRouter';
  import AdminFlow from './src/pages/Admin/AdminFlow';

  // Ignore noisy deprecated package warning logs in development and simulator runs
  LogBox.ignoreLogs([
    '[expo-av]',
    'SafeAreaView has been deprecated',
    'setLayoutAnimationEnabledExperimental is currently a no-op',
    'setLayoutAnimationEnabledExperimental',
  ]);

  function MainApp() {
    const { isLoggedIn, isSessionLoading, userRole } = useUser();
    const { width } = useWindowDimensions();
    
    const isWebDesktop = Platform.OS === 'web' && width > 768;

    const renderContent = () => {
      // Show branded loading screen while session is being validated
      if (isSessionLoading) {
        return (
          <View style={{ flex: 1, backgroundColor: '#060813', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#B085F5', marginBottom: 8, letterSpacing: 2 }}>SBM</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 24, fontWeight: '500' }}>Loading your session...</Text>
            <ActivityIndicator size="large" color="#B085F5" />
          </View>
        );
      }

      if (!isLoggedIn) {
        return <AuthScreen />;
      }

      if (userRole === 'admin') {
        return <AdminFlow />;
      }

      return (
        <NavigationContainer>
          <AppRouter />
        </NavigationContainer>
      );
    };

    return (
      <View style={{
        flex: 1,
        backgroundColor: '#03040B', // Premium dark space backdrop
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
      }}>
        <View style={{
          flex: 1,
          backgroundColor: '#060813', // Simulator background
          width: isWebDesktop ? 440 : '100%',
          maxWidth: isWebDesktop ? 440 : '100%',
          alignSelf: 'center',
          borderLeftWidth: isWebDesktop ? 1 : 0,
          borderRightWidth: isWebDesktop ? 1 : 0,
          borderColor: 'rgba(255, 255, 255, 0.06)',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: isWebDesktop ? 0.6 : 0,
          shadowRadius: 40,
          elevation: isWebDesktop ? 20 : 0,
        }}>
          {renderContent()}
        </View>
      </View>
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
