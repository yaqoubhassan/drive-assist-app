import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Badge, EmptyState } from '../../../src/components/common';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'lead' | 'payment' | 'system' | 'promotion';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your appointment with Emmanuel Auto Services is confirmed for tomorrow at 2:00 PM.',
    time: '5 min ago',
    read: false,
    actionUrl: '/(driver)/profile/history',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Kwame Asante sent you a message: "Thanks! The car is running great now."',
    time: '10 min ago',
    read: false,
    actionUrl: '/(shared)/messages/1',
  },
  {
    id: '3',
    type: 'lead',
    title: 'New Lead Available',
    message: 'A new customer needs help with engine overheating in East Legon. 2.3 km away.',
    time: '25 min ago',
    read: false,
    actionUrl: '/(expert)/leads/1',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received GH₵1,500 from Yaw Boateng for transmission repair.',
    time: '1 hour ago',
    read: true,
    actionUrl: '/(expert)/earnings',
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile Verified',
    message: 'Congratulations! Your expert profile has been verified. You can now receive leads.',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '6',
    type: 'booking',
    title: 'Appointment Reminder',
    message: 'Reminder: You have an appointment with Quick Fix Garage tomorrow at 10:00 AM.',
    time: '3 hours ago',
    read: true,
    actionUrl: '/(driver)/profile/history',
  },
  {
    id: '7',
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 20% off your first diagnosis! Use code NEWUSER20 at checkout.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '8',
    type: 'message',
    title: 'New Message',
    message: 'Premium Auto Care sent you a message: "Your car is ready for pickup!"',
    time: '2 days ago',
    read: true,
    actionUrl: '/(shared)/messages/6',
  },
  {
    id: '9',
    type: 'system',
    title: 'App Update Available',
    message: 'A new version of DriveAssist is available. Update now for the latest features.',
    time: '3 days ago',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(notifications.map((n) =>
      n.id === notification.id ? { ...n, read: true } : n
    ));

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case 'booking':
        return 'event';
      case 'message':
        return 'chat';
      case 'lead':
        return 'person-add';
      case 'payment':
        return 'payment';
      case 'system':
        return 'info';
      case 'promotion':
        return 'local-offer';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return '#3B82F6';
      case 'message':
        return '#10B981';
      case 'lead':
        return '#8B5CF6';
      case 'payment':
        return '#F59E0B';
      case 'system':
        return '#64748B';
      case 'promotion':
        return '#EC4899';
      default:
        return '#64748B';
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center mr-2"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text className="text-primary-500 font-semibold">Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length > 0 ? (
          <View className="px-4 py-2">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`flex-row py-4 ${
                  notification.id !== notifications[notifications.length - 1].id
                    ? `border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`
                    : ''
                }`}
              >
                {/* Icon */}
                <View
                  className="h-12 w-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getNotificationColor(notification.type) + '20' }}
                >
                  <MaterialIcons
                    name={getNotificationIcon(notification.type)}
                    size={24}
                    color={getNotificationColor(notification.type)}
                  />
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className={`font-semibold flex-1 ${
                        !notification.read
                          ? isDark
                            ? 'text-white'
                            : 'text-slate-900'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="h-2 w-2 rounded-full bg-primary-500 ml-2" />
                    )}
                  </View>
                  <Text
                    className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    numberOfLines={2}
                  >
                    {notification.message}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {notification.time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="notifications-none"
            title="No Notifications"
            description="You're all caught up! New notifications will appear here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
