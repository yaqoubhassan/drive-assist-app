import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  Platform,
  StyleSheet,
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
  multiline,
  ...props
}: InputProps) {
  const { isDark } = useTheme();
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
  const placeholderColor = isDark ? '#94A3B8' : '#9CA3AF';
  const iconColor = isDark ? '#94A3B8' : '#6B7280';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';

  // Dynamic input styles for iOS fix
  const inputStyles = StyleSheet.create({
    input: {
      flex: 1,
      fontSize: 16,
      color: textColor,
      // Fix iOS text alignment issue
      paddingTop: Platform.OS === 'ios' ? 14 : 12,
      paddingBottom: Platform.OS === 'ios' ? 14 : 12,
      // Ensure text is vertically centered
      textAlignVertical: 'center',
      // Minimum height for consistent sizing
      minHeight: multiline ? 100 : 48,
      // Remove default iOS padding that causes issues
      ...(Platform.OS === 'ios' && !multiline && {
        lineHeight: 20,
      }),
    },
  });

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
        style={multiline ? { alignItems: 'flex-start', paddingTop: 12 } : undefined}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={iconColor}
            style={{ marginRight: 12, marginTop: multiline ? 2 : 0 }}
          />
        )}

        <TextInput
          style={inputStyles.input}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isPassword && !isSecureVisible}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          multiline={multiline}
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
