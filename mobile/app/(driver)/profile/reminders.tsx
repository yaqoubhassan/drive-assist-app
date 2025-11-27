import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Button, Badge, Chip } from '../../../src/components/common';

interface MaintenanceReminder {
  id: string;
  type: MaintenanceType;
  vehicleId: string;
  vehicleName: string;
  lastServiceDate: string;
  lastServiceMileage: number;
  nextDueDate: string;
  nextDueMileage: number;
  status: 'overdue' | 'due_soon' | 'ok';
  notificationsEnabled: boolean;
}

type MaintenanceType =
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_inspection'
  | 'air_filter'
  | 'coolant_flush'
  | 'transmission_fluid'
  | 'spark_plugs'
  | 'battery_check'
  | 'belt_inspection'
  | 'general_service';

const maintenanceTypes: Record<
  MaintenanceType,
  { label: string; icon: string; color: string; interval: string; mileageInterval: number }
> = {
  oil_change: {
    label: 'Oil Change',
    icon: 'opacity',
    color: '#F59E0B',
    interval: 'Every 5,000 km or 6 months',
    mileageInterval: 5000,
  },
  tire_rotation: {
    label: 'Tire Rotation',
    icon: 'sync',
    color: '#3B82F6',
    interval: 'Every 10,000 km or 12 months',
    mileageInterval: 10000,
  },
  brake_inspection: {
    label: 'Brake Inspection',
    icon: 'disc-full',
    color: '#EF4444',
    interval: 'Every 20,000 km or 12 months',
    mileageInterval: 20000,
  },
  air_filter: {
    label: 'Air Filter',
    icon: 'air',
    color: '#10B981',
    interval: 'Every 20,000 km or 12 months',
    mileageInterval: 20000,
  },
  coolant_flush: {
    label: 'Coolant Flush',
    icon: 'thermostat',
    color: '#06B6D4',
    interval: 'Every 50,000 km or 2 years',
    mileageInterval: 50000,
  },
  transmission_fluid: {
    label: 'Transmission Fluid',
    icon: 'settings',
    color: '#8B5CF6',
    interval: 'Every 60,000 km or 3 years',
    mileageInterval: 60000,
  },
  spark_plugs: {
    label: 'Spark Plugs',
    icon: 'bolt',
    color: '#EC4899',
    interval: 'Every 50,000 km',
    mileageInterval: 50000,
  },
  battery_check: {
    label: 'Battery Check',
    icon: 'battery-charging-full',
    color: '#22C55E',
    interval: 'Every 6 months',
    mileageInterval: 15000,
  },
  belt_inspection: {
    label: 'Belt Inspection',
    icon: 'loop',
    color: '#6366F1',
    interval: 'Every 50,000 km',
    mileageInterval: 50000,
  },
  general_service: {
    label: 'General Service',
    icon: 'build',
    color: '#64748B',
    interval: 'Every 10,000 km or 12 months',
    mileageInterval: 10000,
  },
};

const mockReminders: MaintenanceReminder[] = [
  {
    id: '1',
    type: 'oil_change',
    vehicleId: '1',
    vehicleName: 'Toyota Corolla 2019',
    lastServiceDate: '2024-08-15',
    lastServiceMileage: 40000,
    nextDueDate: '2025-02-15',
    nextDueMileage: 45000,
    status: 'overdue',
    notificationsEnabled: true,
  },
  {
    id: '2',
    type: 'tire_rotation',
    vehicleId: '1',
    vehicleName: 'Toyota Corolla 2019',
    lastServiceDate: '2024-05-20',
    lastServiceMileage: 35000,
    nextDueDate: '2025-05-20',
    nextDueMileage: 45000,
    status: 'due_soon',
    notificationsEnabled: true,
  },
  {
    id: '3',
    type: 'brake_inspection',
    vehicleId: '1',
    vehicleName: 'Toyota Corolla 2019',
    lastServiceDate: '2024-01-10',
    lastServiceMileage: 25000,
    nextDueDate: '2025-01-10',
    nextDueMileage: 45000,
    status: 'due_soon',
    notificationsEnabled: true,
  },
  {
    id: '4',
    type: 'air_filter',
    vehicleId: '2',
    vehicleName: 'Honda CR-V 2021',
    lastServiceDate: '2024-06-01',
    lastServiceMileage: 15000,
    nextDueDate: '2025-06-01',
    nextDueMileage: 35000,
    status: 'ok',
    notificationsEnabled: true,
  },
  {
    id: '5',
    type: 'battery_check',
    vehicleId: '2',
    vehicleName: 'Honda CR-V 2021',
    lastServiceDate: '2024-09-01',
    lastServiceMileage: 20000,
    nextDueDate: '2025-03-01',
    nextDueMileage: 35000,
    status: 'ok',
    notificationsEnabled: false,
  },
];

