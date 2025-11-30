import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Animated skeleton loading placeholder with shimmer effect
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style
}: SkeletonProps) {
  const { isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const backgroundColor = isDark ? '#1E293B' : '#E2E8F0';
  const shimmerColors = isDark
    ? ['#1E293B', '#334155', '#1E293B']
    : ['#E2E8F0', '#F1F5F9', '#E2E8F0'];

  return (
    <View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/**
 * Skeleton for a card item (used for vehicles, appointments, etc.)
 */
export function SkeletonCard({
  hasImage = true,
  imageHeight = 112,
  style
}: {
  hasImage?: boolean;
  imageHeight?: number;
  style?: ViewStyle;
}) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        style,
      ]}
    >
      {hasImage && (
        <Skeleton width="100%" height={imageHeight} borderRadius={0} />
      )}
      <View style={{ padding: 16 }}>
        <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={12} />
      </View>
    </View>
  );
}

/**
 * Skeleton for a list item row
 */
export function SkeletonListItem({
  hasAvatar = true,
  style
}: {
  hasAvatar?: boolean;
  style?: ViewStyle;
}) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderRadius: 12,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        style,
      ]}
    >
      {hasAvatar && (
        <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
      )}
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  );
}

/**
 * Skeleton for horizontal scrolling chips
 */
export function SkeletonChips({ count = 5 }: { count?: number }) {
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={90} height={36} borderRadius={18} />
      ))}
    </View>
  );
}

/**
 * Skeleton for article/content cards in horizontal scroll
 */
export function SkeletonArticleCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ width: 240, borderRadius: 12, overflow: 'hidden' }, style]}>
      <Skeleton width="100%" height={144} borderRadius={12} />
    </View>
  );
}

/**
 * Skeleton for Learn screen categories grid
 */
export function SkeletonCategoryGrid({ count = 6 }: { count?: number }) {
  const { isDark } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            width: '48%',
            borderRadius: 12,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Skeleton width={48} height={48} borderRadius={8} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
            <Skeleton width="60%" height={10} />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Skeleton for featured video cards (horizontal scroll)
 */
export function SkeletonVideoCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ width: 288, borderRadius: 12, overflow: 'hidden' }, style]}>
      <Skeleton width="100%" height={160} borderRadius={12} />
    </View>
  );
}

/**
 * Skeleton for video category chips (horizontal scroll)
 */
export function SkeletonVideoCategoryCard({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          width: 140,
          padding: 16,
          borderRadius: 12,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        style,
      ]}
    >
      <Skeleton width={40} height={40} borderRadius={8} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 4 }} />
      <Skeleton width="50%" height={10} />
    </View>
  );
}

/**
 * Skeleton for article list items with image
 */
export function SkeletonArticleListItem({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        style,
      ]}
    >
      <Skeleton width={96} height={96} borderRadius={0} />
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Skeleton width={60} height={18} borderRadius={9} style={{ marginBottom: 8 }} />
        <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="70%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={10} />
      </View>
    </View>
  );
}

/**
 * Skeleton for video list items with thumbnail
 */
export function SkeletonVideoListItem({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        style,
      ]}
    >
      <Skeleton width="100%" height={192} borderRadius={0} />
      <View style={{ padding: 16 }}>
        <Skeleton width="90%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={16} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Skeleton width={80} height={12} style={{ marginRight: 12 }} />
          <Skeleton width={60} height={12} />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for road sign list items
 */
export function SkeletonRoadSignItem({ style }: { style?: ViewStyle }) {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          padding: 16,
          borderRadius: 12,
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        },
        style,
      ]}
    >
      <Skeleton width={80} height={80} borderRadius={12} style={{ marginRight: 16 }} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Skeleton width={80} height={10} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={12} style={{ marginBottom: 4 }} />
        <Skeleton width="70%" height={12} />
      </View>
      <View style={{ justifyContent: 'center' }}>
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

/**
 * Skeleton for article detail screen
 */
export function SkeletonArticleDetail() {
  const { isDark } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      {/* Header image */}
      <Skeleton width="100%" height={256} borderRadius={0} />

      {/* Content */}
      <View style={{ padding: 16 }}>
        {/* Category & read time */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Skeleton width={80} height={22} borderRadius={11} style={{ marginRight: 12 }} />
          <Skeleton width={60} height={14} />
        </View>

        {/* Title */}
        <Skeleton width="95%" height={24} style={{ marginBottom: 8 }} />
        <Skeleton width="75%" height={24} style={{ marginBottom: 24 }} />

        {/* Author */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
          <View>
            <Skeleton width={120} height={14} style={{ marginBottom: 4 }} />
            <Skeleton width={80} height={12} />
          </View>
        </View>

        {/* Content paragraphs */}
        {Array.from({ length: 4 }).map((_, i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="80%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Skeleton for Learn main screen
 */
export function SkeletonLearnScreen() {
  const { isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
      {/* Header skeleton */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        <Skeleton width={80} height={28} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={44} borderRadius={22} />
      </View>

      {/* Categories grid */}
      <View style={{ paddingBottom: 24 }}>
        <SkeletonCategoryGrid count={6} />
      </View>

      {/* Quiz banner skeleton */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <Skeleton width="100%" height={120} borderRadius={16} />
      </View>

      {/* Featured videos section */}
      <View style={{ paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 }}>
          <Skeleton width={120} height={18} />
          <Skeleton width={60} height={14} />
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12 }}>
          <SkeletonVideoCard />
          <SkeletonVideoCard />
        </View>
      </View>

      {/* Video categories section */}
      <View style={{ paddingBottom: 24 }}>
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Skeleton width={140} height={18} />
        </View>
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, gap: 12 }}>
          <SkeletonVideoCategoryCard />
          <SkeletonVideoCategoryCard />
          <SkeletonVideoCategoryCard />
        </View>
      </View>

      {/* Recent articles section */}
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Skeleton width={120} height={18} />
          <Skeleton width={60} height={14} />
        </View>
        <View style={{ gap: 12 }}>
          <SkeletonArticleListItem />
          <SkeletonArticleListItem />
          <SkeletonArticleListItem />
        </View>
      </View>
    </View>
  );
}

/**
 * Skeleton for Articles list screen
 */
export function SkeletonArticlesScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonArticleListItem key={i} />
        ))}
      </View>
    </View>
  );
}

/**
 * Skeleton for Videos list screen
 */
export function SkeletonVideosScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, gap: 16 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonVideoListItem key={i} />
      ))}
    </View>
  );
}

/**
 * Skeleton for Road Signs screen
 */
export function SkeletonRoadSignsScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, gap: 12 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRoadSignItem key={i} />
      ))}
    </View>
  );
}

export default Skeleton;
