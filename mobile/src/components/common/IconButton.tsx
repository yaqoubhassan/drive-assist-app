import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface IconButtonProps extends TouchableOpacityProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost';
  badge?: number;
}

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  badge,
  disabled,
  className = '',
  ...props
}: IconButtonProps) {
  const { isDark } = useTheme();

  const sizeStyles = {
    sm: { container: 'h-8 w-8', icon: 18 },
    md: { container: 'h-10 w-10', icon: 22 },
    lg: { container: 'h-12 w-12', icon: 26 },
  };

  const variantStyles = {
    default: isDark ? 'bg-slate-800' : 'bg-slate-100',
    primary: 'bg-primary-500',
    ghost: 'bg-transparent',
  };

  const iconColors = {
    default: isDark ? '#E2E8F0' : '#475569',
    primary: '#FFFFFF',
    ghost: isDark ? '#E2E8F0' : '#475569',
  };

  return (
    <TouchableOpacity
      className={`rounded-full items-center justify-center ${variantStyles[variant]} ${sizeStyles[size].container} ${disabled ? 'opacity-50' : ''} ${className}`}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <MaterialIcons
        name={icon}
        size={sizeStyles[size].icon}
        color={iconColors[variant]}
      />

      {badge !== undefined && badge > 0 && (
        <View className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-error items-center justify-center">
          <View className="text-xs font-bold text-white">
            {badge > 99 ? '99+' : badge.toString()}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default IconButton;
