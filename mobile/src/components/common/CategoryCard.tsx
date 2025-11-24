import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { DiagnosisCategory } from '../../types';

interface CategoryCardProps {
  category: DiagnosisCategory;
  title: string;
  description: string;
  selected?: boolean;
  onPress?: () => void;
}

const categoryConfig: Record<
  DiagnosisCategory,
  { icon: keyof typeof MaterialIcons.glyphMap; color: string; bgColor: string }
> = {
  engine: { icon: 'settings', color: '#F97316', bgColor: 'bg-orange-500/20' },
  brakes: { icon: 'disc-full', color: '#EF4444', bgColor: 'bg-red-500/20' },
  electrical: { icon: 'electrical-services', color: '#EAB308', bgColor: 'bg-yellow-500/20' },
  transmission: { icon: 'directions-car', color: '#8B5CF6', bgColor: 'bg-violet-500/20' },
  tires: { icon: 'tire-repair', color: '#22C55E', bgColor: 'bg-green-500/20' },
  other: { icon: 'help-outline', color: '#64748B', bgColor: 'bg-slate-500/20' },
};

export function CategoryCard({
  category,
  title,
  description,
  selected = false,
  onPress,
}: CategoryCardProps) {
  const { isDark } = useTheme();
  const config = categoryConfig[category];

  const baseStyles = isDark ? 'bg-slate-800/50' : 'bg-slate-100';
  const selectedStyles = selected
    ? 'border-2 border-primary-500 bg-primary-500/10'
    : `border-2 border-transparent ${baseStyles}`;

  return (
    <TouchableOpacity
      className={`flex-1 p-4 rounded-xl ${selectedStyles}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className={`h-12 w-12 rounded-lg items-center justify-center ${config.bgColor}`}>
        <MaterialIcons name={config.icon} size={28} color={config.color} />
      </View>

      <View className="mt-3">
        <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </Text>
        <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default CategoryCard;
