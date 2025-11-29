import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button, Input, Card } from '../../../src/components/common';
import { GhanaConstants } from '../../../src/constants';
import vehicleService, { Vehicle, formatMileage } from '../../../src/services/vehicle';

export default function DiagnoseVehicleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTheme();
  const { userType } = useAuth();

  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [year, setYear] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');

  const isGuest = userType === 'guest';

  // Fetch user's saved vehicles
  const fetchVehicles = useCallback(async () => {
    if (isGuest) {
      setLoadingVehicles(false);
      return;
    }

    try {
      setLoadingVehicles(true);
      const vehicles = await vehicleService.getVehicles();
      setSavedVehicles(vehicles);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoadingVehicles(false);
    }
  }, [isGuest]);

  // Fetch vehicles on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [fetchVehicles])
  );

  const handleContinue = () => {
    router.push({
      pathname: '/(driver)/diagnose/review',
      params: {
        ...params,
        vehicleId: selectedVehicle,
        year,
        make,
        model,
        mileage,
      },
    });
  };

  const handleSkip = () => {
    router.push({
      pathname: '/(driver)/diagnose/review',
      params,
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
        <Text
          className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          Step 3 of 4
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(driver)/')}
          className="h-12 w-12 items-center justify-center"
        >
          <MaterialIcons
            name="close"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="pt-4 pb-3">
          <Text
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Vehicle Information
          </Text>
          <Text
            className={`text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Help us provide accurate diagnosis
          </Text>
        </View>

        {/* Optional Note */}
        <View
          className={`flex-row items-center p-3 rounded-xl mb-4 ${
            isDark ? 'bg-amber-500/10' : 'bg-amber-50'
          }`}
        >
          <MaterialIcons name="info" size={18} color="#F59E0B" />
          <Text
            className={`ml-2 text-sm ${isDark ? 'text-amber-200' : 'text-amber-700'}`}
          >
            Optional but recommended
          </Text>
        </View>

        {/* Saved Vehicles */}
        {!isGuest && (
          <View className="mb-6">
            <Text
              className={`text-base font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Or select from saved vehicles
            </Text>
            {loadingVehicles ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Loading your vehicles...
                </Text>
              </View>
            ) : savedVehicles.length > 0 ? (
              savedVehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  onPress={() => setSelectedVehicle(vehicle.id.toString())}
                  className={`flex-row items-center p-4 rounded-xl mb-2 ${
                    selectedVehicle === vehicle.id.toString()
                      ? 'bg-primary-500/10 border-2 border-primary-500'
                      : isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-100'
                  }`}
                >
                  <View
                    className={`h-5 w-5 rounded-full border-2 mr-4 items-center justify-center ${
                      selectedVehicle === vehicle.id.toString()
                        ? 'border-primary-500 bg-primary-500'
                        : isDark
                        ? 'border-slate-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedVehicle === vehicle.id.toString() && (
                      <View className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text
                        className={`font-semibold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Text>
                      {vehicle.is_primary && (
                        <View className="ml-2 bg-primary-500 px-2 py-0.5 rounded-full">
                          <Text className="text-white text-xs font-bold">Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text
                      className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {formatMileage(vehicle.mileage)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(driver)/profile/vehicle-edit')}
                className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialIcons name="add" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text className={`ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Add a vehicle for better diagnosis
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Manual Entry Form */}
        <View className="mb-6">
          <Text
            className={`text-base font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {!isGuest && savedVehicles.length > 0 ? 'Or enter details manually' : 'Enter vehicle details'}
          </Text>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Year"
                placeholder="e.g., 2020"
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Make"
                placeholder="e.g., Toyota"
                value={make}
                onChangeText={setMake}
              />
            </View>
          </View>

          <Input
            label="Model"
            placeholder="e.g., Camry"
            value={model}
            onChangeText={setModel}
          />

          <Input
            label="Mileage (km)"
            placeholder="e.g., 50000"
            icon="speed"
            value={mileage}
            onChangeText={setMileage}
            keyboardType="number-pad"
          />
        </View>

        {/* Popular Makes */}
        <View className="mb-6">
          <Text
            className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Popular makes in Ghana
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {GhanaConstants.popularVehicleMakes.slice(0, 6).map((vehicleMake) => (
              <TouchableOpacity
                key={vehicleMake}
                onPress={() => setMake(vehicleMake)}
                className={`px-3 py-2 rounded-lg ${
                  make === vehicleMake
                    ? 'bg-primary-500/20'
                    : isDark
                    ? 'bg-slate-800'
                    : 'bg-slate-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    make === vehicleMake
                      ? 'text-primary-500'
                      : isDark
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {vehicleMake}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className={`px-4 py-4 border-t ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
      >
        <Button title="Continue" onPress={handleContinue} fullWidth />
        <TouchableOpacity onPress={handleSkip} className="py-3 items-center">
          <Text className="text-primary-500 font-bold">Skip this step</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
