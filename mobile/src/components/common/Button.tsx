import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  Animated,
  Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  loadingText?: string; // Optional text to show during loading
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  loadingText,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  // Animation for loading state
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      // Subtle pulse animation when loading
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      opacityAnim.setValue(1);
    }
  }, [loading, opacityAnim]);

  // Press animation
  const handlePressIn = () => {
    if (!loading && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

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

  const disabledStyles = disabled && !loading ? 'opacity-50' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  const iconColor = variant === 'outline' || variant === 'ghost' ? '#3B82F6' : '#FFFFFF';

  // Get loading text if provided, otherwise use default
  const displayLoadingText = loadingText || getDefaultLoadingText(title);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: loading ? opacityAnim : 1,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      <TouchableOpacity
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`}
        disabled={disabled || loading}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {loading ? (
          <>
            <ActivityIndicator color={iconColor} size="small" />
            <Text
              className={`font-semibold ${variantTextStyles[variant]} ${textSizeStyles[size]} ml-2`}
            >
              {displayLoadingText}
            </Text>
          </>
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
    </Animated.View>
  );
}

// Helper to generate default loading text based on button title
function getDefaultLoadingText(title: string): string {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('sign in') || lowerTitle.includes('login')) {
    return 'Signing in...';
  }
  if (lowerTitle.includes('sign up') || lowerTitle.includes('register') || lowerTitle.includes('create account')) {
    return 'Creating account...';
  }
  if (lowerTitle.includes('verify')) {
    return 'Verifying...';
  }
  if (lowerTitle.includes('send') || lowerTitle.includes('submit')) {
    return 'Sending...';
  }
  if (lowerTitle.includes('save')) {
    return 'Saving...';
  }
  if (lowerTitle.includes('reset')) {
    return 'Resetting...';
  }
  if (lowerTitle.includes('continue')) {
    return 'Loading...';
  }

  return 'Please wait...';
}

export default Button;
