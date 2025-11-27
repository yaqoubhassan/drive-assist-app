import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddressAutocomplete, Avatar, Button, Card, Input, LocationData, PhoneNumberInput, SuccessModal } from '../../../src/components/common';
import { useAuth } from '../../../src/context/AuthContext';
import { useTheme } from '../../../src/context/ThemeContext';

export default function EditExpertProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

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
  const [serviceRadius, setServiceRadius] = useState(15);
  const [showServiceAreaModal, setShowServiceAreaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
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

            <PhoneNumberInput
              label="Phone Number"
              placeholder="XX XXX XXXX"
              defaultCountryCode="GH"
              value={phone}
              onChangeFormattedText={setPhone}
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

        {/* Service Area */}
        <View className="mb-8">
          <Card variant="default">
            <TouchableOpacity
              onPress={() => setShowServiceAreaModal(true)}
              className="flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <MaterialIcons name="map" size={22} color="#10B981" />
                <View className="ml-3">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Service Area
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Within {serviceRadius}km of {locationData?.city || 'your location'}
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

      {/* Service Area Modal */}
      <Modal
        visible={showServiceAreaModal}
        animationType="slide"
        onRequestClose={() => setShowServiceAreaModal(false)}
      >
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View
            className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={() => setShowServiceAreaModal(false)}
              className="h-10 w-10 items-center justify-center"
            >
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Service Area
            </Text>
            <TouchableOpacity
              onPress={() => setShowServiceAreaModal(false)}
              className="px-4 py-2 rounded-lg bg-primary-500"
            >
              <Text className="font-semibold text-white">Done</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 p-4">
            <View className="mb-6">
              <Text className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                How far are you willing to travel?
              </Text>
              <Text className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Set the maximum distance from your location you're willing to service
              </Text>
            </View>

            <View className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {/* Selected radius display */}
              <View className="items-center mb-4">
                <Text className="text-4xl font-bold text-primary-500">
                  {serviceRadius} km
                </Text>
              </View>

              {/* Slider with minus/plus buttons */}
              <View className="flex-row items-center gap-3">
                {/* Minus button */}
                <TouchableOpacity
                  onPress={() => setServiceRadius(Math.max(5, serviceRadius - 5))}
                  className={`h-12 w-12 rounded-full items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                >
                  <MaterialIcons name="remove" size={24} color={isDark ? '#FFFFFF' : '#374151'} />
                </TouchableOpacity>

                {/* Progress bar */}
                <View className="flex-1">
                  <View className={`h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                    <View
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${((serviceRadius - 5) / 95) * 100}%` }}
                    />
                  </View>
                  <View className="flex-row justify-between mt-1">
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>5 km</Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>100 km</Text>
                  </View>
                </View>

                {/* Plus button */}
                <TouchableOpacity
                  onPress={() => setServiceRadius(Math.min(100, serviceRadius + 5))}
                  className={`h-12 w-12 rounded-full items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                >
                  <MaterialIcons name="add" size={24} color={isDark ? '#FFFFFF' : '#374151'} />
                </TouchableOpacity>
              </View>
            </View>

            <View className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <View className="flex-row items-center">
                <MaterialIcons name="info" size={20} color="#3B82F6" />
                <Text className={`flex-1 ml-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  This determines how far from {locationData?.city || 'your location'} you're willing to travel for service calls
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Profile Updated!"
        message="Your profile has been updated successfully."
        primaryButtonLabel="Done"
      />
    </SafeAreaView>
  );
}
