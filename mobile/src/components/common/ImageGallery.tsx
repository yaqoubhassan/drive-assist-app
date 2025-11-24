import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  visible,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (visible && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: initialIndex * SCREEN_WIDTH,
        animated: false,
      });
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: newIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(newIndex);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: newIndex * SCREEN_WIDTH,
        animated: true,
      });
      setCurrentIndex(newIndex);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.9)" barStyle="light-content" />
      <View className="flex-1 bg-black/95">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
          <TouchableOpacity
            onPress={onClose}
            className="h-10 w-10 rounded-full bg-white/10 items-center justify-center"
          >
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white font-semibold">
            {currentIndex + 1} / {images.length}
          </Text>
          <TouchableOpacity className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
            <MaterialIcons name="share" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Image Viewer */}
        <View className="flex-1 justify-center">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{ alignItems: 'center' }}
          >
            {images.map((image, index) => (
              <View
                key={index}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.6 }}
                className="items-center justify-center"
              >
                <Image
                  source={{ uri: image }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.6 }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <TouchableOpacity
                  onPress={goToPrevious}
                  className="absolute left-4 h-12 w-12 rounded-full bg-white/20 items-center justify-center"
                  style={{ top: '50%', marginTop: -24 }}
                >
                  <MaterialIcons name="chevron-left" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              {currentIndex < images.length - 1 && (
                <TouchableOpacity
                  onPress={goToNext}
                  className="absolute right-4 h-12 w-12 rounded-full bg-white/20 items-center justify-center"
                  style={{ top: '50%', marginTop: -24 }}
                >
                  <MaterialIcons name="chevron-right" size={32} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <View className="pb-8">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                gap: 8,
                justifyContent: 'center',
                flexGrow: 1,
              }}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    scrollViewRef.current?.scrollTo({
                      x: index * SCREEN_WIDTH,
                      animated: true,
                    });
                    setCurrentIndex(index);
                  }}
                  className={`h-16 w-16 rounded-lg overflow-hidden border-2 ${
                    currentIndex === index ? 'border-white' : 'border-transparent opacity-50'
                  }`}
                >
                  <Image
                    source={{ uri: image }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && images.length <= 5 && (
          <View className="flex-row items-center justify-center pb-4 gap-2">
            {images.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  currentIndex === index ? 'w-6 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

// Thumbnail Grid Component for displaying multiple images
interface ImageThumbnailGridProps {
  images: string[];
  maxDisplay?: number;
  onPress?: (index: number) => void;
}

export const ImageThumbnailGrid: React.FC<ImageThumbnailGridProps> = ({
  images,
  maxDisplay = 4,
  onPress,
}) => {
  const displayImages = images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(0)}
        className="rounded-xl overflow-hidden"
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: images[0] }}
          className="w-full h-48"
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  if (images.length === 2) {
    return (
      <View className="flex-row gap-2">
        {displayImages.map((image, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onPress?.(index)}
            className="flex-1 rounded-xl overflow-hidden"
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: image }}
              className="w-full h-32"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={() => onPress?.(0)}
        className="flex-1 rounded-xl overflow-hidden"
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: displayImages[0] }}
          className="w-full h-32"
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View className="flex-1 gap-2">
        <View className="flex-row gap-2">
          {displayImages.slice(1, 3).map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => onPress?.(index + 1)}
              className="flex-1 rounded-xl overflow-hidden"
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: image }}
                className="w-full h-[62px]"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
        {displayImages.length >= 4 && (
          <TouchableOpacity
            onPress={() => onPress?.(3)}
            className="flex-1 rounded-xl overflow-hidden relative"
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: displayImages[3] }}
              className="w-full h-[62px]"
              resizeMode="cover"
            />
            {remainingCount > 0 && (
              <View className="absolute inset-0 bg-black/50 items-center justify-center">
                <Text className="text-white text-lg font-bold">+{remainingCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
