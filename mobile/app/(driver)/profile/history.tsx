import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Badge, Chip, EmptyState, Skeleton, SkeletonListItem } from '../../../src/components/common';
import diagnosisService, { DiagnosisResult } from '../../../src/services/diagnosis';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
  { id: 'pending', label: 'Pending' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [diagnoses, setDiagnoses] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchDiagnoses = useCallback(async (page: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (page === 1) {
        setLoading(true);
      }

      const result = await diagnosisService.getDiagnoses(page);

      if (refresh || page === 1) {
        setDiagnoses(result.diagnoses);
      } else {
        setDiagnoses(prev => [...prev, ...result.diagnoses]);
      }

      setCurrentPage(result.currentPage);
      setHasMore(result.currentPage < result.lastPage);
    } catch (error) {
      console.error('Failed to fetch diagnoses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDiagnoses(1, false);
    }, [fetchDiagnoses])
  );

  const onRefresh = useCallback(() => {
    fetchDiagnoses(1, true);
  }, [fetchDiagnoses]);

  const filteredDiagnoses = selectedFilter === 'all'
    ? diagnoses
    : diagnoses.filter((item) => item.status === selectedFilter);

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
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
      case 'failed':
        return <Badge label="Failed" variant="error" size="sm" />;
      case 'pending':
      case 'processing':
        return <Badge label="Pending" variant="warning" size="sm" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (inputType: string): keyof typeof MaterialIcons.glyphMap => {
    switch (inputType) {
      case 'voice':
        return 'mic';
      case 'text_image':
        return 'photo-camera';
      default:
        return 'edit';
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

  const getDiagnosisTitle = (diagnosis: DiagnosisResult) => {
    if (diagnosis.ai_diagnosis) {
      // Get first sentence or first 60 chars
      const firstLine = diagnosis.ai_diagnosis.split('.')[0];
      return firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine;
    }
    if (diagnosis.symptoms_description) {
      return diagnosis.symptoms_description.length > 60
        ? diagnosis.symptoms_description.substring(0, 60) + '...'
        : diagnosis.symptoms_description;
    }
    return 'Vehicle Diagnosis';
  };

  const getVehicleInfo = (diagnosis: DiagnosisResult) => {
    if (diagnosis.vehicle) {
      return `${diagnosis.vehicle.year} ${diagnosis.vehicle.make_name} ${diagnosis.vehicle.model_name}`;
    }
    return 'No vehicle specified';
  };

  const getConfidenceScore = (score: number | null) => {
    if (score === null) return null;
    return Math.round(score * 100);
  };

  // Skeleton Loading Component
  const HistorySkeleton = () => (
    <View className="gap-3 pb-8">
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
        >
          <View className="flex-row items-start mb-3">
            <Skeleton width={48} height={48} borderRadius={12} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="50%" height={12} />
            </View>
            <Skeleton width={70} height={20} borderRadius={10} />
          </View>
          <View className={`flex-row items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <View className="flex-row gap-4">
              <Skeleton width={80} height={14} />
              <Skeleton width={60} height={14} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

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
              {loading ? 'Loading...' : `${filteredDiagnoses.length} diagnosis record${filteredDiagnoses.length !== 1 ? 's' : ''}`}
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

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <HistorySkeleton />
        ) : filteredDiagnoses.length > 0 ? (
          <View className="gap-3 pb-8">
            {filteredDiagnoses.map((item) => (
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
                        style={{ backgroundColor: getUrgencyColor(item.ai_urgency_level) + '20' }}
                      >
                        <MaterialIcons
                          name={item.status === 'completed' ? 'check-circle' : item.status === 'failed' ? 'error' : 'pending'}
                          size={24}
                          color={getUrgencyColor(item.ai_urgency_level)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                          numberOfLines={2}
                        >
                          {getDiagnosisTitle(item)}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {getVehicleInfo(item)}
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
                          {formatDate(item.created_at)}
                        </Text>
                      </View>
                      {item.ai_confidence_score !== null && (
                        <View className="flex-row items-center">
                          <MaterialIcons name="analytics" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                          <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {getConfidenceScore(item.ai_confidence_score)}% confidence
                          </Text>
                        </View>
                      )}
                    </View>
                    {item.ai_urgency_level && (
                      <View
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: getUrgencyColor(item.ai_urgency_level) + '20' }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: getUrgencyColor(item.ai_urgency_level) }}
                        >
                          {item.ai_urgency_level} urgency
                        </Text>
                      </View>
                    )}
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
