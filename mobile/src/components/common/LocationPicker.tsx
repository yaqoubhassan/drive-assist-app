import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { GhanaConstants } from '../../constants';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
}

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  initialLocation?: LocationData;
  title?: string;
}

// Ghana cities for quick selection
const ghanaCities = [
  { name: 'Accra', region: 'Greater Accra', lat: 5.6037, lng: -0.1870 },
  { name: 'Kumasi', region: 'Ashanti', lat: 6.6885, lng: -1.6244 },
  { name: 'Tamale', region: 'Northern', lat: 9.4008, lng: -0.8393 },
  { name: 'Takoradi', region: 'Western', lat: 4.8845, lng: -1.7554 },
  { name: 'Cape Coast', region: 'Central', lat: 5.1315, lng: -1.2795 },
  { name: 'Tema', region: 'Greater Accra', lat: 5.6698, lng: -0.0166 },
  { name: 'Koforidua', region: 'Eastern', lat: 6.0941, lng: -0.2610 },
  { name: 'Sunyani', region: 'Bono', lat: 7.3349, lng: -2.3123 },
  { name: 'Ho', region: 'Volta', lat: 6.6000, lng: 0.4667 },
  { name: 'Wa', region: 'Upper West', lat: 10.0601, lng: -2.5099 },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
  title = 'Select Location',
}) => {
  const mapRef = useRef<MapView>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.latitude || GhanaConstants.defaultLocation.latitude,
    longitude: initialLocation?.longitude || GhanaConstants.defaultLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    if (visible && !initialLocation) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable location services to use this feature.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);

      // Reverse geocode to get address
      await reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    }
    setLoading(false);
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const result = results[0];
        const address = [result.street, result.district, result.city, result.region]
          .filter(Boolean)
          .join(', ');

        setSelectedLocation({
          latitude,
          longitude,
          address: address || 'Selected Location',
          city: result.city || result.district || undefined,
          region: result.region || undefined,
        });
      } else {
        setSelectedLocation({
          latitude,
          longitude,
          address: 'Selected Location',
        });
      }
    } catch (error) {
      setSelectedLocation({
        latitude,
        longitude,
        address: 'Selected Location',
      });
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLoading(true);
    await reverseGeocode(latitude, longitude);
    setLoading(false);
  };

  const handleCitySelect = async (city: typeof ghanaCities[0]) => {
    const newRegion = {
      latitude: city.lat,
      longitude: city.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };

    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);

    setSelectedLocation({
      latitude: city.lat,
      longitude: city.lng,
      address: `${city.name}, ${city.region}`,
      city: city.name,
      region: city.region,
    });

    setSearchQuery('');
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation);
      onClose();
    } else {
      Alert.alert('Select Location', 'Please select a location on the map.');
    }
  };

  const filteredCities = ghanaCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white dark:bg-slate-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4 border-b border-slate-200 dark:border-slate-800">
          <TouchableOpacity
            onPress={onClose}
            className="h-10 w-10 items-center justify-center"
          >
            <MaterialIcons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3">
            <MaterialIcons name="search" size={20} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search city in Ghana..."
              placeholderTextColor="#94A3B8"
              className="flex-1 ml-2 text-slate-900 dark:text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* City Suggestions */}
          {searchQuery.length > 0 && (
            <ScrollView className="max-h-40 mt-2" showsVerticalScrollIndicator={false}>
              {filteredCities.map((city) => (
                <TouchableOpacity
                  key={city.name}
                  onPress={() => handleCitySelect(city)}
                  className="flex-row items-center py-3 border-b border-slate-100 dark:border-slate-700"
                >
                  <MaterialIcons name="location-city" size={20} color="#3B82F6" />
                  <View className="ml-3">
                    <Text className="font-semibold text-slate-900 dark:text-white">
                      {city.name}
                    </Text>
                    <Text className="text-sm text-slate-500">{city.region} Region</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {filteredCities.length === 0 && (
                <Text className="text-center py-4 text-slate-500">No cities found</Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Quick City Selection */}
        {searchQuery.length === 0 && (
          <View className="px-4 py-2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {ghanaCities.slice(0, 6).map((city) => (
                <TouchableOpacity
                  key={city.name}
                  onPress={() => handleCitySelect(city)}
                  className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                  <Text className="text-slate-600 dark:text-slate-300 font-medium">
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Map */}
        <View className="flex-1">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                pinColor="#3B82F6"
              />
            )}
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            onPress={getCurrentLocation}
            className="absolute right-4 top-4 h-12 w-12 rounded-full bg-white shadow-lg items-center justify-center"
            style={{ elevation: 4 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <MaterialIcons name="my-location" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>

          {/* Center Marker Indicator */}
          <View className="absolute top-1/2 left-1/2 -ml-6 -mt-12 pointer-events-none">
            <MaterialIcons name="location-on" size={48} color="#3B82F6" />
          </View>
        </View>

        {/* Selected Location Info */}
        {selectedLocation && (
          <View className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="place" size={20} color="#10B981" />
              <Text className="ml-2 flex-1 text-slate-900 dark:text-white font-semibold">
                {selectedLocation.address}
              </Text>
            </View>
            <Text className="text-sm text-slate-500 mb-4">
              Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
            </Text>
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-primary-500 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-base">Confirm Location</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Confirm Button (if no location selected) */}
        {!selectedLocation && (
          <View className="px-4 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Text className="text-center text-slate-500 mb-4">
              Tap on the map to select a location
            </Text>
            <TouchableOpacity
              className="bg-slate-300 py-4 rounded-xl items-center"
              disabled
            >
              <Text className="text-slate-500 font-bold text-base">Select a Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

// Simple Location Display Component
interface LocationDisplayProps {
  location?: LocationData;
  placeholder?: string;
  onPress?: () => void;
  isDark?: boolean;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  location,
  placeholder = 'Set your location',
  onPress,
  isDark = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 rounded-xl border ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}
    >
      <View
        className={`h-10 w-10 rounded-lg items-center justify-center mr-3 ${
          location ? 'bg-green-500/20' : isDark ? 'bg-slate-700' : 'bg-slate-100'
        }`}
      >
        <MaterialIcons
          name="location-on"
          size={22}
          color={location ? '#10B981' : '#64748B'}
        />
      </View>
      <View className="flex-1">
        {location ? (
          <>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {location.city || 'Selected Location'}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`} numberOfLines={1}>
              {location.address}
            </Text>
          </>
        ) : (
          <>
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {placeholder}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Tap to select on map
            </Text>
          </>
        )}
      </View>
      <MaterialIcons
        name="chevron-right"
        size={24}
        color={isDark ? '#64748B' : '#94A3B8'}
      />
    </TouchableOpacity>
  );
};
