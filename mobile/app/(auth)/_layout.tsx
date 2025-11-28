import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function AuthLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="sign-in" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="sign-up" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="verify-email" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="expert-onboarding" options={{ gestureEnabled: false, animation: 'fade' }} />
    </Stack>
  );
}
