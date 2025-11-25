import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { SearchBar, Card, Rating, Avatar } from '../../../src/components/common';

const { width } = Dimensions.get('window');

const experts = [
  {
    id: '1',
    name: "Kofi's Auto Repair",
    rating: 4.9,
    distance: 2.3,
    status: 'open',
    latitude: 5.6037,
    longitude: -0.1870,
  },
  {
    id: '2',
    name: 'Precision Auto Works',
    rating: 4.8,
    distance: 3.1,
    status: 'open',
    latitude: 5.6100,
    longitude: -0.1800,
  },
  {
    id: '3',
    name: 'Quick Fix Garage',
    rating: 4.5,
    distance: 1.8,
    status: 'closed',
    latitude: 5.5980,
    longitude: -0.1920,
  },
];

export default function ExpertsMapScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const initialRegion = {
    latitude: 5.6037,
    longitude: -0.1870,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const selected = experts.find((e) => e.id === selectedExpert);

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
      {/* Map */}
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {experts.map((expert) => (
          <Marker
            key={expert.id}
            coordinate={{
              latitude: expert.latitude,
              longitude: expert.longitude,
            }}
            onPress={() => setSelectedExpert(expert.id)}
          >
            <View
              className={`h-10 w-10 rounded-full items-center justify-center ${
                selectedExpert === expert.id
                  ? 'bg-primary-500'
                  : expert.status === 'open'
                  ? 'bg-green-500'
                  : 'bg-slate-400'
              }`}
            >
              <MaterialIcons name="build" size={20} color="#FFFFFF" />
            </View>
          </Marker>
        ))}
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
              containerClassName="shadow-md"
            />
          </View>
        </View>

        {/* Radius Selector */}
        <View className="flex-row justify-center mt-3">
          <View className={`px-4 py-2 rounded-full shadow-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <Text className={isDark ? 'text-white' : 'text-slate-900'}>
              Within <Text className="font-bold text-primary-500">10 km</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* My Location Button */}
      <TouchableOpacity
        style={{ position: 'absolute', right: 16, bottom: insets.bottom + 200 }}
        className={`h-11 w-11 rounded-full items-center justify-center shadow-md ${isDark ? 'bg-slate-800' : 'bg-white'}`}
      >
        <MaterialIcons
          name="my-location"
          size={24}
          color="#3B82F6"
        />
      </TouchableOpacity>

      {/* Selected Expert Card */}
      {selected && (
        <View style={{ position: 'absolute', bottom: insets.bottom + 32, left: 16, right: 16 }}>
          <Card
            variant="elevated"
            padding="md"
            onPress={() => router.push(`/(driver)/experts/${selected.id}`)}
          >
            <View className="flex-row items-center">
              <Avatar name={selected.name} size="lg" />
              <View className="flex-1 ml-4">
                <Text
                  className={`font-bold text-lg ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {selected.name}
                </Text>
                <Rating value={selected.rating} size="sm" showValue />
                <View className="flex-row items-center gap-3 mt-1">
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="location-on" size={14} color="#64748B" />
                    <Text className="text-sm text-slate-500">
                      {selected.distance} km
                    </Text>
                  </View>
                  <View
                    className={`h-2 w-2 rounded-full ${
                      selected.status === 'open' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <Text
                    className={`text-sm ${
                      selected.status === 'open' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {selected.status === 'open' ? 'Open' : 'Closed'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="h-12 w-12 rounded-xl bg-primary-500 items-center justify-center"
                onPress={() => router.push(`/(driver)/experts/${selected.id}`)}
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
