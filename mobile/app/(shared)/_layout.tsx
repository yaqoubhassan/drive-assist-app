import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function SharedLayout() {
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
      <Stack.Screen name="messages" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="help" />
    </Stack>
  );
}
