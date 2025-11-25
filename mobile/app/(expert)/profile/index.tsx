import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Card, Avatar, Badge, Rating } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

const getMenuItems = (kycStatus: string) => [
  {
    id: 'services',
    title: 'My Services',
    subtitle: 'Manage your service offerings',
    icon: 'build' as const,
    route: '/(expert)/profile/services',
  },
  {
    id: 'reviews',
    title: 'Reviews',
    subtitle: '47 customer reviews',
    icon: 'star' as const,
    route: '/(expert)/profile/reviews',
    badge: '4.8',
  },
  {
    id: 'availability',
    title: 'Availability',
    subtitle: 'Set your working hours',
    icon: 'schedule' as const,
    route: '/(expert)/profile/availability',
  },
  {
    id: 'documents',
    title: 'KYC Verification',
    subtitle: kycStatus === 'approved'
      ? 'Verified - All documents approved'
      : kycStatus === 'submitted' || kycStatus === 'under_review'
      ? 'Under review'
      : 'Complete verification to unlock features',
    icon: 'verified-user' as const,
    route: '/(expert)/profile/documents',
    kycStatus: kycStatus,
  },
  {
    id: 'payment-accounts',
    title: 'Payment Accounts',
    subtitle: 'Manage your payout methods',
    icon: 'account-balance-wallet' as const,
    route: '/(expert)/profile/payment-accounts',
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences',
    icon: 'settings' as const,
    route: '/(expert)/profile/settings',
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
  { label: 'Jobs Done', value: '47' },
  { label: 'Earnings', value: 'GH₵12.4K' },
  { label: 'Rating', value: '4.8' },
];

const specializations = ['Engine Repair', 'Transmission', 'Brakes', 'Electrical', 'AC/Heating'];

export default function ExpertProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, signOut, kycStatus } = useAuth();

  const menuItems = getMenuItems(kycStatus);

  const handleSignOut = () => {
    signOut();
    router.replace('/(auth)/welcome');
  };

  const getKycBadge = () => {
    if (kycStatus === 'approved') {
      return <Badge label="Verified Expert" variant="success" size="sm" />;
    }
    if (kycStatus === 'submitted' || kycStatus === 'under_review') {
      return <Badge label="Verification Pending" variant="warning" size="sm" />;
    }
    return <Badge label="Unverified" variant="default" size="sm" />;
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
              onPress={() => router.push('/(expert)/profile/edit')}
              className="relative"
            >
              <Avatar
                size="xl"
                source={user?.avatar ? { uri: user.avatar } : undefined}
                name={user?.fullName || 'Expert User'}
              />
              <View className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-500 items-center justify-center border-2 border-white">
                <MaterialIcons name="edit" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <Text className={`text-xl font-bold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {user?.fullName || 'Expert User'}
            </Text>
            <View className="flex-row items-center mt-1">
              {getKycBadge()}
            </View>

            <View className="flex-row items-center mt-2">
              <Rating value={4.8} size="sm" showValue />
              <Text className={`text-sm ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                (47 reviews)
              </Text>
            </View>

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

        {/* Specializations */}
        <View className="px-4 pb-6">
          <Card variant="default">
            <Text className={`font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Specializations
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {specializations.map((spec) => (
                <View
                  key={spec}
                  className={`px-3 py-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                >
                  <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {spec}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Performance Summary */}
        <View className="px-4 pb-6">
          <Card variant="default">
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                This Month's Performance
              </Text>
              <TouchableOpacity>
                <Text className="text-primary-500 font-semibold text-sm">View Details</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="check-circle" size={18} color="#10B981" />
                  <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Response Rate
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>95%</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="schedule" size={18} color="#3B82F6" />
                  <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Avg. Response Time
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>15 min</Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <MaterialIcons name="thumb-up" size={18} color="#F59E0B" />
                  <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Job Completion
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>98%</Text>
              </View>
            </View>
          </Card>
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
                  <View className="flex-row items-center mr-2">
                    <MaterialIcons name="star" size={16} color="#F59E0B" />
                    <Text className="text-yellow-500 font-bold ml-1">{item.badge}</Text>
                  </View>
                )}
                {item.id === 'documents' && (
                  <View className="mr-2">
                    {(item as any).kycStatus === 'approved' ? (
                      <MaterialIcons name="check-circle" size={20} color="#10B981" />
                    ) : (item as any).kycStatus === 'submitted' || (item as any).kycStatus === 'under_review' ? (
                      <MaterialIcons name="hourglass-empty" size={20} color="#F59E0B" />
                    ) : (
                      <View className="h-5 w-5 rounded-full bg-orange-500 items-center justify-center">
                        <Text className="text-white text-xs font-bold">!</Text>
                      </View>
                    )}
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
