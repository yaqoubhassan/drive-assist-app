import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Avatar, Badge, Button, Input } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

const expertInfo = {
  id: '1',
  name: 'Emmanuel Auto Services',
  rating: 4.9,
  reviews: 127,
  specialty: 'Engine & Transmission',
  location: 'East Legon, Accra',
  phone: '+233 24 123 4567',
};

const serviceOptions = [
  { id: '1', name: 'Diagnostic Check', price: 100, duration: '30 min' },
  { id: '2', name: 'Oil Change', price: 150, duration: '45 min' },
  { id: '3', name: 'Brake Inspection', price: 80, duration: '30 min' },
  { id: '4', name: 'Full Service', price: 500, duration: '2-3 hours' },
  { id: '5', name: 'Custom (Describe below)', price: 0, duration: 'TBD' },
];

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showWarning, showAlert } = useAlert();
  const { expertId, date, time } = useLocalSearchParams<{
    expertId: string;
    date: string;
    time: string;
  }>();

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);

  const selectedDate = date ? new Date(date) : new Date();
  const service = serviceOptions.find((s) => s.id === selectedService);

  const handleConfirmBooking = async () => {
    if (!selectedService) {
      showWarning('Select Service', 'Please select a service type.');
      return;
    }

    setConfirming(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConfirming(false);

    showAlert({
      title: 'Booking Confirmed!',
      message: `Your appointment with ${expertInfo.name} has been scheduled for ${selectedDate.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })} at ${time}.`,
      variant: 'success',
      primaryButtonLabel: 'View Booking',
      onPrimaryPress: () => router.replace('/(driver)/profile/history'),
      secondaryButtonLabel: 'Done',
      onSecondaryPress: () => router.replace('/(driver)'),
    });
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
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Confirm Booking
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Appointment Summary */}
        <View className="px-4 py-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              APPOINTMENT DETAILS
            </Text>

            {/* Expert */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <Avatar size="md" name={expertInfo.name} />
              <View className="ml-3 flex-1">
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {expertInfo.name}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {expertInfo.rating} ({expertInfo.reviews} reviews)
                  </Text>
                </View>
              </View>
            </View>

            {/* Date & Time */}
            <View className="flex-row mb-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <MaterialIcons name="event" size={18} color="#3B82F6" />
                  <Text className={`text-sm ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Date
                  </Text>
                </View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedDate.toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <MaterialIcons name="schedule" size={18} color="#3B82F6" />
                  <Text className={`text-sm ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Time
                  </Text>
                </View>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {time}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={18} color="#10B981" />
              <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {expertInfo.location}
              </Text>
            </View>
          </Card>
        </View>

        {/* Service Selection */}
        <View className="px-4 pb-4">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Select Service
          </Text>
          <View className="gap-3">
            {serviceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedService(option.id)}
                className={`p-4 rounded-xl border-2 ${
                  selectedService === option.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : isDark
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {option.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Duration: {option.duration}
                    </Text>
                  </View>
                  <View className="items-end">
                    {option.price > 0 ? (
                      <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(option.price)}
                      </Text>
                    ) : (
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Quote on request
                      </Text>
                    )}
                  </View>
                  <View
                    className={`h-6 w-6 rounded-full ml-3 border-2 items-center justify-center ${
                      selectedService === option.id
                        ? 'border-primary-500 bg-primary-500'
                        : isDark
                        ? 'border-slate-600'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedService === option.id && (
                      <MaterialIcons name="check" size={14} color="#FFFFFF" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Notes */}
        <View className="px-4 pb-4">
          <Input
            label="Additional Notes (Optional)"
            placeholder="Describe your issue or any special requests..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Price Summary */}
        {service && service.price > 0 && (
          <View className="px-4 pb-8">
            <Card variant="default">
              <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                PRICE SUMMARY
              </Text>
              <View className="flex-row items-center justify-between mb-2">
                <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {service.name}
                </Text>
                <Text className={`${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatCurrency(service.price)}
                </Text>
              </View>
              <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Estimated Total
                </Text>
                <Text className={`text-xl font-bold text-primary-500`}>
                  {formatCurrency(service.price)}
                </Text>
              </View>
              <Text className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                * Final price may vary based on actual work required
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Confirm Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Button
          title="Confirm Booking"
          onPress={handleConfirmBooking}
          loading={confirming}
          disabled={!selectedService}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
