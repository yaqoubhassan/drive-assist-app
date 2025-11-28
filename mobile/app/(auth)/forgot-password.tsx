import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../src/components/common';
import { useAlert } from '../../src/context/AlertContext';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const CODE_LENGTH = 6;

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { requestPasswordReset, resetPassword } = useAuth();
  const { showSuccess, showError, showInfo } = useAlert();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: 'Please enter a valid email' });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setErrors({});

    try {
      await requestPasswordReset(email);
      setStep('code');
      setCountdown(60);
    } catch (err) {
      setErrors({ email: 'Failed to send reset code. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, CODE_LENGTH).split('');
      pastedCode.forEach((digit, i) => {
        if (index + i < CODE_LENGTH) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + pastedCode.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < CODE_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    setErrors({});
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const fullCode = code.join('');
    if (fullCode.length !== CODE_LENGTH) {
      setErrors({ code: 'Please enter the complete code' });
      return;
    }
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    setErrors({});

    try {
      const fullCode = code.join('');
      const success = await resetPassword(fullCode, password);

      if (success) {
        showSuccess(
          'Password Reset',
          'Your password has been reset successfully. Please sign in with your new password.',
          () => router.replace('/(auth)/sign-in')
        );
      } else {
        setErrors({ code: 'Invalid code. Please try again.' });
        setStep('code');
        setCode(Array(CODE_LENGTH).fill(''));
      }
    } catch (err) {
      setErrors({ password: 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setCountdown(60);
      showInfo('Code Sent', 'A new reset code has been sent to your email.');
    } catch (err) {
      showError('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Weak', color: '#EF4444', width: 33 };
    if (password.length < 10) return { label: 'Medium', color: '#F59E0B', width: 66 };
    return { label: 'Strong', color: '#10B981', width: 100 };
  };

  const passwordStrength = getPasswordStrength();

  const renderEmailStep = () => (
    <>
      <View className="items-center mb-8">
        <View className="h-20 w-20 rounded-full bg-primary-500/20 items-center justify-center mb-4">
          <MaterialIcons name="lock-reset" size={40} color="#3B82F6" />
        </View>
        <Text
          className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'
            }`}
        >
          Forgot Password?
        </Text>
        <Text
          className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          No worries! Enter your email and we'll send you a reset code.
        </Text>
      </View>

      <Input
        label="Email Address"
        placeholder="Enter your email"
        icon="email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          setErrors({});
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        error={errors.email}
      />

      <Button
        title="Send Reset Code"
        onPress={handleSendCode}
        loading={loading}
        fullWidth
        className="mt-4"
      />
    </>
  );

  const renderCodeStep = () => (
    <>
      <View className="items-center mb-8">
        <View className="h-20 w-20 rounded-full bg-primary-500/20 items-center justify-center mb-4">
          <MaterialIcons name="dialpad" size={40} color="#3B82F6" />
        </View>
        <Text
          className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'
            }`}
        >
          Enter Reset Code
        </Text>
        <Text
          className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          We've sent a 6-digit code to
        </Text>
        <Text className="text-primary-500 font-semibold mt-1">{email}</Text>
      </View>

      <View className="flex-row justify-center gap-3 mb-4">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            value={digit}
            onChangeText={(value) => handleCodeChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={index === 0 ? CODE_LENGTH : 1}
            className={`h-14 w-12 rounded-xl text-center text-2xl font-bold border-2 ${digit
              ? 'border-primary-500 bg-primary-500/10'
              : errors.code
                ? 'border-red-500'
                : isDark
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-300 bg-white'
              } ${isDark ? 'text-white' : 'text-slate-900'}`}
            selectionColor="#3B82F6"
          />
        ))}
      </View>

      {errors.code && (
        <Text className="text-red-500 text-center mb-4">{errors.code}</Text>
      )}

      <Button
        title="Continue"
        onPress={handleVerifyCode}
        disabled={code.join('').length !== CODE_LENGTH}
        fullWidth
      />

      <View className="flex-row justify-center items-center mt-6">
        <Text className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Didn't receive the code?{' '}
        </Text>
        {countdown > 0 ? (
          <Text className="text-slate-400">Resend in {countdown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResendCode} disabled={loading}>
            <Text className="text-primary-500 font-semibold">Resend</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setStep('email')}
        className="flex-row items-center justify-center mt-4"
      >
        <MaterialIcons name="arrow-back" size={18} color="#3B82F6" />
        <Text className="text-primary-500 font-semibold ml-1">Change email</Text>
      </TouchableOpacity>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <View className="items-center mb-8">
        <View className="h-20 w-20 rounded-full bg-green-500/20 items-center justify-center mb-4">
          <MaterialIcons name="check-circle" size={40} color="#10B981" />
        </View>
        <Text
          className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'
            }`}
        >
          Create New Password
        </Text>
        <Text
          className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
        >
          Your new password must be at least 8 characters long.
        </Text>
      </View>

      <View className="gap-1">
        <Input
          label="New Password"
          placeholder="Enter new password"
          icon="lock"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors({});
          }}
          secureTextEntry
          autoCapitalize="none"
          error={errors.password}
        />

        {passwordStrength && (
          <View className="mb-4 -mt-2">
            <View className={`h-1.5 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: passwordStrength.color,
                  width: `${passwordStrength.width}%`,
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
          placeholder="Confirm new password"
          icon="lock"
          value={confirmPassword}
          onChangeText={(value) => {
            setConfirmPassword(value);
            setErrors({});
          }}
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirmPassword}
        />
      </View>

      <Button
        title="Reset Password"
        onPress={handleResetPassword}
        loading={loading}
        fullWidth
        className="mt-4"
      />
    </>
  );

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
              onPress={() => {
                if (step === 'email') {
                  router.back();
                } else if (step === 'code') {
                  setStep('email');
                } else {
                  setStep('code');
                }
              }}
              className="h-10 w-10 items-center justify-center"
            >
              <MaterialIcons
                name="arrow-back"
                size={24}
                color={isDark ? '#FFFFFF' : '#111827'}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-6 justify-center pb-8">
            {step === 'email' && renderEmailStep()}
            {step === 'code' && renderCodeStep()}
            {step === 'password' && renderPasswordStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
