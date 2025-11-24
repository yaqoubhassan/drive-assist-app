import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  image?: ImageSourcePropType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  image,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const { isDark } = useTheme();

  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`}>
      {image ? (
        <Image
          source={image}
          className="w-48 h-48 mb-6"
          resizeMode="contain"
        />
      ) : icon ? (
        <View
          className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}
        >
          <MaterialIcons
            name={icon}
            size={48}
            color={isDark ? '#64748B' : '#94A3B8'}
          />
        </View>
      ) : null}

      <Text
        className={`text-xl font-bold text-center mb-2 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </Text>

      {description && (
        <Text
          className={`text-base text-center mb-6 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </View>
  );
}

export default EmptyState;
