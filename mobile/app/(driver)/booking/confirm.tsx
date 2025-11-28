import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Avatar, Button, Input } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';
import { expertService, Expert } from '../../../src/services/expert';
import { appointmentService, ServiceType } from '../../../src/services/appointment';

// Service type options that match backend
const serviceOptions: Array<{
  id: ServiceType;
  name: string;
  price: number;
  duration: string;
  description: string;
}> = [
  { id: 'diagnostic', name: 'Diagnostic Check', price: 100, duration: '30-60 min', description: 'Comprehensive vehicle diagnosis' },
  { id: 'repair', name: 'Repair Service', price: 0, duration: 'Varies', description: 'Fix identified issues' },
  { id: 'maintenance', name: 'Maintenance Service', price: 150, duration: '1-2 hours', description: 'Regular maintenance and servicing' },
  { id: 'inspection', name: 'Full Inspection', price: 200, duration: '1-2 hours', description: 'Complete vehicle inspection' },
];

export default function BookingConfirmScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showWarning, showAlert, showError } = useAlert();
  const params = useLocalSearchParams<{
    expertId: string;
    date: string;
    time: string;
    diagnosisId?: string;
    vehicleId?: string;
    serviceType?: string;
  }>();

  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    (params.serviceType as ServiceType) || null
  );
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);

  const selectedDate = params.date ? new Date(params.date) : new Date();
  const service = serviceOptions.find((s) => s.id === selectedService);

  useEffect(() => {
    if (params.expertId) {
      fetchExpert();
    }
  }, [params.expertId]);

  const fetchExpert = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expertService.getExpert(params.expertId!);
      setExpert(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load expert details');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedService) {
      showWarning('Select Service', 'Please select a service type.');
      return;
    }

    if (!expert) {
      showError('Error', 'Expert information not loaded.');
      return;
    }

    setConfirming(true);
    try {
      const appointmentData = {
        expert_id: expert.id,
        scheduled_date: params.date!,
        scheduled_time: params.time!,
        service_type: selectedService,
        description: notes || undefined,
        diagnosis_id: params.diagnosisId ? parseInt(params.diagnosisId) : undefined,
        vehicle_id: params.vehicleId ? parseInt(params.vehicleId) : undefined,
        estimated_cost: service?.price || undefined,
      };

      await appointmentService.createAppointment(appointmentData);

      const expertName = expert.profile?.business_name || expert.full_name;

      showAlert({
        title: 'Booking Requested!',
        message: `Your appointment request with ${expertName} has been sent for ${selectedDate.toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })} at ${formatTime(params.time!)}. You'll be notified once it's confirmed.`,
        variant: 'success',
        primaryButtonLabel: 'View Appointments',
        onPrimaryPress: () => router.replace('/(driver)/appointments'),
        secondaryButtonLabel: 'Done',
        onSecondaryPress: () => router.replace('/(driver)'),
      });
    } catch (err: any) {
      showError('Booking Failed', err.message || 'Failed to create appointment. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading booking details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !expert) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Failed to load booking details
          </Text>
          <Text className={`mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const profile = expert.profile;
  const expertName = profile?.business_name || expert.full_name;
  const expertLocation = profile?.address || profile?.city || 'Location not specified';

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
              <Avatar
                size="md"
                name={expertName}
                source={expert.avatar ? { uri: expert.avatar } : undefined}
              />
              <View className="ml-3 flex-1">
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {expertName}
                </Text>
                <View className="flex-row items-center">
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {profile?.rating?.toFixed(1) || '0.0'} ({profile?.total_reviews || 0} reviews)
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
                  {params.time ? formatTime(params.time) : 'Not selected'}
                </Text>
              </View>
            </View>

            {/* Location */}
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={18} color="#10B981" />
              <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {expertLocation}
              </Text>
            </View>
          </Card>
        </View>

        {/* Service Selection */}
        <View className="px-4 pb-4">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Select Service Type
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
                    <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {option.description}
                    </Text>
                    <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
