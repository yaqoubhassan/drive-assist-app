import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Button, Badge, EmptyState } from '../../../src/components/common';
import { Vehicle } from '../../../src/types';

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    userId: 'user1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2019,
    plateNumber: 'GR-1234-20',
    vin: '1HGBH41JXMN109186',
    color: 'Silver',
    fuelType: 'petrol',
    transmission: 'automatic',
    mileage: 45000,
    isDefault: true,
  },
  {
    id: '2',
    userId: 'user1',
    make: 'Honda',
    model: 'CR-V',
    year: 2021,
    plateNumber: 'GW-5678-21',
    color: 'White',
    fuelType: 'petrol',
    transmission: 'automatic',
    mileage: 22000,
    isDefault: false,
  },
];

export default function VehiclesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);

  const handleSetDefault = (vehicleId: string) => {
    setVehicles(vehicles.map((v) => ({
      ...v,
      isDefault: v.id === vehicleId,
    })));
  };

  const handleDelete = (vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to remove this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setVehicles(vehicles.filter((v) => v.id !== vehicleId)),
        },
      ]
    );
  };

  const getVehicleIcon = (make: string) => {
    const lowMake = make.toLowerCase();
    if (lowMake.includes('toyota') || lowMake.includes('honda')) {
      return 'directions-car';
    }
    if (lowMake.includes('suv') || lowMake.includes('cr-v') || lowMake.includes('rav')) {
      return 'directions-car';
    }
    return 'directions-car';
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-2"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My Vehicles
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} saved
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(driver)/diagnose/vehicle')}
          className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center"
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {vehicles.length > 0 ? (
          <View className="gap-4 pb-8">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} variant="default" className="overflow-hidden">
                {/* Vehicle Header */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="h-14 w-14 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                    >
                      <MaterialIcons
                        name={getVehicleIcon(vehicle.make) as any}
                        size={28}
                        color="#3B82F6"
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {vehicle.make} {vehicle.model}
                        </Text>
                        {vehicle.isDefault && (
                          <Badge label="Default" variant="success" size="sm" />
                        )}
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {vehicle.year} • {vehicle.color}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Vehicle Details */}
                <View className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <View className="flex-row flex-wrap gap-y-3">
                    <View className="w-1/2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Plate Number
                      </Text>
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.plateNumber || 'Not set'}
                      </Text>
                    </View>
                    <View className="w-1/2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Fuel Type
                      </Text>
                      <Text className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.fuelType || 'Not set'}
                      </Text>
                    </View>
                    <View className="w-1/2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Transmission
                      </Text>
                      <Text className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.transmission || 'Not set'}
                      </Text>
                    </View>
                    <View className="w-1/2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Mileage
                      </Text>
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.mileage?.toLocaleString() || 0} km
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className={`flex-row mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  {!vehicle.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(vehicle.id)}
                      className="flex-1 flex-row items-center justify-center py-2"
                    >
                      <MaterialIcons name="star-outline" size={18} color="#3B82F6" />
                      <Text className="text-primary-500 font-semibold ml-1">Set Default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => {}}
                    className="flex-1 flex-row items-center justify-center py-2"
                  >
                    <MaterialIcons name="edit" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                    <Text className={`font-semibold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(vehicle.id)}
                    className="flex-1 flex-row items-center justify-center py-2"
                  >
                    <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                    <Text className="text-red-500 font-semibold ml-1">Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="directions-car"
            title="No Vehicles Saved"
            description="Add your vehicles to get personalized diagnoses and maintenance tips."
            actionLabel="Add Vehicle"
            onAction={() => router.push('/(driver)/diagnose/vehicle')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
