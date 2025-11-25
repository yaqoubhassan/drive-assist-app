import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import {
  SearchBar,
  Card,
  Chip,
  Rating,
  Badge,
  Avatar,
  Button,
} from '../../../src/components/common';

const ghanaLocations = [
  'Accra, Greater Accra',
  'Tema, Greater Accra',
  'Kumasi, Ashanti',
  'Takoradi, Western',
  'Cape Coast, Central',
  'Tamale, Northern',
  'Sunyani, Bono',
  'Ho, Volta',
  'Koforidua, Eastern',
];

const filterChips = [
  'All',
  'Engine Specialists',
  'Brake Experts',
  'Electrical',
  '4.5★ & Up',
  'Open Now',
];

const experts = [
  {
    id: '1',
    name: "Kofi's Auto Repair",
    rating: 4.9,
    reviewCount: 234,
    distance: 2.3,
    status: 'open',
    closingTime: '6:00 PM',
    specialties: ['Engine', 'Brakes', 'Electrical'],
    priceRange: 'average',
    verified: true,
    recentReview: {
      text: 'Quick, honest service...',
      author: 'Sarah M.',
    },
    image: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400',
  },
  {
    id: '2',
    name: 'Precision Auto Works',
    rating: 4.8,
    reviewCount: 189,
    distance: 3.1,
    status: 'open',
    closingTime: '7:00 PM',
    specialties: ['Transmission', 'Engine'],
    priceRange: 'premium',
    verified: true,
    recentReview: {
      text: 'Very professional team...',
      author: 'Kwame A.',
    },
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
  },
  {
    id: '3',
    name: 'Quick Fix Garage',
    rating: 4.5,
    reviewCount: 156,
    distance: 1.8,
    status: 'closed',
    closingTime: 'Opens 8:00 AM',
    specialties: ['Oil Change', 'Tires'],
    priceRange: 'budget',
    verified: false,
    recentReview: {
      text: 'Affordable and fast...',
      author: 'Ama B.',
    },
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
  },
];

const priceRangeLabels: Record<string, string> = {
  budget: '$',
  average: '$$',
  premium: '$$$',
};

