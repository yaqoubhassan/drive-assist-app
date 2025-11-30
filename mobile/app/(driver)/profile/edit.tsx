import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Button, Input, Avatar, SuccessModal, PhoneNumberInput } from '../../../src/components/common';
import { profileService } from '../../../src/services/profile';
import { getErrorMessage } from '../../../src/services/api';

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, refreshUser, logout } = useAuth();
  const { showWarning, showError, showSuccess } = useAlert();

  // Split fullName into first and last name for the form
  const nameParts = (user?.fullName || '').split(' ');
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      showWarning('Permission Required', 'Please allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setAvatar(imageUri);

      // Upload avatar immediately
      try {
        setUploadingAvatar(true);
        const newAvatarUrl = await profileService.updateAvatar(imageUri);
        setAvatar(newAvatarUrl);
        await refreshUser();
        showSuccess('Success', 'Profile photo updated successfully');
      } catch (error) {
        showError('Upload Failed', getErrorMessage(error));
        // Revert to previous avatar
        setAvatar(user?.avatar || '');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      showWarning('Validation Error', 'First name is required');
      return;
    }

    try {
      setLoading(true);
      await profileService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone || undefined,
      });
      await refreshUser();
      setShowSuccessModal(true);
    } catch (error) {
      showError('Update Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showWarning('Password Required', 'Please enter your password to confirm account deletion');
      return;
    }

    try {
      setDeletingAccount(true);
      await profileService.deleteAccount(deletePassword);
      setShowDeleteModal(false);
      // Logout and redirect to welcome screen
      await logout();
      router.replace('/(auth)/welcome');
    } catch (error) {
      showError('Deletion Failed', getErrorMessage(error));
    } finally {
      setDeletingAccount(false);
    }
  };

  const openDeleteModal = () => {
    setDeletePassword('');
    setShowDeleteModal(true);
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
          <TouchableOpacity onPress={handlePickImage} className="relative" disabled={uploadingAvatar}>
            <Avatar
              size="xl"
              source={avatar ? { uri: avatar } : undefined}
              name={`${firstName} ${lastName}` || 'User'}
            />
            <View className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-primary-500 items-center justify-center border-2 border-white">
              {uploadingAvatar ? (
                <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
              ) : (
                <MaterialIcons name="camera-alt" size={20} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePickImage} className="mt-3" disabled={uploadingAvatar}>
            <Text className="text-primary-500 font-semibold">
              {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="gap-1">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            icon="person"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            icon="person-outline"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            icon="email"
            value={email}
            editable={false}
            className="opacity-60"
          />

          <PhoneNumberInput
            label="Phone Number"
            placeholder="XX XXX XXXX"
            defaultCountryCode="GH"
            value={phone}
            onChangeFormattedText={setPhone}
          />
        </View>

        {/* Delete Account */}
        <View className={`mt-8 pt-8 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <TouchableOpacity onPress={openDeleteModal}>
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

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="items-center mb-4">
              <View className="h-16 w-16 rounded-full items-center justify-center mb-4 bg-red-100">
                <MaterialIcons name="warning" size={32} color="#EF4444" />
              </View>
              <Text className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Delete Account
              </Text>
              <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>

            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Enter your password to confirm
              </Text>
              <TextInput
                value={deletePassword}
                onChangeText={setDeletePassword}
                placeholder="Password"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                secureTextEntry
                className={`h-12 px-4 rounded-xl ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'}`}
              />
            </View>

            <View className="gap-3">
              <Button
                title={deletingAccount ? 'Deleting...' : 'Delete My Account'}
                variant="danger"
                fullWidth
                onPress={handleDeleteAccount}
                loading={deletingAccount}
              />
              <Button
                title="Cancel"
                variant="secondary"
                fullWidth
                onPress={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
