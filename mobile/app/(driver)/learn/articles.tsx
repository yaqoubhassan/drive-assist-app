import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Badge, Card, SearchBar, SkeletonArticlesScreen, SkeletonChips } from '../../../src/components/common';
import { articlesService, Article, ArticleCategory } from '../../../src/services/learn';

export default function ArticlesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchArticles = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: { page: number; category?: string; search?: string } = { page };
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const result = await articlesService.getArticles(params);

      if (reset || page === 1) {
        setArticles(result.articles);
      } else {
        setArticles(prev => [...prev, ...result.articles]);
      }

      setCurrentPage(result.currentPage);
      setHasMore(result.currentPage < result.lastPage);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const cats = await articlesService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(1, true);
  }, [selectedCategory, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArticles(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchArticles(currentPage + 1);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMore();
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-3"
        >
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          All Articles
        </Text>
      </View>

      {/* Search */}
      <View className="px-4 py-3">
        <SearchBar
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full ${
              !selectedCategory
                ? 'bg-primary-500'
                : isDark ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            <Text className={!selectedCategory ? 'text-white font-medium' : isDark ? 'text-slate-300' : 'text-slate-700'}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === cat.slug
                  ? 'bg-primary-500'
                  : isDark ? 'bg-slate-800' : 'bg-white'
              }`}
            >
              <Text className={selectedCategory === cat.slug ? 'text-white font-medium' : isDark ? 'text-slate-300' : 'text-slate-700'}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Articles List */}
      {loading ? (
        <View className="flex-1 pt-4">
          {/* Category chips skeleton */}
          <View className="mb-4">
            <SkeletonChips count={4} />
          </View>
          {/* Articles skeleton */}
          <SkeletonArticlesScreen />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={400}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {articles.length === 0 ? (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="article" size={64} color={isDark ? '#475569' : '#94A3B8'} />
              <Text className={`mt-4 text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No articles found
              </Text>
              <Text className={`mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {searchQuery ? 'Try a different search term' : 'Check back later for new content'}
              </Text>
            </View>
          ) : (
            <View className="gap-3 pb-6">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  variant="default"
                  padding="none"
                  className="flex-row overflow-hidden"
                  onPress={() => router.push(`/(driver)/learn/article/${article.slug}`)}
                >
                  {article.featured_image ? (
                    <Image
                      source={{ uri: article.featured_image }}
                      className="h-28 w-28"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={`h-28 w-28 items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                    >
                      <MaterialIcons
                        name="article"
                        size={36}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  )}
                  <View className="flex-1 p-4 justify-center">
                    <Badge
                      label={article.category?.name || 'Article'}
                      variant="info"
                      size="sm"
                      className="self-start mb-1"
                    />
                    <Text
                      className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                      numberOfLines={2}
                    >
                      {article.title}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <MaterialIcons name="schedule" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                      <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {article.read_time_minutes} min read
                      </Text>
                      <View className="flex-row items-center ml-3">
                        <MaterialIcons name="visibility" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {article.views_count}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}

              {loadingMore && (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
