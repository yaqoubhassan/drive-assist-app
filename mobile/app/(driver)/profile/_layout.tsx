import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';

export default function ProfileLayout() {
  const { isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        contentStyle: {
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
        },
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="edit" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="vehicles" />
      <Stack.Screen name="vehicle-edit" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings" />
      <Stack.Screen name="history" />
      <Stack.Screen name="bookmarks" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}
