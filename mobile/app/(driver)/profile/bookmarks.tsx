import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Badge, Chip, EmptyState } from '../../../src/components/common';

interface BookmarkedItem {
  id: string;
  type: 'article' | 'expert';
  title: string;
  subtitle: string;
  image: string;
  savedAt: string;
  category?: string;
}

const mockBookmarks: BookmarkedItem[] = [
  {
    id: '1',
    type: 'article',
    title: 'Winter Car Prep Checklist',
    subtitle: '5 min read • Maintenance',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400',
    savedAt: '2 days ago',
    category: 'Maintenance',
  },
  {
    id: '2',
    type: 'article',
    title: 'Understanding Dashboard Warning Lights',
    subtitle: '8 min read • Education',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400',
    savedAt: '3 days ago',
    category: 'Education',
  },
  {
    id: '3',
    type: 'expert',
    title: 'Emmanuel Auto Services',
    subtitle: '4.9 ★ • Engine & Transmission',
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400',
    savedAt: '1 week ago',
  },
  {
    id: '4',
    type: 'article',
    title: 'How to Check Your Oil Level',
    subtitle: '4 min read • Beginner',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400',
    savedAt: '1 week ago',
    category: 'Beginner',
  },
  {
    id: '5',
    type: 'expert',
    title: 'Quick Fix Garage',
    subtitle: '4.7 ★ • General Repairs',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
    savedAt: '2 weeks ago',
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'article', label: 'Articles' },
  { id: 'expert', label: 'Experts' },
];

export default function BookmarksScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>(mockBookmarks);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredBookmarks = selectedFilter === 'all'
    ? bookmarks
    : bookmarks.filter((b) => b.type === selectedFilter);

  const handleRemoveBookmark = (id: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this item from your bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setBookmarks(bookmarks.filter((b) => b.id !== id)),
        },
      ]
    );
  };

  const handleItemPress = (item: BookmarkedItem) => {
    if (item.type === 'article') {
      router.push(`/(driver)/learn/article/${item.id}`);
    } else {
      router.push(`/(driver)/experts/${item.id}`);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center mr-2"
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Saved Items
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredBookmarks.length} item{filteredBookmarks.length !== 1 ? 's' : ''} saved
            </Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              selected={selectedFilter === filter.id}
              onPress={() => setSelectedFilter(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Bookmarks List */}
      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {filteredBookmarks.length > 0 ? (
          <View className="gap-3 pb-8">
            {filteredBookmarks.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <Card variant="default" padding="none" className="overflow-hidden">
                  <View className="flex-row">
                    <Image
                      source={{ uri: item.image }}
                      className="h-24 w-24"
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-3 justify-center">
                      <View className="flex-row items-center gap-2 mb-1">
                        <Badge
                          label={item.type === 'article' ? 'Article' : 'Expert'}
                          variant={item.type === 'article' ? 'info' : 'success'}
                          size="sm"
                        />
                        {item.category && (
                          <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {item.category}
                          </Text>
                        )}
                      </View>
                      <Text
                        className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        numberOfLines={1}
                      >
                        {item.subtitle}
                      </Text>
                      <Text className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Saved {item.savedAt}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveBookmark(item.id)}
                      className="p-3 justify-center"
                    >
                      <MaterialIcons name="bookmark" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="bookmark-border"
            title="No Saved Items"
            description="Articles and experts you bookmark will appear here."
            actionLabel="Browse Articles"
            onAction={() => router.push('/(driver)/learn')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
