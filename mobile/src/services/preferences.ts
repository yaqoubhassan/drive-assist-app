/**
 * Preferences Service
 * Handles user preferences and app settings
 */

import api from './api';
import { apiConfig } from '../config/api';

export interface UserPreferences {
  // Notifications
  push_notifications: boolean;
  email_notifications: boolean;
  appointment_reminders: boolean;
  maintenance_reminders: boolean;
  diagnosis_updates: boolean;

  // Privacy & Data
  location_services: boolean;
  offline_mode: boolean;
  share_analytics: boolean;

  // Language & Region
  language: string;
  region: string;
  currency: string;

  // App Preferences
  theme: 'light' | 'dark' | 'system';
  measurement_unit: 'metric' | 'imperial';
}

export const defaultPreferences: UserPreferences = {
  push_notifications: true,
  email_notifications: true,
  appointment_reminders: true,
  maintenance_reminders: true,
  diagnosis_updates: true,
  location_services: true,
  offline_mode: false,
  share_analytics: true,
  language: 'en',
  region: 'GH',
  currency: 'GHS',
  theme: 'system',
  measurement_unit: 'metric',
};

export const preferencesService = {
  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await api.get<UserPreferences>(apiConfig.endpoints.profile.preferences);
      return { ...defaultPreferences, ...response.data };
    } catch (error) {
      // Return default preferences if API call fails
      return defaultPreferences;
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put<UserPreferences>(
      apiConfig.endpoints.profile.updatePreferences,
      preferences
    );
    return response.data;
  },

  /**
   * Update a single preference
   */
  async updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<UserPreferences> {
    return this.updatePreferences({ [key]: value });
  },
};

export default preferencesService;
