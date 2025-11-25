import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Card, Badge, SearchBar } from '../../../../src/components/common';

const categoryData: Record<string, { title: string; description: string; icon: string; color: string }> = {
  'road-signs': { title: 'Road Signs Guide', description: '150+ signs explained', icon: 'traffic', color: '#EF4444' },
  'car-issues': { title: 'Common Car Issues', description: 'Learn about frequent problems', icon: 'build', color: '#F59E0B' },
  'maintenance': { title: 'Maintenance Guides', description: 'Keep your car running smoothly', icon: 'checklist', color: '#10B981' },
  'driving-tips': { title: 'Driving Tips', description: 'Become a safer driver', icon: 'directions-car', color: '#3B82F6' },
  'ev': { title: 'Electric Vehicles', description: 'Everything about EVs', icon: 'electric-car', color: '#8B5CF6' },
  'bikes': { title: 'E-Bikes & Scooters', description: 'Alternative transportation', icon: 'two-wheeler', color: '#EC4899' },
};

const articlesByCategory: Record<string, Array<{ id: string; title: string; readTime: string; image: string; difficulty: string }>> = {
  'car-issues': [
    { id: '10', title: 'Engine Overheating: Causes & Solutions', readTime: '6 min', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', difficulty: 'Beginner' },
    { id: '11', title: 'Strange Noises and What They Mean', readTime: '8 min', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400', difficulty: 'Intermediate' },
    { id: '12', title: 'Diagnosing Check Engine Light', readTime: '10 min', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400', difficulty: 'Advanced' },
    { id: '13', title: 'Battery Problems and Fixes', readTime: '5 min', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', difficulty: 'Beginner' },
  ],
  'maintenance': [
    { id: '20', title: 'Oil Change: Step by Step Guide', readTime: '7 min', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400', difficulty: 'Beginner' },
    { id: '21', title: 'Tire Rotation Explained', readTime: '5 min', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', difficulty: 'Beginner' },
    { id: '22', title: 'Air Filter Replacement', readTime: '4 min', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', difficulty: 'Beginner' },
    { id: '23', title: 'Brake Pad Inspection Guide', readTime: '8 min', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400', difficulty: 'Intermediate' },
  ],
  'driving-tips': [
    { id: '30', title: 'Defensive Driving Techniques', readTime: '10 min', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400', difficulty: 'Beginner' },
    { id: '31', title: 'Driving in Heavy Rain', readTime: '6 min', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400', difficulty: 'Intermediate' },
    { id: '32', title: 'Night Driving Safety Tips', readTime: '5 min', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400', difficulty: 'Beginner' },
    { id: '33', title: 'Fuel Efficient Driving', readTime: '7 min', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', difficulty: 'Beginner' },
  ],
  'ev': [
    { id: '40', title: 'EV Basics: How They Work', readTime: '8 min', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400', difficulty: 'Beginner' },
    { id: '41', title: 'Charging Your EV: Complete Guide', readTime: '12 min', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', difficulty: 'Beginner' },
    { id: '42', title: 'EV Battery Care Tips', readTime: '6 min', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', difficulty: 'Intermediate' },
    { id: '43', title: 'Cost Comparison: EV vs Gas', readTime: '10 min', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400', difficulty: 'Beginner' },
  ],
  'bikes': [
    { id: '50', title: 'E-Bike Buying Guide', readTime: '10 min', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', difficulty: 'Beginner' },
    { id: '51', title: 'E-Scooter Safety Tips', readTime: '5 min', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400', difficulty: 'Beginner' },
    { id: '52', title: 'Maintenance for E-Bikes', readTime: '7 min', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400', difficulty: 'Intermediate' },
    { id: '53', title: 'Commuting with E-Bikes', readTime: '6 min', image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400', difficulty: 'Beginner' },
  ],
};

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const category = categoryData[id || ''] || { title: 'Category', description: '', icon: 'article', color: '#3B82F6' };
  const articles = articlesByCategory[id || ''] || [];

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-2"
        >
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {category.title}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {category.description}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View className="px-4 py-4">
          <SearchBar
            placeholder={`Search ${category.title.toLowerCase()}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Articles */}
        <View className="px-4 pb-8">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {filteredArticles.length} ARTICLES
          </Text>
          <View className="gap-3">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                variant="default"
                padding="none"
                className="flex-row overflow-hidden"
                onPress={() => router.push(`/(driver)/learn/article/${article.id}`)}
              >
                <Image source={{ uri: article.image }} className="h-24 w-24" resizeMode="cover" />
                <View className="flex-1 p-4 justify-center">
                  <Badge label={article.difficulty} variant="info" size="sm" className="self-start mb-1" />
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {article.title}
                  </Text>
                  <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {article.readTime} read
                  </Text>
                </View>
                <View className="justify-center pr-4">
                  <MaterialIcons name="chevron-right" size={24} color={isDark ? '#475569' : '#94A3B8'} />
                </View>
              </Card>
            ))}
          </View>

          {filteredArticles.length === 0 && (
            <View className="items-center py-12">
              <MaterialIcons name="search-off" size={48} color={isDark ? '#475569' : '#94A3B8'} />
              <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No articles found
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Try a different search term
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
