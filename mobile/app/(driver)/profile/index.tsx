import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Card, Badge, Skeleton } from '../../../src/components/common';
import { transformAvatarUrl } from '../../../src/services/profile';
import vehicleService from '../../../src/services/vehicle';
import api from '../../../src/services/api';
import { apiConfig } from '../../../src/config/api';

interface ProfileStats {
  diagnoses: number;
  vehicles: number;
  appointments: number;
}

const menuItems = [
  {
    id: 'vehicles',
    title: 'My Vehicles',
    subtitle: 'Manage your saved vehicles',
    icon: 'directions-car' as const,
    route: '/(driver)/profile/vehicles',
  },
  {
    id: 'reminders',
    title: 'Maintenance Reminders',
    subtitle: 'Track your vehicle maintenance',
    icon: 'event' as const,
    route: '/(driver)/profile/reminders',
  },
  {
    id: 'history',
    title: 'Diagnosis History',
    subtitle: 'View past diagnoses',
    icon: 'history' as const,
    route: '/(driver)/profile/history',
  },
  {
    id: 'appointments',
    title: 'My Appointments',
    subtitle: 'View and manage bookings',
    icon: 'event-available' as const,
    route: '/(driver)/appointments',
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

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, signOut } = useAuth();

  const [stats, setStats] = useState<ProfileStats>({
    diagnoses: 0,
    vehicles: 0,
    appointments: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const fetchStats = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingStats(true);

      // Fetch all stats in parallel
      const [vehiclesResponse, diagnosesResponse, appointmentsResponse] = await Promise.all([
        vehicleService.getVehicles().catch(() => []),
        api.get<{ data: unknown[] }>(apiConfig.endpoints.diagnoses.list).catch(() => ({ data: { data: [] } })),
        api.get<{ count: number }>(apiConfig.endpoints.appointments.upcomingCount).catch(() => ({ data: { count: 0 } })),
      ]);

      setStats({
        vehicles: Array.isArray(vehiclesResponse) ? vehiclesResponse.length : 0,
        diagnoses: diagnosesResponse?.data?.data ? diagnosesResponse.data.data.length : 0,
        appointments: appointmentsResponse?.data?.count ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch profile stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch stats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats(false); // Don't show skeleton during pull-to-refresh
    setRefreshing(false);
  };

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/welcome');
  };

  // Transform avatar URL for mobile device compatibility
  const avatarUrl = transformAvatarUrl(user?.avatar);
  console.log('[ProfileScreen] user?.avatar:', user?.avatar);
  console.log('[ProfileScreen] transformed avatarUrl:', avatarUrl);

  const statsDisplay = [
    { label: 'Diagnoses', value: stats.diagnoses.toString() },
    { label: 'Vehicles', value: stats.vehicles.toString() },
    { label: 'Appointments', value: stats.appointments.toString() },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 py-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Profile
          </Text>
        </View>

        {/* Profile Card */}
        <View className="px-4 pb-6">
          <Card variant="default" className="items-center py-6">
            {/* Avatar with tap to preview */}
            <TouchableOpacity
              onPress={() => avatarUrl ? setShowImagePreview(true) : router.push('/(driver)/profile/edit')}
              className="relative"
              activeOpacity={0.8}
            >
              {avatarUrl ? (
                <View className="rounded-full overflow-hidden" style={{ width: 96, height: 96 }}>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View
                  className="rounded-full items-center justify-center"
                  style={{
                    width: 96,
                    height: 96,
                    backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
                  }}
                >
                  <Text className={`text-3xl font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {(user?.fullName || 'G').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Edit button - separate from avatar */}
            <TouchableOpacity
              onPress={() => router.push('/(driver)/profile/edit')}
              className="absolute top-6 right-6"
            >
              <View className="h-8 w-8 rounded-full bg-primary-500 items-center justify-center">
                <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text className={`text-xl font-bold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user?.fullName || 'Guest User'}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {user?.email || 'guest@driveassist.com'}
            </Text>

            {avatarUrl && (
              <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Tap photo to preview
              </Text>
            )}

            {user?.isGuest && (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up')}
                className="mt-3"
              >
                <Badge label="Create Account" variant="warning" />
              </TouchableOpacity>
            )}

            {/* Stats with skeleton loading */}
            <View className="flex-row mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 w-full justify-around">
              {loadingStats ? (
                // Skeleton loading state
                <>
                  {[1, 2, 3].map((i) => (
                    <View key={i} className="items-center">
                      <Skeleton width={40} height={28} borderRadius={6} style={{ marginBottom: 4 }} />
                      <Skeleton width={70} height={14} borderRadius={4} />
                    </View>
                  ))}
                </>
              ) : (
                // Loaded state
                statsDisplay.map((stat) => (
                  <View key={stat.label} className="items-center">
                    <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {stat.value}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stat.label}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </Card>
        </View>

        {/* Membership Card */}
        <View className="px-4 pb-6">
          <TouchableOpacity activeOpacity={0.8}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-xl overflow-hidden p-4"
            >
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
            </LinearGradient>
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

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <View className="flex-1 bg-black items-center justify-center">
          {/* Close button */}
          <TouchableOpacity
            onPress={() => setShowImagePreview(false)}
            className="absolute top-12 right-4 z-10 h-10 w-10 rounded-full bg-black/50 items-center justify-center"
          >
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Full screen image */}
          {avatarUrl && (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          )}

          {/* Edit button */}
          <View className="absolute bottom-12 left-0 right-0 px-6">
            <TouchableOpacity
              onPress={() => {
                setShowImagePreview(false);
                // Small delay on iOS to let modal close animation complete
                setTimeout(() => {
                  router.push('/(driver)/profile/edit');
                }, Platform.OS === 'ios' ? 300 : 0);
              }}
              className="flex-row items-center justify-center py-4 rounded-xl bg-white/10"
            >
              <MaterialIcons name="edit" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
