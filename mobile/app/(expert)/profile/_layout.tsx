import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';

export default function ExpertProfileLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="services" />
      <Stack.Screen name="reviews" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
