import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Button, Input, Card } from '../../../src/components/common';
import { GhanaConstants } from '../../../src/constants';

const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG'];
const transmissionTypes = ['Automatic', 'Manual', 'CVT'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function VehicleEditScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();

  const isEditing = !!vehicleId;

  // Form state
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(currentYear);
  const [plateNumber, setPlateNumber] = useState('');
  const [vin, setVin] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [mileage, setMileage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMakePicker, setShowMakePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleSave = async () => {
    if (!make || !model || !year) {
      Alert.alert('Required Fields', 'Please fill in make, model, and year.');
      return;
    }

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);

    Alert.alert(
      isEditing ? 'Vehicle Updated' : 'Vehicle Added',
      `Your ${make} ${model} has been ${isEditing ? 'updated' : 'saved'}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

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

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
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
              Make
            </Text>
            <TouchableOpacity
              onPress={() => setShowMakePicker(!showMakePicker)}
              className={`flex-row items-center justify-between p-4 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <Text className={make ? (isDark ? 'text-white' : 'text-slate-900') : (isDark ? 'text-slate-500' : 'text-slate-400')}>
                {make || 'Select make'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>

            {showMakePicker && (
              <Card variant="default" className="mt-2 max-h-48">
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {GhanaConstants.popularVehicleMakes.map((vehicleMake) => (
                    <TouchableOpacity
                      key={vehicleMake}
                      onPress={() => {
                        setMake(vehicleMake);
                        setShowMakePicker(false);
                      }}
                      className={`py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
                    >
                      <Text className={`${make === vehicleMake ? 'text-primary-500 font-semibold' : isDark ? 'text-white' : 'text-slate-900'}`}>
                        {vehicleMake}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Card>
            )}
          </View>

          <Input
            label="Model"
            placeholder="e.g., Corolla, Civic, Elantra"
            value={model}
            onChangeText={setModel}
          />

          {/* Year Picker */}
          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Year
            </Text>
            <TouchableOpacity
              onPress={() => setShowYearPicker(!showYearPicker)}
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
            label="Plate Number"
            placeholder="e.g., GR-1234-20"
            value={plateNumber}
            onChangeText={setPlateNumber}
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
                  key={type}
                  onPress={() => setFuelType(type)}
                  className={`px-4 py-2 rounded-full ${
                    fuelType === type
                      ? 'bg-primary-500'
                      : isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-100'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      fuelType === type
                        ? 'text-white'
                        : isDark
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {type}
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
                  key={type}
                  onPress={() => setTransmission(type)}
                  className={`px-4 py-2 rounded-full ${
                    transmission === type
                      ? 'bg-primary-500'
                      : isDark
                      ? 'bg-slate-800'
                      : 'bg-slate-100'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      transmission === type
                        ? 'text-white'
                        : isDark
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {type}
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
      </ScrollView>

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
