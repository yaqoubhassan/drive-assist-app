import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Badge, EmptyState, Skeleton } from '../../../src/components/common';
import vehicleService, { Vehicle } from '../../../src/services/vehicle';

export default function VehiclesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showSuccess, showError, showConfirm } = useAlert();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchVehicles = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await vehicleService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchVehicles();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVehicles(false);
    setRefreshing(false);
  };

  const handleSetPrimary = async (vehicle: Vehicle) => {
    try {
      setActionLoading(vehicle.id);
      await vehicleService.setPrimaryVehicle(vehicle.id);
      // Update local state
      setVehicles(vehicles.map((v) => ({
        ...v,
        is_primary: v.id === vehicle.id,
      })));
      showSuccess('Success', `${vehicle.display_name} is now your primary vehicle`);
    } catch (error: any) {
      showError('Error', error.message || 'Failed to set primary vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (vehicle: Vehicle) => {
    showConfirm({
      title: 'Delete Vehicle',
      message: `Are you sure you want to remove your ${vehicle.display_name}? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await vehicleService.deleteVehicle(vehicle.id);
          setVehicles(vehicles.filter((v) => v.id !== vehicle.id));
          showSuccess('Vehicle Removed', 'The vehicle has been removed from your garage.');
        } catch (error: any) {
          showError('Error', error.message || 'Failed to delete vehicle');
        }
      },
    });
  };

  const handleEdit = (vehicle: Vehicle) => {
    router.push({
      pathname: '/(driver)/profile/vehicle-edit',
      params: { id: vehicle.id.toString() },
    });
  };

  const handleAddVehicle = () => {
    router.push('/(driver)/profile/vehicle-edit');
  };

  // Skeleton loading component
  const VehicleSkeleton = () => (
    <Card variant="default" className="overflow-hidden">
      <View className="flex-row items-start">
        <Skeleton width={56} height={56} borderRadius={12} style={{ marginRight: 12 }} />
        <View className="flex-1">
          <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={14} />
        </View>
      </View>
      <View className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
        <View className="flex-row flex-wrap gap-y-3">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-1/2">
              <Skeleton width={60} height={10} style={{ marginBottom: 4 }} />
              <Skeleton width={80} height={16} />
            </View>
          ))}
        </View>
      </View>
      <View className={`flex-row mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
        <Skeleton width="30%" height={32} borderRadius={8} style={{ marginRight: 8 }} />
        <Skeleton width="30%" height={32} borderRadius={8} style={{ marginRight: 8 }} />
        <Skeleton width="30%" height={32} borderRadius={8} />
      </View>
    </Card>
  );

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
          {!loading && (
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} saved
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleAddVehicle}
          className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center"
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          // Skeleton loading state
          <View className="gap-4 pb-8">
            {[1, 2].map((i) => (
              <VehicleSkeleton key={i} />
            ))}
          </View>
        ) : vehicles.length > 0 ? (
          <View className="gap-4 pb-8">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} variant="default" className="overflow-hidden">
                {/* Vehicle Header */}
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-center flex-1">
                    {vehicle.image_url ? (
                      <View className="h-14 w-14 rounded-xl overflow-hidden mr-3">
                        <Image
                          source={{ uri: vehicle.image_url }}
                          style={{ width: 56, height: 56 }}
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View
                        className="h-14 w-14 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
                      >
                        <MaterialIcons
                          name="directions-car"
                          size={28}
                          color="#3B82F6"
                        />
                      </View>
                    )}
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {vehicle.display_name}
                        </Text>
                        {vehicle.is_primary && (
                          <Badge label="Primary" variant="success" size="sm" />
                        )}
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {vehicle.year} • {vehicle.color || 'No color'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Vehicle Details */}
                <View className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <View className="flex-row flex-wrap gap-y-3">
                    <View className="w-1/2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        License Plate
                      </Text>
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.license_plate || 'Not set'}
                      </Text>
                    </View>
                    <View className="w-1/2">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Fuel Type
                      </Text>
                      <Text className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicle.fuel_type || 'Not set'}
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
                  {!vehicle.is_primary && (
                    <TouchableOpacity
                      onPress={() => handleSetPrimary(vehicle)}
                      disabled={actionLoading === vehicle.id}
                      className="flex-1 flex-row items-center justify-center py-2"
                    >
                      <MaterialIcons name="star-outline" size={18} color="#3B82F6" />
                      <Text className="text-primary-500 font-semibold ml-1">
                        {actionLoading === vehicle.id ? 'Setting...' : 'Set Primary'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleEdit(vehicle)}
                    className="flex-1 flex-row items-center justify-center py-2"
                  >
                    <MaterialIcons name="edit" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                    <Text className={`font-semibold ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(vehicle)}
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
            onAction={handleAddVehicle}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
