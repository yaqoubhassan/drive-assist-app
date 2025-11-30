import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Switch, RefreshControl, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import {
  SearchBar,
  Card,
  Chip,
  Rating,
  Badge,
  Avatar,
  Button,
  Skeleton,
  EmptyState,
} from '../../../src/components/common';
import expertService, { Expert, Specialization } from '../../../src/services/expert';

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

export default function ExpertsSearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { isAuthenticated, userType } = useAuth();
  const isGuest = !isAuthenticated || userType === 'guest';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [contactExpert, setContactExpert] = useState<Expert | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Accra, Greater Accra');

  // Data states
  const [experts, setExperts] = useState<Expert[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Filter states
  const [minRating, setMinRating] = useState(0);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);

  // Fetch user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Fetch specializations
  useEffect(() => {
    (async () => {
      try {
        const specs = await expertService.getSpecializations();
        setSpecializations(specs);
      } catch (error) {
        console.error('Failed to fetch specializations:', error);
      }
    })();
  }, []);

  // Fetch experts
  const fetchExperts = useCallback(async (refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      let fetchedExperts: Expert[] = [];

      if (userLocation) {
        // Use getNearbyExperts for location-based search
        const specId = selectedFilter !== 'all'
          ? specializations.find(s => s.slug === selectedFilter)?.id
          : undefined;

        fetchedExperts = await expertService.getNearbyExperts({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radius: maxDistance,
          limit: 20,
          specialization_id: specId,
        });
      } else {
        // Fallback to regular getExperts
        const result = await expertService.getExperts({ radius: maxDistance });
        fetchedExperts = Array.isArray(result) ? result : result.data || [];
      }

      // Sort experts by priority metrics:
      // 1. Priority listing (subscribed experts first)
      // 2. Availability (available first)
      // 3. Distance (closer first)
      // 4. Rating (higher first)
      // 5. Jobs completed (more is better)
      const sortedExperts = [...fetchedExperts].sort((a, b) => {
        // Priority listing first
        const aPriority = a.profile?.is_priority_listed ? 1 : 0;
        const bPriority = b.profile?.is_priority_listed ? 1 : 0;
        if (bPriority !== aPriority) return bPriority - aPriority;

        // Available first
        const aAvailable = a.profile?.is_available ? 1 : 0;
        const bAvailable = b.profile?.is_available ? 1 : 0;
        if (bAvailable !== aAvailable) return bAvailable - aAvailable;

        // Distance (closer first)
        const aDist = a.distance_km ?? 999;
        const bDist = b.distance_km ?? 999;
        if (Math.abs(aDist - bDist) > 0.5) return aDist - bDist;

        // Rating (higher first)
        const aRating = a.profile?.rating ?? 0;
        const bRating = b.profile?.rating ?? 0;
        if (bRating !== aRating) return bRating - aRating;

        // Jobs completed (more first)
        const aJobs = a.profile?.jobs_completed ?? 0;
        const bJobs = b.profile?.jobs_completed ?? 0;
        return bJobs - aJobs;
      });

      setExperts(sortedExperts);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userLocation, maxDistance, selectedFilter, specializations]);

  useFocusEffect(
    useCallback(() => {
      fetchExperts();
    }, [fetchExperts])
  );

  const onRefresh = useCallback(() => {
    fetchExperts(true);
  }, [fetchExperts]);

  // Filter experts by search query and other filters
  const filteredExperts = experts.filter((expert) => {
    const name = expert.profile?.business_name || expert.full_name || '';
    const matchesSearch = searchQuery === '' ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.profile?.specializations?.some(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesRating = (expert.profile?.rating ?? 0) >= minRating;
    const matchesAvailability = !openNowOnly || expert.profile?.is_available;
    const matchesDistance = (expert.distance_km ?? 0) <= maxDistance;

    return matchesSearch && matchesRating && matchesAvailability && matchesDistance;
  });

  const handleExpertPress = (expertId: number) => {
    router.push(`/(driver)/experts/${expertId}`);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);
    fetchExperts();
  };

  const handleSelectLocation = (location: string) => {
    setSelectedLocation(location);
    setShowLocationModal(false);
  };

  const handleContactPress = (expert: Expert) => {
    if (isGuest) {
      setShowSignUpModal(true);
    } else {
      setContactExpert(expert);
      setShowContactModal(true);
    }
  };

  const handleCall = () => {
    if (contactExpert?.profile?.whatsapp_number) {
      Linking.openURL(`tel:${contactExpert.profile.whatsapp_number}`);
    }
    setShowContactModal(false);
  };

  const handleWhatsApp = () => {
    if (contactExpert?.profile?.whatsapp_number) {
      // Format phone number for WhatsApp (remove any non-digit characters)
      const phone = contactExpert.profile.whatsapp_number.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${phone}`);
    }
    setShowContactModal(false);
  };

  const handleMessage = () => {
    if (contactExpert) {
      router.push({
        pathname: '/(shared)/messages/[id]',
        params: { id: contactExpert.id.toString(), expertId: contactExpert.id.toString() },
      });
    }
    setShowContactModal(false);
  };

  // Build filter chips from specializations
  const filterChips = [
    { id: 'all', label: 'All' },
    ...specializations.slice(0, 5).map(s => ({ id: s.slug, label: s.name })),
  ];

  // Skeleton Component
  const ExpertsSkeleton = () => (
    <View className="gap-4">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
        >
          <View className="flex-row">
            <Skeleton width={80} height={80} borderRadius={12} />
            <View className="flex-1 ml-4">
              <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton width="50%" height={14} style={{ marginBottom: 8 }} />
              <Skeleton width="60%" height={12} />
            </View>
          </View>
          <View className="flex-row gap-2 mt-3">
            <Skeleton width={60} height={24} borderRadius={12} />
            <Skeleton width={70} height={24} borderRadius={12} />
            <Skeleton width={50} height={24} borderRadius={12} />
          </View>
          <View className="flex-row gap-3 mt-3">
            <Skeleton width="48%" height={40} borderRadius={8} />
            <Skeleton width="48%" height={40} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );

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
                key={filter.id}
                label={filter.label}
                selected={selectedFilter === filter.id}
                onPress={() => setSelectedFilter(filter.id)}
              />
            ))}
          </View>
        </ScrollView>

        {/* View Toggle */}
        <View className="flex-row justify-between items-center mt-2">
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {loading ? 'Loading...' : `${filteredExperts.length} experts found`}
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="h-10 w-10 rounded-lg items-center justify-center bg-primary-500"
            >
              <MaterialIcons name="view-list" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(driver)/experts/map')}
              className={`h-10 w-10 rounded-lg items-center justify-center ${
                isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <MaterialIcons
                name="map"
                size={20}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Expert List */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <ExpertsSkeleton />
        ) : filteredExperts.length > 0 ? (
          <View className="gap-4 pb-8">
            {filteredExperts.map((expert) => (
              <Card
                key={expert.id}
                variant="default"
                padding="md"
                onPress={() => handleExpertPress(expert.id)}
              >
                <View className="flex-row">
                  {expert.avatar ? (
                    <Image
                      source={{ uri: expert.avatar }}
                      className="h-20 w-20 rounded-xl"
                    />
                  ) : (
                    <View className="h-20 w-20">
                      <Avatar name={expert.full_name} size="lg" />
                    </View>
                  )}
                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center gap-1 flex-wrap">
                      <Text
                        className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        numberOfLines={1}
                      >
                        {expert.profile?.business_name || expert.full_name}
                      </Text>
                      {expert.profile?.is_priority_listed && (
                        <>
                          <MaterialIcons name="verified" size={16} color="#3B82F6" />
                          <View className="bg-amber-500 px-1.5 py-0.5 rounded">
                            <Text className="text-white text-xs font-bold">PRO</Text>
                          </View>
                        </>
                      )}
                    </View>
                    <Rating
                      value={expert.profile?.rating ?? 0}
                      reviewCount={expert.profile?.rating_count ?? 0}
                      size="sm"
                    />
                    <View className="flex-row items-center mt-1 gap-3 flex-wrap">
                      {expert.distance_km !== undefined && (
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons
                            name="location-on"
                            size={14}
                            color={isDark ? '#64748B' : '#94A3B8'}
                          />
                          <Text
                            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {expert.distance_km.toFixed(1)} km
                          </Text>
                        </View>
                      )}
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons
                          name="schedule"
                          size={14}
                          color={expert.profile?.is_available ? '#10B981' : '#EF4444'}
                        />
                        <Text
                          className={`text-sm ${
                            expert.profile?.is_available ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {expert.profile?.is_available ? 'Available' : 'Busy'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Specialties */}
                {expert.profile?.specializations && expert.profile.specializations.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {expert.profile.specializations.slice(0, 3).map((specialty) => (
                      <Badge key={specialty.id} label={specialty.name} variant="default" size="sm" />
                    ))}
                    {expert.profile.experience_years > 0 && (
                      <Badge
                        label={`${expert.profile.experience_years} yrs`}
                        variant="info"
                        size="sm"
                      />
                    )}
                  </View>
                )}

                {/* Bio */}
                {expert.profile?.bio && (
                  <View className={`mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <Text
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      numberOfLines={2}
                    >
                      {expert.profile.bio}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View className="flex-row gap-3 mt-3">
                  <TouchableOpacity
                    className={`flex-1 h-10 rounded-lg items-center justify-center flex-row gap-2 ${
                      isDark ? 'bg-slate-700' : 'bg-slate-100'
                    }`}
                    onPress={() => handleContactPress(expert)}
                  >
                    <MaterialIcons
                      name="chat"
                      size={18}
                      color={isDark ? '#CBD5E1' : '#475569'}
                    />
                    <Text
                      className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
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
          </View>
        ) : (
          <EmptyState
            icon="search-off"
            title="No Experts Found"
            description="Try adjusting your filters or search in a different area."
          />
        )}
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

            {/* Available Now Toggle */}
            <View className={`flex-row items-center justify-between py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Available Now
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Only show currently available experts
                </Text>
              </View>
              <Switch
                value={openNowOnly}
                onValueChange={setOpenNowOnly}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={openNowOnly ? '#3B82F6' : '#94A3B8'}
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

      {/* Contact Options Modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setShowContactModal(false)}
        >
          <View
            className={`rounded-t-3xl px-4 pt-6 pb-8 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View className="items-center mb-6">
              <View className={`w-12 h-1 rounded-full mb-4 ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Contact {contactExpert?.profile?.business_name || contactExpert?.full_name}
              </Text>
            </View>

            {/* Contact Options */}
            <View className="gap-3">
              {/* Call Option */}
              {contactExpert?.profile?.whatsapp_number && (
                <TouchableOpacity
                  onPress={handleCall}
                  className={`flex-row items-center p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                >
                  <View className="h-12 w-12 rounded-full bg-green-500 items-center justify-center">
                    <MaterialIcons name="phone" size={24} color="#FFFFFF" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Call
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Direct phone call
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
              )}

              {/* WhatsApp Option */}
              {contactExpert?.profile?.whatsapp_number && (
                <TouchableOpacity
                  onPress={handleWhatsApp}
                  className={`flex-row items-center p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                >
                  <View className="h-12 w-12 rounded-full bg-[#25D366] items-center justify-center">
                    <MaterialIcons name="chat" size={24} color="#FFFFFF" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      WhatsApp
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Chat on WhatsApp
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
                </TouchableOpacity>
              )}

              {/* In-App Message Option */}
              <TouchableOpacity
                onPress={handleMessage}
                className={`flex-row items-center p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
              >
                <View className="h-12 w-12 rounded-full bg-primary-500 items-center justify-center">
                  <MaterialIcons name="message" size={24} color="#FFFFFF" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    In-App Message
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Send a message within the app
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setShowContactModal(false)}
              className="mt-4 py-3"
            >
              <Text className={`text-center font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sign Up Prompt Modal (for guests) */}
      <Modal
        visible={showSignUpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignUpModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="items-center mb-4">
              <View className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                <MaterialIcons name="lock-outline" size={32} color="#3B82F6" />
              </View>
              <Text className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sign In Required
              </Text>
              <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Create a free account or sign in to contact experts.
              </Text>
            </View>
            <View className="gap-3">
              <Button
                title="Sign Up Free"
                fullWidth
                onPress={() => {
                  setShowSignUpModal(false);
                  router.push('/(auth)/sign-up');
                }}
              />
              <Button
                title="Sign In"
                variant="secondary"
                fullWidth
                onPress={() => {
                  setShowSignUpModal(false);
                  router.push('/(auth)/sign-in');
                }}
              />
              <TouchableOpacity onPress={() => setShowSignUpModal(false)} className="py-2">
                <Text className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Maybe later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
