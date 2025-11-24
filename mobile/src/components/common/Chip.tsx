import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ChipProps {
  label: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

export function Chip({
  label,
  icon,
  selected = false,
  onPress,
  onRemove,
  disabled = false,
  className = '',
}: ChipProps) {
  const { isDark } = useTheme();

  const baseStyles = selected
    ? 'bg-primary-500/20 border-primary-500'
    : isDark
    ? 'bg-slate-800 border-slate-700'
    : 'bg-slate-100 border-slate-200';

  const textColor = selected
    ? 'text-primary-500'
    : isDark
    ? 'text-slate-300'
    : 'text-slate-700';

  const iconColor = selected ? '#3B82F6' : isDark ? '#94A3B8' : '#64748B';

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={`flex-row items-center px-4 h-10 rounded-full border ${baseStyles} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={16}
          color={iconColor}
          style={{ marginRight: 6 }}
        />
      )}

      <Text className={`text-sm font-semibold ${textColor}`}>{label}</Text>

      {onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="ml-2"
        >
          <MaterialIcons name="close" size={16} color={iconColor} />
        </TouchableOpacity>
      )}
    </Component>
  );
}

export default Chip;
