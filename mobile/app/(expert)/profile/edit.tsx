import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button, Input, Avatar, Card, AddressAutocomplete, LocationData } from '../../../src/components/common';

export default function EditExpertProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState('Experienced mechanic with 10+ years in automotive repair. Specializing in engine diagnostics and transmission repair.');
  const [locationData, setLocationData] = useState<LocationData | undefined>({
    latitude: 5.6037,
    longitude: -0.187,
    address: 'East Legon, Accra',
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
  });
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const handleLocationChange = (location: LocationData) => {
    setLocationData(location);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    Alert.alert('Success', 'Profile updated successfully');
    router.back();
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <MaterialIcons
            name="close"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Edit Profile
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Avatar Section */}
        <View className="items-center py-6">
          <TouchableOpacity onPress={handlePickImage} className="relative">
            <Avatar
              size="xl"
              source={avatar ? { uri: avatar } : undefined}
              name={fullName || 'Expert'}
            />
            <View className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary-500 items-center justify-center border-2 border-white">
              <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage} className="mt-3">
            <Text className="text-primary-500 font-semibold">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            PERSONAL INFORMATION
          </Text>
          <View className="gap-1">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              icon="person"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              icon="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Phone Number"
              placeholder="+233 XX XXX XXXX"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Location */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            LOCATION
          </Text>
          <AddressAutocomplete
            label="Business Address"
            placeholder="Search for your address..."
            value={locationData}
            onChange={handleLocationChange}
          />
        </View>

        {/* Bio */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            ABOUT
          </Text>
          <Input
            label="Bio"
            placeholder="Tell customers about yourself..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Business Hours */}
        <View className="mb-6">
          <Card variant="default">
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="schedule" size={22} color="#3B82F6" />
                <View className="ml-3">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Business Hours
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Mon-Fri: 8:00 AM - 6:00 PM
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isDark ? '#475569' : '#94A3B8'}
              />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Service Area */}
        <View className="mb-8">
          <Card variant="default">
            <TouchableOpacity className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialIcons name="map" size={22} color="#10B981" />
                <View className="ml-3">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Service Area
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Within 15km of East Legon
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={isDark ? '#475569' : '#94A3B8'}
              />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}