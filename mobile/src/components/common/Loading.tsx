import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface LoadingProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export function Loading({
  size = 'large',
  message,
  fullScreen = false,
  overlay = false,
  className = '',
}: LoadingProps) {
  const { isDark } = useTheme();

  const content = (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator
        size={size}
        color="#3B82F6"
      />
      {message && (
        <Text
          className={`mt-4 text-base ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View
        className={`flex-1 items-center justify-center ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {content}
      </View>
    );
  }

  if (overlay) {
    return (
      <View className="absolute inset-0 items-center justify-center bg-black/50 z-50">
        <View
          className={`p-8 rounded-2xl ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
        >
          {content}
        </View>
      </View>
    );
  }

  return content;
}

export default Loading;
