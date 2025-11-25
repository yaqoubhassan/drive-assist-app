import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Platform } from 'react-native';

export default function DriverLayout() {
  const { isDark } = useTheme();
  const { userType } = useAuth();
  const router = useRouter();

  const isGuest = userType === 'guest';

  // Route protection - redirect experts to expert routes
  useEffect(() => {
    if (userType === 'expert') {
      router.replace('/(expert)');
    }
  }, [userType]);

  // Don't render if user is an expert
  if (userType === 'expert') {
    return null;
  }

  const tabBarBackground = isDark ? '#111827' : '#FFFFFF';
  const tabBarBorder = isDark ? '#1F2937' : '#E5E7EB';
  const activeColor = '#3B82F6';
  const inactiveColor = isDark ? '#64748B' : '#94A3B8';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBarBackground,
          borderTopColor: tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="diagnose"
        options={{
          title: 'Diagnose',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="add-circle" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Reset the diagnose stack to the index screen when tab is pressed
            e.preventDefault();
            router.replace('/(driver)/diagnose');
          },
        }}
      />
      <Tabs.Screen
        name="experts"
        options={{
          title: 'Experts',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
          // Hide profile tab for guests
          href: isGuest ? null : '/(driver)/profile',
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          // Hide booking from tab bar (it's accessed via navigation)
          href: null,
        }}
      />
    </Tabs>
  );
}
