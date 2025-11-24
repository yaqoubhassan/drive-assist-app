import React from 'react';
import { View, Image, Text, ImageSourcePropType } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface AvatarProps {
  source?: ImageSourcePropType | string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeColor?: string;
  className?: string;
}

export function Avatar({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = '#10B981',
  className = '',
}: AvatarProps) {
  const { isDark } = useTheme();

  const sizeStyles = {
    xs: { container: 'h-8 w-8', text: 'text-xs', badge: 'h-2 w-2' },
    sm: { container: 'h-10 w-10', text: 'text-sm', badge: 'h-2.5 w-2.5' },
    md: { container: 'h-12 w-12', text: 'text-base', badge: 'h-3 w-3' },
    lg: { container: 'h-16 w-16', text: 'text-lg', badge: 'h-3.5 w-3.5' },
    xl: { container: 'h-24 w-24', text: 'text-2xl', badge: 'h-4 w-4' },
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    return initials;
  };

  const bgColor = isDark ? 'bg-slate-700' : 'bg-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-600';

  const renderContent = () => {
    if (source) {
      const imageSource =
        typeof source === 'string' ? { uri: source } : source;
      return (
        <Image
          source={imageSource}
          className="h-full w-full"
          resizeMode="cover"
        />
      );
    }

    if (name) {
      return (
        <Text className={`font-semibold ${textColor} ${sizeStyles[size].text}`}>
          {getInitials(name)}
        </Text>
      );
    }

    return (
      <MaterialIcons
        name="person"
        size={size === 'xl' ? 40 : size === 'lg' ? 28 : 20}
        color={isDark ? '#94A3B8' : '#64748B'}
      />
    );
  };

  return (
    <View className={`relative ${className}`}>
      <View
        className={`rounded-full overflow-hidden items-center justify-center ${bgColor} ${sizeStyles[size].container}`}
      >
        {renderContent()}
      </View>

      {showBadge && (
        <View
          className={`absolute bottom-0 right-0 rounded-full border-2 ${
            isDark ? 'border-slate-800' : 'border-white'
          } ${sizeStyles[size].badge}`}
          style={{ backgroundColor: badgeColor }}
        />
      )}
    </View>
  );
}

export default Avatar;
