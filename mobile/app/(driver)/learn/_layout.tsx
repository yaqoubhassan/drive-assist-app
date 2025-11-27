import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';

export default function LearnLayout() {
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
      <Stack.Screen name="article/[id]" />
      <Stack.Screen name="category/[id]" />
      <Stack.Screen name="road-signs" />
      <Stack.Screen name="quiz/index" />
      <Stack.Screen name="quiz/[category]" />
      <Stack.Screen name="quiz/results" />
    </Stack>
  );
}
