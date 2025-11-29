import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useDiagnosis } from '../../../src/context/DiagnosisContext';
import { useAlert } from '../../../src/context/AlertContext';

const statusMessages = [
  { icon: 'search', text: 'Analyzing your vehicle issue...' },
  { icon: 'smart-toy', text: 'Consulting our AI mechanic...' },
  { icon: 'storage', text: 'Cross-referencing thousands of cases...' },
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
  const { submitDiagnosis, result, error, isSubmitting, isGuest, clearError } = useDiagnosis();
  const { showError } = useAlert();

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Start animations
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

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % statusMessages.length);
    }, 3000);

    // Fun fact rotation
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(factInterval);
    };
  }, []);

  // Progress simulation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // If we have a result, jump to 100%
        if (result) {
          clearInterval(progressInterval);
          return 100;
        }
        // Slow down progress as it gets higher (never reach 100% without result)
        if (prev >= 90) {
          return prev + 0.2;
        }
        if (prev >= 70) {
          return prev + 0.5;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, [result]);

  // Submit diagnosis on mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      submitDiagnosis().catch((err) => {
        console.error('Diagnosis submission error:', err);
      });
    }
  }, [hasStarted, submitDiagnosis]);

  // Handle result
  useEffect(() => {
    if (result && progress >= 95) {
      // Navigate to results with a small delay for smooth transition
      const timeout = setTimeout(() => {
        router.replace('/(driver)/diagnose/results');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [result, progress, router]);

  // Handle error
  useEffect(() => {
    if (error) {
      // Provide a more helpful error message
      let title = 'Diagnosis Failed';
      let message = error;

      // Handle common error cases
      if (error.includes('symptoms_description') || error.includes('Symptoms description')) {
        title = 'Missing Description';
        message = 'Please provide a text description or voice recording of your vehicle issue.';
      } else if (error.includes('voice_recording') || error.includes('Voice recording')) {
        title = 'Audio Upload Failed';
        message = 'There was a problem uploading your voice recording. Please try again or use text description instead.';
      } else if (error.includes('network') || error.includes('Network')) {
        title = 'Connection Error';
        message = 'Please check your internet connection and try again.';
      } else if (error.includes('quota') || error.includes('remaining')) {
        title = 'Diagnosis Limit Reached';
        message = 'You have used all your free diagnoses. Please sign up to continue.';
      }

      showError(title, message, () => {
        clearError();
        // Use replace to go back to diagnose start instead of back() which might fail if no history
        router.replace('/(driver)/diagnose');
      });
    }
  }, [error, showError, clearError, router]);

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

        {/* Guest diagnosis notice */}
        {isGuest && (
          <View
            className={`mt-4 px-4 py-2 rounded-full ${
              isDark ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}
          >
            <Text
              className={`text-sm ${
                isDark ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              Free Guest Diagnosis
            </Text>
          </View>
        )}

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
