import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Badge, Button, Card, Chip } from '../../../src/components/common';
import { Skeleton } from '../../../src/components/common/Skeleton';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import maintenanceService, {
  MaintenanceReminder,
  MaintenanceType,
  CreateMaintenanceTypeRequest,
} from '../../../src/services/maintenance';
import vehicleService, { Vehicle } from '../../../src/services/vehicle';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snooze duration options
const SNOOZE_OPTIONS = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 7, label: '1 week' },
  { days: 14, label: '2 weeks' },
  { days: 30, label: '1 month' },
];

// Map backend status to UI status
type UIStatus = 'overdue' | 'due_soon' | 'ok';

const mapStatus = (status: MaintenanceReminder['status']): UIStatus => {
  switch (status) {
    case 'overdue':
      return 'overdue';
    case 'due':
      return 'due_soon';
    default:
      return 'ok';
  }
};

// Icon mapping for maintenance types
const getMaintenanceIcon = (slug: string): keyof typeof MaterialIcons.glyphMap => {
  const iconMap: Record<string, keyof typeof MaterialIcons.glyphMap> = {
    'oil-change': 'opacity',
    'tire-rotation': 'sync',
    'brake-inspection': 'disc-full',
    'air-filter': 'air',
    'coolant-flush': 'thermostat',
    'transmission-fluid': 'settings',
    'spark-plugs': 'bolt',
    'battery-check': 'battery-charging-full',
    'timing-belt': 'loop',
    'wheel-alignment': 'tune',
    'ac-service': 'ac-unit',
    'fuel-filter': 'filter-alt',
    'brake-fluid': 'water-drop',
    'power-steering-fluid': 'explore',
    'cabin-air-filter': 'filter-drama',
    'insurance-renewal': 'shield',
    'road-worthy': 'verified',
  };
  return iconMap[slug] || 'build';
};

// Bottom Sheet Drag Handle Component
const DragHandle = ({ isDark }: { isDark: boolean }) => (
  <View className="items-center pt-2 pb-4">
    <View
      className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}
    />
  </View>
);

