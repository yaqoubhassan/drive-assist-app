import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Button, Input } from '../../src/components/common';

export default function SignInScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(driver)');
    } catch (error) {
      setErrors({ email: 'Invalid email or password' });
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
            <View className="mb-8">
              <Text
                className={`text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Welcome Back
              </Text>
              <Text
                className={`text-base ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Sign in to continue
              </Text>
            </View>

            {/* Form */}
            <View className="gap-1">
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

              <Input
                label="Password"
                placeholder="Enter your password"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                error={errors.password}
              />

              {/* Forgot Password */}
              <TouchableOpacity className="self-end mb-6">
                <Text className="text-primary-500 font-semibold text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <Button
                title="Sign In"
                onPress={handleSignIn}
                loading={loading}
                fullWidth
              />

              {/* Divider */}
              <View className="flex-row items-center my-6">
                <View className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <Text
                  className={`mx-4 text-sm font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  OR
                </Text>
                <View className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
              </View>

              {/* Social Login */}
              <View className="gap-3">
                <TouchableOpacity
                  className={`flex-row items-center justify-center h-12 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <MaterialIcons name="g-translate" size={24} color="#EA4335" style={{ marginRight: 12 }} />
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-row items-center justify-center h-12 rounded-xl border ${
                    isDark
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <MaterialIcons
                    name="apple"
                    size={24}
                    color={isDark ? '#FFFFFF' : '#000000'}
                    style={{ marginRight: 12 }}
                  />
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Continue with Apple
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center mt-8 mb-6">
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                <Text className="text-primary-500 font-semibold text-sm">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
