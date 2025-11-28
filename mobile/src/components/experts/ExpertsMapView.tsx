import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { expertService, Expert } from '../../services/expert';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.15;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

interface ExpertsMapViewProps {
  onExpertPress: (expert: Expert) => void;
  radius?: number; // in km
  onRadiusChange?: (radius: number) => void;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function ExpertsMapView({
  onExpertPress,
  radius = 15,
  onRadiusChange,
}: ExpertsMapViewProps) {
  const { isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(radius);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    fetchLocationAndExperts();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyExperts(userLocation.latitude, userLocation.longitude, selectedRadius);
    }
  }, [selectedRadius]);

  const fetchLocationAndExperts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission(false);
        setError('Location permission is required to show the map');
        setLoading(false);
        return;
      }

      setLocationPermission(true);

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
    } catch (err: any) {
      console.error('Error fetching location:', err);
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyExperts = async (lat: number, lng: number, rad: number) => {
    try {
      const nearbyExperts = await expertService.getNearbyExperts({
        latitude: lat,
        longitude: lng,
        limit: 20,
        radius: rad + 10, // Fetch a bit more to show experts outside the circle too
      });
      setExperts(nearbyExperts);
    } catch (err: any) {
      console.error('Error fetching experts:', err);
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setSelectedRadius(newRadius);
    onRadiusChange?.(newRadius);
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-800">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className={`mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Loading map...
        </Text>
      </View>
    );
  }

  if (locationPermission === false || error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100 dark:bg-slate-800 p-6">
        <MaterialIcons
          name="location-off"
          size={64}
          color={isDark ? '#64748B' : '#94A3B8'}
        />
        <Text className={`text-center mt-4 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Location Access Required
        </Text>
        <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {error || 'Enable location access to view experts on the map'}
        </Text>
        <TouchableOpacity
          onPress={fetchLocationAndExperts}
          className="mt-6 px-8 py-3 bg-primary-500 rounded-full"
        >
          <Text className="text-white font-semibold">Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion: Region = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
    : {
        latitude: 5.5545,
        longitude: -0.1902,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        customMapStyle={isDark ? darkMapStyle : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* User Location Marker (Red) */}
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
          const location = expert.profile?.location;

          if (!location?.latitude || !location?.longitude) return null;

          return (
            <Marker
              key={expert.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={expert.profile?.business_name || expert.full_name}
              description={`${expert.distance_km?.toFixed(1) || '?'} km away`}
              onPress={() => onExpertPress(expert)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View className="items-center">
                <View
                  className={`rounded-full p-1.5 border-2 border-white shadow-lg ${
                    isWithinRadius ? 'bg-primary-500' : 'bg-slate-400'
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

      {/* Radius Control */}
      <View className="absolute top-4 left-4 right-4">
        <View className={`rounded-xl p-3 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} shadow-lg`}>
          <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Search Radius: {selectedRadius} km
          </Text>
          <View className="flex-row justify-between">
            {[5, 10, 15, 25, 50].map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => handleRadiusChange(r)}
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

      {/* Center on User Button */}
      <TouchableOpacity
        onPress={centerOnUser}
        className={`absolute bottom-6 right-4 w-12 h-12 rounded-full items-center justify-center shadow-lg ${
          isDark ? 'bg-slate-800' : 'bg-white'
        }`}
      >
        <MaterialIcons
          name="my-location"
          size={24}
          color={isDark ? '#3B82F6' : '#3B82F6'}
        />
      </TouchableOpacity>

      {/* Legend */}
      <View className={`absolute bottom-6 left-4 rounded-xl p-3 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} shadow-lg`}>
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

      {/* Expert Count */}
      <View className={`absolute top-24 right-4 rounded-full px-3 py-1.5 ${isDark ? 'bg-slate-800/95' : 'bg-white/95'} shadow-lg`}>
        <Text className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {experts.filter(isExpertWithinRadius).length} experts nearby
        </Text>
      </View>
    </View>
  );
}