// Reminder Skeleton Component
const ReminderSkeleton = () => {
  const { isDark } = useTheme();
  return (
    <Card variant="default">
      <View className="flex-row items-start">
        <Skeleton width={48} height={48} borderRadius={12} style={{ marginRight: 12 }} />
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Skeleton width={120} height={16} />
            <Skeleton width={60} height={20} borderRadius={10} />
          </View>
          <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
      <View
        className={`flex-row mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
      >
        <View className="flex-1">
          <Skeleton width={70} height={12} style={{ marginBottom: 4 }} />
          <Skeleton width={90} height={16} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={12} />
        </View>
        <View className="flex-1">
          <Skeleton width={50} height={12} style={{ marginBottom: 4 }} />
          <Skeleton width={90} height={16} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={12} />
        </View>
      </View>
      <View
        className={`flex-row items-center justify-between mt-3 p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
      >
        <Skeleton width={120} height={16} />
        <Skeleton width={20} height={20} />
      </View>
      <View className="flex-row mt-4 gap-3">
        <Skeleton width="75%" height={44} borderRadius={12} />
        <Skeleton width={44} height={44} borderRadius={12} />
      </View>
    </Card>
  );
};

// Empty State Component
const EmptyState = ({
  isDark,
  onAddReminder,
}: {
  isDark: boolean;
  onAddReminder: () => void;
}) => (
  <View className="items-center py-16 px-8">
    <View
      className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
        isDark ? 'bg-slate-800' : 'bg-slate-100'
      }`}
    >
      <MaterialIcons name="notifications-none" size={48} color={isDark ? '#475569' : '#94A3B8'} />
    </View>
    <Text className={`text-xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      No Maintenance Reminders
    </Text>
    <Text className={`text-center mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
      Set up reminders to keep track of your vehicle's maintenance schedule and never miss a
      service.
    </Text>
    <Button title="Add Your First Reminder" onPress={onAddReminder} icon="add" />
  </View>
);

export default function RemindersScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showSuccess, showError } = useAlert();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [adding, setAdding] = useState(false);
  const [snoozing, setSnoozing] = useState(false);
  const [savingCustomType, setSavingCustomType] = useState(false);
  const [deletingType, setDeletingType] = useState(false);

  // Data states
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'due_soon' | 'ok'>(
    'all'
  );

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<MaintenanceReminder | null>(null);
  const [editingType, setEditingType] = useState<MaintenanceType | null>(null);
  const [newMileage, setNewMileage] = useState('');
  const [completionCost, setCompletionCost] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  // Custom type form state
  const [customTypeName, setCustomTypeName] = useState('');
  const [customTypeDescription, setCustomTypeDescription] = useState('');
  const [customTypeIntervalKm, setCustomTypeIntervalKm] = useState('');
  const [customTypeIntervalMonths, setCustomTypeIntervalMonths] = useState('');
  const [customTypeColor, setCustomTypeColor] = useState('#3B82F6');

  // Snooze state
  const [selectedSnoozeDays, setSelectedSnoozeDays] = useState<number | null>(7);
  const [customSnoozeDays, setCustomSnoozeDays] = useState('');

  // New reminder state
  const [newReminderTypeId, setNewReminderTypeId] = useState<number | null>(null);
  const [newReminderVehicleId, setNewReminderVehicleId] = useState<number | null>(null);
  const [newReminderDueDate, setNewReminderDueDate] = useState('');

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [remindersData, typesData, vehiclesData] = await Promise.all([
        maintenanceService.getReminders(),
        maintenanceService.getMaintenanceTypes(),
        vehicleService.getVehicles(),
      ]);
      setReminders(remindersData);
      setMaintenanceTypes(typesData);
      setVehicles(vehiclesData);

      // Set defaults for new reminder
      if (typesData.length > 0) {
        setNewReminderTypeId(typesData[0].id);
      }
      if (vehiclesData.length > 0) {
        setNewReminderVehicleId(vehiclesData[0].id);
      }
    } catch (error: any) {
      console.error('Failed to load maintenance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredReminders = reminders.filter((r) => {
    if (selectedFilter === 'all') return true;
    return mapStatus(r.status) === selectedFilter;
  });

  const overdueCount = reminders.filter((r) => r.status === 'overdue').length;
  const dueSoonCount = reminders.filter((r) => r.status === 'due').length;

  const getStatusColor = (status: MaintenanceReminder['status']) => {
    switch (status) {
      case 'overdue':
        return '#EF4444';
      case 'due':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'snoozed':
        return '#64748B';
      default:
        return '#3B82F6';
    }
  };

  const getStatusLabel = (status: MaintenanceReminder['status']) => {
    switch (status) {
      case 'overdue':
        return 'Overdue';
      case 'due':
        return 'Due Soon';
      case 'completed':
        return 'Completed';
      case 'snoozed':
        return 'Snoozed';
      default:
        return 'Upcoming';
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
    setCompletionCost('');
    setCompletionNotes('');
    setShowCompleteModal(true);
  };

  const confirmCompleteService = async () => {
    if (!selectedReminder) return;

    setCompleting(true);
    try {
      await maintenanceService.completeReminder(selectedReminder.id, {
        completed_mileage: newMileage ? parseInt(newMileage, 10) : undefined,
        cost: completionCost ? parseFloat(completionCost) : undefined,
        notes: completionNotes || undefined,
      });

      showSuccess('Service Completed', 'Maintenance has been marked as complete.');
      setShowCompleteModal(false);
      setSelectedReminder(null);
      loadData(); // Refresh data
    } catch (error: any) {
      showError('Error', error.message || 'Failed to complete maintenance');
    } finally {
      setCompleting(false);
    }
  };

  const handleOpenSnoozeModal = (reminder: MaintenanceReminder) => {
    setSelectedReminder(reminder);
    setSelectedSnoozeDays(7);
    setCustomSnoozeDays('');
    setShowSnoozeModal(true);
  };

  const handleSnooze = async () => {
    if (!selectedReminder) return;

    const days = selectedSnoozeDays || (customSnoozeDays ? parseInt(customSnoozeDays, 10) : 0);
    if (!days || days < 1) {
      showError('Invalid Duration', 'Please select or enter a valid number of days.');
      return;
    }

    setSnoozing(true);
    try {
      await maintenanceService.snoozeReminder(selectedReminder.id, days);
      showSuccess('Reminder Snoozed', `Reminder has been snoozed for ${days} day${days > 1 ? 's' : ''}.`);
      setShowSnoozeModal(false);
      setSelectedReminder(null);
      loadData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to snooze reminder');
    } finally {
      setSnoozing(false);
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderTypeId || !newReminderVehicleId) {
      showError('Required Fields', 'Please select a vehicle and maintenance type.');
      return;
    }

    setAdding(true);
    try {
      // Calculate due date (default to 6 months from now if not set)
      const dueDate = newReminderDueDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await maintenanceService.createReminder({
        vehicle_id: newReminderVehicleId,
        maintenance_type_id: newReminderTypeId,
        due_date: dueDate,
      });

      showSuccess('Reminder Added', 'Maintenance reminder has been added.');
      setShowAddModal(false);
      loadData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to add reminder');
    } finally {
      setAdding(false);
    }
  };

  // Custom type handlers
  const openCustomTypeModal = (type?: MaintenanceType) => {
    if (type) {
      // Edit mode
      setEditingType(type);
      setCustomTypeName(type.name);
      setCustomTypeDescription(type.description || '');
      setCustomTypeIntervalKm(type.default_interval_km?.toString() || '');
      setCustomTypeIntervalMonths(type.default_interval_months?.toString() || '');
      setCustomTypeColor(type.color || '#3B82F6');
    } else {
      // Create mode
      setEditingType(null);
      setCustomTypeName('');
      setCustomTypeDescription('');
      setCustomTypeIntervalKm('');
      setCustomTypeIntervalMonths('');
      setCustomTypeColor('#3B82F6');
    }
    setShowCustomTypeModal(true);
  };

  const handleSaveCustomType = async () => {
    if (!customTypeName.trim()) {
      showError('Required', 'Please enter a name for the maintenance type.');
      return;
    }

    setSavingCustomType(true);
    try {
      const data: CreateMaintenanceTypeRequest = {
        name: customTypeName.trim(),
        description: customTypeDescription.trim() || undefined,
        color: customTypeColor,
        default_interval_km: customTypeIntervalKm ? parseInt(customTypeIntervalKm, 10) : undefined,
        default_interval_months: customTypeIntervalMonths ? parseInt(customTypeIntervalMonths, 10) : undefined,
      };

      if (editingType) {
        await maintenanceService.updateMaintenanceType(editingType.id, data);
        showSuccess('Updated', 'Custom maintenance type has been updated.');
      } else {
        await maintenanceService.createMaintenanceType(data);
        showSuccess('Created', 'Custom maintenance type has been created.');
      }

      setShowCustomTypeModal(false);
      loadData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to save maintenance type');
    } finally {
      setSavingCustomType(false);
    }
  };

  const handleDeleteCustomType = async (type: MaintenanceType) => {
    if (type.is_system) {
      showError('Cannot Delete', 'System maintenance types cannot be deleted.');
      return;
    }

    setDeletingType(true);
    try {
      await maintenanceService.deleteMaintenanceType(type.id);
      showSuccess('Deleted', 'Custom maintenance type has been deleted.');
      loadData();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to delete maintenance type');
    } finally {
      setDeletingType(false);
    }
  };

  // Handler to open/close add reminder modal
  const openAddReminderSheet = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const closeAddReminderSheet = useCallback(() => {
    setShowAddModal(false);
  }, []);

  // Loading skeleton
  if (loading) {
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
            <View className="h-10 w-10 rounded-full bg-primary-500/50" />
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Filter chips skeleton */}
          <View className="flex-row px-4 py-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={32} borderRadius={16} />
            ))}
          </View>

          {/* Reminders skeleton */}
          <View className="px-4 pb-8 gap-3">
            {[1, 2, 3].map((i) => (
              <ReminderSkeleton key={i} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            onPress={openAddReminderSheet}
            className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center"
            disabled={vehicles.length === 0}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Empty State */}
        {reminders.length === 0 ? (
          <EmptyState isDark={isDark} onAddReminder={openAddReminderSheet} />
        ) : (
          <>
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
                  <View className={`flex-row items-center ${Platform.OS === 'ios' ? 'p-5' : ''}`}>
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
                label={`OK (${reminders.filter((r) => mapStatus(r.status) === 'ok').length})`}
                selected={selectedFilter === 'ok'}
                onPress={() => setSelectedFilter('ok')}
              />
            </ScrollView>

            {/* Reminders List */}
            <View className="px-4 pb-8">
              <View className="gap-3">
                {filteredReminders.map((reminder) => {
                  const typeIcon = getMaintenanceIcon(reminder.maintenance_type?.slug || '');
                  const typeColor = reminder.maintenance_type?.color || '#64748B';
                  const daysUntil = getDaysUntilDue(reminder.due_date);
                  const vehicleName = reminder.vehicle?.display_name ||
                    `${reminder.vehicle?.year} ${reminder.vehicle?.make_name} ${reminder.vehicle?.model_name}`;

                  return (
                    <Card key={reminder.id} variant="default">
                      <View className="flex-row items-start">
                        <View
                          className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                          style={{ backgroundColor: typeColor + '20' }}
                        >
                          <MaterialIcons name={typeIcon} size={24} color={typeColor} />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {reminder.maintenance_type?.name || 'Maintenance'}
                            </Text>
                            <Badge
                              label={getStatusLabel(reminder.status)}
                              variant={
                                reminder.status === 'overdue'
                                  ? 'error'
                                  : reminder.status === 'due'
                                    ? 'warning'
                                    : 'success'
                              }
                              size="sm"
                            />
                          </View>
                          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {vehicleName}
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
                          <Text
                            className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                          >
                            {reminder.last_completed_date
                              ? formatDate(reminder.last_completed_date)
                              : 'Not recorded'}
                          </Text>
                          {reminder.last_completed_mileage && (
                            <Text
                              className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              at {reminder.last_completed_mileage.toLocaleString()} km
                            </Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Next Due
                          </Text>
                          <Text
                            className="font-semibold"
                            style={{ color: getStatusColor(reminder.status) }}
                          >
                            {formatDate(reminder.due_date)}
                          </Text>
                          {reminder.due_mileage && (
                            <Text
                              className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              or {reminder.due_mileage.toLocaleString()} km
                            </Text>
                          )}
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
                        {reminder.status === 'snoozed' && reminder.snoozed_until && (
                          <View className="flex-row items-center">
                            <MaterialIcons name="snooze" size={16} color="#64748B" />
                            <Text className="text-xs text-slate-400 ml-1">
                              Until {formatDate(reminder.snoozed_until)}
                            </Text>
                          </View>
                        )}
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
                          onPress={() => handleOpenSnoozeModal(reminder)}
                          className={`py-3 px-4 rounded-xl items-center ${
                            isDark ? 'bg-slate-700' : 'bg-slate-100'
                          }`}
                        >
                          <MaterialIcons
                            name="snooze"
                            size={20}
                            color={isDark ? '#FFFFFF' : '#111827'}
                          />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  );
                })}

                {filteredReminders.length === 0 && reminders.length > 0 && (
                  <View className="items-center py-12">
                    <MaterialIcons
                      name="check-circle"
                      size={64}
                      color={isDark ? '#475569' : '#94A3B8'}
                    />
                    <Text
                      className={`text-lg font-semibold mt-4 ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      All Caught Up!
                    </Text>
                    <Text
                      className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
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
                  {maintenanceTypes.slice(0, 5).map((type) => (
                    <View key={type.id} className="flex-row items-center">
                      <View
                        className="h-8 w-8 rounded-lg items-center justify-center mr-3"
                        style={{ backgroundColor: (type.color || '#64748B') + '20' }}
                      >
                        <MaterialIcons
                          name={getMaintenanceIcon(type.slug)}
                          size={16}
                          color={type.color || '#64748B'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        >
                          {type.name}
                        </Text>
                        <Text
                          className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                          {type.default_interval_km
                            ? `Every ${type.default_interval_km.toLocaleString()} km`
                            : ''}
                          {type.default_interval_km && type.default_interval_months ? ' or ' : ''}
                          {type.default_interval_months
                            ? `${type.default_interval_months} months`
                            : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={closeAddReminderSheet}
          />
          <View
            className={`rounded-t-3xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{ maxHeight: SCREEN_HEIGHT * 0.90 }}
          >
            <DragHandle isDark={isDark} />
            <View className="px-6 pb-2">
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add Reminder
                </Text>
                <TouchableOpacity onPress={closeAddReminderSheet}>
                  <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              className="px-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {vehicles.length === 0 ? (
                <View className="items-center py-8">
                  <MaterialIcons
                    name="directions-car"
                    size={48}
                    color={isDark ? '#475569' : '#94A3B8'}
                  />
                  <Text
                    className={`text-center mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    You need to add a vehicle first before creating maintenance reminders.
                  </Text>
                  <Button
                    title="Add Vehicle"
                    onPress={() => {
                      closeAddReminderSheet();
                      router.push('/(driver)/profile/vehicle-edit');
                    }}
                    variant="outline"
                    className="mt-4"
                  />
                </View>
              ) : (
                <>
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
                        label={vehicle.display_name || `${vehicle.make} ${vehicle.model}`}
                        selected={newReminderVehicleId === vehicle.id}
                        onPress={() => setNewReminderVehicleId(vehicle.id)}
                      />
                    ))}
                  </ScrollView>

                  {/* Maintenance Type Selection - Improved with custom types */}
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Maintenance Type
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        closeAddReminderSheet();
                        openCustomTypeModal();
                      }}
                      className="flex-row items-center"
                    >
                      <MaterialIcons name="add" size={18} color="#3B82F6" />
                      <Text className="text-primary-500 text-sm ml-1">Add Custom</Text>
                    </TouchableOpacity>
                  </View>

                  {/* System Types Section */}
                  <Text className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    STANDARD TYPES
                  </Text>
                  <View className="gap-2 mb-4">
                    {maintenanceTypes.filter(t => t.is_system).map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => setNewReminderTypeId(type.id)}
                        className={`flex-row items-center p-3 rounded-xl border-2 ${
                          newReminderTypeId === type.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : isDark
                              ? 'border-slate-700 bg-slate-700/50'
                              : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <View
                          className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                          style={{ backgroundColor: (type.color || '#64748B') + '20' }}
                        >
                          <MaterialIcons
                            name={getMaintenanceIcon(type.slug)}
                            size={20}
                            color={type.color || '#64748B'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                          >
                            {type.name}
                          </Text>
                          <Text
                            className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {type.default_interval_km
                              ? `Every ${type.default_interval_km.toLocaleString()} km`
                              : ''}
                            {type.default_interval_km && type.default_interval_months ? ' or ' : ''}
                            {type.default_interval_months
                              ? `${type.default_interval_months} months`
                              : ''}
                          </Text>
                        </View>
                        {newReminderTypeId === type.id && (
                          <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Custom Types Section */}
                  {maintenanceTypes.filter(t => !t.is_system).length > 0 && (
                    <>
                      <Text className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        YOUR CUSTOM TYPES
                      </Text>
                      <View className="gap-2 mb-4">
                        {maintenanceTypes.filter(t => !t.is_system).map((type) => (
                          <TouchableOpacity
                            key={type.id}
                            onPress={() => setNewReminderTypeId(type.id)}
                            className={`flex-row items-center p-3 rounded-xl border-2 ${
                              newReminderTypeId === type.id
                                ? 'border-primary-500 bg-primary-500/10'
                                : isDark
                                  ? 'border-slate-700 bg-slate-700/50'
                                  : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <View
                              className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                              style={{ backgroundColor: (type.color || '#64748B') + '20' }}
                            >
                              <MaterialIcons
                                name="build"
                                size={20}
                                color={type.color || '#64748B'}
                              />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <Text
                                  className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                                >
                                  {type.name}
                                </Text>
                                <View className="ml-2 px-2 py-0.5 rounded-full bg-primary-500/20">
                                  <Text className="text-xs text-primary-500">Custom</Text>
                                </View>
                              </View>
                              <Text
                                className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                              >
                                {type.default_interval_km
                                  ? `Every ${type.default_interval_km.toLocaleString()} km`
                                  : ''}
                                {type.default_interval_km && type.default_interval_months ? ' or ' : ''}
                                {type.default_interval_months
                                  ? `${type.default_interval_months} months`
                                  : ''}
                                {!type.default_interval_km && !type.default_interval_months ? 'No interval set' : ''}
                              </Text>
                            </View>
                            {newReminderTypeId === type.id ? (
                              <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                            ) : (
                              <View className="flex-row">
                                <TouchableOpacity
                                  onPress={() => {
                                    closeAddReminderSheet();
                                    openCustomTypeModal(type);
                                  }}
                                  className="p-1"
                                >
                                  <MaterialIcons name="edit" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => handleDeleteCustomType(type)}
                                  className="p-1 ml-1"
                                  disabled={deletingType}
                                >
                                  <MaterialIcons name="delete" size={18} color="#EF4444" />
                                </TouchableOpacity>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}

                  <Button
                    title="Add Reminder"
                    onPress={() => {
                      handleAddReminder();
                      closeAddReminderSheet();
                    }}
                    loading={adding}
                    fullWidth
                  />
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Complete Service Modal - Fixed keyboard issue */}
      <Modal visible={showCompleteModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowCompleteModal(false)}
            />
            <View
              className={`rounded-t-3xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
            >
              <DragHandle isDark={isDark} />
              {/* Header outside ScrollView so it stays visible */}
              <View className="px-6 pb-2">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Complete Service
                  </Text>
                  <TouchableOpacity onPress={() => setShowCompleteModal(false)}>
                    <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                className="px-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
              >

                {selectedReminder && (
                  <>
                    <View
                      className={`flex-row items-center p-4 rounded-xl mb-4 ${
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      }`}
                    >
                      <View
                        className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                        style={{
                          backgroundColor:
                            (selectedReminder.maintenance_type?.color || '#64748B') + '20',
                        }}
                      >
                        <MaterialIcons
                          name={getMaintenanceIcon(selectedReminder.maintenance_type?.slug || '')}
                          size={24}
                          color={selectedReminder.maintenance_type?.color || '#64748B'}
                        />
                      </View>
                      <View>
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {selectedReminder.maintenance_type?.name || 'Maintenance'}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {selectedReminder.vehicle?.display_name ||
                            `${selectedReminder.vehicle?.year} ${selectedReminder.vehicle?.make_name} ${selectedReminder.vehicle?.model_name}`}
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

                    <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Cost (GHS) - Optional
                    </Text>
                    <TextInput
                      className={`p-4 rounded-xl mb-4 text-lg ${
                        isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                      }`}
                      placeholder="Enter service cost"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      keyboardType="numeric"
                      value={completionCost}
                      onChangeText={setCompletionCost}
                    />

                    <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Notes - Optional
                    </Text>
                    <TextInput
                      className={`p-4 rounded-xl mb-4 ${
                        isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                      }`}
                      placeholder="Add any notes about the service"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={{ minHeight: 80 }}
                      value={completionNotes}
                      onChangeText={setCompletionNotes}
                    />

                    <Button
                      title="Mark as Complete"
                      onPress={confirmCompleteService}
                      loading={completing}
                      fullWidth
                    />

                    {/* Bottom padding for keyboard */}
                    <View style={{ height: 20 }} />
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Snooze Duration Modal */}
      <Modal visible={showSnoozeModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowSnoozeModal(false)}
            />
            <View
              className={`rounded-t-3xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
            >
              <DragHandle isDark={isDark} />
              {/* Header outside ScrollView so it stays visible */}
              <View className="px-6 pb-2">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Snooze Reminder
                  </Text>
                  <TouchableOpacity onPress={() => setShowSnoozeModal(false)}>
                    <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                className="px-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                <Text className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  How long would you like to snooze this reminder?
                </Text>

                {/* Preset options */}
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {SNOOZE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.days}
                      onPress={() => {
                        setSelectedSnoozeDays(option.days);
                        setCustomSnoozeDays('');
                      }}
                      className={`px-4 py-3 rounded-xl border-2 ${
                        selectedSnoozeDays === option.days
                          ? 'border-primary-500 bg-primary-500/10'
                          : isDark
                            ? 'border-slate-700 bg-slate-700/50'
                            : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <Text
                        className={`font-semibold ${
                          selectedSnoozeDays === option.days
                            ? 'text-primary-500'
                            : isDark
                              ? 'text-white'
                              : 'text-slate-900'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Custom input */}
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Or enter custom days
                </Text>
                <TextInput
                  className={`p-4 rounded-xl mb-6 ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                  placeholder="Enter number of days"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  keyboardType="numeric"
                  value={customSnoozeDays}
                  onChangeText={(text) => {
                    setCustomSnoozeDays(text);
                    if (text) {
                      setSelectedSnoozeDays(null);
                    }
                  }}
                />

                <Button
                  title={`Snooze for ${selectedSnoozeDays || customSnoozeDays || '?'} day${(selectedSnoozeDays || parseInt(customSnoozeDays || '0', 10)) === 1 ? '' : 's'}`}
                  onPress={handleSnooze}
                  loading={snoozing}
                  disabled={!selectedSnoozeDays && !customSnoozeDays}
                  fullWidth
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Maintenance Type Modal */}
      <Modal visible={showCustomTypeModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end">
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowCustomTypeModal(false)}
            />
            <View
              className={`rounded-t-3xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}
            >
              <DragHandle isDark={isDark} />
              {/* Header outside ScrollView so it stays visible */}
              <View className="px-6 pb-2">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingType ? 'Edit Custom Type' : 'Create Custom Type'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowCustomTypeModal(false)}>
                    <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                className="px-6"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                <Text className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Create your own maintenance type to track specific services for your vehicle.
                </Text>

                {/* Name */}
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Name *
                </Text>
                <TextInput
                  className={`p-4 rounded-xl mb-4 ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                  placeholder="e.g., Timing Chain Replacement"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={customTypeName}
                  onChangeText={setCustomTypeName}
                />

                {/* Description */}
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Description (Optional)
                </Text>
                <TextInput
                  className={`p-4 rounded-xl mb-4 ${
                    isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                  placeholder="Brief description of the maintenance"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  style={{ minHeight: 60 }}
                  value={customTypeDescription}
                  onChangeText={setCustomTypeDescription}
                />

                {/* Interval */}
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Recommended Interval (Optional)
                </Text>
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1">
                    <TextInput
                      className={`p-4 rounded-xl ${
                        isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                      }`}
                      placeholder="Km interval"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      keyboardType="numeric"
                      value={customTypeIntervalKm}
                      onChangeText={setCustomTypeIntervalKm}
                    />
                    <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Kilometers
                    </Text>
                  </View>
                  <View className="flex-1">
                    <TextInput
                      className={`p-4 rounded-xl ${
                        isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
                      }`}
                      placeholder="Months"
                      placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                      keyboardType="numeric"
                      value={customTypeIntervalMonths}
                      onChangeText={setCustomTypeIntervalMonths}
                    />
                    <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Months
                    </Text>
                  </View>
                </View>

                {/* Color Selection */}
                <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Color
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'].map((color) => (
                    <TouchableOpacity
                      key={color}
                      onPress={() => setCustomTypeColor(color)}
                      className={`h-10 w-10 rounded-full items-center justify-center ${
                        customTypeColor === color ? 'border-2 border-white' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {customTypeColor === color && (
                        <MaterialIcons name="check" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title={editingType ? 'Save Changes' : 'Create Type'}
                  onPress={handleSaveCustomType}
                  loading={savingCustomType}
                  fullWidth
                />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
