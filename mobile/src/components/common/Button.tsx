import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';

  const variantStyles = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    outline: 'bg-transparent border-2 border-primary-500',
    ghost: 'bg-transparent',
    danger: 'bg-error',
  };

  const variantTextStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-500',
    ghost: 'text-primary-500',
    danger: 'text-white',
  };

  const sizeStyles = {
    sm: 'h-10 px-4',
    md: 'h-12 px-6',
    lg: 'h-14 px-8',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 18,
    md: 20,
    lg: 24,
  };

  const disabledStyles = disabled || loading ? 'opacity-50' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  const iconColor = variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#FFFFFF';

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialIcons
              name={icon}
              size={iconSizes[size]}
              color={iconColor}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            className={`font-semibold ${variantTextStyles[variant]} ${textSizeStyles[size]}`}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialIcons
              name={icon}
              size={iconSizes[size]}
              color={iconColor}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
