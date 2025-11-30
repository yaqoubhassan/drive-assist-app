import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Linking, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button, Card, Rating, Badge, Avatar, Chip, Skeleton } from '../../../src/components/common';
import expertService, { Expert, Review } from '../../../src/services/expert';

export default function ExpertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const { userType, isAuthenticated } = useAuth();

  const isGuest = !isAuthenticated || userType === 'guest';

  // Data states
  const [expert, setExpert] = useState<Expert | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  // Fetch expert data
  const fetchExpertData = useCallback(async (refresh: boolean = false) => {
    if (!id) return;

    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [expertData, reviewsData] = await Promise.all([
        expertService.getExpert(parseInt(id)),
        expertService.getExpertReviews(parseInt(id), 1).catch(() => ({ reviews: [], currentPage: 1, lastPage: 1, total: 0 })),
      ]);

      setExpert(expertData);
      setReviews(reviewsData.reviews);
    } catch (error) {
      console.error('Failed to fetch expert data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchExpertData();
    }, [fetchExpertData])
  );

  const onRefresh = useCallback(() => {
    fetchExpertData(true);
  }, [fetchExpertData]);

  const handleContactPress = () => {
    if (isGuest) {
      setShowSignUpModal(true);
    } else if (expert?.profile?.whatsapp_number) {
      Linking.openURL(`tel:${expert.profile.whatsapp_number}`);
    }
  };

  const handleBookAppointment = () => {
    if (isGuest) {
      setShowSignUpModal(true);
    } else {
      router.push({
        pathname: '/(driver)/booking',
        params: { expertId: id },
      });
    }
  };

  const handleDirections = () => {
    if (expert?.profile?.address) {
      const address = encodeURIComponent(expert.profile.address);
      Linking.openURL(`https://maps.google.com/?q=${address}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Skeleton Loading Component
  const ExpertDetailSkeleton = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {/* Cover Image Skeleton */}
      <Skeleton width="100%" height={192} borderRadius={0} />

      {/* Profile Header Skeleton */}
      <View className="px-4 -mt-12 items-center">
        <Skeleton width={96} height={96} borderRadius={48} />
        <View className="items-center mt-4 w-full">
          <Skeleton width="60%" height={24} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={16} style={{ marginBottom: 8 }} />
          <View className="flex-row gap-2">
            <Skeleton width={80} height={24} borderRadius={12} />
            <Skeleton width={80} height={24} borderRadius={12} />
          </View>
        </View>

        {/* Quick Info Skeleton */}
        <View className="flex-row justify-around py-6 w-full">
          {[1, 2, 3].map((i) => (
            <View key={i} className="items-center">
              <Skeleton width={24} height={24} borderRadius={12} style={{ marginBottom: 4 }} />
              <Skeleton width={40} height={16} style={{ marginBottom: 4 }} />
              <Skeleton width={50} height={12} />
            </View>
          ))}
        </View>

        {/* Action Buttons Skeleton */}
        <View className="flex-row gap-3 w-full">
          <Skeleton width="48%" height={44} borderRadius={12} />
          <Skeleton width="48%" height={44} borderRadius={12} />
        </View>
      </View>

      {/* About Skeleton */}
      <View className="px-4 py-6">
        <Skeleton width={80} height={20} style={{ marginBottom: 8 }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="70%" height={14} />
      </View>

      {/* Specialties Skeleton */}
      <View className="px-4 pb-6">
        <Skeleton width={100} height={20} style={{ marginBottom: 12 }} />
        <View className="flex-row flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={80} height={32} borderRadius={16} />
          ))}
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        edges={['top']}
      >
        <ExpertDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (!expert) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        edges={['top']}
      >
        <View className="flex-1 items-center justify-center p-6">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text className={`text-xl font-bold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Expert Not Found
          </Text>
          <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            The expert you're looking for doesn't exist or has been removed.
          </Text>
          <Button title="Go Back" onPress={() => router.back()} className="mt-6" />
        </View>
      </SafeAreaView>
    );
  }

  const profile = expert.profile;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Cover Image */}
        <View className="relative">
          {expert.avatar ? (
            <Image
              source={{ uri: expert.avatar }}
              className="h-48 w-full"
              resizeMode="cover"
            />
          ) : (
            <View className={`h-48 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          )}
          <LinearGradient
            colors={['transparent', isDark ? '#111827' : '#FFFFFF']}
            className="absolute inset-0"
          />

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/50 items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            <TouchableOpacity className="h-10 w-10 rounded-full bg-black/50 items-center justify-center">
              <MaterialIcons name="share" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity className="h-10 w-10 rounded-full bg-black/50 items-center justify-center">
              <MaterialIcons name="bookmark-border" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Header */}
        <View className="px-4 -mt-12">
          <View className="items-center">
            <Avatar
              source={expert.avatar || undefined}
              name={expert.full_name}
              size="xl"
              className="border-4 border-white dark:border-slate-900"
            />
            <View className="items-center mt-4">
              <View className="flex-row items-center gap-2 flex-wrap justify-center">
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile?.business_name || expert.full_name}
                </Text>
                {profile?.is_priority_listed && (
                  <>
                    <MaterialIcons name="verified" size={22} color="#3B82F6" />
                    <View className="bg-amber-500 px-2 py-0.5 rounded">
                      <Text className="text-white text-xs font-bold">PRO</Text>
                    </View>
                  </>
                )}
              </View>
              <Rating
                value={profile?.rating ?? 0}
                reviewCount={profile?.rating_count ?? 0}
                size="md"
                className="mt-1"
              />
              {profile?.specializations && profile.specializations.length > 0 && (
                <View className="flex-row gap-2 mt-2 flex-wrap justify-center">
                  {profile.specializations.slice(0, 3).map((spec) => (
                    <Badge key={spec.id} label={spec.name} variant="success" size="sm" />
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Quick Info */}
          <View className="flex-row justify-around py-6">
            {expert.distance_km !== undefined && (
              <View className="items-center">
                <MaterialIcons name="location-on" size={24} color="#3B82F6" />
                <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {expert.distance_km.toFixed(1)} km
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Away
                </Text>
              </View>
            )}
            <View className="items-center">
              <MaterialIcons
                name="schedule"
                size={24}
                color={profile?.is_available ? '#10B981' : '#EF4444'}
              />
              <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {profile?.is_available ? 'Available' : 'Busy'}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Status
              </Text>
            </View>
            {profile?.experience_years !== undefined && profile.experience_years > 0 && (
              <View className="items-center">
                <MaterialIcons name="work" size={24} color="#F59E0B" />
                <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.experience_years} yrs
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Experience
                </Text>
              </View>
            )}
            {profile?.jobs_completed !== undefined && profile.jobs_completed > 0 && (
              <View className="items-center">
                <MaterialIcons name="check-circle" size={24} color="#10B981" />
                <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {profile.jobs_completed}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Jobs
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button
              title="Contact"
              icon="phone"
              fullWidth
              className="flex-1"
              onPress={handleContactPress}
            />
            <Button
              title="Directions"
              icon="directions"
              variant="secondary"
              className="flex-1"
              onPress={handleDirections}
            />
          </View>
        </View>

        {/* About */}
        {profile?.bio && (
          <View className="px-4 py-6">
            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              About
            </Text>
            <Text className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {profile.bio}
            </Text>
          </View>
        )}

        {/* Specialties */}
        {profile?.specializations && profile.specializations.length > 0 && (
          <View className="px-4 pb-6">
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Specialties
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.specializations.map((specialty) => (
                <Chip key={specialty.id} label={specialty.name} />
              ))}
            </View>
          </View>
        )}

        {/* Location */}
        {profile?.address && (
          <View className="px-4 pb-6">
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Location
            </Text>
            <Card variant="outlined">
              <View className="flex-row items-center">
                <MaterialIcons name="location-on" size={20} color="#3B82F6" />
                <Text className={`ml-2 flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {profile.address}
                  {profile.city && `, ${profile.city}`}
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* Reviews */}
        <View className="px-4 pb-32">
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Reviews ({profile?.rating_count ?? 0})
            </Text>
          </View>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} variant="outlined" className="mb-3">
                <View className="flex-row items-start">
                  <Avatar
                    name={`${review.driver.first_name} ${review.driver.last_name}`}
                    source={review.driver.avatar || undefined}
                    size="sm"
                  />
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center justify-between">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {review.driver.first_name} {review.driver.last_name}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatDate(review.created_at)}
                      </Text>
                    </View>
                    <Rating value={review.rating} showValue={false} size="sm" />
                    {review.comment && (
                      <Text className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        "{review.comment}"
                      </Text>
                    )}
                    {review.expert_response && (
                      <View className={`mt-2 p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                        <Text className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Expert's Response:
                        </Text>
                        <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {review.expert_response}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <View className={`p-6 rounded-xl items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <MaterialIcons name="rate-review" size={40} color={isDark ? '#64748B' : '#94A3B8'} />
              <Text className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No reviews yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View
        className={`absolute bottom-0 left-0 right-0 px-4 py-4 border-t ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'
        }`}
        style={{ paddingBottom: 32 }}
      >
        <View className="flex-row gap-3">
          <Button
            title="Book Appointment"
            icon="event"
            fullWidth
            className="flex-1"
            onPress={handleBookAppointment}
          />
          <Button
            title="Contact"
            icon="phone"
            variant="secondary"
            className="flex-1"
            onPress={handleContactPress}
          />
        </View>
      </View>

      {/* Sign Up Prompt Modal */}
      <Modal
        visible={showSignUpModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignUpModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <View className="items-center mb-4">
              <View className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                <MaterialIcons name="lock-outline" size={32} color="#3B82F6" />
              </View>
              <Text className={`text-xl font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Sign In Required
              </Text>
              <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Create a free account or sign in to contact experts and book appointments.
              </Text>
            </View>
            <View className="gap-3">
              <Button
                title="Sign Up Free"
                fullWidth
                onPress={() => {
                  setShowSignUpModal(false);
                  router.push('/(auth)/sign-up');
                }}
              />
              <Button
                title="Sign In"
                variant="secondary"
                fullWidth
                onPress={() => {
                  setShowSignUpModal(false);
                  router.push('/(auth)/sign-in');
                }}
              />
              <TouchableOpacity onPress={() => setShowSignUpModal(false)} className="py-2">
                <Text className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Maybe later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
