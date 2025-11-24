import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Badge, Chip, EmptyState } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

interface DiagnosisHistoryItem {
  id: string;
  title: string;
  category: string;
  vehicle: string;
  date: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: { min: number; max: number };
  status: 'completed' | 'in_progress' | 'expert_contacted';
}

const mockHistory: DiagnosisHistoryItem[] = [
  {
    id: '1',
    title: 'Engine Overheating',
    category: 'Engine',
    vehicle: 'Toyota Corolla 2019',
    date: '2024-11-20',
    confidence: 92,
    severity: 'high',
    estimatedCost: { min: 500, max: 1200 },
    status: 'completed',
  },
  {
    id: '2',
    title: 'Brake Pad Wear',
    category: 'Brakes',
    vehicle: 'Toyota Corolla 2019',
    date: '2024-11-15',
    confidence: 88,
    severity: 'medium',
    estimatedCost: { min: 200, max: 400 },
    status: 'expert_contacted',
  },
  {
    id: '3',
    title: 'AC Not Cooling',
    category: 'Electrical',
    vehicle: 'Honda CR-V 2021',
    date: '2024-11-10',
    confidence: 75,
    severity: 'low',
    estimatedCost: { min: 150, max: 350 },
    status: 'completed',
  },
  {
    id: '4',
    title: 'Check Engine Light',
    category: 'Engine',
    vehicle: 'Toyota Corolla 2019',
    date: '2024-11-05',
    confidence: 85,
    severity: 'medium',
    estimatedCost: { min: 100, max: 800 },
    status: 'completed',
  },
];

const filters = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'expert_contacted', label: 'Expert Contacted' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredHistory = selectedFilter === 'all'
    ? mockHistory
    : mockHistory.filter((item) => item.status === selectedFilter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#EA580C';
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
      case 'completed':
        return <Badge label="Completed" variant="success" size="sm" />;
      case 'expert_contacted':
        return <Badge label="Expert Contacted" variant="info" size="sm" />;
      case 'in_progress':
        return <Badge label="In Progress" variant="warning" size="sm" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string): keyof typeof MaterialIcons.glyphMap => {
    switch (category.toLowerCase()) {
      case 'engine':
        return 'engineering';
      case 'brakes':
        return 'do-not-disturb';
      case 'electrical':
        return 'electrical-services';
      case 'transmission':
        return 'settings';
      case 'tires':
        return 'trip-origin';
      default:
        return 'build';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Diagnosis History
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {filteredHistory.length} diagnosis record{filteredHistory.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Filter */}
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

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {filteredHistory.length > 0 ? (
          <View className="gap-3 pb-8">
            {filteredHistory.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/(driver)/diagnose/results?id=${item.id}`)}
                activeOpacity={0.7}
              >
                <Card variant="default">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="h-12 w-12 rounded-xl items-center justify-center mr-3"
                        style={{ backgroundColor: getSeverityColor(item.severity) + '20' }}
                      >
                        <MaterialIcons
                          name={getCategoryIcon(item.category)}
                          size={24}
                          color={getSeverityColor(item.severity)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.title}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.vehicle}
                        </Text>
                      </View>
                    </View>
                    {getStatusBadge(item.status)}
                  </View>

                  {/* Details */}
                  <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center">
                        <MaterialIcons name="calendar-today" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {formatDate(item.date)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="analytics" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {item.confidence}% match
                        </Text>
                      </View>
                    </View>
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formatCurrency(item.estimatedCost.min)} - {formatCurrency(item.estimatedCost.max)}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="history"
            title="No Diagnosis History"
            description="Your past diagnoses will appear here. Start by diagnosing an issue with your vehicle."
            actionLabel="Start Diagnosis"
            onAction={() => router.push('/(driver)/diagnose')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
