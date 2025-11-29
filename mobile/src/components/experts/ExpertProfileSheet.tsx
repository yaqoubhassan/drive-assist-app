import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Linking,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { Expert, Review, expertService } from '../../services/expert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap points as percentages of screen height (from bottom)
const SNAP_POINTS = {
  COLLAPSED: SCREEN_HEIGHT * 0.45, // 45% visible
  HALF: SCREEN_HEIGHT * 0.70,      // 70% visible
  FULL: SCREEN_HEIGHT * 0.92,      // 92% visible (leaving some space at top)
};

interface ExpertProfileSheetProps {
  expert: Expert | null;
  visible: boolean;
  onClose: () => void;
  onContactPress: () => void;
  isGuest?: boolean;
}

export default function ExpertProfileSheet({
  expert,
  visible,
  onClose,
  onContactPress,
  isGuest = false,
}: ExpertProfileSheetProps) {
  const { isDark } = useTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  // Animated values
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const currentSnapPoint = useSharedValue(SNAP_POINTS.COLLAPSED);

  // Reset position when modal opens/closes
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(SCREEN_HEIGHT - SNAP_POINTS.COLLAPSED, {
        damping: 20,
        stiffness: 150,
      });
      currentSnapPoint.value = SNAP_POINTS.COLLAPSED;
      setScrollEnabled(false);

      // Load reviews when opening
      if (expert) {
        loadReviews(expert.id);
      }
    } else {
      translateY.value = SCREEN_HEIGHT;
      setReviews([]);
    }
  }, [visible, expert]);

  const loadReviews = async (expertId: number) => {
    setLoadingReviews(true);
    try {
      const result = await expertService.getExpertReviews(expertId);
      setReviews(result.reviews);
    } catch (error) {
      console.log('Failed to load reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const snapToPoint = useCallback((point: number) => {
    'worklet';
    translateY.value = withSpring(SCREEN_HEIGHT - point, {
      damping: 20,
      stiffness: 150,
    });
    currentSnapPoint.value = point;
    // Enable scroll only when fully expanded
    runOnJS(setScrollEnabled)(point === SNAP_POINTS.FULL);
  }, []);

  const handleClose = useCallback(() => {
    translateY.value = withSpring(SCREEN_HEIGHT, {
      damping: 20,
      stiffness: 150,
    });
    setTimeout(onClose, 200);
  }, [onClose]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Nothing needed on start
    })
    .onUpdate((event) => {
      // Calculate new position
      const newY = SCREEN_HEIGHT - currentSnapPoint.value + event.translationY;
      // Clamp to valid range
      const minY = SCREEN_HEIGHT - SNAP_POINTS.FULL;
      const maxY = SCREEN_HEIGHT;
      translateY.value = Math.max(minY, Math.min(maxY, newY));
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;

      // Determine which snap point to go to based on position and velocity
      if (velocity > 500) {
        // Fast swipe down
        if (currentSnapPoint.value === SNAP_POINTS.FULL) {
          snapToPoint(SNAP_POINTS.HALF);
        } else if (currentSnapPoint.value === SNAP_POINTS.HALF) {
          snapToPoint(SNAP_POINTS.COLLAPSED);
        } else {
          runOnJS(handleClose)();
        }
      } else if (velocity < -500) {
        // Fast swipe up
        if (currentSnapPoint.value === SNAP_POINTS.COLLAPSED) {
          snapToPoint(SNAP_POINTS.HALF);
        } else {
          snapToPoint(SNAP_POINTS.FULL);
        }
      } else {
        // Slow drag - snap to nearest point
        const heightFromBottom = SCREEN_HEIGHT - currentY;
        const points = [SNAP_POINTS.COLLAPSED, SNAP_POINTS.HALF, SNAP_POINTS.FULL];
        let nearestPoint = SNAP_POINTS.COLLAPSED;
        let minDistance = Math.abs(heightFromBottom - SNAP_POINTS.COLLAPSED);

        points.forEach((point) => {
          const distance = Math.abs(heightFromBottom - point);
          if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = point;
          }
        });

        // If dragged below collapsed, close
        if (heightFromBottom < SNAP_POINTS.COLLAPSED * 0.5) {
          runOnJS(handleClose)();
        } else {
          snapToPoint(nearestPoint);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!expert) return null;

  const profile = expert.profile;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <MaterialIcons key={i} name="star" size={18} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <MaterialIcons key={i} name="star-half" size={18} color="#F59E0B" />
        );
      } else {
        stars.push(
          <MaterialIcons
            key={i}
            name="star-border"
            size={18}
            color={isDark ? '#475569' : '#CBD5E1'}
          />
        );
      }
    }

    return stars;
  };

  const renderReviewStars = (rating: number, size: number = 14) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <MaterialIcons
          key={i}
          name={i < rating ? 'star' : 'star-border'}
          size={size}
          color="#F59E0B"
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const openMaps = async () => {
    if (profile?.latitude && profile?.longitude) {
      const lat = profile.latitude;
      const lng = profile.longitude;
      const label = encodeURIComponent(profile?.business_name || expert.full_name || 'Expert Location');

      const schemes = Platform.select({
        ios: [
          `maps://app?daddr=${lat},${lng}&q=${label}`,
          `https://maps.apple.com/?daddr=${lat},${lng}&q=${label}`,
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        ],
        android: [
          `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        ],
        default: [
          `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        ],
      }) || [`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`];

      for (const url of schemes) {
        try {
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
            return;
          }
        } catch (error) {
          // Continue to next URL scheme
        }
      }

      Alert.alert(
        'Location',
        `${profile?.address || ''}\n${profile?.city || ''}\n\nCoordinates: ${lat}, ${lng}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View className="flex-1">
        {/* Backdrop */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/50"
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Draggable Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                right: 0,
                height: SCREEN_HEIGHT,
              },
              animatedStyle,
            ]}
            className={`rounded-t-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-2">
              <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
            </View>

            {/* Drag indicator text */}
            <Text className={`text-center text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Drag up for more details
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              className="absolute top-4 right-4 z-10"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>

            <ScrollView
              className="flex-1 px-5"
              showsVerticalScrollIndicator={false}
              scrollEnabled={scrollEnabled}
              bounces={false}
            >
              {/* Header */}
              <View className="flex-row items-start pt-2">
                {/* Avatar */}
                <View className="mr-4">
                  {expert.avatar ? (
                    <Image
                      source={{ uri: expert.avatar }}
                      className="w-20 h-20 rounded-2xl"
                    />
                  ) : (
                    <View
                      className={`w-20 h-20 rounded-2xl items-center justify-center ${
                        isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-3xl font-bold ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {expert.first_name?.charAt(0) || 'E'}
                      </Text>
                    </View>
                  )}
                  {profile?.is_priority_listed && (
                    <View className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-1">
                      <MaterialIcons name="verified" size={16} color="#FFF" />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View className="flex-1">
                  <Text
                    className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                    numberOfLines={2}
                  >
                    {profile?.business_name || expert.full_name}
                  </Text>

                  {profile?.business_name && (
                    <Text className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {expert.full_name}
                    </Text>
                  )}

                  {/* Rating */}
                  <View className="flex-row items-center mt-2">
                    <View className="flex-row">{renderStars(profile?.rating || 0)}</View>
                    <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {profile?.rating?.toFixed(1) || '0.0'}
                    </Text>
                    <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      ({profile?.rating_count || 0} reviews)
                    </Text>
                  </View>

                  {/* Distance */}
                  {expert.distance_km !== undefined && (
                    <View className="flex-row items-center mt-1">
                      <MaterialIcons name="location-on" size={16} color="#3B82F6" />
                      <Text className="text-primary-500 text-sm ml-1">
                        {expert.distance_km < 1
                          ? `${Math.round(expert.distance_km * 1000)}m away`
                          : `${expert.distance_km.toFixed(1)}km away`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Stats */}
              <View className={`flex-row mt-5 rounded-xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <View className="flex-1 items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {profile?.experience_years || 0}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Years Exp.
                  </Text>
                </View>
                <View className={`w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <View className="flex-1 items-center">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {profile?.jobs_completed || 0}
                  </Text>
                  <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Jobs Done
                  </Text>
                </View>
                <View className={`w-px ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <View className="flex-1 items-center">
                  <View className={`w-3 h-3 rounded-full ${profile?.is_available ? 'bg-green-500' : 'bg-slate-400'}`} />
                  <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {profile?.is_available ? 'Available' : 'Busy'}
                  </Text>
                </View>
              </View>

              {/* Bio */}
              {profile?.bio && (
                <View className="mt-5">
                  <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    About
                  </Text>
                  <Text className={`text-sm leading-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {profile.bio}
                  </Text>
                </View>
              )}

              {/* Specializations */}
              {profile?.specializations && profile.specializations.length > 0 && (
                <View className="mt-5">
                  <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Specializations
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {profile.specializations.map((spec) => (
                      <View
                        key={spec.id}
                        className={`px-3 py-1.5 rounded-full ${
                          isDark ? 'bg-primary-500/20' : 'bg-primary-50'
                        }`}
                      >
                        <Text className="text-sm text-primary-500">{spec.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Location */}
              {(profile?.city || profile?.address) && (
                <View className="mt-5">
                  <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Location
                  </Text>
                  <TouchableOpacity
                    onPress={openMaps}
                    className={`flex-row items-center p-3 rounded-xl ${
                      isDark ? 'bg-slate-800' : 'bg-slate-50'
                    }`}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={24}
                      color={isDark ? '#94A3B8' : '#64748B'}
                    />
                    <View className="flex-1 ml-3">
                      {profile.address && (
                        <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {profile.address}
                        </Text>
                      )}
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {profile.city}
                      </Text>
                    </View>
                    <MaterialIcons
                      name="directions"
                      size={24}
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Working Hours */}
              {profile?.working_hours && (
                <View className="mt-5">
                  <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Working Hours
                  </Text>
                  <View className={`p-3 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    {Object.entries(profile.working_hours).map(([day, hours]) => (
                      <View key={day} className="flex-row justify-between py-1">
                        <Text className={`text-sm capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {day}
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {hours ? `${(hours as any).start} - ${(hours as any).end}` : 'Closed'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Reviews Section */}
              <View className="mt-5">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Reviews ({profile?.rating_count || 0})
                  </Text>
                </View>

                {loadingReviews ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#3B82F6" />
                  </View>
                ) : reviews.length > 0 ? (
                  <View className="gap-3">
                    {reviews.map((review) => (
                      <View
                        key={review.id}
                        className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
                      >
                        <View className="flex-row items-center mb-2">
                          {review.driver?.avatar ? (
                            <Image
                              source={{ uri: review.driver.avatar }}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <View
                              className={`w-10 h-10 rounded-full items-center justify-center ${
                                isDark ? 'bg-slate-700' : 'bg-slate-200'
                              }`}
                            >
                              <Text className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {review.driver?.first_name?.charAt(0) || 'U'}
                              </Text>
                            </View>
                          )}
                          <View className="flex-1 ml-3">
                            <Text className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {review.driver?.first_name} {review.driver?.last_name?.charAt(0)}.
                            </Text>
                            <View className="flex-row items-center">
                              <View className="flex-row">{renderReviewStars(review.rating)}</View>
                              <Text className={`ml-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {formatDate(review.created_at)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        {review.comment && (
                          <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {review.comment}
                          </Text>
                        )}
                        {review.expert_response && (
                          <View className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <Text className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Expert's Response
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              {review.expert_response}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className={`p-6 rounded-xl items-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <MaterialIcons
                      name="rate-review"
                      size={32}
                      color={isDark ? '#475569' : '#94A3B8'}
                    />
                    <Text className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      No reviews yet
                    </Text>
                  </View>
                )}
              </View>

              {/* Contact Button */}
              <TouchableOpacity
                onPress={onContactPress}
                className="mt-6 mb-4 bg-primary-500 rounded-xl py-4 flex-row items-center justify-center"
              >
                <MaterialIcons name="chat" size={20} color="#FFF" />
                <Text className="text-white font-semibold ml-2">
                  {isGuest ? 'Sign Up to Contact' : 'Contact Expert'}
                </Text>
              </TouchableOpacity>

              {/* Guest Note */}
              {isGuest && (
                <Text className={`text-center text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Create an account to message this expert and access their contact details
                </Text>
              )}

              {/* Bottom padding for safe area */}
              <View className="h-8" />
            </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}
