import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Avatar, Badge, Chip, SearchBar, EmptyState } from '../../../src/components/common';

interface Lead {
  id: string;
  name: string;
  phone: string;
  issue: string;
  category: string;
  vehicle: string;
  location: string;
  distance: string;
  time: string;
  urgency: 'high' | 'medium' | 'low';
  description: string;
  photos: number;
  status: 'new' | 'viewed' | 'contacted';
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Kwame Asante',
    phone: '+233 24 123 4567',
    issue: 'Engine Overheating',
    category: 'Engine',
    vehicle: 'Toyota Corolla 2019',
    location: 'East Legon, Accra',
    distance: '2.3 km',
    time: '10 min ago',
    urgency: 'high',
    description: 'Car overheats after 15-20 minutes of driving. Temperature gauge goes to red.',
    photos: 3,
    status: 'new',
  },
  {
    id: '2',
    name: 'Ama Serwaa',
    phone: '+233 27 234 5678',
    issue: 'Brake Pad Replacement',
    category: 'Brakes',
    vehicle: 'Honda Civic 2020',
    location: 'Osu, Accra',
    distance: '4.1 km',
    time: '25 min ago',
    urgency: 'medium',
    description: 'Squeaking sound when braking. Need brake pads replaced.',
    photos: 0,
    status: 'viewed',
  },
  {
    id: '3',
    name: 'Kofi Mensah',
    phone: '+233 20 345 6789',
    issue: 'AC Not Working',
    category: 'Electrical',
    vehicle: 'Hyundai Elantra 2018',
    location: 'Tema, Greater Accra',
    distance: '12.5 km',
    time: '1 hour ago',
    urgency: 'low',
    description: 'Air conditioning stopped working. No cold air coming out.',
    photos: 1,
    status: 'contacted',
  },
  {
    id: '4',
    name: 'Abena Pokua',
    phone: '+233 55 456 7890',
    issue: 'Check Engine Light',
    category: 'Engine',
    vehicle: 'Nissan Altima 2017',
    location: 'Madina, Accra',
    distance: '6.8 km',
    time: '2 hours ago',
    urgency: 'medium',
    description: 'Check engine light came on suddenly. Car seems to run fine.',
    photos: 2,
    status: 'new',
  },
  {
    id: '5',
    name: 'Yaw Boateng',
    phone: '+233 24 567 8901',
    issue: 'Transmission Issues',
    category: 'Transmission',
    vehicle: 'Toyota Camry 2016',
    location: 'Airport Residential, Accra',
    distance: '3.2 km',
    time: '3 hours ago',
    urgency: 'high',
    description: 'Car jerks when shifting gears. Hard shifting from 2nd to 3rd.',
    photos: 0,
    status: 'new',
  },
];

const filters = [
  { id: 'all', label: 'All Leads' },
  { id: 'new', label: 'New' },
  { id: 'viewed', label: 'Viewed' },
  { id: 'contacted', label: 'Contacted' },
];

const urgencyOptions = [
  { id: 'all', label: 'All' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
];

const categoryOptions = [
  { id: 'all', label: 'All Categories' },
  { id: 'Engine', label: 'Engine' },
  { id: 'Brakes', label: 'Brakes' },
  { id: 'Electrical', label: 'Electrical' },
  { id: 'Transmission', label: 'Transmission' },
  { id: 'Suspension', label: 'Suspension' },
  { id: 'Other', label: 'Other' },
];

export default function LeadsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Count active filters (excluding 'all' selections)
  const activeFilterCount =
    (selectedUrgency !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0);

  const filteredLeads = mockLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || lead.status === selectedFilter;
    const matchesUrgency = selectedUrgency === 'all' || lead.urgency === selectedUrgency;
    const matchesCategory = selectedCategory === 'all' || lead.category === selectedCategory;
    return matchesSearch && matchesFilter && matchesUrgency && matchesCategory;
  });

  const clearFilters = () => {
    setSelectedUrgency('all');
    setSelectedCategory('all');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge label="New" variant="success" size="sm" />;
      case 'viewed':
        return <Badge label="Viewed" variant="info" size="sm" />;
      case 'contacted':
        return <Badge label="Contacted" variant="warning" size="sm" />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Leads
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredLeads.length} potential customers
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}
          >
            <MaterialIcons name="filter-list" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-primary-500 h-5 w-5 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <SearchBar
          placeholder="Search leads..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
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

      {/* Leads List */}
      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredLeads.length > 0 ? (
          <View className="gap-3 pb-8">
            {filteredLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                onPress={() => router.push(`/(expert)/leads/${lead.id}`)}
                activeOpacity={0.7}
              >
                <Card variant="default">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <Avatar size="md" name={lead.name} />
                      <View className="ml-3 flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {lead.name}
                          </Text>
                          {getStatusBadge(lead.status)}
                        </View>
                        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {lead.time}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center">
                      <View
                        className="h-3 w-3 rounded-full mr-1"
                        style={{ backgroundColor: getUrgencyColor(lead.urgency) }}
                      />
                      <Text
                        className="text-xs font-semibold capitalize"
                        style={{ color: getUrgencyColor(lead.urgency) }}
                      >
                        {lead.urgency}
                      </Text>
                    </View>
                  </View>

                  {/* Issue */}
                  <View className="mb-3">
                    <Text className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {lead.issue}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {lead.vehicle}
                    </Text>
                  </View>

                  {/* Description Preview */}
                  <Text
                    className={`text-sm mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                    numberOfLines={2}
                  >
                    {lead.description}
                  </Text>

                  {/* Footer */}
                  <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <MaterialIcons name="location-on" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {lead.distance}
                        </Text>
                      </View>
                      {lead.photos > 0 && (
                        <View className="flex-row items-center">
                          <MaterialIcons name="photo" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                          <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {lead.photos} photo{lead.photos > 1 ? 's' : ''}
                          </Text>
                        </View>
                      )}
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={isDark ? '#475569' : '#94A3B8'}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="people"
            title="No Leads Found"
            description="No leads match your search criteria. Try adjusting your filters."
          />
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Filter Leads
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text className="text-primary-500 font-semibold">Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-4">
            {/* Urgency Filter */}
            <View className="mb-6">
              <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                URGENCY LEVEL
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {urgencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedUrgency(option.id)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedUrgency === option.id
                        ? 'bg-primary-500 border-primary-500'
                        : isDark
                        ? 'border-slate-600 bg-slate-800'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedUrgency === option.id
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View className="mb-6">
              <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                CATEGORY
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categoryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => setSelectedCategory(option.id)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedCategory === option.id
                        ? 'bg-primary-500 border-primary-500'
                        : isDark
                        ? 'border-slate-600 bg-slate-800'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        selectedCategory === option.id
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply Button */}
          <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              className="bg-primary-500 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-lg">
                Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
