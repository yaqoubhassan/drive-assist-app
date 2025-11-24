import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helper,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  containerClassName = '',
  className = '',
  ...props
}: InputProps) {
  const { isDark, colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);

  const isPassword = secureTextEntry !== undefined;

  const borderColor = error
    ? 'border-error'
    : isFocused
    ? 'border-primary-500'
    : isDark
    ? 'border-slate-700'
    : 'border-slate-200';

  const bgColor = isDark ? 'bg-slate-800' : 'bg-slate-50';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const placeholderColor = isDark ? '#94A3B8' : '#9CA3AF';
  const iconColor = isDark ? '#94A3B8' : '#6B7280';

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text
          className={`mb-2 text-sm font-semibold ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-xl border-2 px-4 ${borderColor} ${bgColor}`}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={iconColor}
            style={{ marginRight: 12 }}
          />
        )}

        <TextInput
          className={`flex-1 py-4 text-base ${textColor} ${className}`}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isPassword && !isSecureVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsSecureVisible(!isSecureVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={isSecureVisible ? 'visibility' : 'visibility-off'}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name={rightIcon} size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View className="mt-2 flex-row items-center">
          <MaterialIcons name="error-outline" size={14} color="#EF4444" />
          <Text className="ml-1 text-sm text-error">{error}</Text>
        </View>
      )}

      {helper && !error && (
        <Text
          className={`mt-2 text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {helper}
        </Text>
      )}
    </View>
  );
}

export default Input;
