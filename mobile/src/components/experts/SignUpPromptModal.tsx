import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SignUpPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
  title?: string;
  message?: string;
}

export default function SignUpPromptModal({
  visible,
  onClose,
  onSignUp,
  onSignIn,
  title = 'Sign Up Required',
  message = 'Create an account to access expert contact details, send messages, and book appointments.',
}: SignUpPromptModalProps) {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center">
        {/* Backdrop */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/60"
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View
          className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          style={{ width: SCREEN_WIDTH - 48 }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10"
          >
            <MaterialIcons
              name="close"
              size={24}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>

          {/* Icon */}
          <View className="items-center mb-4">
            <View className={`w-16 h-16 rounded-full items-center justify-center ${
              isDark ? 'bg-primary-500/20' : 'bg-primary-50'
            }`}>
              <MaterialIcons name="lock-outline" size={32} color="#3B82F6" />
            </View>
          </View>

          {/* Title */}
          <Text
            className={`text-xl font-bold text-center mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            className={`text-center mb-6 leading-5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {message}
          </Text>

          {/* Benefits */}
          <View className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <Text className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              With an account you can:
            </Text>
            {[
              { icon: 'chat', text: 'Message experts directly' },
              { icon: 'phone', text: 'Access contact details' },
              { icon: 'event', text: 'Book appointments' },
              { icon: 'history', text: 'Save your diagnosis history' },
              { icon: 'notifications', text: 'Get maintenance reminders' },
            ].map((item, index) => (
              <View key={index} className="flex-row items-center mb-2 last:mb-0">
                <MaterialIcons
                  name={item.icon as any}
                  size={18}
                  color="#3B82F6"
                />
                <Text
                  className={`ml-3 text-sm ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {item.text}
                </Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={onSignUp}
            className="bg-primary-500 rounded-xl py-4 mb-3"
          >
            <Text className="text-white font-semibold text-center text-base">
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignIn}
            className={`rounded-xl py-4 border ${
              isDark ? 'border-slate-600' : 'border-slate-200'
            }`}
          >
            <Text
              className={`font-semibold text-center text-base ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              I Already Have an Account
            </Text>
          </TouchableOpacity>

          {/* Skip option */}
          <TouchableOpacity onPress={onClose} className="mt-4">
            <Text
              className={`text-center text-sm ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
