import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/common';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { continueAsGuest } = useAuth();

  const handleSignUp = () => {
    router.push('/(auth)/sign-up');
  };

  const handleSignIn = () => {
    router.push('/(auth)/sign-in');
  };

  const handleContinueAsGuest = async () => {
    await continueAsGuest();
    router.replace('/(driver)');
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top', 'bottom']}
    >
      <View className="flex-1 px-6 pt-8">
        {/* Logo & Branding */}
        <View className={`items-center ${Platform.OS === 'ios' ? 'pb-8' : ''}`}>
          <View className="h-20 w-20 rounded-2xl bg-primary-500 items-center justify-center mb-4">
            <MaterialIcons name="directions-car" size={48} color="#FFFFFF" />
          </View>
          <Text
            className={`text-base ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Your AI-Powered Car Companion
          </Text>
        </View>

        {/* Illustration */}
        <View className="flex-1 items-center justify-center py-8 mb-4">
          <View
            className={`w-full aspect-[4/3] rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
          >
            <MaterialIcons
              name="car-repair"
              size={120}
              color={isDark ? '#64748B' : '#94A3B8'}
            />
            <View className="absolute top-4 right-4">
              <MaterialIcons name="check-circle" size={40} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Welcome Text */}
        <View className="items-center mt-4 mb-2">
          <Text
            className={`text-3xl font-bold text-center mb-1 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            Welcome to DriveAssist
          </Text>
          <Text
            className={`text-base text-center ${isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
          >
            Sign in or continue as guest
          </Text>
        </View>

        {/* Auth Buttons */}
        <View className="gap-3">
          <Button
            title="Sign Up"
            onPress={handleSignUp}
            variant="primary"
            fullWidth
          />
          <Button
            title="Sign In"
            onPress={handleSignIn}
            variant="outline"
            fullWidth
          />

          {/* Divider */}
          <View className="flex-row items-center my-2">
            <View className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
            <Text
              className={`mx-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
            >
              OR
            </Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </View>

          {/* Guest Button */}
          <TouchableOpacity
            onPress={handleContinueAsGuest}
            className="py-3 items-center"
          >
            <Text className="text-primary-500 font-bold text-base">
              Continue as Guest
            </Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View className="gap-3 mt-2">
            <TouchableOpacity
              onPress={() => handleSocialLogin('google')}
              className={`flex-row items-center justify-center h-12 rounded-xl border ${isDark
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-slate-300'
                }`}
            >
              <View className="w-6 h-6 mr-3">
                <MaterialIcons name="g-translate" size={24} color="#EA4335" />
              </View>
              <Text
                className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'
                  }`}
              >
                Continue with Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialLogin('apple')}
              className={`flex-row items-center justify-center h-12 rounded-xl border ${isDark
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
              <Text
                className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'
                  }`}
              >
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
