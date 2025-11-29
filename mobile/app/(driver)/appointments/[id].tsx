import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Badge, Avatar, Button, Input } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';
import {
  appointmentService,
  Appointment,
  getStatusLabel,
  formatAppointmentDate,
  formatAppointmentTime,
} from '../../../src/services/appointment';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const { showAlert, showWarning, showError } = useAlert();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchAppointment();
    }
  }, [id]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointment(id!);
      setAppointment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    const phone = appointment?.expert?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleMessage = () => {
    if (appointment?.expert?.id) {
      router.push({
        pathname: '/(driver)/messages/chat',
        params: { recipientId: appointment.expert.id.toString() },
      });
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      showWarning('Reason Required', 'Please provide a reason for cancellation.');
      return;
    }

    setCancelling(true);
    try {
      await appointmentService.cancelAppointment(id!, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      showAlert({
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled successfully.',
        variant: 'success',
        primaryButtonLabel: 'OK',
        onPrimaryPress: () => {
          fetchAppointment();
        },
      });
    } catch (err: any) {
      showError('Cancellation Failed', err.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReschedule = () => {
    if (appointment?.expert?.id) {
      router.push({
        pathname: '/(driver)/booking',
        params: {
          expertId: appointment.expert.id.toString(),
          diagnosisId: appointment.diagnosis_id?.toString() || '',
          vehicleId: appointment.vehicle_id?.toString() || '',
          serviceType: appointment.service_type,
        },
      });
    }
  };

  const getStatusVariant = (status: string): 'info' | 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getServiceTypeLabel = (serviceType: string): string => {
    switch (serviceType) {
      case 'diagnostic':
        return 'Diagnostic Check';
      case 'repair':
        return 'Repair Service';
      case 'maintenance':
        return 'Maintenance Service';
      case 'inspection':
        return 'Full Inspection';
      default:
        return serviceType;
    }
  };

  const canCancel = appointment?.status === 'pending' || appointment?.status === 'confirmed';
  const canReschedule = appointment?.status === 'pending' || appointment?.status === 'confirmed';

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading appointment...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !appointment) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text className={`mt-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Failed to load appointment
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

  const expertName = appointment.expert?.profile?.business_name || appointment.expert?.full_name || 'Expert';
  const expertLocation = appointment.expert?.profile?.address || appointment.expert?.profile?.city || 'Location not specified';

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
        <Text className={`text-xl font-bold flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Appointment Details
        </Text>
        <Badge
          label={getStatusLabel(appointment.status)}
          variant={getStatusVariant(appointment.status)}
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Expert Card */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center mb-4">
              <Avatar
                size="lg"
                name={expertName}
                source={appointment.expert?.avatar ? { uri: appointment.expert.avatar } : undefined}
              />
              <View className="ml-3 flex-1">
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {expertName}
                </Text>
                {appointment.expert?.profile?.specializations && appointment.expert.profile.specializations.length > 0 && (
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {appointment.expert.profile.specializations[0].name}
                  </Text>
                )}
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text className={`text-sm ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {appointment.expert?.profile?.rating?.toFixed(1) || '0.0'} ({appointment.expert?.profile?.total_reviews || 0} reviews)
                  </Text>
                </View>
              </View>
            </View>

            {/* Contact Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCall}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
              >
                <MaterialIcons name="phone" size={20} color="#3B82F6" />
                <Text className="ml-2 font-semibold text-primary-500">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMessage}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
              >
                <MaterialIcons name="chat" size={20} color="#3B82F6" />
                <Text className="ml-2 font-semibold text-primary-500">Message</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Appointment Details */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              APPOINTMENT DETAILS
            </Text>

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
                  {formatAppointmentDate(appointment.scheduled_date)}
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
                  {formatAppointmentTime(appointment.scheduled_time)}
                </Text>
              </View>
            </View>

            {/* Service Type */}
            <View className={`py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="build" size={18} color="#10B981" />
                <Text className={`text-sm ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Service Type
                </Text>
              </View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {getServiceTypeLabel(appointment.service_type)}
              </Text>
            </View>

            {/* Location */}
            <View className={`py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="location-on" size={18} color="#EF4444" />
                <Text className={`text-sm ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Location ({appointment.location_type === 'expert_shop' ? 'Expert Shop' : 'Your Location'})
                </Text>
              </View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {expertLocation}
              </Text>
            </View>

            {/* Duration */}
            <View className={`py-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <View className="flex-row items-center mb-1">
                <MaterialIcons name="timelapse" size={18} color="#8B5CF6" />
                <Text className={`text-sm ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Estimated Duration
                </Text>
              </View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {appointment.estimated_duration_minutes} minutes
              </Text>
            </View>
          </Card>
        </View>

        {/* Vehicle */}
        {appointment.vehicle && (
          <View className="px-4 pb-4">
            <Card variant="default">
              <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                VEHICLE
              </Text>
              <View className="flex-row items-center">
                <View className={`h-12 w-12 rounded-xl items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <MaterialIcons name="directions-car" size={24} color="#3B82F6" />
                </View>
                <View className="ml-3">
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                  </Text>
                  {appointment.vehicle.license_plate && (
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {appointment.vehicle.license_plate}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Description */}
        {appointment.description && (
          <View className="px-4 pb-4">
            <Card variant="default">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                NOTES
              </Text>
              <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {appointment.description}
              </Text>
            </Card>
          </View>
        )}

        {/* Cost */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              PRICING
            </Text>
            <View className="flex-row items-center justify-between">
              <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {appointment.final_cost ? 'Final Cost' : 'Estimated Cost'}
              </Text>
              <Text className={`text-xl font-bold text-primary-500`}>
                {formatCurrency(appointment.final_cost || appointment.estimated_cost || 0)}
              </Text>
            </View>
            {!appointment.final_cost && appointment.estimated_cost && (
              <Text className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                * Final cost may vary based on actual work required
              </Text>
            )}
            <View className={`flex-row items-center justify-between mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Payment Status
              </Text>
              <Badge
                label={appointment.payment_status.charAt(0).toUpperCase() + appointment.payment_status.slice(1)}
                variant={appointment.payment_status === 'paid' ? 'success' : 'warning'}
                size="sm"
              />
            </View>
          </Card>
        </View>

        {/* Cancellation Reason */}
        {appointment.status === 'cancelled' && appointment.cancellation_reason && (
          <View className="px-4 pb-4">
            <Card variant="default" className="border border-red-500/30 bg-red-500/5">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                CANCELLATION REASON
              </Text>
              <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {appointment.cancellation_reason}
              </Text>
            </Card>
          </View>
        )}

        {/* Cancel Modal Inline */}
        {showCancelModal && (
          <View className="px-4 pb-4">
            <Card variant="default" className="border border-red-500/30">
              <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cancel Appointment
              </Text>
              <Text className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Please provide a reason for cancellation:
              </Text>
              <Input
                placeholder="Enter reason..."
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                numberOfLines={3}
              />
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className={`flex-1 py-3 rounded-xl items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                >
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}>
                    Keep Appointment
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-xl items-center bg-red-500"
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Cancel</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>

      {/* Action Buttons */}
      {(canCancel || canReschedule) && !showCancelModal && (
        <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <View className="flex-row gap-3">
            {canCancel && (
              <TouchableOpacity
                onPress={() => setShowCancelModal(true)}
                className={`flex-1 py-4 rounded-xl items-center border-2 border-red-500`}
              >
                <Text className="text-red-500 font-semibold">Cancel</Text>
              </TouchableOpacity>
            )}
            {canReschedule && (
              <TouchableOpacity
                onPress={handleReschedule}
                className="flex-1 py-4 rounded-xl items-center bg-primary-500"
              >
                <Text className="text-white font-semibold">Reschedule</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
