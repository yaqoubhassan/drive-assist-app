/**
 * Secure Storage Service
 * Uses expo-secure-store for sensitive data (tokens)
 * Falls back to AsyncStorage for non-sensitive data
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys
export const StorageKeys = {
  // Secure storage (tokens)
  AUTH_TOKEN: 'driveassist_auth_token',
  REFRESH_TOKEN: 'driveassist_refresh_token',

  // Regular storage (non-sensitive)
  USER: '@driveassist/user',
  USER_TYPE: '@driveassist/user_type',
  ONBOARDING_COMPLETE: '@driveassist/onboarding_complete',
  THEME: '@driveassist/theme',
  SAVED_VEHICLES: '@driveassist/saved_vehicles',
  SAVED_EXPERTS: '@driveassist/saved_experts',
  EXPERT_PROFILE: '@driveassist/expert_profile',
  EXPERT_ONBOARDING_COMPLETE: '@driveassist/expert_onboarding_complete',
  EXPERT_KYC_STATUS: '@driveassist/expert_kyc_status',
  EMAIL_VERIFIED: '@driveassist/email_verified',
  FCM_TOKEN: '@driveassist/fcm_token',
} as const;

/**
 * Secure Storage - For sensitive data like auth tokens
 * Uses expo-secure-store which provides encrypted storage
 */
export const secureStorage = {
  /**
   * Store a value securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // SecureStore doesn't work on web, use localStorage with warning
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get a value from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error getting secure item ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing secure item ${key}:`, error);
    }
  },
};

/**
 * Regular Storage - For non-sensitive data
 * Uses AsyncStorage
 */
export const storage = {
  /**
   * Store a value
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get a value
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove a value
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  /**
   * Remove multiple values
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
    }
  },

  /**
   * Store an object as JSON
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing object ${key}:`, error);
      throw error;
    }
  },

  /**
   * Get an object from JSON
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      return null;
    }
  },
};

/**
 * Token Management
 * Centralized functions for managing auth tokens
 */
export const tokenStorage = {
  /**
   * Save auth token
   */
  async saveToken(token: string): Promise<void> {
    await secureStorage.setItem(StorageKeys.AUTH_TOKEN, token);
  },

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    return await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
  },

  /**
   * Remove auth token
   */
  async removeToken(): Promise<void> {
    await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);
  },

  /**
   * Check if user has a token (is potentially logged in)
   */
  async hasToken(): Promise<boolean> {
    const token = await secureStorage.getItem(StorageKeys.AUTH_TOKEN);
    return !!token;
  },
};

/**
 * Clear all auth-related storage
 */
export const clearAuthStorage = async (): Promise<void> => {
  // Clear secure storage
  await secureStorage.removeItem(StorageKeys.AUTH_TOKEN);
  await secureStorage.removeItem(StorageKeys.REFRESH_TOKEN);

  // Clear regular storage auth-related items
  await storage.multiRemove([
    StorageKeys.USER,
    StorageKeys.USER_TYPE,
    StorageKeys.EMAIL_VERIFIED,
    StorageKeys.EXPERT_ONBOARDING_COMPLETE,
    StorageKeys.EXPERT_KYC_STATUS,
    StorageKeys.EXPERT_PROFILE,
  ]);
};

export default {
  secureStorage,
  storage,
  tokenStorage,
  StorageKeys,
  clearAuthStorage,
};
