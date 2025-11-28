import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Badge, Chip, EmptyState, Avatar } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';
import {
  appointmentService,
  Appointment,
  AppointmentStatus,
  getStatusColor,
  getStatusLabel,
  formatAppointmentDate,
  formatAppointmentTime,
} from '../../../src/services/appointment';

const statusFilters: Array<{ id: AppointmentStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function AppointmentsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<AppointmentStatus | 'all'>('all');

  useEffect(() => {
    fetchAppointments();
  }, [selectedFilter]);

  const fetchAppointments = async () => {
    try {
      setError(null);
      const params: { status?: AppointmentStatus } = {};
      if (selectedFilter !== 'all') {
        params.status = selectedFilter;
      }
      const response = await appointmentService.getAppointments(params);
      setAppointments(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [selectedFilter]);

  const getServiceTypeIcon = (serviceType: string): keyof typeof MaterialIcons.glyphMap => {
    switch (serviceType) {
      case 'diagnostic':
        return 'search';
      case 'repair':
        return 'build';
      case 'maintenance':
        return 'engineering';
      case 'inspection':
        return 'fact-check';
      default:
        return 'car-repair';
    }
  };

  const getServiceTypeLabel = (serviceType: string): string => {
    switch (serviceType) {
      case 'diagnostic':
        return 'Diagnostic';
      case 'repair':
        return 'Repair';
      case 'maintenance':
        return 'Maintenance';
      case 'inspection':
        return 'Inspection';
      default:
        return serviceType;
    }
  };

  const getStatusVariant = (status: AppointmentStatus): 'info' | 'success' | 'warning' | 'error' | 'default' => {
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
      case 'no_show':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading appointments...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center mb-4">
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
              My Appointments
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(driver)/experts')}
            className="h-10 w-10 rounded-full items-center justify-center bg-primary-500"
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {statusFilters.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              selected={selectedFilter === filter.id}
              onPress={() => setSelectedFilter(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View className="flex-1 items-center justify-center py-8">
            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
            <Text className={`mt-4 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={fetchAppointments}
              className="mt-4 bg-primary-500 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : appointments.length > 0 ? (
          <View className="gap-3 pb-8">
            {appointments.map((appointment) => {
              const expertName = appointment.expert?.profile?.business_name || appointment.expert?.full_name || 'Expert';

              return (
                <TouchableOpacity
                  key={appointment.id}
                  onPress={() => router.push(`/(driver)/appointments/${appointment.id}`)}
                  activeOpacity={0.7}
                >
                  <Card variant="default">
                    {/* Header */}
                    <View className="flex-row items-start justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <Avatar
                          size="md"
                          name={expertName}
                          source={appointment.expert?.avatar ? { uri: appointment.expert.avatar } : undefined}
                        />
                        <View className="ml-3 flex-1">
                          <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {expertName}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <MaterialIcons
                              name={getServiceTypeIcon(appointment.service_type)}
                              size={14}
                              color={isDark ? '#94A3B8' : '#64748B'}
                            />
                            <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {getServiceTypeLabel(appointment.service_type)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Badge
                        label={getStatusLabel(appointment.status)}
                        variant={getStatusVariant(appointment.status)}
                        size="sm"
                      />
                    </View>

                    {/* Vehicle */}
                    {appointment.vehicle && (
                      <View className={`flex-row items-center py-2 mb-2 border-t border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <MaterialIcons name="directions-car" size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                        <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                        </Text>
                      </View>
                    )}

                    {/* Date, Time & Cost */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center">
                          <MaterialIcons name="event" size={14} color="#3B82F6" />
                          <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatAppointmentDate(appointment.scheduled_date)}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <MaterialIcons name="schedule" size={14} color="#3B82F6" />
                          <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatAppointmentTime(appointment.scheduled_time)}
                          </Text>
                        </View>
                      </View>
                      {(appointment.estimated_cost || appointment.final_cost) && (
                        <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {formatCurrency(appointment.final_cost || appointment.estimated_cost || 0)}
                        </Text>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon="event"
            title="No Appointments"
            description={
              selectedFilter === 'all'
                ? "You haven't booked any appointments yet. Find an expert and schedule your first appointment."
                : `No ${selectedFilter.replace('_', ' ')} appointments found.`
            }
            actionLabel="Find Experts"
            onAction={() => router.push('/(driver)/experts')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
