import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Button, Input, Card, Loading } from '../../../src/components/common';
import vehicleService from '../../../src/services/vehicle';
import { GhanaConstants } from '../../../src/constants';

const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
  { value: 'lpg', label: 'LPG' },
];

const transmissionTypes = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'cvt', label: 'CVT' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function VehicleEditScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showSuccess, showError, showConfirm } = useAlert();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const isEditing = !!id;

  // Loading states
  const [loadingVehicle, setLoadingVehicle] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [makeId, setMakeId] = useState<number | null>(null);
  const [makeName, setMakeName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(currentYear);
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [transmission, setTransmission] = useState('automatic');
  const [mileage, setMileage] = useState('');

  // Picker states
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Available makes from backend (with IDs) or constants (names only)
  const [vehicleMakes, setVehicleMakes] = useState<{ id: number; name: string }[]>([]);

  // Load vehicle data if editing
  useEffect(() => {
    if (isEditing && id) {
      loadVehicle(id);
    }
    loadVehicleMakes();
  }, [id, isEditing]);

  const loadVehicle = async (vehicleId: string) => {
    try {
      const vehicle = await vehicleService.getVehicle(vehicleId);
      setMakeId(vehicle.make_id || null);
      setMakeName(vehicle.make || '');
      setModel(vehicle.model || '');
      setYear(vehicle.year || currentYear);
      setLicensePlate(vehicle.plate_number || '');
      setVin(vehicle.vin || '');
      setColor(vehicle.color || '');
      setFuelType(vehicle.fuel_type || 'petrol');
      setTransmission(vehicle.transmission || 'automatic');
      setMileage(vehicle.mileage?.toString() || '');
    } catch (error: any) {
      showError('Error', error.message || 'Failed to load vehicle');
      router.back();
    } finally {
      setLoadingVehicle(false);
    }
  };

  const loadVehicleMakes = async () => {
    try {
      const makes = await vehicleService.getVehicleMakes();
      if (makes.length > 0) {
        setVehicleMakes(makes.map(m => ({ id: m.id, name: m.name })));
      } else {
        // Fall back to constants (without IDs)
        setVehicleMakes(GhanaConstants.popularVehicleMakes.map((name, index) => ({ id: -index - 1, name })));
      }
    } catch (error) {
      // Fall back to constants if API fails
      console.log('Using local vehicle makes');
      setVehicleMakes(GhanaConstants.popularVehicleMakes.map((name, index) => ({ id: -index - 1, name })));
    }
  };

  const handleSave = async () => {
    if (!makeName || !model || !year) {
      showError('Required Fields', 'Please fill in make, model, and year.');
      return;
    }

    setSaving(true);

    try {
      // Build request data with correct field names for backend
      const vehicleData: any = {
        year,
        custom_model: model, // Always send model as custom_model for simplicity
        license_plate: licensePlate || undefined,
        vin: vin || undefined,
        color: color || undefined,
        fuel_type: fuelType,
        transmission,
        mileage: mileage ? parseInt(mileage, 10) : undefined,
      };

      // Use vehicle_make_id if we have a valid ID from the API, otherwise use custom_make
      if (makeId && makeId > 0) {
        vehicleData.vehicle_make_id = makeId;
      } else {
        vehicleData.custom_make = makeName;
      }

      if (isEditing && id) {
        await vehicleService.updateVehicle(id, vehicleData);
        showSuccess(
          'Vehicle Updated',
          `Your ${makeName} ${model} has been updated successfully.`,
          () => router.back()
        );
      } else {
        await vehicleService.createVehicle(vehicleData);
        showSuccess(
          'Vehicle Added',
          `Your ${makeName} ${model} has been added successfully.`,
          () => router.back()
        );
      }
    } catch (error: any) {
      showError(
        isEditing ? 'Update Failed' : 'Add Failed',
        error.message || `Failed to ${isEditing ? 'update' : 'add'} vehicle. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Delete Vehicle',
      message: `Are you sure you want to delete your ${makeName} ${model}? This action cannot be undone.`,
      variant: 'danger',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setDeleting(true);
        try {
          await vehicleService.deleteVehicle(id!);
          showSuccess(
            'Vehicle Deleted',
            'Your vehicle has been deleted successfully.',
            () => router.back()
          );
        } catch (error: any) {
          showError('Delete Failed', error.message || 'Failed to delete vehicle.');
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (loadingVehicle) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
        <Loading message="Loading vehicle..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {isEditing ? 'Edit Vehicle' : 'Add Vehicle'}
        </Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Vehicle Icon */}
          <View className="items-center py-6">
            <View
              className="h-24 w-24 rounded-2xl items-center justify-center"
              style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
            >
              <MaterialIcons name="directions-car" size={48} color="#3B82F6" />
            </View>
          </View>

          {/* Basic Info */}
          <View className="mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              BASIC INFORMATION
            </Text>

            {/* Make Picker */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Make *
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowMakePicker(!showMakePicker);
                  setShowYearPicker(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={makeName ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-400')}>
                  {makeName || 'Select make'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>

              {showMakePicker && (
                <Card variant="default" className="mt-2 max-h-48">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {vehicleMakes.map((vehicleMake) => (
                      <TouchableOpacity
                        key={vehicleMake.id}
                        onPress={() => {
                          setMakeId(vehicleMake.id);
                          setMakeName(vehicleMake.name);
                          setShowMakePicker(false);
                        }}
                        className={`py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
                      >
                        <Text className={`${makeName === vehicleMake.name ? 'text-primary-500 font-semibold' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          {vehicleMake.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Card>
              )}
            </View>

            <Input
              label="Model *"
              placeholder="e.g., Corolla, Civic, Elantra"
              value={model}
              onChangeText={setModel}
            />

            {/* Year Picker */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Year *
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowYearPicker(!showYearPicker);
                  setShowMakePicker(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl border ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <Text className={isDark ? 'text-white' : 'text-slate-900'}>
                  {year}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>

              {showYearPicker && (
                <Card variant="default" className="mt-2 max-h-48">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {years.map((y) => (
                      <TouchableOpacity
                        key={y}
                        onPress={() => {
                          setYear(y);
                          setShowYearPicker(false);
                        }}
                        className={`py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
                      >
                        <Text className={`${year === y ? 'text-primary-500 font-semibold' : isDark ? 'text-white' : 'text-slate-900'}`}>
                          {y}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Card>
              )}
            </View>

            <Input
              label="Color"
              placeholder="e.g., Silver, White, Black"
              value={color}
              onChangeText={setColor}
            />
          </View>

          {/* Registration Info */}
          <View className="mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              REGISTRATION
            </Text>

            <Input
              label="License Plate"
              placeholder="e.g., GR-1234-20"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
            />

            <Input
              label="VIN (Optional)"
              placeholder="17-character Vehicle Identification Number"
              value={vin}
              onChangeText={setVin}
              autoCapitalize="characters"
              maxLength={17}
            />
          </View>

          {/* Technical Info */}
          <View className="mb-6">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              TECHNICAL DETAILS
            </Text>

            {/* Fuel Type */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Fuel Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {fuelTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setFuelType(type.value)}
                    className={`px-4 py-2 rounded-full ${
                      fuelType === type.value
                        ? 'bg-primary-500'
                        : isDark
                        ? 'bg-slate-800'
                        : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        fuelType === type.value
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Transmission */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Transmission
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {transmissionTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setTransmission(type.value)}
                    className={`px-4 py-2 rounded-full ${
                      transmission === type.value
                        ? 'bg-primary-500'
                        : isDark
                        ? 'bg-slate-800'
                        : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        transmission === type.value
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Current Mileage (km)"
              placeholder="e.g., 45000"
              value={mileage}
              onChangeText={setMileage}
              keyboardType="numeric"
            />
          </View>

          {/* Delete Button (only when editing) */}
          {isEditing && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={handleDelete}
                disabled={deleting}
                className={`flex-row items-center justify-center py-4 rounded-xl border ${
                  isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-200 bg-red-50'
                }`}
              >
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                <Text className="text-red-500 font-semibold ml-2">
                  {deleting ? 'Deleting...' : 'Delete Vehicle'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <Button
          title={isEditing ? 'Save Changes' : 'Add Vehicle'}
          onPress={handleSave}
          loading={saving}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
