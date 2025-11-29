import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Dimensions, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAuth } from '../../../src/context/AuthContext';
import { Button, Card, Rating, Badge, Avatar, Chip } from '../../../src/components/common';
import { formatCurrencyRange } from '../../../src/constants';

const { width: screenWidth } = Dimensions.get('window');

// Mock expert data
const expertData = {
  id: '1',
  name: "Kofi's Auto Repair",
  rating: 4.9,
  reviewCount: 234,
  bio: 'Family-owned auto repair shop serving Accra since 2005. Specializing in Japanese and German vehicles. We pride ourselves on honest, transparent service and customer education.',
  yearsExperience: 18,
  verified: true,
  certifications: ['ASE Certified', 'Licensed', 'Insured'],
  distance: 2.3,
  address: '123 Independence Ave, Osu, Accra',
  phone: '+233 24 123 4567',
  hours: {
    weekday: '8:00 AM - 6:00 PM',
    saturday: '9:00 AM - 3:00 PM',
    sunday: 'Closed',
  },
  currentStatus: 'open',
  specialties: ['Engine Diagnostics', 'Brake Service', 'Electrical Systems', 'Oil Changes'],
  services: [
    { name: 'Oil Change', priceMin: 80, priceMax: 150 },
    { name: 'Brake Pad Replacement', priceMin: 200, priceMax: 400 },
    { name: 'Diagnostic Fee', priceMin: 100, priceMax: 100 },
    { name: 'Engine Tune-Up', priceMin: 300, priceMax: 600 },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=400',
    'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
  ],
  reviews: [
    {
      id: '1',
      author: 'Sarah M.',
      rating: 5,
      date: '3 days ago',
      text: 'Fast and honest service. Kofi explained everything clearly and didn\'t try to upsell me.',
      service: 'Brake Repair',
      helpful: 12,
    },
    {
      id: '2',
      author: 'Kwame A.',
      rating: 5,
      date: '1 week ago',
      text: 'Best mechanic in Accra! Very knowledgeable and fair pricing.',
      service: 'Engine Diagnostics',
      helpful: 8,
    },
  ],
  coverImage: 'https://images.unsplash.com/photo-1580273916550-e323e7a39554?w=800',
  profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
};

