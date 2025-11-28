import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Button, Input, PhoneNumberInput } from '../../src/components/common';
import { UserType } from '../../src/types';

export default function SignUpScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('driver');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Weak', color: '#EF4444', width: '33%' };
    if (password.length < 10) return { label: 'Medium', color: '#F59E0B', width: '66%' };
    return { label: 'Strong', color: '#10B981', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp({
        email,
        password,
        fullName,
        phone: phone || undefined,
        userType,
      });
      // All users go through email verification first
      router.replace('/(auth)/verify-email');
    } catch (error: any) {
      // Parse backend validation errors
      const apiErrors: Record<string, string> = {};

      if (error?.errors) {
        // Backend returns errors in format: { field: ["error message"] }
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Map backend field names to frontend field names
            const fieldMap: Record<string, string> = {
              first_name: 'fullName',
              last_name: 'fullName',
            };
            const frontendField = fieldMap[field] || field;
            apiErrors[frontendField] = messages[0] as string;
          }
        });
      } else if (error?.message) {
        // Generic error message
        apiErrors.general = error.message;
      } else {
        apiErrors.general = 'Registration failed. Please try again.';
      }

      setErrors(apiErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

          <View className="flex-1 px-6">
            {/* Title */}
            <View className="mb-6">
              <Text
                className={`text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Create Account
              </Text>
              <Text
                className={`text-base ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Join thousands of smart drivers
              </Text>
            </View>

            {/* User Type Selection */}
            <View className="flex-row gap-3 mb-6">
              <TouchableOpacity
                onPress={() => setUserType('driver')}
                className={`flex-1 p-4 rounded-xl border-2 items-center ${
                  userType === 'driver'
                    ? 'border-primary-500 bg-primary-500/10'
                    : isDark
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <MaterialIcons
                  name="directions-car"
                  size={28}
                  color={userType === 'driver' ? '#3B82F6' : isDark ? '#64748B' : '#94A3B8'}
                />
                <Text
                  className={`mt-2 font-semibold ${
                    userType === 'driver'
                      ? 'text-primary-500'
                      : isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  I'm a Driver
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setUserType('expert')}
                className={`flex-1 p-4 rounded-xl border-2 items-center ${
                  userType === 'expert'
                    ? 'border-primary-500 bg-primary-500/10'
                    : isDark
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <MaterialIcons
                  name="build"
                  size={28}
                  color={userType === 'expert' ? '#3B82F6' : isDark ? '#64748B' : '#94A3B8'}
                />
                <Text
                  className={`mt-2 font-semibold ${
                    userType === 'expert'
                      ? 'text-primary-500'
                      : isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  I'm an Expert
                </Text>
              </TouchableOpacity>
            </View>

            {/* General Error Message */}
            {errors.general && (
              <View className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <Text className="text-red-500 text-sm text-center">{errors.general}</Text>
              </View>
            )}

            {/* Form */}
            <View className="gap-1">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                icon="person"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                error={errors.fullName}
              />

              <Input
                label="Email"
                placeholder="Enter your email"
                icon="email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
              />

              <PhoneNumberInput
                label="Phone Number (Optional)"
                placeholder="XX XXX XXXX"
                defaultCountryCode="GH"
                value={phone}
                onChangeFormattedText={(formattedText) => {
                  // Save the full formatted number with country code
                  // e.g., +233249952818
                  setPhone(formattedText);
                }}
                error={errors.phone}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                error={errors.password}
              />

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <View className="mb-4 -mt-2">
                  <View className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <View
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: passwordStrength.color,
                        width: passwordStrength.width,
                      }}
                    />
                  </View>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: passwordStrength.color }}
                  >
                    Password strength: {passwordStrength.label}
                  </Text>
                </View>
              )}

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                icon="lock"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                error={errors.confirmPassword}
              />

              {/* Terms Checkbox */}
              <TouchableOpacity
                onPress={() => setTermsAccepted(!termsAccepted)}
                className="flex-row items-start mb-6"
              >
                <View
                  className={`h-5 w-5 rounded border-2 mr-3 mt-0.5 items-center justify-center ${
                    termsAccepted
                      ? 'bg-primary-500 border-primary-500'
                      : isDark
                      ? 'border-slate-600'
                      : 'border-slate-300'
                  }`}
                >
                  {termsAccepted && (
                    <MaterialIcons name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
                <Text
                  className={`flex-1 text-sm ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  I agree to the{' '}
                  <Text className="text-primary-500 font-semibold">Terms of Service</Text>
                  {' '}and{' '}
                  <Text className="text-primary-500 font-semibold">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text className="text-error text-sm -mt-4 mb-4">{errors.terms}</Text>
              )}

              {/* Sign Up Button */}
              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={loading}
                disabled={!termsAccepted}
                fullWidth
              />
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-6 mb-6">
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                <Text className="text-primary-500 font-semibold text-sm">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
