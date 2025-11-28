import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AlertProvider } from '../src/context/AlertContext';
import { DiagnosisProvider } from '../src/context/DiagnosisContext';

import '../global.css';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isDark } = useTheme();

  useEffect(() => {
    // Hide splash screen once everything is loaded
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 200,
          contentStyle: {
            backgroundColor: isDark ? '#111827' : '#FFFFFF',
          },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(driver)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(expert)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(shared)" options={{ animation: 'slide_from_right', animationDuration: 250 }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <DiagnosisProvider>
              <AlertProvider>
                <RootLayoutNav />
              </AlertProvider>
            </DiagnosisProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
