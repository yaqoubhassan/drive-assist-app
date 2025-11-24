import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/common';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'auto-fix-high',
    title: 'AI-Powered Diagnostics',
    description:
      'Upload photos or describe your car issue. Get instant AI analysis and solutions tailored to your vehicle.',
    backgroundColor: '#3B82F6',
  },
  {
    id: '2',
    icon: 'location-on',
    title: 'Find Local Experts',
    description:
      'Connect with verified mechanics near you. Compare reviews, prices, and get the best service for your car.',
    backgroundColor: '#10B981',
  },
  {
    id: '3',
    icon: 'school',
    title: 'Learn & Stay Safe',
    description:
      'Access road signs, maintenance guides, and driving tips anytime. Keep your car running smoothly.',
    backgroundColor: '#F59E0B',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/welcome');
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/welcome');
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View className="flex-1 items-center justify-center px-8" style={{ width }}>
      {/* Icon Circle */}
      <View
        className="h-48 w-48 rounded-full items-center justify-center mb-10"
        style={{ backgroundColor: item.backgroundColor + '20' }}
      >
        <View
          className="h-32 w-32 rounded-full items-center justify-center"
          style={{ backgroundColor: item.backgroundColor }}
        >
          <MaterialIcons name={item.icon} size={64} color="#FFFFFF" />
        </View>
      </View>

      {/* Title */}
      <Text
        className={`text-3xl font-bold text-center mb-4 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}
      >
        {item.title}
      </Text>

      {/* Description */}
      <Text
        className={`text-lg text-center leading-relaxed ${
          isDark ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {item.description}
      </Text>
    </View>
  );

  const renderPagination = () => (
    <View className="flex-row justify-center items-center gap-2 my-8">
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            className="h-2 rounded-full bg-primary-500"
            style={{ width: dotWidth, opacity }}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      {/* Skip Button */}
      <View className="flex-row justify-end px-6 pt-4">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-primary-500 font-semibold text-base">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
        bounces={false}
        className="flex-1"
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Bottom Actions */}
      <View className="px-6 pb-8">
        <Button
          title={isLastSlide ? 'Get Started' : 'Next'}
          onPress={handleNext}
          icon={isLastSlide ? 'arrow-forward' : undefined}
          iconPosition="right"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
