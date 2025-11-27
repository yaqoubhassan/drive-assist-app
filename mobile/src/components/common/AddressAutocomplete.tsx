import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
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

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

// ============================================
// Custom Address Autocomplete Input Component
// Using Google Places API directly (like web version)
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
  const mapRef = useRef<MapView>(null);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showMapModal, setShowMapModal] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(value || null);
  const [inputText, setInputText] = useState(value?.address || '');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
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
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
  );

  // Update when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedLocation(value);
      setInputText(value.address || '');
      setMapRegion({
        latitude: value.latitude,
        longitude: value.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [value]);

  // Fetch predictions from Google Places API
  const fetchPredictions = useCallback(async (input: string) => {
    if (!input || input.length < 2 || !GOOGLE_MAPS_API_KEY) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}&components=country:gh&language=en`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        setPredictions([]);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchPredictions(text);
      }, 300);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  // Fetch place details when user selects a prediction
  const fetchPlaceDetails = async (placeId: string, description: string) => {
    setIsSearching(true);

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components&key=${GOOGLE_MAPS_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        const location: LocationData = {
          address: result.formatted_address || description,
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };

        // Extract city, region, country
        result.address_components?.forEach((component: any) => {
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

        // Update state
        setInputText(location.address || description);
        setSelectedLocation(location);
        setMapRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });

        // Call onChange
        onChange(location);

        // Hide predictions and dismiss keyboard
        setShowPredictions(false);
        setPredictions([]);
        Keyboard.dismiss();
      }
    } catch (err) {
      console.error('Error fetching place details:', err);
      Alert.alert('Error', 'Failed to get place details. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle prediction selection
  const handleSelectPrediction = (prediction: PlacePrediction) => {
    fetchPlaceDetails(prediction.place_id, prediction.description);
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingLocation(true);
    // Hide predictions when using current location
    setShowPredictions(false);
    setPredictions([]);

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
      setInputText(address);
      onChange(location);

      // Animate map
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setMapRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
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
    } catch (err) {
      console.error('Reverse geocode error:', err);
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
      setInputText(selectedLocation.address || '');
    }
    setShowMapModal(false);
  };

  const inputBgColor = isDark ? '#1E293B' : '#FFFFFF';
  const inputTextColor = isDark ? '#FFFFFF' : '#111827';
  const placeholderColor = isDark ? '#64748B' : '#9CA3AF';
  const borderColor = error ? '#EF4444' : isDark ? '#334155' : '#E2E8F0';
  const dropdownBgColor = isDark ? '#1E293B' : '#FFFFFF';
  const dropdownBorderColor = isDark ? '#334155' : '#E2E8F0';
  const hoverBgColor = isDark ? '#334155' : '#F1F5F9';
  const secondaryTextColor = isDark ? '#94A3B8' : '#64748B';

  const hasApiKey = !!GOOGLE_MAPS_API_KEY;

  return (
    <View>
      {label && (
        <Text
          className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
        >
          {label}
        </Text>
      )}

      {/* Custom Autocomplete Input */}
      <View style={{ zIndex: 1000 }}>
        <View className="rounded-xl overflow-hidden" style={{ borderWidth: 2, borderColor }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: inputBgColor,
              paddingHorizontal: 12,
            }}
          >
            <MaterialIcons name="search" size={20} color="#64748B" />
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={handleTextChange}
              onFocus={() => {
                if (predictions.length > 0) {
                  setShowPredictions(true);
                }
              }}
              placeholder={hasApiKey ? placeholder : 'API key required'}
              placeholderTextColor={placeholderColor}
              editable={!disabled && hasApiKey}
              style={{
                flex: 1,
                height: 48,
                fontSize: 16,
                color: inputTextColor,
                marginLeft: 8,
              }}
            />
            {isSearching && <ActivityIndicator size="small" color="#3B82F6" />}
            {inputText.length > 0 && !isSearching && (
              <TouchableOpacity
                onPress={() => {
                  setInputText('');
                  setPredictions([]);
                  setShowPredictions(false);
                  setSelectedLocation(null);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Predictions Dropdown */}
        {showPredictions && predictions.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 56,
              left: 0,
              right: 0,
              height: Math.min(predictions.length * 50, 230),
              backgroundColor: dropdownBgColor,
              borderWidth: 2,
              borderColor: dropdownBorderColor,
              borderRadius: 12,
              zIndex: 1001,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 8,
              paddingVertical: 8,
              paddingHorizontal: 8,
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              bounces={false}
              overScrollMode="always"
              scrollEventThrottle={16}
            >
              {predictions.map((item, index) => (
                <Pressable
                  key={item.place_id}
                  onPress={() => handleSelectPrediction(item)}
                  style={({ pressed }) => ({
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: index < predictions.length - 1 ? 1 : 0,
                    borderBottomColor: dropdownBorderColor,
                    backgroundColor: pressed ? hoverBgColor : 'transparent',
                  })}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Icon Container */}
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        backgroundColor: isDark ? '#334155' : '#EEF2FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <MaterialIcons name="place" size={20} color="#3B82F6" />
                    </View>

                    {/* Text Container */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: inputTextColor,
                          lineHeight: 20,
                        }}
                        numberOfLines={1}
                      >
                        {item.structured_formatting?.main_text || item.description}
                      </Text>
                      {item.structured_formatting?.secondary_text && (
                        <Text
                          style={{
                            fontSize: 13,
                            color: secondaryTextColor,
                            marginTop: 2,
                            lineHeight: 18,
                          }}
                          numberOfLines={1}
                        >
                          {item.structured_formatting.secondary_text}
                        </Text>
                      )}
                    </View>
                  </View>

                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}

      {!hasApiKey && (
        <Text className="text-yellow-600 text-xs mt-1">
          Note: Add GOOGLE_MAPS_API_KEY to enable address autocomplete
        </Text>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-2 mt-3">
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          disabled={disabled || isLoadingLocation}
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'
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

        <TouchableOpacity
          onPress={() => setShowMapModal(true)}
          disabled={disabled}
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'
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
          className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'} border ${isDark ? 'border-green-500/20' : 'border-green-200'
            }`}
        >
          <View className="flex-row items-start">
            <MaterialIcons name="check-circle" size={18} color="#10B981" />
            <View className="flex-1 ml-2">
              <Text
                className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}
              >
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
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View
            className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'
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
              className={`px-4 py-2 rounded-lg ${selectedLocation ? 'bg-primary-500' : 'bg-slate-300'
                }`}
            >
              <Text
                className={`font-semibold ${selectedLocation ? 'text-white' : 'text-slate-500'}`}
              >
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
              initialRegion={mapRegion}
              onPress={handleMapPress}
              showsUserLocation
              showsMyLocationButton={false}
              mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
              rotateEnabled={false}
              pitchEnabled={false}
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
              className={`absolute right-4 bottom-24 h-12 w-12 rounded-full items-center justify-center shadow-lg ${isDark ? 'bg-slate-800' : 'bg-white'
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
            className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            {selectedLocation ? (
              <View>
                <Text
                  className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                >
                  Selected Address
                </Text>
                <Text
                  className={`text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
                  numberOfLines={2}
                >
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
      className={`flex-row items-center p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
        }`}
    >
      <View
        className={`h-10 w-10 rounded-lg items-center justify-center mr-3 ${location ? 'bg-green-500/20' : isDark ? 'bg-slate-700' : 'bg-slate-100'
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
            <Text
              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              numberOfLines={1}
            >
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