import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button, Input, Avatar, SuccessModal } from '../../../src/components/common';

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
              name={fullName || 'User'}
            />
            <View className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary-500 items-center justify-center border-2 border-white">
              <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage} className="mt-3">
            <Text className="text-primary-500 font-semibold">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
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

        {/* Delete Account */}
        <View className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
          <TouchableOpacity
            onPress={() => Alert.alert(
              'Delete Account',
              'Are you sure you want to delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => { } },
              ]
            )}
          >
            <Text className="text-red-500 font-semibold text-center">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          fullWidth
        />
      </View>

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