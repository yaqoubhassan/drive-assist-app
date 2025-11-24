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
        contentStyle: {
          backgroundColor: isDark ? '#111827' : '#FFFFFF',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="describe" />
      <Stack.Screen name="vehicle" />
      <Stack.Screen name="review" />
      <Stack.Screen name="loading" options={{ gestureEnabled: false }} />
      <Stack.Screen name="results" />
    </Stack>
  );
}
