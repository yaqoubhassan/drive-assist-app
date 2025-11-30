import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../../src/context/ThemeContext';
import { SearchBar, Card, Rating, Avatar, Skeleton } from '../../../src/components/common';
import expertService, { Expert } from '../../../src/services/expert';

const { width } = Dimensions.get('window');
const ASPECT_RATIO = width / Dimensions.get('window').height;
const LATITUDE_DELTA = 0.15;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function ExpertsMapScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch location and experts
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Get location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(userLoc);

        // Fetch nearby experts
        await fetchNearbyExperts(userLoc.latitude, userLoc.longitude, selectedRadius);

        // Animate to user location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: userLoc.latitude,
            longitude: userLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Refetch experts when radius changes
  useEffect(() => {
    if (userLocation) {
      fetchNearbyExperts(userLocation.latitude, userLocation.longitude, selectedRadius);
    }
  }, [selectedRadius]);

  const fetchNearbyExperts = async (lat: number, lng: number, radius: number) => {
    try {
      const nearbyExperts = await expertService.getNearbyExperts({
        latitude: lat,
        longitude: lng,
        radius: radius + 10, // Fetch a bit more to show experts outside the circle too
        limit: 20,
      });
      setExperts(nearbyExperts);
    } catch (error) {
      console.error('Error fetching experts:', error);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      });
    }
  };

  const isExpertWithinRadius = (expert: Expert): boolean => {
    if (expert.distance_km === undefined) return true;
    return expert.distance_km <= selectedRadius;
  };

  // Dark mode map style
  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
  ];

  const initialRegion: Region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    : {
        latitude: 5.6037,
        longitude: -0.1870,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

  // Map Loading Skeleton
  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }}>
        {/* Map Placeholder with subtle pattern */}
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="map" size={80} color={isDark ? '#334155' : '#CBD5E1'} />
          <Text className={`mt-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Loading map...
          </Text>
        </View>

        {/* Top Controls Skeleton */}
        <View style={{ position: 'absolute', top: insets.top + 16, left: 16, right: 16 }}>
          <View className="flex-row items-center gap-3">
            {/* Back button skeleton */}
            <Skeleton width={44} height={44} borderRadius={22} />
            {/* Search bar skeleton */}
            <View className="flex-1">
              <Skeleton width="100%" height={44} borderRadius={22} />
            </View>
          </View>

          {/* Radius Selector Skeleton */}
          <View className={`mt-3 rounded-xl p-3 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'}`}>
            <Skeleton width={120} height={16} style={{ marginBottom: 8 }} />
            <View className="flex-row justify-between">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} width={48} height={28} borderRadius={14} />
              ))}
            </View>
          </View>
        </View>

        {/* Legend Skeleton */}
        <View
          style={{ position: 'absolute', left: 16, bottom: insets.bottom + 100 }}
          className={`rounded-xl p-3 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'}`}
        >
          <Skeleton width={50} height={14} style={{ marginBottom: 8 }} />
          <View className="flex-row items-center mb-1">
            <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 8 }} />
            <Skeleton width={30} height={12} />
          </View>
          <View className="flex-row items-center mb-1">
            <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 8 }} />
            <Skeleton width={80} height={12} />
          </View>
          <View className="flex-row items-center">
            <Skeleton width={16} height={16} borderRadius={8} style={{ marginRight: 8 }} />
            <Skeleton width={70} height={12} />
          </View>
        </View>

        {/* My Location Button Skeleton */}
        <View style={{ position: 'absolute', right: 16, bottom: insets.bottom + 100 }}>
          <Skeleton width={44} height={44} borderRadius={22} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        customMapStyle={isDark ? darkMapStyle : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View className="items-center">
              <View className="bg-red-500 rounded-full p-1.5 border-2 border-white shadow-lg">
                <MaterialIcons name="person" size={20} color="#FFF" />
              </View>
              <View className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-red-500 -mt-1" />
            </View>
          </Marker>
        )}

        {/* Radius Circle */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={selectedRadius * 1000} // Convert km to meters
            strokeWidth={2}
            strokeColor="rgba(59, 130, 246, 0.8)"
            fillColor="rgba(59, 130, 246, 0.1)"
          />
        )}

        {/* Expert Markers */}
        {experts.map((expert) => {
          const isWithinRadius = isExpertWithinRadius(expert);
          const rawLat = expert.profile?.location?.latitude;
          const rawLng = expert.profile?.location?.longitude;

          if (rawLat === null || rawLat === undefined || rawLng === null || rawLng === undefined) return null;

          // Ensure coordinates are numbers (API might return strings)
          const lat = typeof rawLat === 'string' ? parseFloat(rawLat) : rawLat;
          const lng = typeof rawLng === 'string' ? parseFloat(rawLng) : rawLng;

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker
              key={expert.id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={expert.profile?.business_name || expert.full_name}
              description={`${expert.distance_km?.toFixed(1) || '?'} km away`}
              onPress={() => setSelectedExpert(expert)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View className="items-center">
                <View
                  className={`rounded-full p-1.5 border-2 border-white shadow-lg ${
                    selectedExpert?.id === expert.id
                      ? 'bg-primary-600'
                      : isWithinRadius
                      ? 'bg-primary-500'
                      : 'bg-slate-400'
                  }`}
                >
                  <MaterialIcons name="build" size={16} color="#FFF" />
                </View>
                {expert.profile?.is_priority_listed && (
                  <View className="absolute -top-1 -right-1 bg-amber-500 rounded-full w-4 h-4 items-center justify-center">
                    <MaterialIcons name="star" size={10} color="#FFF" />
                  </View>
                )}
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Top Controls */}
      <View style={{ position: 'absolute', top: insets.top + 16, left: 16, right: 16 }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`h-11 w-11 rounded-full items-center justify-center shadow-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#111827'}
            />
          </TouchableOpacity>
          <View className="flex-1">
            <SearchBar
              placeholder="Search experts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              containerClassName="shadow-md"
            />
          </View>
        </View>

        {/* Radius Selector */}
        <View className={`mt-3 rounded-xl p-3 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} shadow-lg`}>
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Search Radius: {selectedRadius} km
          </Text>
          <View className="flex-row justify-between">
            {[5, 10, 15, 25, 50].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRadius(r)}
                className={`px-3 py-1.5 rounded-full ${
                  selectedRadius === r
                    ? 'bg-primary-500'
                    : isDark
                    ? 'bg-slate-700'
                    : 'bg-slate-100'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedRadius === r
                      ? 'text-white'
                      : isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {r}km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Expert Count */}
      <View
        style={{ position: 'absolute', top: insets.top + 140, right: 16 }}
        className={`rounded-full px-3 py-1.5 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} shadow-lg`}
      >
        <Text className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {experts.filter(isExpertWithinRadius).length} experts nearby
        </Text>
      </View>

      {/* My Location Button */}
      <TouchableOpacity
        onPress={centerOnUser}
        style={{ position: 'absolute', right: 16, bottom: insets.bottom + (selectedExpert ? 220 : 100) }}
        className={`h-11 w-11 rounded-full items-center justify-center shadow-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}
      >
        <MaterialIcons
          name="my-location"
          size={24}
          color="#3B82F6"
        />
      </TouchableOpacity>

      {/* Legend */}
      <View
        style={{ position: 'absolute', left: 16, bottom: insets.bottom + (selectedExpert ? 220 : 100) }}
        className={`rounded-xl p-3 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} shadow-lg`}
      >
        <Text className={`text-xs font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Legend
        </Text>
        <View className="flex-row items-center mb-1">
          <View className="bg-red-500 rounded-full w-4 h-4 mr-2" />
          <Text className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>You</Text>
        </View>
        <View className="flex-row items-center mb-1">
          <View className="bg-primary-500 rounded-full w-4 h-4 mr-2" />
          <Text className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Expert (nearby)</Text>
        </View>
        <View className="flex-row items-center">
          <View className="bg-slate-400 rounded-full w-4 h-4 mr-2" />
          <Text className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Expert (farther)</Text>
        </View>
      </View>

      {/* Selected Expert Card */}
      {selectedExpert && (
        <View style={{ position: 'absolute', bottom: insets.bottom + 32, left: 16, right: 16 }}>
          <Card
            variant="elevated"
            padding="md"
            onPress={() => router.push(`/(driver)/experts/${selectedExpert.id}`)}
          >
            <View className="flex-row items-center">
              <Avatar name={selectedExpert.full_name} size="lg" />
              <View className="flex-1 ml-4">
                <View className="flex-row items-center gap-1">
                  <Text
                    className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}
                    numberOfLines={1}
                  >
                    {selectedExpert.profile?.business_name || selectedExpert.full_name}
                  </Text>
                  {selectedExpert.profile?.is_priority_listed && (
                    <View className="bg-amber-500 px-1.5 py-0.5 rounded">
                      <Text className="text-white text-xs font-bold">PRO</Text>
                    </View>
                  )}
                </View>
                <Rating value={selectedExpert.profile?.rating ?? 0} size="sm" showValue />
                <View className="flex-row items-center gap-3 mt-1">
                  {selectedExpert.distance_km !== undefined && (
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="location-on" size={14} color="#64748B" />
                      <Text className="text-sm text-slate-500">
                        {selectedExpert.distance_km.toFixed(1)} km
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center gap-1">
                    <View
                      className={`h-2 w-2 rounded-full ${
                        selectedExpert.profile?.is_available ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <Text
                      className={`text-sm ${
                        selectedExpert.profile?.is_available ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {selectedExpert.profile?.is_available ? 'Available' : 'Busy'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                className="h-12 w-12 rounded-xl bg-primary-500 items-center justify-center"
                onPress={() => router.push(`/(driver)/experts/${selectedExpert.id}`)}
              >
                <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}