export default function ExpertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const { userType, isAuthenticated } = useAuth();

  const isGuest = !isAuthenticated || userType === 'guest';

  // State for modals
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleContactPress = () => {
    if (isGuest) {
      setShowSignUpModal(true);
    } else {
      // Navigate to messaging or make a call
      Linking.openURL(`tel:${expertData.phone}`);
    }
  };

  const handleBookAppointment = () => {
    if (isGuest) {
      setShowSignUpModal(true);
    } else {
      router.push({
        pathname: '/(driver)/booking',
        params: { expertId: expertData.id },
      });
    }
  };

  const handleDirections = () => {
    // Open maps with the expert's address
    const address = encodeURIComponent(expertData.address);
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  };

  const openGallery = (index: number) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
  };

  const handleViewAllPhotos = () => {
    setSelectedImageIndex(0);
    setShowGalleryModal(true);
  };

  const handleViewAllReviews = () => {
    // For now, we'll just scroll or show a message
    // In a full implementation, this would navigate to a reviews screen
    router.push({
      pathname: '/(driver)/experts/reviews',
      params: { expertId: expertData.id },
    });
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View className="relative">
          <Image
            source={{ uri: expertData.coverImage }}
            className="h-48 w-full"
            resizeMode="cover"
          />
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
            <Avatar source={expertData.profileImage} size="xl" className="border-4 border-white dark:border-slate-900" />
            <View className="items-center mt-4">
              <View className="flex-row items-center gap-2">
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {expertData.name}
                </Text>
                {expertData.verified && (
                  <MaterialIcons name="verified" size={22} color="#3B82F6" />
                )}
              </View>
              <Rating value={expertData.rating} reviewCount={expertData.reviewCount} size="md" className="mt-1" />
              <View className="flex-row gap-2 mt-2">
                {expertData.certifications.map((cert) => (
                  <Badge key={cert} label={cert} variant="success" size="sm" />
                ))}
              </View>
            </View>
          </View>

          {/* Quick Info */}
          <View className="flex-row justify-around py-6">
            <View className="items-center">
              <MaterialIcons name="location-on" size={24} color="#3B82F6" />
              <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {expertData.distance} km
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Away
              </Text>
            </View>
            <View className="items-center">
              <MaterialIcons name="schedule" size={24} color="#10B981" />
              <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Open
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Closes 6 PM
              </Text>
            </View>
            <View className="items-center">
              <MaterialIcons name="work" size={24} color="#F59E0B" />
              <Text className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {expertData.yearsExperience} yrs
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Experience
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button title="Contact Expert" icon="phone" fullWidth className="flex-1" onPress={handleContactPress} />
            <Button title="Directions" icon="directions" variant="secondary" className="flex-1" onPress={handleDirections} />
          </View>
        </View>

        {/* About */}
        <View className="px-4 py-6">
          <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            About
          </Text>
          <Text className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {expertData.bio}
          </Text>
        </View>

        {/* Specialties */}
        <View className="px-4 pb-6">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Specialties
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {expertData.specialties.map((specialty) => (
              <Chip key={specialty} label={specialty} />
            ))}
          </View>
        </View>

        {/* Services & Pricing */}
        <View className="px-4 pb-6">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Services & Pricing
          </Text>
          <Card variant="outlined" padding="none">
            {expertData.services.map((service, index) => (
              <View
                key={service.name}
                className={`flex-row justify-between p-4 ${
                  index > 0 ? `border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}` : ''
                }`}
              >
                <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  {service.name}
                </Text>
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatCurrencyRange(service.priceMin, service.priceMax)}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Hours */}
        <View className="px-4 pb-6">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Hours
          </Text>
          <Card variant="outlined">
            <View className="flex-row justify-between mb-2">
              <Text className={isDark ? 'text-slate-300' : 'text-slate-600'}>Monday - Friday</Text>
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {expertData.hours.weekday}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className={isDark ? 'text-slate-300' : 'text-slate-600'}>Saturday</Text>
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {expertData.hours.saturday}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className={isDark ? 'text-slate-300' : 'text-slate-600'}>Sunday</Text>
              <Text className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {expertData.hours.sunday}
              </Text>
            </View>
          </Card>
        </View>

        {/* Gallery */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Photos
            </Text>
            <TouchableOpacity onPress={handleViewAllPhotos}>
              <Text className="text-primary-500 font-semibold">View all ({expertData.gallery.length})</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {expertData.gallery.map((image, index) => (
                <TouchableOpacity key={index} onPress={() => openGallery(index)} activeOpacity={0.8}>
                  <Image
                    source={{ uri: image }}
                    className="h-24 w-24 rounded-xl"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Reviews */}
        <View className="px-4 pb-32">
          <View className="flex-row justify-between items-center mb-3">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Reviews ({expertData.reviewCount})
            </Text>
            <TouchableOpacity onPress={handleViewAllReviews}>
              <Text className="text-primary-500 font-semibold">View all</Text>
            </TouchableOpacity>
          </View>

          {expertData.reviews.map((review) => (
            <Card key={review.id} variant="outlined" className="mb-3">
              <View className="flex-row items-start">
                <Avatar name={review.author} size="sm" />
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center justify-between">
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {review.author}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {review.date}
                    </Text>
                  </View>
                  <Rating value={review.rating} showValue={false} size="sm" />
                  <Text className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    "{review.text}"
                  </Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <Badge label={review.service} variant="info" size="sm" />
                    <TouchableOpacity className="flex-row items-center gap-1">
                      <MaterialIcons name="thumb-up" size={14} color="#64748B" />
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Helpful ({review.helpful})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          ))}
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
          <Button title="Book Appointment" icon="event" fullWidth className="flex-1" onPress={handleBookAppointment} />
          <Button title="Contact" icon="phone" variant="secondary" className="flex-1" onPress={handleContactPress} />
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

      {/* Fullscreen Gallery Modal */}
      <Modal
        visible={showGalleryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGalleryModal(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <SafeAreaView edges={['top']}>
            <View className="flex-row items-center justify-between px-4 py-4">
              <TouchableOpacity
                onPress={() => setShowGalleryModal(false)}
                className="h-10 w-10 rounded-full bg-white/20 items-center justify-center"
              >
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text className="text-white font-semibold">
                {selectedImageIndex + 1} / {expertData.gallery.length}
              </Text>
              <View className="w-10" />
            </View>
          </SafeAreaView>

          {/* Image Viewer */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(index);
            }}
            contentOffset={{ x: selectedImageIndex * screenWidth, y: 0 }}
          >
            {expertData.gallery.map((image, index) => (
              <View key={index} style={{ width: screenWidth }} className="items-center justify-center">
                <Image
                  source={{ uri: image.replace('w=400', 'w=800') }}
                  style={{ width: screenWidth, height: screenWidth }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Thumbnail Navigation */}
          <SafeAreaView edges={['bottom']}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, gap: 8 }}
            >
              {expertData.gallery.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  className={`rounded-lg overflow-hidden ${selectedImageIndex === index ? 'border-2 border-primary-500' : 'opacity-50'}`}
                >
                  <Image
                    source={{ uri: image }}
                    className="h-16 w-16"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
