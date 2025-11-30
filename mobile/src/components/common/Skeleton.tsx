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

export default Skeleton;
