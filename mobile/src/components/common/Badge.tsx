import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-200 dark:bg-slate-700',
    success: 'bg-green-100 dark:bg-green-900/50',
    warning: 'bg-amber-100 dark:bg-amber-900/50',
    error: 'bg-red-100 dark:bg-red-900/50',
    info: 'bg-blue-100 dark:bg-blue-900/50',
    primary: 'bg-primary-100 dark:bg-primary-900/50',
  };

  const textStyles = {
    default: 'text-slate-700 dark:text-slate-300',
    success: 'text-green-700 dark:text-green-300',
    warning: 'text-amber-700 dark:text-amber-300',
    error: 'text-red-700 dark:text-red-300',
    info: 'text-blue-700 dark:text-blue-300',
    primary: 'text-primary-700 dark:text-primary-300',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View
      className={`rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <Text
        className={`font-semibold ${textStyles[variant]} ${textSizeStyles[size]}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default Badge;
