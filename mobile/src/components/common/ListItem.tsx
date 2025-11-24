import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  leftIconColor?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  showChevron?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  badge?: string;
  badgeColor?: string;
  onPress?: () => void;
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  leftIconColor,
  leftComponent,
  rightComponent,
  showChevron = true,
  switchValue,
  onSwitchChange,
  badge,
  badgeColor = '#10B981',
  onPress,
  className = '',
}: ListItemProps) {
  const { isDark } = useTheme();

  const iconBgColor = isDark ? 'bg-slate-700' : 'bg-slate-200';
  const iconDefaultColor = isDark ? '#94A3B8' : '#64748B';

  const content = (
    <View className={`flex-row items-center py-3 ${className}`}>
      {leftComponent && <View className="mr-4">{leftComponent}</View>}

      {leftIcon && !leftComponent && (
        <View className={`h-10 w-10 rounded-lg items-center justify-center mr-4 ${iconBgColor}`}>
          <MaterialIcons
            name={leftIcon}
            size={22}
            color={leftIconColor || iconDefaultColor}
          />
        </View>
      )}

      <View className="flex-1">
        <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </Text>
        )}
      </View>

      {badge && (
        <View
          className="px-2.5 py-0.5 rounded-full mr-2"
          style={{ backgroundColor: badgeColor + '20' }}
        >
          <Text className="text-xs font-semibold" style={{ color: badgeColor }}>
            {badge}
          </Text>
        </View>
      )}

      {rightComponent && <View className="ml-2">{rightComponent}</View>}

      {switchValue !== undefined && onSwitchChange && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#CBD5E1', true: '#3B82F6' }}
          thumbColor="#FFFFFF"
        />
      )}

      {showChevron && switchValue === undefined && (
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={isDark ? '#64748B' : '#94A3B8'}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default ListItem;
