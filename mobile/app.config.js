// Dynamic Expo configuration that reads from environment variables
// To use: Create a .env file with your GOOGLE_MAPS_API_KEY

export default ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

  return {
    ...config,
    name: 'DriveAssist',
    slug: 'drive-assist',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme: 'driveassist',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1a237e',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.driveassist.app',
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'DriveAssist needs your location to find nearby automotive experts.',
        NSLocationAlwaysUsageDescription:
          'DriveAssist needs your location to find nearby automotive experts.',
        NSCameraUsageDescription:
          'DriveAssist needs camera access to take photos of vehicle issues.',
        NSMicrophoneUsageDescription:
          'DriveAssist needs microphone access for voice recordings.',
        NSPhotoLibraryUsageDescription:
          'DriveAssist needs access to your photos to upload vehicle images.',
      },
      config: {
        googleMapsApiKey: googleMapsApiKey,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1a237e',
      },
      package: 'com.driveassist.app',
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
      config: {
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      'expo-font',
      [
        'expo-camera',
        {
          cameraPermission:
            'Allow DriveAssist to access your camera to take photos of vehicle issues.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow DriveAssist to access your photos to upload vehicle images.',
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow DriveAssist to use your location to find nearby experts.',
        },
      ],
      [
        'expo-av',
        {
          microphonePermission:
            'Allow DriveAssist to access your microphone for voice recordings.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    // Expose the API key to the app via expo-constants
    extra: {
      googleMapsApiKey: googleMapsApiKey,
    },
  };
};
