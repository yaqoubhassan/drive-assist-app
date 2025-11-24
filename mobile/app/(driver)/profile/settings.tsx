import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../../src/context/ThemeContext';
import { Card } from '../../../src/components/common';

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, themeMode, setThemeMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'light-mode' },
    { value: 'dark', label: 'Dark', icon: 'dark-mode' },
    { value: 'system', label: 'System', icon: 'settings-brightness' },
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            APPEARANCE
          </Text>
          <Card variant="default" padding="none">
            <View className="p-4">
              <Text className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Theme
              </Text>
              <View className="flex-row gap-3">
                {themeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setThemeMode(option.value)}
                    className={`flex-1 p-3 rounded-xl items-center border-2 ${
                      themeMode === option.value
                        ? 'border-primary-500 bg-primary-500/10'
                        : isDark
                        ? 'border-slate-700 bg-slate-800'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <MaterialIcons
                      name={option.icon}
                      size={24}
                      color={themeMode === option.value ? '#3B82F6' : isDark ? '#94A3B8' : '#64748B'}
                    />
                    <Text
                      className={`mt-1 text-sm font-medium ${
                        themeMode === option.value
                          ? 'text-primary-500'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Notifications */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            NOTIFICATIONS
          </Text>
          <Card variant="default" padding="none">
            <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="notifications" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Push Notifications
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Get alerts about your diagnoses
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={notifications ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="email" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Email Notifications
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Receive updates via email
                  </Text>
                </View>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={emailNotifications ? '#3B82F6' : '#94A3B8'}
              />
            </View>
          </Card>
        </View>

        {/* Privacy */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            PRIVACY & DATA
          </Text>
          <Card variant="default" padding="none">
            <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="location-on" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Location Services
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Find nearby experts
                  </Text>
                </View>
              </View>
              <Switch
                value={locationServices}
                onValueChange={setLocationServices}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={locationServices ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="cloud-off" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Offline Mode
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Save diagnoses for offline access
                  </Text>
                </View>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={offlineMode ? '#3B82F6' : '#94A3B8'}
              />
            </View>
          </Card>
        </View>

        {/* Language */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            LANGUAGE & REGION
          </Text>
          <Card variant="default" padding="none">
            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="language" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Language
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    English
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="public" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Region
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Ghana
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Legal */}
        <View className="mb-8">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            LEGAL
          </Text>
          <Card variant="default" padding="none">
            <TouchableOpacity
              className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="description" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Terms of Service
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="privacy-tip" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Privacy Policy
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
