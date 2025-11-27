import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  primaryButtonLabel?: string;
  onPrimaryPress?: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  variant?: 'success' | 'info' | 'warning';
}

export function SuccessModal({
  visible,
  onClose,
  title = 'Success!',
  message,
  primaryButtonLabel,
  onPrimaryPress,
  secondaryButtonLabel,
  onSecondaryPress,
  autoClose = false,
  autoCloseDelay = 2000,
  variant = 'success',
}: SuccessModalProps) {
  const { isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const variantConfig = {
    success: {
      icon: 'check-circle' as const,
      bgColor: isDark ? 'bg-green-500/20' : 'bg-green-100',
      iconColor: '#22C55E',
      borderColor: isDark ? 'border-green-500/30' : 'border-green-200',
    },
    info: {
      icon: 'info' as const,
      bgColor: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      iconColor: '#3B82F6',
      borderColor: isDark ? 'border-blue-500/30' : 'border-blue-200',
    },
    warning: {
      icon: 'warning' as const,
      bgColor: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
      iconColor: '#F59E0B',
      borderColor: isDark ? 'border-yellow-500/30' : 'border-yellow-200',
    },
  };

  const config = variantConfig[variant];

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      checkmarkAnim.setValue(0);
      fadeAnim.setValue(0);

      // Run animations in sequence
      Animated.sequence([
        // Fade in backdrop
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Scale in modal with bounce
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate checkmark separately
      Animated.timing(checkmarkAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }).start();

      // Auto close if enabled
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, autoClose, autoCloseDelay, onClose]);

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
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
            className={`self-center mb-4 w-20 h-20 rounded-full items-center justify-center ${config.bgColor} border-2 ${config.borderColor}`}
            style={{
              transform: [
                {
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
              opacity: checkmarkAnim,
            }}
          >
            <MaterialIcons
              name={config.icon}
              size={48}
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
          <View className="gap-3">
            {/* Primary Button */}
            <TouchableOpacity
              onPress={handlePrimaryPress}
              activeOpacity={0.8}
              className="h-12 rounded-xl items-center justify-center bg-primary-500"
            >
              <Text className="text-white font-semibold text-base">
                {primaryButtonLabel || 'Done'}
              </Text>
            </TouchableOpacity>

            {/* Secondary Button */}
            {secondaryButtonLabel && (
              <TouchableOpacity
                onPress={handleSecondaryPress}
                activeOpacity={0.7}
                className={`h-12 rounded-xl items-center justify-center ${
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                }`}
              >
                <Text
                  className={`font-semibold text-base ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {secondaryButtonLabel}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

export default SuccessModal;
