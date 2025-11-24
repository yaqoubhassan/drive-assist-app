export * from './colors';
export * from './theme';

/**
 * Ghana-specific constants for the Ghanaian market
 */
export const GhanaConstants = {
  // Currency
  currency: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghana Cedi',
  },

  // Default location (Accra)
  defaultLocation: {
    latitude: 5.6037,
    longitude: -0.1870,
    city: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
  },

  // Phone code
  phoneCode: '+233',

  // Date/Time format
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',

  // Common Ghanaian cities
  cities: [
    'Accra',
    'Kumasi',
    'Tamale',
    'Takoradi',
    'Tema',
    'Cape Coast',
    'Koforidua',
    'Sunyani',
    'Ho',
    'Wa',
  ],

  // Common vehicle makes in Ghana
  popularVehicleMakes: [
    'Toyota',
    'Hyundai',
    'Honda',
    'Nissan',
    'Kia',
    'Volkswagen',
    'Mercedes-Benz',
    'BMW',
    'Ford',
    'Mitsubishi',
  ],
};

/**
 * App-wide constants
 */
export const AppConstants = {
  appName: 'DriveAssist',
  appTagline: "Your Car's Smart Companion",
  version: '1.0.0',

  // Max file sizes (in bytes)
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVoiceRecordingDuration: 60, // seconds
  maxPhotosPerDiagnosis: 5,

  // Pagination
  defaultPageSize: 20,

  // API timeouts (in ms)
  apiTimeout: 30000,

  // Local storage keys
  storageKeys: {
    authToken: '@driveassist/auth_token',
    user: '@driveassist/user',
    userType: '@driveassist/user_type',
    onboardingComplete: '@driveassist/onboarding_complete',
    theme: '@driveassist/theme',
    savedVehicles: '@driveassist/saved_vehicles',
    savedExperts: '@driveassist/saved_experts',
  },
};

/**
 * Format currency for display (Ghana Cedi)
 */
export const formatCurrency = (amount: number): string => {
  return `GH₵${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format currency range
 */
export const formatCurrencyRange = (min: number, max: number): string => {
  return `GH₵${min.toLocaleString()} - GH₵${max.toLocaleString()}`;
};
