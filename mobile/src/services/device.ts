/**
 * Device Service
 * Handles device identification and fingerprinting for guest users
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { storage, StorageKeys } from './storage';

// Unique ID storage key
const DEVICE_ID_KEY = '@driveassist:device_id';

export interface DeviceInfo {
  deviceId: string;
  deviceType: string;
  deviceModel: string | null;
  osVersion: string | null;
  appVersion: string | null;
}

/**
 * Generate a pseudo-unique device ID
 * Combines available device info with a random component
 */
function generateDeviceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const deviceName = Device.deviceName?.replace(/\s/g, '_') || 'unknown';
  const osType = Platform.OS;

  return `${osType}_${deviceName}_${timestamp}_${random}`;
}

/**
 * Get or create a unique device ID
 * This ID persists across app sessions
 */
async function getOrCreateDeviceId(): Promise<string> {
  try {
    // Try to get existing device ID
    const existingId = await storage.getItem(DEVICE_ID_KEY);
    if (existingId) {
      return existingId;
    }

    // Generate new device ID
    const newId = generateDeviceId();
    await storage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch (error) {
    console.error('Error getting/creating device ID:', error);
    // Fallback to a generated ID (won't persist if storage fails)
    return generateDeviceId();
  }
}

/**
 * Get device type string
 */
function getDeviceType(): string {
  if (Device.isDevice) {
    switch (Device.deviceType) {
      case Device.DeviceType.PHONE:
        return 'phone';
      case Device.DeviceType.TABLET:
        return 'tablet';
      case Device.DeviceType.DESKTOP:
        return 'desktop';
      case Device.DeviceType.TV:
        return 'tv';
      default:
        return 'unknown';
    }
  }
  return 'simulator';
}

/**
 * Device Service
 */
export const deviceService = {
  /**
   * Get complete device information including unique ID
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    const deviceId = await getOrCreateDeviceId();

    return {
      deviceId,
      deviceType: getDeviceType(),
      deviceModel: Device.modelName,
      osVersion: Device.osVersion,
      appVersion: Application.nativeApplicationVersion,
    };
  },

  /**
   * Get device ID only
   */
  async getDeviceId(): Promise<string> {
    return getOrCreateDeviceId();
  },

  /**
   * Get device headers for API requests
   */
  async getDeviceHeaders(): Promise<Record<string, string>> {
    const info = await this.getDeviceInfo();

    const headers: Record<string, string> = {
      'X-Device-ID': info.deviceId,
    };

    if (info.deviceType) {
      headers['X-Device-Type'] = info.deviceType;
    }
    if (info.deviceModel) {
      headers['X-Device-Model'] = info.deviceModel;
    }
    if (info.osVersion) {
      headers['X-OS-Version'] = `${Platform.OS} ${info.osVersion}`;
    }
    if (info.appVersion) {
      headers['X-App-Version'] = info.appVersion;
    }

    return headers;
  },

  /**
   * Clear stored device ID (for testing purposes)
   */
  async clearDeviceId(): Promise<void> {
    await storage.removeItem(DEVICE_ID_KEY);
  },

  /**
   * Check if this is a physical device
   */
  isPhysicalDevice(): boolean {
    return Device.isDevice ?? false;
  },

  /**
   * Get device brand
   */
  getBrand(): string | null {
    return Device.brand;
  },

  /**
   * Get platform info
   */
  getPlatform(): {
    os: string;
    version: string | null;
  } {
    return {
      os: Platform.OS,
      version: Device.osVersion,
    };
  },
};

export default deviceService;
