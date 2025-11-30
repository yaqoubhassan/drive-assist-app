import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Skeleton, SkeletonListItem, SkeletonChips, SkeletonCard, SkeletonArticleCard } from '../common';

/**
 * Skeleton loading screen for the authenticated driver home screen
 * Matches the structure of the actual home screen for smooth transition
 */
export function HomeScreenSkeleton() {
  const { isDark } = useTheme();

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center gap-2">
            <Skeleton width={20} height={20} borderRadius={10} />
            <View>
              <Skeleton width={120} height={20} style={{ marginBottom: 4 }} />
              <Skeleton width={80} height={14} />
            </View>
          </View>
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>

        {/* Quick Actions Card Skeleton */}
        <View className="px-4 py-3">
          <View
            className={`p-5 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
          >
            <Skeleton width="70%" height={20} style={{ marginBottom: 12 }} />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Skeleton width="100%" height={44} borderRadius={12} />
              </View>
              <View className="flex-1">
                <Skeleton width="100%" height={44} borderRadius={12} />
              </View>
            </View>
          </View>
        </View>

        {/* Quick Categories Skeleton */}
        <View className="pt-4">
          <View className="px-4 pb-3">
            <Skeleton width={140} height={20} />
          </View>
          <SkeletonChips count={5} />
        </View>

        {/* Upcoming Appointments Skeleton */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Skeleton width={180} height={20} />
            <Skeleton width={60} height={14} />
          </View>
          <View className="px-4 gap-3">
            <SkeletonListItem />
            <SkeletonListItem />
          </View>
        </View>

        {/* Recent Diagnoses Skeleton */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Skeleton width={150} height={20} />
            <Skeleton width={60} height={14} />
          </View>
          <View className="px-4 gap-3">
            <SkeletonListItem />
            <SkeletonListItem />
          </View>
        </View>

        {/* My Vehicles Skeleton */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Skeleton width={100} height={20} />
            <Skeleton width={90} height={14} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          >
            <SkeletonCard style={{ width: 256 }} />
            <SkeletonCard style={{ width: 256 }} />
          </ScrollView>
        </View>

        {/* Learn Something New Skeleton */}
        <View className="pt-6 pb-8">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Skeleton width={170} height={20} />
            <Skeleton width={60} height={14} />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          >
            <SkeletonArticleCard />
            <SkeletonArticleCard />
            <SkeletonArticleCard />
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreenSkeleton;
