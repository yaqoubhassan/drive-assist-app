import { Stack } from 'expo-router';
import { useTheme } from '../../../src/context/ThemeContext';

export default function NotificationsLayout() {
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
    </Stack>
  );
}
