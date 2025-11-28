import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { expertService, Expert } from '../../services/expert';
import { Card } from '../common';

interface NearbyExpertsListProps {
  onExpertPress: (expert: Expert) => void;
  onSignUpPress?: () => void;
  isGuest?: boolean;
  limit?: number;
}

export default function NearbyExpertsList({
  onExpertPress,
  onSignUpPress,
  isGuest = false,
  limit = 5,
}: NearbyExpertsListProps) {
  const { isDark } = useTheme();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    fetchNearbyExperts();
  }, []);

  const fetchNearbyExperts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission(false);
        setError('Location permission is required to find nearby experts');
        setLoading(false);
        return;
      }

      setLocationPermission(true);

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Fetch nearby experts
      const nearbyExperts = await expertService.getNearbyExperts({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        limit,
        radius: 30, // 30km radius
      });

      setExperts(nearbyExperts);
    } catch (err: any) {
      console.error('Error fetching nearby experts:', err);
      setError(err.message || 'Failed to load nearby experts');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <MaterialIcons key={i} name="star" size={14} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <MaterialIcons key={i} name="star-half" size={14} color="#F59E0B" />
        );
      } else {
        stars.push(
          <MaterialIcons
            key={i}
            name="star-border"
            size={14}
            color={isDark ? '#475569' : '#CBD5E1'}
          />
        );
      }
    }

    return stars;
  };

  if (loading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Finding nearby experts...
        </Text>
      </View>
    );
  }

  if (locationPermission === false) {
    return (
      <Card variant="outlined" padding="lg">
        <View className="items-center">
          <MaterialIcons
            name="location-off"
            size={48}
            color={isDark ? '#64748B' : '#94A3B8'}
          />
          <Text
            className={`text-center mt-3 font-medium ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Location Access Required
          </Text>
          <Text
            className={`text-center mt-1 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Enable location access to find experts near you
          </Text>
          <TouchableOpacity
            onPress={fetchNearbyExperts}
            className="mt-4 px-6 py-2 bg-primary-500 rounded-full"
          >
            <Text className="text-white font-medium">Enable Location</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" padding="lg">
        <View className="items-center">
          <MaterialIcons
            name="error-outline"
            size={48}
            color={isDark ? '#64748B' : '#94A3B8'}
          />
          <Text
            className={`text-center mt-3 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchNearbyExperts}
            className="mt-4 px-6 py-2 bg-primary-500 rounded-full"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  if (experts.length === 0) {
    return (
      <Card variant="outlined" padding="lg">
        <View className="items-center">
          <MaterialIcons
            name="search-off"
            size={48}
            color={isDark ? '#64748B' : '#94A3B8'}
          />
          <Text
            className={`text-center mt-3 font-medium ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            No Experts Nearby
          </Text>
          <Text
            className={`text-center mt-1 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            We couldn't find any experts in your area. Try expanding your search radius.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <View>
      {/* Section Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Nearby Experts
        </Text>
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={16} color="#3B82F6" />
          <Text className="text-primary-500 text-sm ml-1">
            Within 30km
          </Text>
        </View>
      </View>

      {/* Expert Cards */}
      {experts.map((expert, index) => (
        <TouchableOpacity
          key={expert.id}
          onPress={() => {
            if (isGuest && onSignUpPress) {
              onSignUpPress();
            } else {
              onExpertPress(expert);
            }
          }}
          className={`mb-3 ${index === experts.length - 1 ? 'mb-0' : ''}`}
        >
          <Card variant="outlined" padding="md">
            <View className="flex-row">
              {/* Avatar */}
              <View className="mr-3">
                {expert.avatar ? (
                  <Image
                    source={{ uri: expert.avatar }}
                    className="h-14 w-14 rounded-full"
                  />
                ) : (
                  <View
                    className={`h-14 w-14 rounded-full items-center justify-center ${
                      isDark ? 'bg-slate-700' : 'bg-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xl font-bold ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {expert.first_name?.charAt(0) || 'E'}
                    </Text>
                  </View>
                )}
                {expert.profile?.is_priority_listed && (
                  <View className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5">
                    <MaterialIcons name="star" size={12} color="#FFF" />
                  </View>
                )}
              </View>

              {/* Details */}
              <View className="flex-1">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                      numberOfLines={1}
                    >
                      {expert.profile?.business_name || expert.full_name}
                    </Text>
                    <Text
                      className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                      numberOfLines={1}
                    >
                      {expert.profile?.city || 'Location not specified'}
                    </Text>
                  </View>

                  {/* Distance Badge */}
                  {expert.distance_km !== undefined && (
                    <View
                      className={`px-2 py-1 rounded-full ${
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {expert.distance_km < 1
                          ? `${Math.round(expert.distance_km * 1000)}m`
                          : `${expert.distance_km}km`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Rating */}
                <View className="flex-row items-center mt-1">
                  <View className="flex-row">{renderStars(expert.profile?.rating || 0)}</View>
                  <Text
                    className={`text-xs ml-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {expert.profile?.rating?.toFixed(1) || '0.0'} ({expert.profile?.rating_count || 0})
                  </Text>
                  <Text
                    className={`text-xs ml-2 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {expert.profile?.jobs_completed || 0} jobs
                  </Text>
                </View>

                {/* Specializations */}
                {expert.profile?.specializations && expert.profile.specializations.length > 0 && (
                  <View className="flex-row flex-wrap mt-2 gap-1">
                    {expert.profile.specializations.slice(0, 3).map((spec) => (
                      <View
                        key={spec.id}
                        className={`px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-primary-500/20' : 'bg-primary-50'
                        }`}
                      >
                        <Text className="text-xs text-primary-500">
                          {spec.name}
                        </Text>
                      </View>
                    ))}
                    {expert.profile.specializations.length > 3 && (
                      <Text
                        className={`text-xs ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        +{expert.profile.specializations.length - 3} more
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Arrow */}
              <View className="justify-center ml-2">
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={isDark ? '#64748B' : '#94A3B8'}
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      ))}

      {/* Guest Sign Up Prompt */}
      {isGuest && (
        <View
          className={`mt-4 p-4 rounded-xl ${
            isDark ? 'bg-primary-500/10' : 'bg-primary-50'
          }`}
        >
          <View className="flex-row items-start">
            <MaterialIcons
              name="person-add"
              size={20}
              color="#3B82F6"
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <View className="flex-1">
              <Text
                className={`font-semibold ${
                  isDark ? 'text-primary-300' : 'text-primary-800'
                }`}
              >
                Want to connect with an expert?
              </Text>
              <Text
                className={`text-sm mt-1 ${
                  isDark ? 'text-primary-300/80' : 'text-primary-700'
                }`}
              >
                Sign up to message experts, book appointments, and get personalized recommendations.
              </Text>
              {onSignUpPress && (
                <TouchableOpacity
                  onPress={onSignUpPress}
                  className="mt-3 bg-primary-500 rounded-lg py-2 px-4 self-start"
                >
                  <Text className="text-white font-medium">Sign Up Now</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
