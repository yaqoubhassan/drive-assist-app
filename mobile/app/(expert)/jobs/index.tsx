import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Avatar, Badge, Chip, EmptyState } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

interface Job {
  id: string;
  customer: string;
  phone: string;
  issue: string;
  vehicle: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  amount: number;
  paid: boolean;
}

const mockJobs: Job[] = [
  {
    id: '1',
    customer: 'Yaw Boateng',
    phone: '+233 24 567 8901',
    issue: 'Transmission Repair',
    vehicle: 'Toyota Camry 2016',
    location: 'Airport Residential, Accra',
    status: 'in_progress',
    date: 'Today',
    time: '4:00 PM',
    amount: 1500,
    paid: false,
  },
  {
    id: '2',
    customer: 'Akua Mansa',
    phone: '+233 20 678 9012',
    issue: 'Oil Change & Filter',
    vehicle: 'Honda Accord 2018',
    location: 'Cantonments, Accra',
    status: 'scheduled',
    date: 'Tomorrow',
    time: '10:00 AM',
    amount: 250,
    paid: false,
  },
  {
    id: '3',
    customer: 'Kwame Asante',
    phone: '+233 24 123 4567',
    issue: 'Engine Overheating Fix',
    vehicle: 'Toyota Corolla 2019',
    location: 'East Legon, Accra',
    status: 'scheduled',
    date: 'Nov 26',
    time: '2:00 PM',
    amount: 650,
    paid: true,
  },
  {
    id: '4',
    customer: 'Ama Serwaa',
    phone: '+233 27 234 5678',
    issue: 'Brake Pad Replacement',
    vehicle: 'Honda Civic 2020',
    location: 'Osu, Accra',
    status: 'completed',
    date: 'Nov 20',
    time: '11:00 AM',
    amount: 350,
    paid: true,
  },
  {
    id: '5',
    customer: 'Kofi Mensah',
    phone: '+233 20 345 6789',
    issue: 'AC Repair',
    vehicle: 'Hyundai Elantra 2018',
    location: 'Tema, Greater Accra',
    status: 'completed',
    date: 'Nov 18',
    time: '3:00 PM',
    amount: 400,
    paid: true,
  },
  {
    id: '6',
    customer: 'Abena Pokua',
    phone: '+233 55 456 7890',
    issue: 'Diagnostic Check',
    vehicle: 'Nissan Altima 2017',
    location: 'Madina, Accra',
    status: 'cancelled',
    date: 'Nov 15',
    time: '9:00 AM',
    amount: 100,
    paid: false,
  },
];

const filters = [
  { id: 'all', label: 'All Jobs' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

const dateRangeOptions = [
  { id: 'all', label: 'All Time', icon: 'all-inclusive' as const },
  { id: 'today', label: 'Today', icon: 'today' as const },
  { id: 'tomorrow', label: 'Tomorrow', icon: 'event' as const },
  { id: 'this_week', label: 'This Week', icon: 'date-range' as const },
  { id: 'this_month', label: 'This Month', icon: 'calendar-today' as const },
  { id: 'past', label: 'Past Jobs', icon: 'history' as const },
];

export default function JobsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Filter by date range
  const filterByDate = (job: Job) => {
    if (selectedDateRange === 'all') return true;
    const jobDate = job.date.toLowerCase();
    switch (selectedDateRange) {
      case 'today':
        return jobDate === 'today';
      case 'tomorrow':
        return jobDate === 'tomorrow';
      case 'this_week':
        return ['today', 'tomorrow'].includes(jobDate) || jobDate.includes('nov 2');
      case 'this_month':
        return jobDate.includes('nov') || jobDate === 'today' || jobDate === 'tomorrow';
      case 'past':
        return !['today', 'tomorrow'].includes(jobDate) && !jobDate.includes('nov 2');
      default:
        return true;
    }
  };

  const filteredJobs = mockJobs
    .filter((job) => {
      const matchesStatus = selectedFilter === 'all'
        ? job.status !== 'cancelled'
        : job.status === selectedFilter;
      const matchesDate = filterByDate(job);
      return matchesStatus && matchesDate;
    });

  const getDateRangeLabel = () => {
    const option = dateRangeOptions.find(o => o.id === selectedDateRange);
    return option?.label || 'All Time';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge label="Scheduled" variant="info" size="sm" />;
      case 'in_progress':
        return <Badge label="In Progress" variant="warning" size="sm" />;
      case 'completed':
        return <Badge label="Completed" variant="success" size="sm" />;
      case 'cancelled':
        return <Badge label="Cancelled" variant="error" size="sm" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Jobs
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowDateModal(true)}
            className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          >
            <MaterialIcons name="calendar-today" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
            {selectedDateRange !== 'all' && (
              <View className="absolute -top-1 -right-1 bg-primary-500 h-3 w-3 rounded-full" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              selected={selectedFilter === filter.id}
              onPress={() => setSelectedFilter(filter.id)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Jobs List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredJobs.length > 0 ? (
          <View className="gap-3 pb-8">
            {filteredJobs.map((job) => (
              <TouchableOpacity
                key={job.id}
                onPress={() => router.push(`/(expert)/jobs/${job.id}`)}
                activeOpacity={0.7}
              >
                <Card variant="default">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="h-12 w-12 rounded-xl items-center justify-center"
                        style={{ backgroundColor: getStatusColor(job.status) + '20' }}
                      >
                        <MaterialIcons
                          name={job.status === 'completed' ? 'check-circle' : 'work'}
                          size={24}
                          color={getStatusColor(job.status)}
                        />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {job.issue}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {job.vehicle}
                        </Text>
                      </View>
                    </View>
                    {getStatusBadge(job.status)}
                  </View>

                  {/* Customer */}
                  <View className="flex-row items-center mb-3">
                    <Avatar size="sm" name={job.customer} />
                    <Text className={`ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {job.customer}
                    </Text>
                  </View>

                  {/* Footer */}
                  <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <MaterialIcons name="event" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {job.date}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="schedule" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {job.time}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatCurrency(job.amount)}
                      </Text>
                      {job.paid && (
                        <View className="ml-2 bg-green-500/20 px-2 py-0.5 rounded">
                          <Text className="text-green-500 text-xs font-semibold">Paid</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="work"
            title="No Jobs Found"
            description="Jobs matching your filter will appear here."
          />
        )}
      </ScrollView>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDateModal(false)}
      >
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Filter by Date
            </Text>
            <TouchableOpacity onPress={() => setSelectedDateRange('all')}>
              <Text className="text-primary-500 font-semibold">Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              SELECT DATE RANGE
            </Text>
            <View className="gap-2">
              {dateRangeOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setSelectedDateRange(option.id);
                    setShowDateModal(false);
                  }}
                  className={`flex-row items-center p-4 rounded-xl border ${
                    selectedDateRange === option.id
                      ? 'bg-primary-500/10 border-primary-500'
                      : isDark
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <View
                    className={`h-10 w-10 rounded-lg items-center justify-center mr-3 ${
                      selectedDateRange === option.id
                        ? 'bg-primary-500'
                        : isDark
                        ? 'bg-slate-700'
                        : 'bg-slate-100'
                    }`}
                  >
                    <MaterialIcons
                      name={option.icon}
                      size={22}
                      color={selectedDateRange === option.id ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                    />
                  </View>
                  <Text
                    className={`flex-1 font-semibold ${
                      selectedDateRange === option.id
                        ? 'text-primary-500'
                        : isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    {option.label}
                  </Text>
                  {selectedDateRange === option.id && (
                    <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
