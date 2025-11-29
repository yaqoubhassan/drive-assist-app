import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Card } from '../../../src/components/common';
import { preferencesService, UserPreferences, defaultPreferences } from '../../../src/services/preferences';

// TODO: Replace with actual URLs when available
const LEGAL_URLS = {
  termsOfService: 'https://driveassist.app/terms',
  privacyPolicy: 'https://driveassist.app/privacy',
};

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe' },
  { code: 'ga', name: 'Ga', nativeName: 'Gã' },
];

const regions = [
  { code: 'GH', name: 'Ghana', currency: 'GH₵' },
  { code: 'NG', name: 'Nigeria', currency: '₦' },
  { code: 'KE', name: 'Kenya', currency: 'KSh' },
  { code: 'ZA', name: 'South Africa', currency: 'R' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'CFA' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isDark, mode: themeMode, setMode: setThemeMode } = useTheme();
  const { userType } = useAuth();
  const isGuest = userType === 'guest';

  // Preferences state
  const [loading, setLoading] = useState(!isGuest);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  // UI state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { value: 'light', label: 'Light', icon: 'light-mode' },
    { value: 'dark', label: 'Dark', icon: 'dark-mode' },
    { value: 'system', label: 'System', icon: 'settings-brightness' },
  ];

  const currentLanguage = languages.find(l => l.code === preferences.language);
  const currentRegion = regions.find(r => r.code === preferences.region);

  useEffect(() => {
    if (!isGuest) {
      fetchPreferences();
    }
  }, [isGuest]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await preferencesService.getPreferences();
      setPreferences(prefs);
      // Sync theme with stored preference
      if (prefs.theme && prefs.theme !== themeMode) {
        setThemeMode(prefs.theme);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    // Update local state immediately for responsiveness
    setPreferences(prev => ({ ...prev, [key]: value }));

    // Save to backend for authenticated users
    if (!isGuest) {
      try {
        setSaving(true);
        await preferencesService.updatePreference(key, value);
      } catch (error) {
        console.error('Failed to update preference:', error);
        // Revert on error
        setPreferences(prev => ({ ...prev, [key]: preferences[key] }));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setThemeMode(newTheme);
    updatePreference('theme', newTheme);
  };

  const openLegalPage = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading settings...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Settings
          </Text>
        </View>
        {saving && (
          <ActivityIndicator size="small" color="#3B82F6" />
        )}
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
                    onPress={() => handleThemeChange(option.value)}
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
                value={preferences.push_notifications}
                onValueChange={(value) => updatePreference('push_notifications', value)}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={preferences.push_notifications ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
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
                value={preferences.email_notifications}
                onValueChange={(value) => updatePreference('email_notifications', value)}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={preferences.email_notifications ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="event-available" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Appointment Reminders
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Get reminded about upcoming bookings
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.appointment_reminders}
                onValueChange={(value) => updatePreference('appointment_reminders', value)}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={preferences.appointment_reminders ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View
                  className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                >
                  <MaterialIcons name="build" size={22} color={isDark ? '#94A3B8' : '#64748B'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Maintenance Reminders
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Get notified about vehicle maintenance
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.maintenance_reminders}
                onValueChange={(value) => updatePreference('maintenance_reminders', value)}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={preferences.maintenance_reminders ? '#3B82F6' : '#94A3B8'}
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
                value={preferences.location_services}
                onValueChange={(value) => updatePreference('location_services', value)}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={preferences.location_services ? '#3B82F6' : '#94A3B8'}
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
                value={preferences.offline_mode}
                onValueChange={(value) => updatePreference('offline_mode', value)}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={preferences.offline_mode ? '#3B82F6' : '#94A3B8'}
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
              onPress={() => setShowLanguageModal(true)}
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
                    {currentLanguage?.name || 'English'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowRegionModal(true)}
              className="flex-row items-center justify-between p-4"
            >
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
                    {currentRegion?.name || 'Ghana'} ({currentRegion?.currency || 'GH₵'})
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
              onPress={() => openLegalPage(LEGAL_URLS.termsOfService)}
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
              <MaterialIcons name="open-in-new" size={20} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openLegalPage(LEGAL_URLS.privacyPolicy)}
              className="flex-row items-center justify-between p-4"
            >
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
              <MaterialIcons name="open-in-new" size={20} color={isDark ? '#475569' : '#94A3B8'} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)} className="mr-4">
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Select Language
            </Text>
          </View>

          <ScrollView className="flex-1">
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                onPress={() => {
                  updatePreference('language', language.code);
                  setShowLanguageModal(false);
                }}
                className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <View className="flex-1">
                  <Text className={`font-semibold ${
                    preferences.language === language.code
                      ? 'text-primary-500'
                      : isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {language.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {language.nativeName}
                  </Text>
                </View>
                {preferences.language === language.code && (
                  <MaterialIcons name="check" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Region Modal */}
      <Modal
        visible={showRegionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRegionModal(false)}
      >
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity onPress={() => setShowRegionModal(false)} className="mr-4">
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Select Region
            </Text>
          </View>

          <ScrollView className="flex-1">
            {regions.map((region) => (
              <TouchableOpacity
                key={region.code}
                onPress={() => {
                  updatePreference('region', region.code);
                  setShowRegionModal(false);
                }}
                className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <View className="flex-1">
                  <Text className={`font-semibold ${
                    preferences.region === region.code
                      ? 'text-primary-500'
                      : isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {region.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Currency: {region.currency}
                  </Text>
                </View>
                {preferences.region === region.code && (
                  <MaterialIcons name="check" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
