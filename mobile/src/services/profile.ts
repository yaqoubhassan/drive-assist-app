/**
 * Profile Service
 * Handles all profile-related API calls
 */

import api from './api';
import { apiConfig } from '../config/api';
import { storage, StorageKeys, clearAuthStorage } from './storage';
import { User, DriverProfile, ExpertProfile } from '../types';

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
}

export interface UpdateAvatarResponse {
  avatar: string;
}

export interface ProfileImage {
  uri: string;
  name: string;
  type: string;
}

/**
 * Transform avatar URL to use the correct base URL for the mobile app
 * Backend may return localhost URLs which don't work on mobile devices
 */
export function transformAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  // Extract the base URL from apiConfig (without /api/v1)
  const apiBase = apiConfig.baseUrl.replace('/api/v1', '');

  // Replace localhost or 127.0.0.1 URLs with the configured API base
  const transformedUrl = url
    .replace(/^https?:\/\/localhost(:\d+)?/, apiBase)
    .replace(/^https?:\/\/127\.0\.0\.1(:\d+)?/, apiBase);

  return transformedUrl;
}

export const profileService = {
  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await api.put<UpdateProfileResponse>(
      apiConfig.endpoints.profile.update,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update profile');
    }

    // Update local storage with new user data
    const storedUser = await storage.getObject<User | DriverProfile | ExpertProfile>(StorageKeys.USER);
    if (storedUser) {
      const updatedUser = {
        ...storedUser,
        fullName: `${response.data.first_name} ${response.data.last_name}`,
        phone: response.data.phone || undefined,
      };
      await storage.setObject(StorageKeys.USER, updatedUser);
    }

    return response.data;
  },

  /**
   * Update user avatar
   */
  async updateAvatar(image: ProfileImage): Promise<string> {
    const formData = new FormData();

    // Follow the same pattern as vehicle service
    formData.append('avatar', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);

    const response = await api.postFormData<UpdateAvatarResponse>(
      apiConfig.endpoints.profile.updateAvatar,
      formData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update avatar');
    }

    // Transform the URL to work on mobile devices
    const avatarUrl = transformAvatarUrl(response.data.avatar);

    // Update local storage with new avatar
    const storedUser = await storage.getObject<User | DriverProfile | ExpertProfile>(StorageKeys.USER);
    if (storedUser) {
      const updatedUser = {
        ...storedUser,
        avatar: avatarUrl,
      };
      await storage.setObject(StorageKeys.USER, updatedUser);
    }

    return avatarUrl || '';
  },

  /**
   * Delete user avatar
   */
  async deleteAvatar(): Promise<void> {
    const response = await api.delete(apiConfig.endpoints.profile.deleteAvatar);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete avatar');
    }

    // Update local storage to remove avatar
    const storedUser = await storage.getObject<User | DriverProfile | ExpertProfile>(StorageKeys.USER);
    if (storedUser) {
      const updatedUser = {
        ...storedUser,
        avatar: undefined,
      };
      await storage.setObject(StorageKeys.USER, updatedUser);
    }
  },

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await api.put(apiConfig.endpoints.profile.updatePassword, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update password');
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    const response = await api.delete(apiConfig.endpoints.profile.deleteAccount, { password });

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete account');
    }

    // Clear all local storage
    await clearAuthStorage();
  },
};

export default profileService;
