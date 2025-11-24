import React from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps extends TextInputProps {
  onFilterPress?: () => void;
  showFilter?: boolean;
  filterActive?: boolean;
  containerClassName?: string;
}

export function SearchBar({
  onFilterPress,
  showFilter = false,
  filterActive = false,
  containerClassName = '',
  className = '',
  ...props
}: SearchBarProps) {
  const { isDark } = useTheme();

  const bgColor = isDark ? 'bg-slate-800' : 'bg-slate-100';
  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const placeholderColor = isDark ? '#64748B' : '#9CA3AF';
  const iconColor = isDark ? '#64748B' : '#6B7280';

  return (
    <View className={`flex-row items-center ${containerClassName}`}>
      <View
        className={`flex-1 flex-row items-center rounded-full px-4 h-11 ${bgColor}`}
      >
        <MaterialIcons name="search" size={20} color={iconColor} />

        <TextInput
          className={`flex-1 ml-3 text-base ${textColor} ${className}`}
          placeholderTextColor={placeholderColor}
          placeholder="Search..."
          {...props}
        />

        {props.value && (
          <TouchableOpacity
            onPress={() => props.onChangeText?.('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      {showFilter && (
        <TouchableOpacity
          className={`ml-3 h-11 w-11 rounded-full items-center justify-center ${bgColor}`}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="tune"
            size={22}
            color={filterActive ? '#3B82F6' : iconColor}
          />
          {filterActive && (
            <View className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary-500 border-2 border-white dark:border-slate-800" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default SearchBar;
