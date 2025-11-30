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
import { Badge, Card, Chip, SearchBar, Skeleton, EmptyState } from '../../../src/components/common';
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

  // Build category chips
  const categoryChips = [
    { id: 'all', slug: null, label: 'All' },
    ...categories.map(cat => ({ id: cat.id.toString(), slug: cat.slug, label: cat.name })),
  ];

  // Skeleton for category chips - matches Chip component (h-10 = 40px)
  const CategoryChipsSkeleton = () => (
    <View className="flex-row gap-2 px-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} width={i === 1 ? 50 : 90} height={40} borderRadius={20} />
      ))}
    </View>
  );

  // Skeleton for article cards
  const ArticlesSkeleton = () => (
    <View className="gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          className={`flex-row rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
        >
          <Skeleton width={112} height={112} borderRadius={0} />
          <View className="flex-1 p-4 justify-center">
            <Skeleton width={60} height={18} borderRadius={9} style={{ marginBottom: 8 }} />
            <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="70%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="50%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold flex-1 ml-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            All Articles
          </Text>
        </View>

        {/* Search */}
        <SearchBar
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
      >
        {loading ? (
          <CategoryChipsSkeleton />
        ) : (
          <View className="flex-row gap-2 px-4">
            {categoryChips.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                selected={selectedCategory === cat.slug}
                onPress={() => setSelectedCategory(cat.slug)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Results count */}
      <View className="px-4 py-2">
        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {loading ? 'Loading...' : `${articles.length} articles found`}
        </Text>
      </View>

      {/* Articles List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ArticlesSkeleton />
        ) : articles.length > 0 ? (
          <View className="gap-3 pb-8">
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
                      {article.read_time ?? 3} min read
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
        ) : (
          <EmptyState
            icon="article"
            title="No Articles Found"
            description={searchQuery ? 'Try a different search term' : 'Check back later for new content'}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
