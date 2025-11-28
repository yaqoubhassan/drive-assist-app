import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { SearchBar, Chip, Card } from '../../../src/components/common';
import { roadSignsService, RoadSignCategory, RoadSign } from '../../../src/services/learn';

export default function RoadSignsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSign, setExpandedSign] = useState<string | null>(null);

  // State for API data
  const [categories, setCategories] = useState<RoadSignCategory[]>([]);
  const [signs, setSigns] = useState<RoadSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [categoriesData, signsData] = await Promise.all([
        roadSignsService.getCategories(),
        roadSignsService.getAllSigns(),
      ]);
      setCategories(categoriesData);
      setSigns(signsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load road signs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // Build category filter options
  const categoryOptions = [
    { id: 'all', label: 'All Signs', color: '#64748B' },
    ...categories.map(cat => ({
      id: cat.slug,
      label: cat.name.replace(' Signs', ''),
      color: cat.color,
    })),
  ];

  const filteredSigns = signs.filter((sign) => {
    const matchesSearch = sign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sign.meaning.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || sign.category?.slug === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (sign: RoadSign) => {
    return sign.category?.color || '#64748B';
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading road signs...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Failed to load road signs
          </Text>
          <Text className={`mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchData}
            className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
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
              Ghana Road Signs
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredSigns.length} signs • DVLA Approved
            </Text>
          </View>
        </View>

        <SearchBar
          placeholder="Search road signs..."
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

      {/* Signs List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="gap-3 pb-8">
          {filteredSigns.map((sign) => (
            <TouchableOpacity
              key={sign.id}
              onPress={() => setExpandedSign(expandedSign === sign.id.toString() ? null : sign.id.toString())}
              activeOpacity={0.7}
            >
              <Card variant="default" padding="none" className="overflow-hidden">
                <View className="flex-row p-4">
                  {/* Sign Image */}
                  <View
                    className="h-20 w-20 rounded-lg items-center justify-center mr-4"
                    style={{ backgroundColor: getCategoryColor(sign) + '15' }}
                  >
                    <Image
                      source={{ uri: sign.image }}
                      className="h-14 w-14"
                      resizeMode="contain"
                    />
                  </View>

                  {/* Sign Info */}
                  <View className="flex-1 justify-center">
                    <View className="flex-row items-center mb-1">
                      <View
                        className="h-2 w-2 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(sign) }}
                      />
                      <Text
                        className="text-xs font-medium capitalize"
                        style={{ color: getCategoryColor(sign) }}
                      >
                        {sign.category?.name || 'General'}
                      </Text>
                    </View>
                    <Text className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sign.name}
                    </Text>
                    <Text
                      className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      numberOfLines={expandedSign === sign.id.toString() ? undefined : 2}
                    >
                      {sign.description}
                    </Text>
                  </View>

                  {/* Expand Icon */}
                  <View className="items-center justify-center">
                    <MaterialIcons
                      name={expandedSign === sign.id.toString() ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={isDark ? '#64748B' : '#94A3B8'}
                    />
                  </View>
                </View>

                {/* Expanded Content - Full Meaning */}
                {expandedSign === sign.id.toString() && (
                  <View className={`px-4 pb-4 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <View className="mb-3">
                      <Text className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        What it means:
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {sign.meaning}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="lightbulb" size={18} color="#F59E0B" />
                      <Text className={`text-sm ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        Always obey road signs for your safety
                      </Text>
                    </View>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {filteredSigns.length === 0 && (
          <View className="items-center justify-center py-12">
            <MaterialIcons
              name="search-off"
              size={48}
              color={isDark ? '#475569' : '#94A3B8'}
            />
            <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No signs found
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
