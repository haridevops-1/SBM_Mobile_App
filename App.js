  import React from 'react';
  import { View, useWindowDimensions, Platform, LogBox } from 'react-native';
  import { NavigationContainer } from '@react-navigation/native';
  import { StatusBar } from 'expo-status-bar';
  import { UserProvider, useUser } from './src/context/UserContext';
  import AuthScreen from './src/pages/Auth/Auth';
  import AppRouter from './src/router/AppRouter';

  // Ignore noisy deprecated package warning logs in development and simulator runs
  LogBox.ignoreLogs([
    '[expo-av]',
    'SafeAreaView has been deprecated',
  ]);

  function MainApp() {
    const { isLoggedIn } = useUser();
    const { width } = useWindowDimensions();
    
    const isWebDesktop = Platform.OS === 'web' && width > 768;

    const renderContent = () => {
      if (!isLoggedIn) {
        return <AuthScreen />;
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
