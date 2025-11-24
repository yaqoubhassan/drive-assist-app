import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Button, CategoryCard } from '../../../src/components/common';
import { DiagnosisCategory } from '../../../src/types';

interface Category {
  id: DiagnosisCategory;
  title: string;
  description: string;
}

const categories: Category[] = [
  { id: 'engine', title: 'Engine', description: 'Noises, smoke, or leaks' },
  { id: 'brakes', title: 'Brakes', description: 'Squeaking, grinding' },
  { id: 'electrical', title: 'Electrical', description: 'Lights, battery issues' },
  { id: 'transmission', title: 'Transmission', description: 'Shifting problems' },
  { id: 'tires', title: 'Tires & Wheels', description: 'Vibrations, alignment' },
  { id: 'other', title: 'Not Sure / Other', description: 'Describe the problem' },
];

export default function DiagnoseCategoryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<DiagnosisCategory | null>(null);

  const handleContinue = () => {
    if (selectedCategory) {
      router.push({
        pathname: '/(driver)/diagnose/describe',
        params: { category: selectedCategory },
      });
    }
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(driver)/diagnose/describe',
      params: { category: 'other' },
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
        <Text
          className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Step 1 of 4
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center"
        >
          <MaterialIcons
            name="close"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="pt-6 pb-3">
          <Text
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            What's the issue?
          </Text>
          <Text
            className={`text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Select the area with problems
          </Text>
        </View>

        {/* Category Grid */}
        <View className="flex-row flex-wrap gap-4 pt-4 pb-6">
          {categories.map((category) => (
            <View key={category.id} className="w-[47%]">
              <CategoryCard
                category={category.id}
                title={category.title}
                description={category.description}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className={`px-4 py-4 border-t ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
      >
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedCategory}
          fullWidth
        />
        <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
          <Text className="text-primary-500 font-bold">Skip this step</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
