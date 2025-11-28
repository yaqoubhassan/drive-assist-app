import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';

export default function DiagnoseLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        contentStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="describe" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="review" />
      <Stack.Screen name="loading" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="results" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
