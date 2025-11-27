import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Avatar, Rating, Chip, Button } from '../../../src/components/common';

interface Review {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
  job: string;
  helpful: number;
  response?: string;
}

const mockReviews: Review[] = [
  {
    id: '1',
    customer: 'Kwame Asante',
    rating: 5,
    comment: 'Excellent work on my engine! He diagnosed the issue quickly and fixed it the same day. Very professional and reasonably priced. Highly recommend!',
    date: 'Nov 20, 2024',
    job: 'Engine Repair',
    helpful: 12,
    response: 'Thank you for your kind words! It was a pleasure working on your car.',
  },
  {
    id: '2',
    customer: 'Ama Serwaa',
    rating: 5,
    comment: 'Great service! Replaced my brake pads quickly and at a fair price. Will definitely use again.',
    date: 'Nov 18, 2024',
    job: 'Brake Replacement',
    helpful: 8,
  },
  {
    id: '3',
    customer: 'Kofi Mensah',
    rating: 4,
    comment: 'Good job fixing my AC. It\'s working perfectly now. Could have communicated the timeline better but overall satisfied.',
    date: 'Nov 15, 2024',
    job: 'AC Repair',
    helpful: 5,
  },
  {
    id: '4',
    customer: 'Yaw Boateng',
    rating: 5,
    comment: 'The best mechanic I\'ve used in Accra! Fixed my transmission issue that other mechanics couldn\'t solve. Worth every cedi.',
    date: 'Nov 12, 2024',
    job: 'Transmission Repair',
    helpful: 15,
  },
  {
    id: '5',
    customer: 'Abena Pokua',
    rating: 5,
    comment: 'Very knowledgeable and honest. He could have charged me more but gave me a fair quote. Car runs great now!',
    date: 'Nov 10, 2024',
    job: 'Engine Diagnostic',
    helpful: 9,
  },
];

const filters = [
  { id: 'all', label: 'All Reviews' },
  { id: '5', label: '5 Stars' },
  { id: '4', label: '4 Stars' },
  { id: '3', label: '3 Stars' },
];

export default function ReviewsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const handleReplyPress = (review: Review) => {
    setSelectedReview(review);
    setReplyText('');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !selectedReview) return;

    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update the review with the response
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === selectedReview.id
          ? { ...review, response: replyText.trim() }
          : review
      )
    );

    setSubmitting(false);
    setShowReplyModal(false);
    setSelectedReview(null);
    setReplyText('');
    Alert.alert('Success', 'Your reply has been posted successfully.');
  };

  const filteredReviews = selectedFilter === 'all'
    ? reviews
    : reviews.filter((review) => review.rating.toString() === selectedFilter);

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / totalReviews) * 100,
  }));

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
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
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Reviews
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Rating Summary */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center">
              {/* Average Rating */}
              <View className="items-center pr-6 border-r border-slate-200 dark:border-slate-700">
                <Text className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {averageRating.toFixed(1)}
                </Text>
                <Rating value={averageRating} size="sm" />
                <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {totalReviews} reviews
                </Text>
              </View>

              {/* Rating Breakdown */}
              <View className="flex-1 pl-6 gap-1.5">
                {ratingBreakdown.map((item) => (
                  <View key={item.star} className="flex-row items-center">
                    <Text className={`w-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.star}
                    </Text>
                    <MaterialIcons name="star" size={12} color="#F59E0B" />
                    <View className={`flex-1 h-2 mx-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <View
                        className="h-full rounded-full bg-yellow-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </View>
                    <Text className={`w-6 text-xs text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.count}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>

        {/* Filter */}
        <View className="px-4 mb-4">
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

        {/* Reviews List */}
        <View className="px-4 pb-8">
          <View className="gap-3">
            {filteredReviews.map((review) => (
              <Card key={review.id} variant="default">
                {/* Review Header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center">
                    <Avatar size="md" name={review.customer} />
                    <View className="ml-3">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {review.customer}
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {review.job} • {review.date}
                      </Text>
                    </View>
                  </View>
                  <Rating value={review.rating} size="sm" />
                </View>

                {/* Review Comment */}
                <Text className={`leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {review.comment}
                </Text>

                {/* Expert Response */}
                {review.response && (
                  <View className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="reply" size={16} color="#3B82F6" />
                      <Text className="text-primary-500 font-semibold text-sm ml-1">
                        Your Response
                      </Text>
                    </View>
                    <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {review.response}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View className={`flex-row items-center justify-between mt-3 pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <View className="flex-row items-center">
                    <MaterialIcons name="thumb-up" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {review.helpful} found helpful
                    </Text>
                  </View>
                  {!review.response && (
                    <TouchableOpacity
                      onPress={() => handleReplyPress(review)}
                      className="flex-row items-center"
                    >
                      <MaterialIcons name="reply" size={16} color="#3B82F6" />
                      <Text className="text-primary-500 font-semibold text-sm ml-1">Reply</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Reply Modal */}
      <Modal
        visible={showReplyModal}
        animationType="slide"
        onRequestClose={() => setShowReplyModal(false)}
      >
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View
            className={`flex-row items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
            style={{ paddingTop: insets.top + 16 }}
          >
            <TouchableOpacity
              onPress={() => setShowReplyModal(false)}
              className="h-10 w-10 items-center justify-center"
            >
              <MaterialIcons name="close" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Reply to Review
            </Text>
            <View className="w-10" />
          </View>

          <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
            {/* Original Review */}
            {selectedReview && (
              <View className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <View className="flex-row items-center mb-3">
                  <Avatar size="sm" name={selectedReview.customer} />
                  <View className="ml-3 flex-1">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedReview.customer}
                    </Text>
                    <View className="flex-row items-center">
                      <Rating value={selectedReview.rating} size="xs" />
                      <Text className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedReview.date}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedReview.comment}
                </Text>
              </View>
            )}

            {/* Reply Input */}
            <View className="mb-4">
              <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Your Reply
              </Text>
              <TextInput
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Write a thoughtful reply to this review..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                className={`p-4 rounded-xl border ${isDark
                  ? 'border-slate-600 bg-slate-800 text-white'
                  : 'border-slate-300 bg-white text-slate-900'
                  }`}
                style={{ minHeight: 120 }}
              />
              <Text className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Your reply will be visible to all users viewing this review.
              </Text>
            </View>

            {/* Tips */}
            <View className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
              <View className="flex-row items-center mb-2">
                <MaterialIcons name="lightbulb" size={18} color="#3B82F6" />
                <Text className={`font-semibold ml-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Tips for a great reply
                </Text>
              </View>
              <View className="gap-1">
                <Text className={`text-sm ${isDark ? 'text-blue-400/80' : 'text-blue-600/80'}`}>
                  • Thank the customer for their feedback
                </Text>
                <Text className={`text-sm ${isDark ? 'text-blue-400/80' : 'text-blue-600/80'}`}>
                  • Address any specific concerns mentioned
                </Text>
                <Text className={`text-sm ${isDark ? 'text-blue-400/80' : 'text-blue-600/80'}`}>
                  • Keep it professional and courteous
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View
            className={`px-4 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Button
              title="Post Reply"
              onPress={handleSubmitReply}
              loading={submitting}
              disabled={!replyText.trim()}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
