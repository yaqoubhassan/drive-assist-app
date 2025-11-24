import React, { useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isOnboardingComplete, userType } = useAuth();

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after splash delay
    const timer = setTimeout(() => {
      handleNavigation();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, isOnboardingComplete, userType]);

  const handleNavigation = () => {
    if (isLoading) return;

    if (!isOnboardingComplete) {
      router.replace('/(auth)/onboarding');
    } else if (!isAuthenticated) {
      router.replace('/(auth)/welcome');
    } else if (userType === 'expert') {
      router.replace('/(expert)');
    } else {
      router.replace('/(driver)');
    }
  };

  return (
    <LinearGradient
      colors={['#1a237e', '#673ab7']}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="flex-1 items-center justify-center p-6">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          {/* Logo Icon */}
          <View className="mb-6 h-32 w-32 items-center justify-center rounded-3xl bg-white/10">
            <MaterialIcons name="directions-car" size={80} color="#FFFFFF" />
          </View>

          {/* App Name */}
          <Text className="text-4xl font-bold text-white tracking-tight">
            DriveAssist
          </Text>

          {/* Tagline */}
          <Text className="mt-3 text-lg text-white/80 text-center">
            Your Car's Smart Companion
          </Text>
        </Animated.View>

        {/* Version */}
        <View className="absolute bottom-8 right-6">
          <Text className="text-sm text-white/50">v1.0.0</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