export default function ExpertsSearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Accra, Greater Accra');

  // Filter states
  const [minRating, setMinRating] = useState(0);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);

  const handleExpertPress = (expertId: string) => {
    router.push(`/(driver)/experts/${expertId}`);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      {/* Header */}
      <View className="px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Find Experts
          </Text>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center"
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons
              name="tune"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
        </View>

        {/* Location & Search */}
        <Card variant="default" padding="md" className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <MaterialIcons name="location-on" size={18} color="#3B82F6" />
            <Text
              className={`flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {selectedLocation.split(',')[0]}, Ghana
            </Text>
            <TouchableOpacity onPress={() => setShowLocationModal(true)}>
              <Text className="text-primary-500 font-semibold text-sm">
                Change
              </Text>
            </TouchableOpacity>
          </View>
          <SearchBar
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Card>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          <View className="flex-row gap-2">
            {filterChips.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
              />
            ))}
          </View>
        </ScrollView>

        {/* View Toggle */}
        <View className="flex-row justify-end gap-2 mt-2">
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            className={`h-10 w-10 rounded-lg items-center justify-center ${
              viewMode === 'list'
                ? 'bg-primary-500'
                : isDark
                ? 'bg-slate-800'
                : 'bg-slate-200'
            }`}
          >
            <MaterialIcons
              name="view-list"
              size={20}
              color={viewMode === 'list' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(driver)/experts/map')}
            className={`h-10 w-10 rounded-lg items-center justify-center ${
              viewMode === 'map'
                ? 'bg-primary-500'
                : isDark
                ? 'bg-slate-800'
                : 'bg-slate-200'
            }`}
          >
            <MaterialIcons
              name="map"
              size={20}
              color={viewMode === 'map' ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Expert List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        {experts.map((expert) => (
          <Card
            key={expert.id}
            variant="default"
            padding="md"
            className="mb-4"
            onPress={() => handleExpertPress(expert.id)}
          >
            <View className="flex-row">
              <Image
                source={{ uri: expert.image }}
                className="h-20 w-20 rounded-xl"
              />
              <View className="flex-1 ml-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1">
                    <Text
                      className={`font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {expert.name}
                    </Text>
                    {expert.verified && (
                      <MaterialIcons name="verified" size={16} color="#3B82F6" />
                    )}
                  </View>
                </View>
                <Rating
                  value={expert.rating}
                  reviewCount={expert.reviewCount}
                  size="sm"
                />
                <View className="flex-row items-center mt-1 gap-3">
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons
                      name="location-on"
                      size={14}
                      color={isDark ? '#64748B' : '#94A3B8'}
                    />
                    <Text
                      className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {expert.distance} km away
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons
                      name="schedule"
                      size={14}
                      color={expert.status === 'open' ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      className={`text-sm ${
                        expert.status === 'open' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {expert.status === 'open' ? 'Open' : 'Closed'} • {expert.closingTime}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Specialties */}
            <View className="flex-row flex-wrap gap-2 mt-3">
              {expert.specialties.map((specialty) => (
                <Badge key={specialty} label={specialty} variant="default" size="sm" />
              ))}
              <Badge
                label={priceRangeLabels[expert.priceRange]}
                variant="info"
                size="sm"
              />
            </View>

            {/* Recent Review */}
            <View className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Text
                className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                "{expert.recentReview.text}" - {expert.recentReview.author}
              </Text>
            </View>

            {/* Actions */}
            <View className="flex-row gap-3 mt-3">
              <TouchableOpacity
                className={`flex-1 h-10 rounded-lg items-center justify-center ${
                  isDark ? 'bg-slate-700' : 'bg-slate-100'
                }`}
                onPress={() => router.push(`/(shared)/messages?expertId=${expert.id}`)}
              >
                <Text
                  className={`font-semibold ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Contact
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-10 rounded-lg items-center justify-center bg-primary-500"
                onPress={() => handleExpertPress(expert.id)}
              >
                <Text className="font-semibold text-white">View Profile</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Text className="text-primary-500 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Filters
            </Text>
            <TouchableOpacity onPress={() => {
              setMinRating(0);
              setOpenNowOnly(false);
              setVerifiedOnly(false);
              setMaxDistance(50);
            }}>
              <Text className="text-primary-500 font-semibold">Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {/* Rating Filter */}
            <View className="mb-6">
              <Text className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Minimum Rating
              </Text>
              <View className="flex-row gap-2">
                {[0, 3, 3.5, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setMinRating(rating)}
                    className={`flex-1 py-3 rounded-lg items-center ${
                      minRating === rating
                        ? 'bg-primary-500'
                        : isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                  >
                    <Text className={minRating === rating ? 'text-white font-semibold' : isDark ? 'text-white' : 'text-slate-700'}>
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Open Now Toggle */}
            <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Open Now
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Only show currently open shops
                </Text>
              </View>
              <Switch
                value={openNowOnly}
                onValueChange={setOpenNowOnly}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={openNowOnly ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            {/* Verified Only Toggle */}
            <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Verified Only
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Only show verified experts
                </Text>
              </View>
              <Switch
                value={verifiedOnly}
                onValueChange={setVerifiedOnly}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={verifiedOnly ? '#3B82F6' : '#94A3B8'}
              />
            </View>

            {/* Max Distance */}
            <View className="my-6">
              <Text className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Maximum Distance
              </Text>
              <View className="flex-row gap-2">
                {[5, 10, 25, 50].map((dist) => (
                  <TouchableOpacity
                    key={dist}
                    onPress={() => setMaxDistance(dist)}
                    className={`flex-1 py-3 rounded-lg items-center ${
                      maxDistance === dist
                        ? 'bg-primary-500'
                        : isDark ? 'bg-slate-800' : 'bg-slate-100'
                    }`}
                  >
                    <Text className={maxDistance === dist ? 'text-white font-semibold' : isDark ? 'text-white' : 'text-slate-700'}>
                      {dist} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <Button title="Apply Filters" onPress={handleApplyFilters} fullWidth />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)} className="mr-4">
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Select Location
            </Text>
          </View>

          <ScrollView className="flex-1">
            {ghanaLocations.map((location) => (
              <TouchableOpacity
                key={location}
                onPress={() => handleSelectLocation(location)}
                className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <MaterialIcons
                  name="location-on"
                  size={24}
                  color={selectedLocation === location ? '#3B82F6' : isDark ? '#64748B' : '#94A3B8'}
                />
                <Text className={`flex-1 ml-3 ${
                  selectedLocation === location
                    ? 'text-primary-500 font-semibold'
                    : isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {location}
                </Text>
                {selectedLocation === location && (
                  <MaterialIcons name="check" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
