import React, { ReactNode } from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  className = '',
  ...props
}: CardProps) {
  const { isDark } = useTheme();

  const baseStyles = 'rounded-xl overflow-hidden';

  const variantStyles = {
    default: isDark ? 'bg-slate-800' : 'bg-white',
    elevated: isDark
      ? 'bg-slate-800 shadow-lg'
      : 'bg-white shadow-md',
    outlined: isDark
      ? 'bg-transparent border border-slate-700'
      : 'bg-transparent border border-slate-200',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        className={combinedStyles}
        onPress={onPress}
        activeOpacity={0.8}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedStyles} {...props}>
      {children}
    </View>
  );
}

export default Card;
