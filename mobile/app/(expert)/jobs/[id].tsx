import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Avatar, Badge, Button } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { showInfo, showSuccess } = useAlert();
  const [status, setStatus] = useState<'scheduled' | 'in_progress' | 'completed'>('scheduled');
  const [updating, setUpdating] = useState(false);

  const job = {
    id: id || '1',
    customer: {
      name: 'Yaw Boateng',
      phone: '+233 24 567 8901',
      email: 'yaw.boateng@email.com',
    },
    issue: 'Transmission Repair',
    description: 'Hard shifting from 2nd to 3rd gear. Customer reports jerking motion when accelerating.',
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2016,
      plate: 'GW-5678-16',
    },
    location: 'Airport Residential, Accra',
    date: 'Today',
    time: '4:00 PM',
    amount: 1500,
    paid: false,
    notes: 'Customer prefers to wait during repair. Has parking space available.',
    tasks: [
      { id: '1', task: 'Diagnose transmission issue', completed: true },
      { id: '2', task: 'Check transmission fluid level', completed: true },
      { id: '3', task: 'Inspect clutch plates', completed: false },
      { id: '4', task: 'Replace worn components', completed: false },
      { id: '5', task: 'Test drive and verify fix', completed: false },
    ],
  };

  const handleCall = () => {
    Linking.openURL(`tel:${job.customer.phone.replace(/\s/g, '')}`);
  };

  const handleDirections = () => {
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(job.location)}`);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (status === 'scheduled') {
      setStatus('in_progress');
      showInfo('Status Updated', 'Job is now in progress.');
    } else if (status === 'in_progress') {
      setStatus('completed');
      showSuccess('Job Completed', 'Great work! The job has been marked as completed.');
    }

    setUpdating(false);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'scheduled':
        return <Badge label="Scheduled" variant="info" />;
      case 'in_progress':
        return <Badge label="In Progress" variant="warning" />;
      case 'completed':
        return <Badge label="Completed" variant="success" />;
      default:
        return null;
    }
  };

  const getActionButton = () => {
    switch (status) {
      case 'scheduled':
        return { title: 'Start Job', icon: 'play-arrow' as const };
      case 'in_progress':
        return { title: 'Complete Job', icon: 'check' as const };
      case 'completed':
        return null;
      default:
        return null;
    }
  };

  const actionButton = getActionButton();
  const completedTasks = job.tasks.filter((t) => t.completed).length;

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
            Job Details
          </Text>
        </View>
        {getStatusBadge()}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Job Overview */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {job.issue}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {job.vehicle.make} {job.vehicle.model} {job.vehicle.year}
                </Text>
              </View>
              <View className="items-end">
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatCurrency(job.amount)}
                </Text>
                {!job.paid && (
                  <Text className="text-orange-500 text-sm">Pending payment</Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center gap-4 mb-4">
              <View className="flex-row items-center">
                <MaterialIcons name="event" size={18} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {job.date}
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="schedule" size={18} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {job.time}
                </Text>
              </View>
            </View>

            <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {job.description}
            </Text>
          </Card>
        </View>

        {/* Customer Info */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              CUSTOMER
            </Text>
            <View className="flex-row items-center mb-4">
              <Avatar size="lg" name={job.customer.name} />
              <View className="ml-4 flex-1">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {job.customer.name}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {job.customer.phone}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCall}
                className="h-12 w-12 rounded-full bg-primary-500 items-center justify-center"
              >
                <MaterialIcons name="phone" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleDirections}
              className={`flex-row items-center p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
            >
              <MaterialIcons name="location-on" size={20} color="#10B981" />
              <Text className={`flex-1 ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {job.location}
              </Text>
              <MaterialIcons name="directions" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Tasks Checklist */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                TASKS
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {completedTasks}/{job.tasks.length} completed
              </Text>
            </View>

            {/* Progress Bar */}
            <View className={`h-2 rounded-full mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
              <View
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${(completedTasks / job.tasks.length) * 100}%` }}
              />
            </View>

            <View className="gap-2">
              {job.tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  className="flex-row items-center py-2"
                >
                  <View
                    className={`h-6 w-6 rounded-full items-center justify-center mr-3 ${
                      task.completed
                        ? 'bg-green-500'
                        : isDark
                        ? 'border-2 border-slate-600'
                        : 'border-2 border-slate-300'
                    }`}
                  >
                    {task.completed && (
                      <MaterialIcons name="check" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    className={`flex-1 ${
                      task.completed
                        ? isDark
                          ? 'text-slate-500 line-through'
                          : 'text-slate-400 line-through'
                        : isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    {task.task}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Notes */}
        {job.notes && (
          <View className="px-4 pb-4">
            <Card variant="default">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                NOTES
              </Text>
              <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {job.notes}
              </Text>
            </Card>
          </View>
        )}

        {/* Vehicle Info */}
        <View className="px-4 pb-8">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              VEHICLE
            </Text>
            <View className="flex-row items-center">
              <View
                className="h-14 w-14 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
              >
                <MaterialIcons name="directions-car" size={28} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {job.vehicle.make} {job.vehicle.model}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {job.vehicle.year} • {job.vehicle.plate}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Action Button */}
      {actionButton && (
        <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <Button
            title={actionButton.title}
            onPress={handleUpdateStatus}
            loading={updating}
            leftIcon={actionButton.icon}
            fullWidth
          />
        </View>
      )}
    </SafeAreaView>
  );
}
