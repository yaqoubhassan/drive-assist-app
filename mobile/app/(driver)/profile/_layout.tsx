import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';

export default function ProfileLayout() {
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
      <Stack.Screen name="vehicles" />
      <Stack.Screen name="vehicle-edit" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="history" />
      <Stack.Screen name="bookmarks" />
    </Stack>
  );
}
