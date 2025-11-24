import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { SearchBar, Card, Badge } from '../../../src/components/common';

const categories = [
  { id: 'road-signs', title: 'Road Signs Guide', subtitle: '150+ signs explained', icon: 'traffic' as const, color: '#EF4444' },
  { id: 'car-issues', title: 'Common Car Issues', subtitle: 'Learn about frequent problems', icon: 'build' as const, color: '#F59E0B' },
  { id: 'maintenance', title: 'Maintenance Guides', subtitle: 'Keep your car running smoothly', icon: 'checklist' as const, color: '#10B981' },
  { id: 'driving-tips', title: 'Driving Tips', subtitle: 'Become a safer driver', icon: 'directions-car' as const, color: '#3B82F6' },
  { id: 'ev', title: 'Electric Vehicles', subtitle: 'Everything about EVs', icon: 'electric-car' as const, color: '#8B5CF6' },
  { id: 'bikes', title: 'E-Bikes & Scooters', subtitle: 'Alternative transportation', icon: 'two-wheeler' as const, color: '#EC4899' },
];

const featuredArticles = [
  {
    id: '1',
    title: 'Winter Car Prep Checklist',
    category: 'Maintenance',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400',
  },
  {
    id: '2',
    title: 'Understanding Dashboard Warning Lights',
    category: 'Education',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400',
  },
];

const recentArticles = [
  {
    id: '3',
    title: 'How to Check Your Oil Level',
    category: 'Beginner',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400',
  },
  {
    id: '4',
    title: 'Tire Pressure: Why It Matters',
    category: 'Safety',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
  {
    id: '5',
    title: 'Signs Your Brakes Need Attention',
    category: 'Safety',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
  },
];

export default function LearnScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Learn
          </Text>
          <SearchBar
            placeholder="Search articles, guides, tips..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerClassName="mt-4"
          />
        </View>

        {/* Categories */}
        <View className="px-4 pb-6">
          <View className="flex-row flex-wrap gap-3">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => {
                  if (category.id === 'road-signs') {
                    router.push('/(driver)/learn/road-signs');
                  }
                }}
                className={`flex-row items-center p-4 rounded-xl ${
                  isDark ? 'bg-slate-800' : 'bg-white'
                }`}
                style={{ width: '48%' }}
              >
                <View
                  className="h-12 w-12 rounded-lg items-center justify-center mr-3"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  <MaterialIcons name={category.icon} size={24} color={category.color} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {category.title}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {category.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured */}
        <View className="pb-6">
          <Text className={`text-lg font-bold px-4 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Featured This Week
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
            {featuredArticles.map((article) => (
              <TouchableOpacity
                key={article.id}
                onPress={() => router.push(`/(driver)/learn/article/${article.id}`)}
                className="relative w-72 h-44 rounded-xl overflow-hidden"
              >
                <Image source={{ uri: article.image }} className="h-full w-full" resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} className="absolute inset-0" />
                <View className="absolute bottom-4 left-4 right-4">
                  <Badge label={article.category} variant="primary" size="sm" className="self-start mb-2" />
                  <Text className="text-white font-bold text-lg">{article.title}</Text>
                  <Text className="text-white/70 text-sm">{article.readTime}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Articles */}
        <View className="px-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recently Added
          </Text>
          <View className="gap-3">
            {recentArticles.map((article) => (
              <Card
                key={article.id}
                variant="default"
                padding="none"
                className="flex-row overflow-hidden"
                onPress={() => router.push(`/(driver)/learn/article/${article.id}`)}
              >
                <Image source={{ uri: article.image }} className="h-24 w-24" resizeMode="cover" />
                <View className="flex-1 p-4 justify-center">
                  <Badge label={article.category} variant="info" size="sm" className="self-start mb-1" />
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {article.title}
                  </Text>
                  <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {article.readTime}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
