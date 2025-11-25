import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/common';

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, verifyEmail, resendVerificationCode, isEmailVerified, userType } = useAuth();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Redirect if already verified
  useEffect(() => {
    if (isEmailVerified && userType === 'expert') {
      router.replace('/(auth)/expert-onboarding');
    }
  }, [isEmailVerified, userType]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, CODE_LENGTH).split('');
      pastedCode.forEach((digit, i) => {
        if (index + i < CODE_LENGTH) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedCode.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      // Auto-focus next input
      if (value && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setError('');
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setError('Please enter the complete verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await verifyEmail(fullCode);
      if (success) {
        // Navigate to expert onboarding for experts
        if (userType === 'expert') {
          router.replace('/(auth)/expert-onboarding');
        } else {
          router.replace('/(driver)');
        }
      } else {
        setError('Invalid verification code. Please try again.');
        setCode(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    try {
      await resendVerificationCode();
      setCountdown(60);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (err) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-6 justify-center">
          {/* Icon */}
          <View className="items-center mb-8">
            <View className="h-20 w-20 rounded-full bg-primary-500/20 items-center justify-center mb-4">
              <MaterialIcons name="mark-email-read" size={40} color="#3B82F6" />
            </View>
            <Text
              className={`text-2xl font-bold text-center mb-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Verify Your Email
            </Text>
            <Text
              className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              We've sent a 6-digit verification code to
            </Text>
            <Text className="text-primary-500 font-semibold mt-1">
              {maskedEmail}
            </Text>
          </View>

          {/* Code Input */}
          <View className="flex-row justify-center gap-3 mb-4">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(value) => handleCodeChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="number-pad"
                maxLength={index === 0 ? CODE_LENGTH : 1}
                className={`h-14 w-12 rounded-xl text-center text-2xl font-bold border-2 ${
                  digit
                    ? 'border-primary-500 bg-primary-500/10'
                    : error
                    ? 'border-red-500'
                    : isDark
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-300 bg-white'
                } ${isDark ? 'text-white' : 'text-slate-900'}`}
                selectionColor="#3B82F6"
              />
            ))}
          </View>

          {/* Error Message */}
          {error && (
            <Text className="text-red-500 text-center mb-4">{error}</Text>
          )}

          {/* Verify Button */}
          <Button
            title="Verify Email"
            onPress={handleVerify}
            loading={loading}
            disabled={code.join('').length !== CODE_LENGTH}
            fullWidth
          />

          {/* Resend */}
          <View className="flex-row justify-center items-center mt-6">
            <Text className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Didn't receive the code?{' '}
            </Text>
            {countdown > 0 ? (
              <Text className="text-slate-400">
                Resend in {countdown}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                <Text className="text-primary-500 font-semibold">
                  {resending ? 'Sending...' : 'Resend'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Check spam notice */}
          <View
            className={`mt-8 p-4 rounded-xl ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <View className="flex-row items-start">
              <MaterialIcons
                name="info"
                size={20}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
              <Text
                className={`flex-1 ml-2 text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Can't find the email? Check your spam or junk folder. Make sure to
                mark our emails as "not spam" to receive future notifications.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
