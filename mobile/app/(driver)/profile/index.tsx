import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Card, Avatar, Badge, ListItem } from '../../../src/components/common';

const menuItems = [
  {
    id: 'vehicles',
    title: 'My Vehicles',
    subtitle: 'Manage your saved vehicles',
    icon: 'directions-car' as const,
    route: '/(driver)/profile/vehicles',
    badge: '2',
  },
  {
    id: 'history',
    title: 'Diagnosis History',
    subtitle: 'View past diagnoses',
    icon: 'history' as const,
    route: '/(driver)/profile/history',
  },
  {
    id: 'bookmarks',
    title: 'Saved Articles',
    subtitle: 'Your bookmarked content',
    icon: 'bookmark' as const,
    route: '/(driver)/profile/bookmarks',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    subtitle: 'Manage your alerts',
    icon: 'notifications' as const,
    route: '/(shared)/notifications',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences',
    icon: 'settings' as const,
    route: '/(driver)/profile/settings',
  },
  {
    id: 'help',
    title: 'Help & Support',
    subtitle: 'FAQs and contact us',
    icon: 'help' as const,
    route: '/(shared)/help',
  },
];

const stats = [
  { label: 'Diagnoses', value: '12' },
  { label: 'Vehicles', value: '2' },
  { label: 'Saved', value: '8' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="px-4 pb-6">
          <Card variant="default" className="items-center py-6">
            <TouchableOpacity
              onPress={() => router.push('/(driver)/profile/edit')}
              className="relative"
            >
              <Avatar
                size="xl"
                source={user?.avatar ? { uri: user.avatar } : undefined}
                name={user?.fullName || 'Guest User'}
              />
              <View className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-500 items-center justify-center border-2 border-white">
                <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text className={`text-xl font-bold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user?.fullName || 'Guest User'}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {user?.email || 'guest@driveassist.com'}
            </Text>

            {user?.isGuest && (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up')}
                className="mt-3"
              >
                <Badge label="Create Account" variant="warning" />
              </TouchableOpacity>
            )}

            {/* Stats */}
            <View className="flex-row mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 w-full justify-around">
              {stats.map((stat) => (
                <View key={stat.label} className="items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {stat.value}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Membership Card */}
        <View className="px-4 pb-6">
          <TouchableOpacity activeOpacity={0.8}>
            <View className="rounded-xl overflow-hidden">
              <View className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4">
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-white/80 text-sm">Current Plan</Text>
                    <Text className="text-white text-xl font-bold">Free Plan</Text>
                  </View>
                  <View className="bg-white/20 px-3 py-1 rounded-full">
                    <Text className="text-white font-semibold">Upgrade</Text>
                  </View>
                </View>
                <View className="mt-4">
                  <Text className="text-white/80 text-sm">5 diagnoses remaining this month</Text>
                  <View className="h-2 bg-white/20 rounded-full mt-2">
                    <View className="h-full bg-white rounded-full" style={{ width: '50%' }} />
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View className="px-4 pb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ACCOUNT
          </Text>
          <Card variant="default" padding="none">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route as any)}
                className={`flex-row items-center p-4 ${
                  index !== menuItems.length - 1
                    ? `border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`
                    : ''
                }`}
              >
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons
                    name={item.icon}
                    size={22}
                    color={isDark ? '#94A3B8' : '#64748B'}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.subtitle}
                  </Text>
                </View>
                {item.badge && (
                  <View className="bg-primary-500 h-6 min-w-[24px] rounded-full items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold px-2">{item.badge}</Text>
                  </View>
                )}
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={isDark ? '#475569' : '#94A3B8'}
                />
              </TouchableOpacity>
            ))}
          </Card>
        </View>

        {/* App Info */}
        <View className="px-4 pb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ABOUT
          </Text>
          <Card variant="default" padding="none">
            <TouchableOpacity
              className={`flex-row items-center p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
            >
              <View
                className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
              >
                <MaterialIcons
                  name="info"
                  size={22}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  About DriveAssist
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Version 1.0.0
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isDark ? '#475569' : '#94A3B8'}
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4">
              <View
                className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
              >
                <MaterialIcons
                  name="star"
                  size={22}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Rate the App
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Share your feedback
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isDark ? '#475569' : '#94A3B8'}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Sign Out Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className={`flex-row items-center justify-center p-4 rounded-xl ${
              isDark ? 'bg-red-500/10' : 'bg-red-50'
            }`}
          >
            <MaterialIcons name="logout" size={22} color="#EF4444" />
            <Text className="text-red-500 font-semibold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
