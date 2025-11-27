import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Card, Badge } from '../../../../src/components/common';

const { width } = Dimensions.get('window');

const quizCategories = [
  {
    id: 'all',
    title: 'All Road Signs',
    description: 'Test your knowledge on all types of road signs',
    icon: 'traffic' as const,
    color: '#3B82F6',
    gradient: ['#3B82F6', '#8B5CF6'] as [string, string],
    questionCount: 40,
    difficulty: 'Mixed',
    estimatedTime: '15 min',
  },
  {
    id: 'regulatory',
    title: 'Regulatory Signs',
    description: 'Stop signs, speed limits, and rules you must follow',
    icon: 'block' as const,
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'] as [string, string],
    questionCount: 12,
    difficulty: 'Beginner',
    estimatedTime: '5 min',
  },
  {
    id: 'warning',
    title: 'Warning Signs',
    description: 'Hazards, curves, and caution alerts ahead',
    icon: 'warning' as const,
    color: '#F59E0B',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
    questionCount: 14,
    difficulty: 'Beginner',
    estimatedTime: '6 min',
  },
  {
    id: 'informational',
    title: 'Information Signs',
    description: 'Services, facilities, and helpful info on the road',
    icon: 'info' as const,
    color: '#3B82F6',
    gradient: ['#3B82F6', '#2563EB'] as [string, string],
    questionCount: 8,
    difficulty: 'Easy',
    estimatedTime: '3 min',
  },
  {
    id: 'guide',
    title: 'Guide Signs',
    description: 'Directions, destinations, and route markers',
    icon: 'signpost' as const,
    color: '#10B981',
    gradient: ['#10B981', '#059669'] as [string, string],
    questionCount: 6,
    difficulty: 'Easy',
    estimatedTime: '3 min',
  },
];

const recentScores = [
  { category: 'All Road Signs', score: 85, date: 'Nov 25', grade: 'B' },
  { category: 'Warning Signs', score: 92, date: 'Nov 23', grade: 'A' },
  { category: 'Regulatory Signs', score: 78, date: 'Nov 20', grade: 'C' },
];

export default function QuizIndexScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return '#10B981';
      case 'B':
        return '#3B82F6';
      case 'C':
        return '#F59E0B';
      case 'D':
        return '#F97316';
      default:
        return '#EF4444';
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center mr-2"
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Road Signs Quiz
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Test your knowledge
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Banner */}
        <View className="px-4 py-4">
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5"
            style={{ borderRadius: 16 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white/80 font-medium">Your Progress</Text>
              <TouchableOpacity>
                <MaterialIcons name="leaderboard" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-white text-2xl font-bold">85%</Text>
                <Text className="text-white/70 text-xs mt-1">Avg. Score</Text>
              </View>
              <View className="h-12 w-px bg-white/20" />
              <View className="items-center flex-1">
                <Text className="text-white text-2xl font-bold">12</Text>
                <Text className="text-white/70 text-xs mt-1">Quizzes Taken</Text>
              </View>
              <View className="h-12 w-px bg-white/20" />
              <View className="items-center flex-1">
                <Text className="text-white text-2xl font-bold">38/40</Text>
                <Text className="text-white/70 text-xs mt-1">Signs Learned</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Passing Info */}
        <View className="px-4 mb-4">
          <View className={`flex-row items-center p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
            <MaterialIcons name="lightbulb" size={20} color="#3B82F6" />
            <Text className={`ml-2 text-sm flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Score 70% or higher to pass each quiz. Good luck!
            </Text>
          </View>
        </View>

        {/* Quiz Categories */}
        <View className="px-4 pb-4">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Choose a Category
          </Text>
          <View className="gap-3">
            {quizCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => router.push(`/(driver)/learn/quiz/${category.id}` as any)}
                activeOpacity={0.7}
              >
                <Card variant="default" padding="none" className="overflow-hidden">
                  <LinearGradient
                    colors={category.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="p-4"
                    style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
                  >
                    <View className="flex-row items-center">
                      <View className="h-12 w-12 rounded-full bg-white/20 items-center justify-center mr-3">
                        <MaterialIcons name={category.icon} size={24} color="#FFFFFF" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-bold text-lg">{category.title}</Text>
                        <Text className="text-white/80 text-sm">{category.description}</Text>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                  <View className={`flex-row p-3 justify-between ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <View className="flex-row items-center">
                      <MaterialIcons name="help-outline" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                      <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {category.questionCount} questions
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="schedule" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                      <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {category.estimatedTime}
                      </Text>
                    </View>
                    <Badge label={category.difficulty} variant="info" size="sm" />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Scores */}
        <View className="px-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Recent Scores
          </Text>
          <View className="gap-3">
            {recentScores.map((score, index) => (
              <Card key={index} variant="default">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="h-10 w-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: getGradeColor(score.grade) + '20' }}
                    >
                      <Text
                        className="font-bold text-lg"
                        style={{ color: getGradeColor(score.grade) }}
                      >
                        {score.grade}
                      </Text>
                    </View>
                    <View>
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {score.category}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {score.date}
                      </Text>
                    </View>
                  </View>
                  <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {score.score}%
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
