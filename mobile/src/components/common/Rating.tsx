import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface RatingProps {
  value: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export function Rating({
  value,
  maxValue = 5,
  size = 'md',
  showValue = true,
  reviewCount,
  interactive = false,
  onChange,
  className = '',
}: RatingProps) {
  const sizeStyles = {
    sm: { icon: 14, text: 'text-xs', gap: 'gap-0.5' },
    md: { icon: 18, text: 'text-sm', gap: 'gap-1' },
    lg: { icon: 24, text: 'text-base', gap: 'gap-1.5' },
  };

  const handlePress = (rating: number) => {
    if (interactive && onChange) {
      onChange(rating);
    }
  };

  const renderStar = (index: number) => {
    const filled = index < value;
    const halfFilled = index === Math.floor(value) && value % 1 >= 0.5;

    const StarComponent = interactive ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={() => handlePress(index + 1)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={halfFilled ? 'star-half' : filled ? 'star' : 'star-border'}
          size={sizeStyles[size].icon}
          color="#F59E0B"
        />
      </StarComponent>
    );
  };

  return (
    <View className={`flex-row items-center ${sizeStyles[size].gap} ${className}`}>
      <View className={`flex-row ${sizeStyles[size].gap}`}>
        {Array.from({ length: maxValue }, (_, i) => renderStar(i))}
      </View>

      {showValue && (
        <Text className={`font-semibold text-slate-700 dark:text-slate-300 ${sizeStyles[size].text}`}>
          {value.toFixed(1)}
        </Text>
      )}

      {reviewCount !== undefined && (
        <Text className={`text-slate-500 dark:text-slate-400 ${sizeStyles[size].text}`}>
          ({reviewCount} reviews)
        </Text>
      )}
    </View>
  );
}

export default Rating;