const vehicles = [
  { id: '1', name: 'Toyota Corolla 2019', mileage: 45000 },
  { id: '2', name: 'Honda CR-V 2021', mileage: 22000 },
];

export default function RemindersScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [reminders, setReminders] = useState<MaintenanceReminder[]>(mockReminders);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'due_soon' | 'ok'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<MaintenanceReminder | null>(null);
  const [newMileage, setNewMileage] = useState('');

  // New reminder state
  const [newReminderType, setNewReminderType] = useState<MaintenanceType>('oil_change');
  const [newReminderVehicle, setNewReminderVehicle] = useState(vehicles[0]?.id || '');

  const filteredReminders = reminders.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.status === selectedFilter;
  });

  const overdueCount = reminders.filter((r) => r.status === 'overdue').length;
  const dueSoonCount = reminders.filter((r) => r.status === 'due_soon').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#EF4444';
      case 'due_soon':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due_soon':
        return 'Due Soon';
      default:
        return 'OK';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysUntilDue = (dateStr: string) => {
    const dueDate = new Date(dateStr);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCompleteService = (reminder: MaintenanceReminder) => {
    setSelectedReminder(reminder);
    setNewMileage('');
    setShowCompleteModal(true);
  };

  const confirmCompleteService = () => {
    if (!selectedReminder || !newMileage) return;

    const vehicle = vehicles.find((v) => v.id === selectedReminder.vehicleId);
    const currentMileage = parseInt(newMileage, 10);
    const maintenanceType = maintenanceTypes[selectedReminder.type];

    // Calculate next due date (6 months from now for most services)
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 6);

    const updatedReminder: MaintenanceReminder = {
      ...selectedReminder,
      lastServiceDate: new Date().toISOString().split('T')[0],
      lastServiceMileage: currentMileage,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      nextDueMileage: currentMileage + maintenanceType.mileageInterval,
      status: 'ok',
    };

    setReminders(reminders.map((r) => (r.id === selectedReminder.id ? updatedReminder : r)));
    setShowCompleteModal(false);
    setSelectedReminder(null);
    setNewMileage('');
  };

  const handleAddReminder = () => {
    const vehicle = vehicles.find((v) => v.id === newReminderVehicle);
    if (!vehicle) return;

    const maintenanceType = maintenanceTypes[newReminderType];
    const today = new Date();
    const nextDueDate = new Date();
    nextDueDate.setMonth(nextDueDate.getMonth() + 6);

    const newReminder: MaintenanceReminder = {
      id: Date.now().toString(),
      type: newReminderType,
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      lastServiceDate: today.toISOString().split('T')[0],
      lastServiceMileage: vehicle.mileage,
      nextDueDate: nextDueDate.toISOString().split('T')[0],
      nextDueMileage: vehicle.mileage + maintenanceType.mileageInterval,
      status: 'ok',
      notificationsEnabled: true,
    };

    setReminders([...reminders, newReminder]);
    setShowAddModal(false);
  };

  const toggleNotifications = (reminderId: string) => {
    setReminders(
      reminders.map((r) =>
        r.id === reminderId ? { ...r, notificationsEnabled: !r.notificationsEnabled } : r
      )
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center mr-2"
            >
              <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <View>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Maintenance Reminders
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Keep your vehicle in top shape
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center"
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        {(overdueCount > 0 || dueSoonCount > 0) && (
          <View className="px-4 py-4">
            <LinearGradient
              colors={overdueCount > 0 ? ['#EF4444', '#DC2626'] : ['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-4"
              style={{ borderRadius: 16 }}
            >
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-white/20 items-center justify-center mr-3">
                  <MaterialIcons
                    name={overdueCount > 0 ? 'warning' : 'schedule'}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {overdueCount > 0
                      ? `${overdueCount} Overdue Service${overdueCount > 1 ? 's' : ''}`
                      : `${dueSoonCount} Service${dueSoonCount > 1 ? 's' : ''} Due Soon`}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    {overdueCount > 0
                      ? 'Schedule your service appointment today'
                      : 'Plan your upcoming maintenance'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          <Chip
            label={`All (${reminders.length})`}
            selected={selectedFilter === 'all'}
            onPress={() => setSelectedFilter('all')}
          />
          <Chip
            label={`Overdue (${overdueCount})`}
            selected={selectedFilter === 'overdue'}
            onPress={() => setSelectedFilter('overdue')}
          />
          <Chip
            label={`Due Soon (${dueSoonCount})`}
            selected={selectedFilter === 'due_soon'}
            onPress={() => setSelectedFilter('due_soon')}
          />
          <Chip
            label={`OK (${reminders.filter((r) => r.status === 'ok').length})`}
            selected={selectedFilter === 'ok'}
            onPress={() => setSelectedFilter('ok')}
          />
        </ScrollView>

        {/* Reminders List */}
        <View className="px-4 pb-8">
          <View className="gap-3">
            {filteredReminders.map((reminder) => {
              const typeInfo = maintenanceTypes[reminder.type];
              const daysUntil = getDaysUntilDue(reminder.nextDueDate);

              return (
                <Card key={reminder.id} variant="default">
                  <View className="flex-row items-start">
                    <View
                      className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                      style={{ backgroundColor: typeInfo.color + '20' }}
                    >
                      <MaterialIcons name={typeInfo.icon as any} size={24} color={typeInfo.color} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {typeInfo.label}
                        </Text>
                        <Badge
                          label={getStatusLabel(reminder.status)}
                          variant={
                            reminder.status === 'overdue'
                              ? 'danger'
                              : reminder.status === 'due_soon'
                              ? 'warning'
                              : 'success'
                          }
                          size="sm"
                        />
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {reminder.vehicleName}
                      </Text>
                    </View>
                  </View>

                  {/* Details */}
                  <View
                    className={`flex-row mt-4 pt-4 border-t ${
                      isDark ? 'border-slate-700' : 'border-slate-100'
                    }`}
                  >
                    <View className="flex-1">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Last Service
                      </Text>
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatDate(reminder.lastServiceDate)}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        at {reminder.lastServiceMileage.toLocaleString()} km
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Next Due
                      </Text>
                      <Text
                        className="font-semibold"
                        style={{ color: getStatusColor(reminder.status) }}
                      >
                        {formatDate(reminder.nextDueDate)}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        or {reminder.nextDueMileage.toLocaleString()} km
                      </Text>
                    </View>
                  </View>

                  {/* Countdown */}
                  <View
                    className={`flex-row items-center justify-between mt-3 p-3 rounded-xl ${
                      isDark ? 'bg-slate-800' : 'bg-slate-50'
                    }`}
                  >
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name="schedule"
                        size={18}
                        color={getStatusColor(reminder.status)}
                      />
                      <Text
                        className="ml-2 font-semibold"
                        style={{ color: getStatusColor(reminder.status) }}
                      >
                        {daysUntil > 0
                          ? `${daysUntil} days until due`
                          : daysUntil === 0
                          ? 'Due today'
                          : `${Math.abs(daysUntil)} days overdue`}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons
                        name={reminder.notificationsEnabled ? 'notifications-active' : 'notifications-off'}
                        size={18}
                        color={reminder.notificationsEnabled ? '#3B82F6' : '#94A3B8'}
                      />
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row mt-4 gap-3">
                    <TouchableOpacity
                      onPress={() => handleCompleteService(reminder)}
                      className="flex-1 py-3 rounded-xl bg-primary-500 items-center"
                    >
                      <Text className="text-white font-semibold">Mark Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => toggleNotifications(reminder.id)}
                      className={`py-3 px-4 rounded-xl items-center ${
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      }`}
                    >
                      <MaterialIcons
                        name={reminder.notificationsEnabled ? 'notifications-off' : 'notifications-active'}
                        size={20}
                        color={isDark ? '#FFFFFF' : '#111827'}
                      />
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}

            {filteredReminders.length === 0 && (
              <View className="items-center py-12">
                <MaterialIcons
                  name="check-circle"
                  size={64}
                  color={isDark ? '#475569' : '#94A3B8'}
                />
                <Text
                  className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  All Caught Up!
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No reminders matching this filter
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Maintenance Schedule Info */}
        <View className="px-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recommended Schedule
          </Text>
          <Card variant="default">
            <View className="gap-3">
              {Object.entries(maintenanceTypes)
                .slice(0, 5)
                .map(([key, info]) => (
                  <View key={key} className="flex-row items-center">
                    <View
                      className="h-8 w-8 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: info.color + '20' }}
                    >
                      <MaterialIcons name={info.icon as any} size={16} color={info.color} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        {info.label}
                      </Text>
                      <Text
                        className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {info.interval}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Add Reminder
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
            </View>

            {/* Vehicle Selection */}
            <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Select Vehicle
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ gap: 8 }}
            >
              {vehicles.map((vehicle) => (
                <Chip
                  key={vehicle.id}
                  label={vehicle.name}
                  selected={newReminderVehicle === vehicle.id}
                  onPress={() => setNewReminderVehicle(vehicle.id)}
                />
              ))}
            </ScrollView>

            {/* Maintenance Type Selection */}
            <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Maintenance Type
            </Text>
            <ScrollView className="max-h-48 mb-4">
              <View className="gap-2">
                {Object.entries(maintenanceTypes).map(([key, info]) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setNewReminderType(key as MaintenanceType)}
                    className={`flex-row items-center p-3 rounded-xl border-2 ${
                      newReminderType === key
                        ? 'border-primary-500 bg-primary-500/10'
                        : isDark
                        ? 'border-slate-700 bg-slate-700/50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <View
                      className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                      style={{ backgroundColor: info.color + '20' }}
                    >
                      <MaterialIcons name={info.icon as any} size={20} color={info.color} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        {info.label}
                      </Text>
                      <Text
                        className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {info.interval}
                      </Text>
                    </View>
                    {newReminderType === key && (
                      <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Button
              title="Add Reminder"
              onPress={handleAddReminder}
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* Complete Service Modal */}
      <Modal visible={showCompleteModal} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setShowCompleteModal(false)}
          />
          <View className={`rounded-t-3xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Complete Service
              </Text>
              <TouchableOpacity onPress={() => setShowCompleteModal(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
            </View>

            {selectedReminder && (
              <>
                <View className={`flex-row items-center p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <View
                    className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                    style={{
                      backgroundColor: maintenanceTypes[selectedReminder.type].color + '20',
                    }}
                  >
                    <MaterialIcons
                      name={maintenanceTypes[selectedReminder.type].icon as any}
                      size={24}
                      color={maintenanceTypes[selectedReminder.type].color}
                    />
                  </View>
                  <View>
                    <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {maintenanceTypes[selectedReminder.type].label}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedReminder.vehicleName}
                    </Text>
                  </View>
                </View>

                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Current Mileage (km)
                </Text>
                <TextInput
                  className={`p-4 rounded-xl mb-4 text-lg ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                  placeholder="Enter current mileage"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  keyboardType="numeric"
                  value={newMileage}
                  onChangeText={setNewMileage}
                />

                <Button
                  title="Mark as Complete"
                  onPress={confirmCompleteService}
                  disabled={!newMileage}
                  fullWidth
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
