import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';

const statusMessages = [
  { icon: 'search', text: 'Analyzing your vehicle issue...' },
  { icon: 'smart-toy', text: 'Consulting our AI mechanic...' },
  { icon: 'storage', text: 'Cross-referencing thousands of cases...' },
  { icon: 'photo-library', text: 'Examining uploaded photos...' },
  { icon: 'auto-awesome', text: 'Preparing your diagnosis...' },
];

const funFacts = [
  'Regular oil changes can extend engine life by 50%',
  'Underinflated tires can reduce fuel efficiency by 3%',
  'Most car batteries last 3-5 years',
  'Brake pads should be checked every 20,000 km',
];

export default function DiagnoseLoadingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 5 + 2;
      });
    }, 500);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3000);

    // Fun fact rotation
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);

    // Navigate to results after completion
    const timeout = setTimeout(() => {
      router.replace('/(driver)/diagnose/results');
    }, 15000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearInterval(factInterval);
      clearTimeout(timeout);
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const currentMessage = statusMessages[messageIndex];

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top', 'bottom']}
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* Animated Car Icon */}
        <Animated.View
          style={{
            transform: [{ scale: pulseValue }],
          }}
          className="mb-8"
        >
          <View className="h-32 w-32 rounded-full bg-primary-500/20 items-center justify-center">
            <Animated.View
              style={{ transform: [{ rotate: spin }] }}
              className="h-24 w-24 rounded-full bg-primary-500/30 items-center justify-center"
            >
              <MaterialIcons name="directions-car" size={48} color="#3B82F6" />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <View className="w-full mb-8">
          <View
            className={`h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          >
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </View>
          <Text
            className={`text-center mt-2 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {Math.round(Math.min(progress, 100))}%
          </Text>
        </View>

        {/* Status Message */}
        <View className="flex-row items-center justify-center mb-4">
          <MaterialIcons
            name={currentMessage.icon as keyof typeof MaterialIcons.glyphMap}
            size={24}
            color="#3B82F6"
            style={{ marginRight: 8 }}
          />
          <Text
            className={`text-lg font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {currentMessage.text}
          </Text>
        </View>

        {/* Fun Fact */}
        <View
          className={`absolute bottom-20 mx-8 p-4 rounded-xl ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}
        >
          <View className="flex-row items-start">
            <MaterialIcons
              name="lightbulb"
              size={20}
              color="#F59E0B"
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold mb-1 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Did you know?
              </Text>
              <Text
                className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
              >
                {funFacts[factIndex]}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
