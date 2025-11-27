import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmationModalProps) {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const iconAnim = useRef(new Animated.Value(0)).current;

  const variantConfig = {
    danger: {
      icon: 'delete' as const,
      bgColor: isDark ? 'bg-red-500/20' : 'bg-red-100',
      iconColor: '#EF4444',
      borderColor: isDark ? 'border-red-500/30' : 'border-red-200',
      buttonBg: 'bg-red-500',
      buttonText: 'text-white',
    },
    warning: {
      icon: 'warning' as const,
      bgColor: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
      iconColor: '#F59E0B',
      borderColor: isDark ? 'border-yellow-500/30' : 'border-yellow-200',
      buttonBg: 'bg-yellow-500',
      buttonText: 'text-white',
    },
    info: {
      icon: 'help' as const,
      bgColor: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      iconColor: '#3B82F6',
      borderColor: isDark ? 'border-blue-500/30' : 'border-blue-200',
      buttonBg: 'bg-primary-500',
      buttonText: 'text-white',
    },
  };

  const config = variantConfig[variant];

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      iconAnim.setValue(0);

      // Run animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate icon with a shake effect for danger variant
      if (variant === 'danger') {
        Animated.sequence([
          Animated.timing(iconAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(iconAnim, {
            toValue: 0,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.timing(iconAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible, variant]);

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        className="flex-1 justify-center items-center px-6"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: fadeAnim,
        }}
      >
        <Pressable
          className="absolute inset-0"
          onPress={onClose}
        />
        <Animated.View
          className={`w-full max-w-sm rounded-2xl p-6 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
          style={{
            transform: [{ scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Icon Container */}
          <Animated.View
            className={`self-center mb-4 w-16 h-16 rounded-full items-center justify-center ${config.bgColor} border-2 ${config.borderColor}`}
            style={{
              transform: [
                {
                  rotate: iconAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', variant === 'danger' ? '10deg' : '0deg'],
                  }),
                },
              ],
            }}
          >
            <MaterialIcons
              name={config.icon}
              size={32}
              color={config.iconColor}
            />
          </Animated.View>

          {/* Title */}
          <Text
            className={`text-xl font-bold text-center mb-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {title}
          </Text>

          {/* Message */}
          {message && (
            <Text
              className={`text-center mb-6 leading-6 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              disabled={loading}
              className={`flex-1 h-12 rounded-xl items-center justify-center ${
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              } ${loading ? 'opacity-50' : ''}`}
            >
              <Text
                className={`font-semibold text-base ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={loading}
              className={`flex-1 h-12 rounded-xl items-center justify-center ${config.buttonBg} ${loading ? 'opacity-50' : ''}`}
            >
              <Text className={`font-semibold text-base ${config.buttonText}`}>
                {loading ? 'Deleting...' : confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default ConfirmationModal;
