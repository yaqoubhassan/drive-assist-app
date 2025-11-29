import React from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Expert } from '../../services/expert';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  const openMaps = async () => {
    if (profile?.location?.latitude && profile?.location?.longitude) {
      const lat = profile.location.latitude;
      const lng = profile.location.longitude;
      const label = encodeURIComponent(profile?.business_name || expert.full_name || 'Expert Location');

      // Try different map URL schemes based on platform
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

      // If no URL scheme works, show an alert with the address
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
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableOpacity
          className="absolute inset-0 bg-black/50"
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet Content */}
        <View
          className={`rounded-t-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
          style={{ maxHeight: SCREEN_HEIGHT * 0.75 }}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10"
          >
            <MaterialIcons
              name="close"
              size={24}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>

          <ScrollView className="px-5 pb-8" showsVerticalScrollIndicator={false}>
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
