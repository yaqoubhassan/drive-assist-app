import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Button, Card } from '../../../../src/components/common';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

const categoryTitles: Record<string, string> = {
  all: 'All Road Signs',
  regulatory: 'Regulatory Signs',
  warning: 'Warning Signs',
  informational: 'Information Signs',
  guide: 'Guide Signs',
};

export default function QuizResultsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { score, correct, total, time, category } = useLocalSearchParams<{
    score: string;
    correct: string;
    total: string;
    time: string;
    category: string;
  }>();

  const scoreNum = parseInt(score || '0', 10);
  const correctNum = parseInt(correct || '0', 10);
  const totalNum = parseInt(total || '0', 10);
  const timeNum = parseInt(time || '0', 10);

  const isPassed = scoreNum >= 70;

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

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

  const grade = getGrade(scoreNum);
  const gradeColor = getGradeColor(grade);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins} min ${secs} sec`;
  };

  const getMessage = () => {
    if (scoreNum >= 90) return "Outstanding! You're a road sign expert!";
    if (scoreNum >= 80) return "Great job! You know your road signs well.";
    if (scoreNum >= 70) return "Good work! You passed the quiz.";
    if (scoreNum >= 60) return "Almost there! Keep practicing.";
    return "Keep learning! Review the signs and try again.";
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <LinearGradient
          colors={isPassed ? ['#10B981', '#059669'] : ['#F59E0B', '#EF4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-4 py-8"
        >
          <Animated.View entering={ZoomIn.delay(200)} className="items-center">
            <View className="h-20 w-20 rounded-full bg-white/20 items-center justify-center mb-4">
              <MaterialIcons
                name={isPassed ? 'emoji-events' : 'trending-up'}
                size={48}
                color="#FFFFFF"
              />
            </View>
            <Text className="text-white text-2xl font-bold text-center">
              {isPassed ? 'Congratulations! 🎉' : 'Keep Practicing! 💪'}
            </Text>
            <Text className="text-white/80 text-center mt-2">{getMessage()}</Text>
          </Animated.View>
        </LinearGradient>

        {/* Score Card */}
        <View className="px-4 -mt-6">
          <Animated.View entering={FadeInUp.delay(400)}>
            <Card variant="elevated" className="items-center py-6">
              {/* Grade Circle */}
              <View
                className="h-28 w-28 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: gradeColor + '20', borderWidth: 4, borderColor: gradeColor }}
              >
                <Text className="text-5xl font-bold" style={{ color: gradeColor }}>
                  {grade}
                </Text>
              </View>

              {/* Score */}
              <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {scoreNum}%
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {correctNum} out of {totalNum} correct
              </Text>

              {/* Pass/Fail Badge */}
              <View
                className={`mt-4 px-4 py-2 rounded-full ${isPassed ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
              >
                <Text
                  className={`font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}
                >
                  {isPassed ? '✓ PASSED' : '✗ NEEDS IMPROVEMENT'}
                </Text>
              </View>
            </Card>
          </Animated.View>
        </View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(600)} className="px-4 mt-4">
          <View className="flex-row gap-3">
            <Card variant="default" className="flex-1 items-center py-4">
              <MaterialIcons name="schedule" size={24} color="#3B82F6" />
              <Text className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatTime(timeNum)}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Time Taken
              </Text>
            </Card>
            <Card variant="default" className="flex-1 items-center py-4">
              <MaterialIcons name="speed" size={24} color="#8B5CF6" />
              <Text className={`text-lg font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {totalNum > 0 ? Math.round(timeNum / totalNum) : 0}s
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Avg. per Question
              </Text>
            </Card>
          </View>
        </Animated.View>

        {/* Category Info */}
        <Animated.View entering={FadeInDown.delay(800)} className="px-4 mt-4">
          <Card variant="default">
            <View className="flex-row items-center">
              <View className="h-12 w-12 rounded-full bg-primary-500/10 items-center justify-center mr-3">
                <MaterialIcons name="category" size={24} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {categoryTitles[category || 'all']}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Quiz Category
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Grade Scale */}
        <Animated.View entering={FadeInDown.delay(1000)} className="px-4 mt-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Grading Scale
          </Text>
          <Card variant="default">
            <View className="flex-row justify-between">
              {[
                { grade: 'A', range: '90-100%', color: '#10B981' },
                { grade: 'B', range: '80-89%', color: '#3B82F6' },
                { grade: 'C', range: '70-79%', color: '#F59E0B' },
                { grade: 'D', range: '60-69%', color: '#F97316' },
                { grade: 'F', range: '0-59%', color: '#EF4444' },
              ].map((item) => (
                <View key={item.grade} className="items-center">
                  <View
                    className={`h-10 w-10 rounded-full items-center justify-center mb-1 ${item.grade === grade ? 'border-2' : ''
                      }`}
                    style={{
                      backgroundColor: item.color + '20',
                      borderColor: item.grade === grade ? item.color : 'transparent',
                    }}
                  >
                    <Text className="font-bold" style={{ color: item.color }}>
                      {item.grade}
                    </Text>
                  </View>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.range}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.replace('/(driver)/learn/quiz')}
            className={`flex-1 py-4 rounded-xl items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'
              }`}
          >
            <MaterialIcons name="list" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            <Text className={`mt-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              All Quizzes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace(`/(driver)/learn/quiz/${category}` as any)}
            className="flex-1 py-4 rounded-xl items-center justify-center bg-primary-500"
          >
            <MaterialIcons name="replay" size={24} color="#FFFFFF" />
            <Text className="mt-1 font-semibold text-white">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(driver)/learn/road-signs')}
          className="mt-3"
        >
          <Text className="text-primary-500 text-center font-semibold">
            Review Road Signs Guide
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
