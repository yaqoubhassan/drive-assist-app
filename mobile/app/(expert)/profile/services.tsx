import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Button, Input, Badge, ConfirmationModal, SuccessModal } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
  active: boolean;
}

const initialServices: Service[] = [
  {
    id: '1',
    name: 'Engine Diagnostic',
    description: 'Complete engine diagnostic using OBD-II scanner',
    price: 100,
    duration: '30 min',
    category: 'Diagnostics',
    active: true,
  },
  {
    id: '2',
    name: 'Oil Change',
    description: 'Oil and filter change with quality oil',
    price: 150,
    duration: '45 min',
    category: 'Maintenance',
    active: true,
  },
  {
    id: '3',
    name: 'Brake Pad Replacement',
    description: 'Front or rear brake pad replacement',
    price: 250,
    duration: '1-2 hours',
    category: 'Brakes',
    active: true,
  },
  {
    id: '4',
    name: 'Transmission Service',
    description: 'Transmission fluid change and inspection',
    price: 400,
    duration: '2-3 hours',
    category: 'Transmission',
    active: true,
  },
  {
    id: '5',
    name: 'AC Repair',
    description: 'AC system diagnosis and repair',
    price: 300,
    duration: '1-2 hours',
    category: 'Electrical',
    active: false,
  },
  {
    id: '6',
    name: 'Full Service',
    description: 'Comprehensive vehicle service and inspection',
    price: 500,
    duration: '3-4 hours',
    category: 'Maintenance',
    active: true,
  },
];

const categories = ['All', 'Diagnostics', 'Maintenance', 'Brakes', 'Transmission', 'Electrical', 'Engine'];

export default function ServicesScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { showWarning } = useAlert();
  const [services, setServices] = useState<Service[]>(initialServices);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Maintenance');

  const activeServices = services.filter((s) => s.active).length;

  const handleToggleService = (serviceId: string) => {
    setServices(services.map((s) =>
      s.id === serviceId ? { ...s, active: !s.active } : s
    ));
  };

  const handleDeleteService = (service: Service) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDeleteService = () => {
    if (serviceToDelete) {
      setServices(services.filter((s) => s.id !== serviceToDelete.id));
      setShowDeleteModal(false);
      setSuccessMessage({
        title: 'Service Deleted',
        message: `"${serviceToDelete.name}" has been removed from your services.`,
      });
      setServiceToDelete(null);
      setShowSuccessModal(true);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description);
    setServicePrice(service.price.toString());
    setServiceDuration(service.duration);
    setServiceCategory(service.category);
    setShowAddModal(true);
  };

  const handleSaveService = () => {
    if (!serviceName || !servicePrice) {
      showWarning('Required Fields', 'Please fill in service name and price.');
      return;
    }

    const newService: Service = {
      id: editingService?.id || Date.now().toString(),
      name: serviceName,
      description: serviceDescription,
      price: parseInt(servicePrice) || 0,
      duration: serviceDuration || '1 hour',
      category: serviceCategory,
      active: true,
    };

    if (editingService) {
      setServices(services.map((s) => (s.id === editingService.id ? newService : s)));
    } else {
      setServices([...services, newService]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingService(null);
    setServiceName('');
    setServiceDescription('');
    setServicePrice('');
    setServiceDuration('');
    setServiceCategory('Maintenance');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Diagnostics':
        return '#3B82F6';
      case 'Maintenance':
        return '#10B981';
      case 'Brakes':
        return '#EF4444';
      case 'Transmission':
        return '#8B5CF6';
      case 'Electrical':
        return '#F59E0B';
      case 'Engine':
        return '#EC4899';
      default:
        return '#64748B';
    }
  };

  if (showAddModal) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
        {/* Header */}
        <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <TouchableOpacity onPress={resetForm} className="h-10 w-10 items-center justify-center">
            <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {editingService ? 'Edit Service' : 'Add Service'}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          <View className="gap-1">
            <Input
              label="Service Name"
              placeholder="e.g., Engine Diagnostic"
              value={serviceName}
              onChangeText={setServiceName}
            />

            <Input
              label="Description"
              placeholder="Describe what's included..."
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
            />

            <Input
              label="Price (GH₵)"
              placeholder="e.g., 150"
              value={servicePrice}
              onChangeText={setServicePrice}
              keyboardType="numeric"
            />

            <Input
              label="Duration"
              placeholder="e.g., 1-2 hours"
              value={serviceDuration}
              onChangeText={setServiceDuration}
            />

            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.filter((c) => c !== 'All').map((category) => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setServiceCategory(category)}
                    className={`px-4 py-2 rounded-full ${
                      serviceCategory === category
                        ? 'bg-primary-500'
                        : isDark
                        ? 'bg-slate-800'
                        : 'bg-slate-100'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        serviceCategory === category
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <Button title="Save Service" onPress={handleSaveService} fullWidth />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-2"
        >
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My Services
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {activeServices} active services
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center"
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-8">
          {services.map((service) => (
            <Card key={service.id} variant="default">
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {service.name}
                    </Text>
                    {!service.active && (
                      <Badge label="Inactive" variant="warning" size="sm" />
                    )}
                  </View>
                  <View
                    className="self-start px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: getCategoryColor(service.category) + '20' }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: getCategoryColor(service.category) }}
                    >
                      {service.category}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={service.active}
                  onValueChange={() => handleToggleService(service.id)}
                  trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                  thumbColor={service.active ? '#3B82F6' : '#94A3B8'}
                />
              </View>

              <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {service.description}
              </Text>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center">
                    <MaterialIcons name="payments" size={16} color="#10B981" />
                    <Text className={`ml-1 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(service.price)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text className={`ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {service.duration}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleEditService(service)}
                    className={`h-8 w-8 rounded-lg items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                  >
                    <MaterialIcons name="edit" size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteService(service)}
                    className={`h-8 w-8 rounded-lg items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-50'}`}
                  >
                    <MaterialIcons name="delete" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setServiceToDelete(null);
        }}
        onConfirm={confirmDeleteService}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.title}
        message={successMessage.message}
        primaryButtonLabel="Done"
      />
    </SafeAreaView>
  );
}
