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
  Platform,
  Keyboard,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GhanaConstants } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

// Get API key from app.config.js extra
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
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
  { name: 'Accra', region: 'Greater Accra', lat: 5.6037, lng: -0.187 },
  { name: 'Kumasi', region: 'Ashanti', lat: 6.6885, lng: -1.6244 },
  { name: 'Tamale', region: 'Northern', lat: 9.4008, lng: -0.8393 },
  { name: 'Takoradi', region: 'Western', lat: 4.8845, lng: -1.7554 },
  { name: 'Cape Coast', region: 'Central', lat: 5.1315, lng: -1.2795 },
  { name: 'Tema', region: 'Greater Accra', lat: 5.6698, lng: -0.0166 },
  { name: 'Koforidua', region: 'Eastern', lat: 6.0941, lng: -0.261 },
  { name: 'Sunyani', region: 'Bono', lat: 7.3349, lng: -2.3123 },
  { name: 'Ho', region: 'Volta', lat: 6.6, lng: 0.4667 },
  { name: 'Wa', region: 'Upper West', lat: 10.0601, lng: -2.5099 },
];

export const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
  title = 'Select Location',
}) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
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
          country: result.country || undefined,
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

  const handleCitySelect = async (city: (typeof ghanaCities)[0]) => {
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
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header */}
        <View
          className={`flex-row items-center justify-between px-4 pb-4 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
          style={{ paddingTop: insets.top + 16 }}
        >
          <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center">
            <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className={`px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <View
            className={`flex-row items-center rounded-xl px-4 py-3 ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}
          >
            <MaterialIcons name="search" size={20} color="#64748B" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search city in Ghana..."
              placeholderTextColor="#94A3B8"
              className={`flex-1 ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
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
                  className={`flex-row items-center py-3 border-b ${
                    isDark ? 'border-slate-700' : 'border-slate-100'
                  }`}
                >
                  <MaterialIcons name="location-city" size={20} color="#3B82F6" />
                  <View className="ml-3">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                  className={`px-4 py-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                >
                  <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
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
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
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
            className={`absolute right-4 top-4 h-12 w-12 rounded-full shadow-lg items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}
            style={{ elevation: 4 }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <MaterialIcons name="my-location" size={24} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>

        {/* Selected Location Info */}
        <View
          className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {selectedLocation ? (
            <>
              <View className="flex-row items-center mb-3">
                <MaterialIcons name="place" size={20} color="#10B981" />
                <Text
                  className={`ml-2 flex-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  {selectedLocation.address}
                </Text>
              </View>
              <Text className="text-sm text-slate-500 mb-4">
                Lat: {selectedLocation.latitude.toFixed(6)}, Lng:{' '}
                {selectedLocation.longitude.toFixed(6)}
              </Text>
              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-primary-500 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-base">Confirm Location</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-center text-slate-500 mb-4">
                Tap on the map to select a location
              </Text>
              <TouchableOpacity className="bg-slate-300 py-4 rounded-xl items-center" disabled>
                <Text className="text-slate-500 font-bold text-base">Select a Location</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// Address Autocomplete Input Component
// ============================================

interface AddressAutocompleteProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search for your address...',
  label,
  error,
  disabled = false,
}) => {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const autocompleteRef = useRef<GooglePlacesAutocompleteRef>(null);
  const mapRef = useRef<MapView>(null);

  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(value || null);
  const [mapRegion, setMapRegion] = useState<Region>(
    value
      ? {
          latitude: value.latitude,
          longitude: value.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
      : {
          latitude: GhanaConstants.defaultLocation.latitude,
          longitude: GhanaConstants.defaultLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }
  );

  // Update selected location when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setMapRegion({
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      // Update autocomplete text
      if (autocompleteRef.current && value.address) {
        autocompleteRef.current.setAddressText(value.address);
      }
    }
  }, [value]);

  const handlePlaceSelect = (data: any, details: any) => {
    if (!details) return;

    const location: LocationData = {
      address: data.description || details.formatted_address,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    };

    // Extract city, region, country from address components
    details.address_components?.forEach((component: any) => {
      if (component.types.includes('locality')) {
        location.city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        location.region = component.long_name;
      }
      if (component.types.includes('country')) {
        location.country = component.long_name;
      }
    });

    setSelectedLocation(location);
    setMapRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    onChange(location);
    Keyboard.dismiss();
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow location access to use this feature.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      let city = '';
      let region = '';
      let country = '';

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const parts = [];
        if (place.streetNumber) parts.push(place.streetNumber);
        if (place.street) parts.push(place.street);
        if (place.district) parts.push(place.district);
        if (place.city) {
          parts.push(place.city);
          city = place.city;
        }
        if (place.region) {
          parts.push(place.region);
          region = place.region;
        }
        if (place.country) {
          country = place.country;
        }
        if (parts.length > 0) {
          address = parts.join(', ');
        }
      }

      const location: LocationData = {
        address,
        latitude,
        longitude,
        city,
        region,
        country,
      };

      setSelectedLocation(location);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      onChange(location);

      // Update autocomplete text
      if (autocompleteRef.current) {
        autocompleteRef.current.setAddressText(address);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to get your current location. Please try again.');
      console.error('Location error:', err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;

    setIsLoadingLocation(true);

    try {
      // Reverse geocode the selected coordinates
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      let city = '';
      let region = '';
      let country = '';

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const parts = [];
        if (place.streetNumber) parts.push(place.streetNumber);
        if (place.street) parts.push(place.street);
        if (place.district) parts.push(place.district);
        if (place.city) {
          parts.push(place.city);
          city = place.city;
        }
        if (place.region) {
          parts.push(place.region);
          region = place.region;
        }
        if (place.country) {
          country = place.country;
        }
        if (parts.length > 0) {
          address = parts.join(', ');
        }
      }

      const location: LocationData = {
        address,
        latitude,
        longitude,
        city,
        region,
        country,
      };

      setSelectedLocation(location);
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (err) {
      console.error('Reverse geocode error:', err);
      // Still set the location with coordinates only
      const location: LocationData = {
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
      };
      setSelectedLocation(location);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleConfirmMapLocation = () => {
    if (selectedLocation) {
      onChange(selectedLocation);
      if (autocompleteRef.current) {
        autocompleteRef.current.setAddressText(selectedLocation.address || '');
      }
    }
    setShowMapModal(false);
  };

  const inputBgColor = isDark ? '#1E293B' : '#FFFFFF';
  const inputTextColor = isDark ? '#FFFFFF' : '#111827';
  const placeholderColor = isDark ? '#64748B' : '#9CA3AF';
  const borderColor = error ? '#EF4444' : isDark ? '#334155' : '#E2E8F0';

  // Check if API key is available
  const hasApiKey = !!GOOGLE_MAPS_API_KEY;

  return (
    <View>
      {label && (
        <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {label}
        </Text>
      )}

      {/* Autocomplete Input */}
      {hasApiKey ? (
        <View className="rounded-xl overflow-hidden" style={{ borderWidth: 2, borderColor }}>
          <GooglePlacesAutocomplete
            ref={autocompleteRef}
            placeholder={placeholder}
            onPress={handlePlaceSelect}
            fetchDetails={true}
            query={{
              key: GOOGLE_MAPS_API_KEY,
              language: 'en',
              components: 'country:gh|country:us|country:gb',
              types: 'address',
            }}
            styles={{
              container: {
                flex: 0,
              },
              textInputContainer: {
                backgroundColor: inputBgColor,
                paddingHorizontal: 8,
                paddingVertical: 4,
              },
              textInput: {
                backgroundColor: inputBgColor,
                color: inputTextColor,
                fontSize: 16,
                height: 44,
                marginBottom: 0,
              },
              listView: {
                backgroundColor: inputBgColor,
                borderTopWidth: 1,
                borderTopColor: borderColor,
              },
              row: {
                backgroundColor: inputBgColor,
                padding: 13,
              },
              separator: {
                backgroundColor: borderColor,
              },
              description: {
                color: inputTextColor,
              },
              poweredContainer: {
                display: 'none',
              },
            }}
            textInputProps={{
              placeholderTextColor: placeholderColor,
              editable: !disabled,
            }}
            enablePoweredByContainer={false}
            debounce={300}
            minLength={2}
            nearbyPlacesAPI="GooglePlacesSearch"
            GooglePlacesDetailsQuery={{
              fields: 'formatted_address,geometry,address_components',
            }}
          />
        </View>
      ) : (
        // Fallback to simple text input if no API key
        <View
          className={`rounded-xl overflow-hidden flex-row items-center px-4 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}
          style={{ borderWidth: 2, borderColor }}
        >
          <MaterialIcons name="location-on" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
          <TextInput
            value={selectedLocation?.address || ''}
            placeholder={placeholder}
            placeholderTextColor={placeholderColor}
            editable={false}
            className={`flex-1 py-3 ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
          />
        </View>
      )}

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      {!hasApiKey && (
        <Text className="text-yellow-600 text-xs mt-1">
          Note: Add GOOGLE_MAPS_API_KEY to enable address autocomplete
        </Text>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-2 mt-3">
        {/* Use Current Location */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          disabled={disabled || isLoadingLocation}
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
            isDark ? 'bg-blue-500/20' : 'bg-blue-50'
          }`}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <>
              <MaterialIcons name="my-location" size={18} color="#3B82F6" />
              <Text className="text-primary-500 font-medium ml-2">Current Location</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Select on Map */}
        <TouchableOpacity
          onPress={() => setShowMapModal(true)}
          disabled={disabled}
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${
            isDark ? 'bg-slate-700' : 'bg-slate-100'
          }`}
        >
          <MaterialIcons name="map" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
          <Text className={`font-medium ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Select on Map
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Location Preview */}
      {selectedLocation && (
        <View
          className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'} border ${
            isDark ? 'border-green-500/20' : 'border-green-200'
          }`}
        >
          <View className="flex-row items-start">
            <MaterialIcons name="check-circle" size={18} color="#10B981" />
            <View className="flex-1 ml-2">
              <Text className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                Location Set
              </Text>
              <Text
                className={`text-xs mt-0.5 ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}
                numberOfLines={2}
              >
                {selectedLocation.address}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Map Modal */}
      <Modal visible={showMapModal} animationType="slide" onRequestClose={() => setShowMapModal(false)}>
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View
            className={`flex-row items-center justify-between px-4 py-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={() => setShowMapModal(false)}
              className="h-10 w-10 items-center justify-center"
            >
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Select Location
            </Text>
            <TouchableOpacity
              onPress={handleConfirmMapLocation}
              disabled={!selectedLocation}
              className={`px-4 py-2 rounded-lg ${selectedLocation ? 'bg-primary-500' : 'bg-slate-300'}`}
            >
              <Text className={`font-semibold ${selectedLocation ? 'text-white' : 'text-slate-500'}`}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>

          {/* Map */}
          <View className="flex-1">
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
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
                  title="Selected Location"
                  description={selectedLocation.address}
                />
              )}
            </MapView>

            {/* Loading overlay */}
            {isLoadingLocation && (
              <View className="absolute inset-0 bg-black/30 items-center justify-center">
                <View className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text className={`mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Getting address...
                  </Text>
                </View>
              </View>
            )}

            {/* My Location Button */}
            <TouchableOpacity
              onPress={handleUseCurrentLocation}
              className={`absolute right-4 bottom-24 h-12 w-12 rounded-full items-center justify-center shadow-lg ${
                isDark ? 'bg-slate-800' : 'bg-white'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <MaterialIcons name="my-location" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Selected Location Info */}
          <View
            className={`px-4 py-4 border-t ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {selectedLocation ? (
              <View>
                <Text className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Selected Address
                </Text>
                <Text className={`text-base ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                  {selectedLocation.address}
                </Text>
              </View>
            ) : (
              <Text className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Tap on the map to select a location
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ============================================
// Simple Location Display Component
// ============================================

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
        <MaterialIcons name="location-on" size={22} color={location ? '#10B981' : '#64748B'} />
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
      <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
    </TouchableOpacity>
  );
};
