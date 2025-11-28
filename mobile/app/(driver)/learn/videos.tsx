import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { SearchBar, Chip, Card } from '../../../src/components/common';
import { videosService, Video, VideoCategory } from '../../../src/services/learn';

export default function VideosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(params.category as string || 'all');

  // State for API data
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await videosService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      setError(null);
      let data: Video[];

      if (selectedCategory === 'all') {
        const response = await videosService.getVideos();
        data = response.videos;
      } else {
        const response = await videosService.getVideosByCategory(selectedCategory);
        data = response.videos;
      }

      setVideos(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
  };

  const openYouTubeVideo = async (video: Video) => {
    try {
      const youtubeAppUrl = `youtube://watch?v=${video.youtube_id}`;
      const canOpenApp = await Linking.canOpenURL(youtubeAppUrl);

      if (canOpenApp) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        await Linking.openURL(video.youtube_url);
      }
    } catch (error) {
      await Linking.openURL(video.youtube_url);
    }
  };

  // Build category filter options
  const categoryOptions = [
    { id: 'all', label: 'All Videos', color: '#64748B' },
    ...categories.map(cat => ({
      id: cat.slug,
      label: cat.name,
      color: cat.color,
    })),
  ];

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.channel_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading && videos.length === 0) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading videos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center mr-2"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Video Tutorials
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredVideos.length} videos • Learn to drive & fix
            </Text>
          </View>
        </View>

        <SearchBar
          placeholder="Search videos..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categoryOptions.map((category) => (
            <Chip
              key={category.id}
              label={category.label}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Videos List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View className="items-center justify-center py-12">
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Failed to load videos
            </Text>
            <Text className={`mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchVideos}
              className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4 pb-8">
            {filteredVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                onPress={() => openYouTubeVideo(video)}
                activeOpacity={0.8}
              >
                <Card variant="default" padding="none" className="overflow-hidden">
                  {/* Thumbnail */}
                  <View className="relative">
                    <Image
                      source={{ uri: video.thumbnail_url }}
                      className="h-48 w-full"
                      resizeMode="cover"
                    />
                    {/* Play Button Overlay */}
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="h-16 w-16 rounded-full bg-red-600/90 items-center justify-center">
                        <MaterialIcons name="play-arrow" size={40} color="#FFFFFF" />
                      </View>
                    </View>
                    {/* Duration */}
                    <View className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded">
                      <Text className="text-white text-xs font-medium">
                        {video.duration_formatted}
                      </Text>
                    </View>
                    {/* Featured Badge */}
                    {video.is_featured && (
                      <View className="absolute top-3 left-3 bg-amber-500 px-2 py-1 rounded">
                        <Text className="text-white text-xs font-bold">FEATURED</Text>
                      </View>
                    )}
                  </View>

                  {/* Video Info */}
                  <View className="p-4">
                    <Text
                      className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
                      numberOfLines={2}
                    >
                      {video.title}
                    </Text>

                    <View className="flex-row items-center mt-2">
                      <MaterialIcons
                        name="person"
                        size={14}
                        color={isDark ? '#94A3B8' : '#64748B'}
                      />
                      <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {video.channel_name}
                      </Text>
                      <View className="mx-2 h-1 w-1 rounded-full bg-slate-400" />
                      <MaterialIcons
                        name="visibility"
                        size={14}
                        color={isDark ? '#94A3B8' : '#64748B'}
                      />
                      <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {video.views_count.toLocaleString()} views
                      </Text>
                    </View>

                    {video.category && (
                      <View className="flex-row items-center mt-2">
                        <View
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: video.category.color + '20' }}
                        >
                          <Text
                            className="text-xs font-medium"
                            style={{ color: video.category.color }}
                          >
                            {video.category.name}
                          </Text>
                        </View>
                      </View>
                    )}

                    {video.description && (
                      <Text
                        className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        numberOfLines={2}
                      >
                        {video.description}
                      </Text>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {filteredVideos.length === 0 && !error && (
          <View className="items-center justify-center py-12">
            <MaterialIcons
              name="video-library"
              size={48}
              color={isDark ? '#475569' : '#94A3B8'}
            />
            <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No videos found
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
