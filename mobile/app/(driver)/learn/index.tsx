import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, SearchBar, SkeletonLearnScreen } from '../../../src/components/common';
import { useTheme } from '../../../src/context/ThemeContext';
import {
  articlesService,
  videosService,
  Article,
  Video,
  VideoCategory,
} from '../../../src/services/learn';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'road-signs', title: 'Road Signs Guide', subtitle: 'Learn all road signs', icon: 'traffic' as const, color: '#EF4444' },
  { id: 'videos', title: 'Video Tutorials', subtitle: 'Watch & learn', icon: 'play-circle-filled' as const, color: '#8B5CF6' },
  { id: 'car-issues', title: 'Common Car Issues', subtitle: 'Diagnose problems', icon: 'build' as const, color: '#F59E0B' },
  { id: 'maintenance', title: 'Maintenance Tips', subtitle: 'Keep car healthy', icon: 'checklist' as const, color: '#10B981' },
  { id: 'driving-tips', title: 'Driving Tips', subtitle: 'Drive safer', icon: 'directions-car' as const, color: '#3B82F6' },
  { id: 'safety', title: 'Road Safety', subtitle: 'Stay protected', icon: 'security' as const, color: '#EC4899' },
];

export default function LearnScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // State for API data
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosData, videoCatsData, articlesData] = await Promise.all([
        videosService.getFeaturedVideos().catch(() => []),
        videosService.getCategories().catch(() => []),
        articlesService.getArticles({ page: 1 }).catch(() => ({ articles: [] })),
      ]);

      setFeaturedVideos(videosData);
      setVideoCategories(videoCatsData);
      setArticles(articlesData.articles || []);
    } catch (error) {
      console.error('Error fetching learn data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const openYouTubeVideo = async (video: Video) => {
    try {
      // Try YouTube app first
      const youtubeAppUrl = `youtube://watch?v=${video.youtube_id}`;
      const canOpenApp = await Linking.canOpenURL(youtubeAppUrl);

      if (canOpenApp) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Fall back to web URL
        await Linking.openURL(video.youtube_url);
      }
    } catch (error) {
      // Final fallback
      await Linking.openURL(video.youtube_url);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (categoryId === 'road-signs') {
      router.push('/(driver)/learn/road-signs');
    } else if (categoryId === 'videos') {
      router.push('/(driver)/learn/videos');
    } else {
      router.push(`/(driver)/learn/category/${categoryId}`);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                onPress={() => handleCategoryPress(category.id)}
                className={`flex-row items-center p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'
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

        {/* Quiz Banner */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={() => router.push('/(driver)/learn/quiz')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-5"
              style={{ borderRadius: 16 }}
            >
              <View className={`flex-row items-center justify-between ${Platform.OS === 'ios' ? 'p-5' : ''}`}>
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View className="h-10 w-10 rounded-full bg-white/20 items-center justify-center mr-3">
                      <MaterialIcons name="quiz" size={22} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text className="text-white text-lg font-bold">Test Your Knowledge</Text>
                      <Text className="text-white/80 text-sm">Take the Road Signs Quiz</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1 mr-2">
                      <MaterialIcons name="help-outline" size={14} color="#FFFFFF" />
                      <Text className="text-white text-xs ml-1">40 Questions</Text>
                    </View>
                    <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                      <MaterialIcons name="emoji-events" size={14} color="#FFFFFF" />
                      <Text className="text-white text-xs ml-1">Earn Badges</Text>
                    </View>
                  </View>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Videos */}
        {featuredVideos.length > 0 && (
          <View className="pb-6">
            <View className="flex-row items-center justify-between px-4 mb-3">
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Featured Videos
              </Text>
              <TouchableOpacity onPress={() => router.push('/(driver)/learn/videos')}>
                <Text className="text-primary-500 font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {featuredVideos.slice(0, 5).map((video) => (
                <TouchableOpacity
                  key={video.id}
                  onPress={() => openYouTubeVideo(video)}
                  className="relative w-72 rounded-xl overflow-hidden"
                >
                  <Image
                    source={{ uri: video.thumbnail_url }}
                    className="h-40 w-full"
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute inset-0"
                  />
                  {/* Play Button */}
                  <View className="absolute inset-0 items-center justify-center">
                    <View className="h-14 w-14 rounded-full bg-red-600 items-center justify-center">
                      <MaterialIcons name="play-arrow" size={32} color="#FFFFFF" />
                    </View>
                  </View>
                  {/* Duration */}
                  <View className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-medium">
                      {video.duration_formatted}
                    </Text>
                  </View>
                  {/* Video Info */}
                  <View className="absolute bottom-3 left-3 right-3">
                    <Text className="text-white font-bold" numberOfLines={2}>
                      {video.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons name="person" size={12} color="#FFFFFF99" />
                      <Text className="text-white/70 text-xs ml-1">
                        {video.channel_name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Video Categories */}
        {videoCategories.length > 0 && (
          <View className="pb-6">
            <Text className={`text-lg font-bold px-4 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Video Categories
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {videoCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => router.push(`/(driver)/learn/videos?category=${category.slug}`)}
                  className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                  style={{ width: 140 }}
                >
                  <View
                    className="h-10 w-10 rounded-lg items-center justify-center mb-2"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    <MaterialIcons
                      name={category.icon as any || 'play-circle-filled'}
                      size={20}
                      color={category.color}
                    />
                  </View>
                  <Text
                    className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {category.video_count} videos
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Articles */}
        {articles.length > 0 && (
          <View className="px-4 pb-8">
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Recent Articles
              </Text>
              <TouchableOpacity onPress={() => router.push('/(driver)/learn/articles')}>
                <Text className="text-primary-500 font-medium">See All</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              {articles.slice(0, 5).map((article) => (
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
                      className="h-24 w-24"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={`h-24 w-24 items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                    >
                      <MaterialIcons
                        name="article"
                        size={32}
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
                    <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {article.read_time_minutes} min read
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Skeleton Loading Overlay */}
      {loading && (
        <View className="absolute inset-0">
          <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
            <SkeletonLearnScreen />
          </SafeAreaView>
        </View>
      )}
    </SafeAreaView>
  );
}
