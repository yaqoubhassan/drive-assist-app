import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../src/context/ThemeContext';
import { Badge, Button } from '../../../../src/components/common';

const articles: Record<string, {
  id: string;
  title: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  image: string;
  content: string[];
  relatedArticles: { id: string; title: string; image: string }[];
}> = {
  '1': {
    id: '1',
    title: 'Winter Car Prep Checklist',
    category: 'Maintenance',
    readTime: '5 min read',
    author: 'DriveAssist Team',
    date: 'Nov 20, 2024',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800',
    content: [
      'As the harmattan season approaches in Ghana, it\'s essential to prepare your vehicle for the dusty, dry conditions. While we don\'t experience snow, the harmattan brings its own challenges for your car.',
      '## Check Your Air Filter',
      'The dusty harmattan winds can clog your air filter quickly. A clean air filter ensures optimal engine performance and fuel efficiency. Check it monthly during harmattan season and replace if necessary.',
      '## Battery Maintenance',
      'Extreme temperature fluctuations can affect battery performance. Have your battery tested to ensure it\'s holding charge properly. Clean any corrosion from terminals using a mixture of baking soda and water.',
      '## Windshield and Wipers',
      'Dust accumulation on your windshield can impair visibility. Ensure your windshield washer fluid is full and your wipers are in good condition. Consider using a rain repellent treatment for easier cleaning.',
      '## Tire Pressure Check',
      'Temperature changes affect tire pressure. Check your tires weekly and maintain the recommended PSI found on your door jamb sticker. Properly inflated tires improve fuel economy and safety.',
      '## Cooling System',
      'Despite cooler mornings, afternoons can still be hot. Ensure your coolant level is adequate and the radiator is functioning properly. Overheating is a common issue year-round in Ghana.',
      '## Interior Protection',
      'Use sunshades when parked and consider seat covers to protect your interior from dust and UV damage. Regular interior cleaning during harmattan helps maintain your vehicle\'s value.',
    ],
    relatedArticles: [
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
      { id: '3', title: 'How to Check Your Oil Level', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
    ],
  },
  '2': {
    id: '2',
    title: 'Understanding Dashboard Warning Lights',
    category: 'Education',
    readTime: '8 min read',
    author: 'DriveAssist Team',
    date: 'Nov 18, 2024',
    image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800',
    content: [
      'Your car\'s dashboard warning lights are its way of communicating with you. Understanding what each light means can help you address issues before they become serious problems.',
      '## Check Engine Light',
      'This is perhaps the most common and most misunderstood warning light. It can indicate anything from a loose gas cap to a serious engine problem. When this light comes on, don\'t panic, but do get it checked soon.',
      '## Oil Pressure Warning',
      'If this light comes on while driving, pull over safely and turn off your engine immediately. Low oil pressure can cause severe engine damage. Check your oil level and add if necessary before restarting.',
      '## Battery/Charging Alert',
      'This light indicates an issue with your vehicle\'s charging system. It could be a failing battery, alternator, or loose connection. Have it checked to avoid being stranded.',
      '## Temperature Warning',
      'An overheating engine can cause catastrophic damage. If this light comes on, pull over safely, turn off your engine, and let it cool before checking coolant levels. Never remove the radiator cap when hot.',
      '## Brake System Warning',
      'This could indicate low brake fluid, worn brake pads, or a more serious brake system issue. Don\'t ignore this light - your brakes are critical for safety.',
      '## ABS Warning',
      'The Anti-lock Braking System light indicates an issue with this safety feature. Your regular brakes should still work, but have the ABS system checked soon.',
      '## Tire Pressure Monitor',
      'Modern vehicles monitor tire pressure. This light indicates one or more tires are significantly under-inflated. Check and inflate all tires to the recommended pressure.',
    ],
    relatedArticles: [
      { id: '1', title: 'Winter Car Prep Checklist', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
      { id: '5', title: 'Signs Your Brakes Need Attention', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
    ],
  },
  '3': {
    id: '3',
    title: 'How to Check Your Oil Level',
    category: 'Beginner',
    readTime: '4 min read',
    author: 'DriveAssist Team',
    date: 'Nov 15, 2024',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=800',
    content: [
      'Checking your oil level is one of the most basic yet important maintenance tasks you can perform. Regular checks can prevent costly engine damage.',
      '## When to Check',
      'Check your oil at least once a month, or before long trips. Always check when the engine is cool or has been off for at least 10 minutes to allow oil to settle.',
      '## Step 1: Locate the Dipstick',
      'Open your hood and find the dipstick - it usually has a yellow or orange handle marked with an oil can symbol. Pull it out completely.',
      '## Step 2: Clean and Reinsert',
      'Wipe the dipstick clean with a rag or paper towel. Insert it fully back into its tube, then pull it out again to get an accurate reading.',
      '## Step 3: Read the Level',
      'The dipstick has markers indicating minimum and maximum levels. Your oil should be between these marks. If it\'s near or below the minimum, add oil.',
      '## Step 4: Check Oil Condition',
      'While you\'re at it, note the oil\'s color and consistency. Fresh oil is amber and transparent. Dark, gritty oil may indicate it\'s time for a change.',
      '## Adding Oil',
      'If needed, add oil through the oil filler cap (not the dipstick tube). Add a little at a time and recheck the level. Don\'t overfill - too much oil can cause problems too.',
      '## Pro Tip',
      'Keep a log of your oil checks and additions. This helps you track if your car is consuming oil, which could indicate a problem.',
    ],
    relatedArticles: [
      { id: '1', title: 'Winter Car Prep Checklist', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400' },
      { id: '4', title: 'Tire Pressure: Why It Matters', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    ],
  },
  '4': {
    id: '4',
    title: 'Tire Pressure: Why It Matters',
    category: 'Safety',
    readTime: '3 min read',
    author: 'DriveAssist Team',
    date: 'Nov 12, 2024',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    content: [
      'Proper tire pressure is crucial for safety, fuel efficiency, and tire longevity. Yet it\'s one of the most overlooked aspects of car maintenance.',
      '## Safety First',
      'Under-inflated tires increase stopping distances and can cause loss of vehicle control. Over-inflated tires reduce the contact patch with the road, decreasing grip.',
      '## Fuel Economy',
      'Properly inflated tires can improve fuel efficiency by up to 3%. With fuel prices in Ghana, this translates to significant savings over time.',
      '## Tire Life',
      'Incorrect pressure causes uneven tire wear. Under-inflation wears the edges, over-inflation wears the center. Either way, you\'ll need new tires sooner.',
      '## How to Check',
      'Use a reliable tire pressure gauge. Check pressure when tires are cold (haven\'t been driven for at least 3 hours). The recommended pressure is on a sticker inside your driver\'s door.',
      '## Check All Four',
      'Don\'t forget to check all four tires, plus your spare. Pressure can vary between tires, even on the same car.',
      '## Temperature Effects',
      'Tire pressure changes with temperature - about 1 PSI for every 10°F change. In Ghana\'s varying temperatures, check more frequently during harmattan season.',
    ],
    relatedArticles: [
      { id: '5', title: 'Signs Your Brakes Need Attention', image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400' },
      { id: '3', title: 'How to Check Your Oil Level', image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400' },
    ],
  },
  '5': {
    id: '5',
    title: 'Signs Your Brakes Need Attention',
    category: 'Safety',
    readTime: '6 min read',
    author: 'DriveAssist Team',
    date: 'Nov 10, 2024',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800',
    content: [
      'Your brakes are the most critical safety system in your vehicle. Recognizing the signs of brake problems can prevent accidents and costly repairs.',
      '## Squealing or Squeaking',
      'A high-pitched squeal when braking usually indicates worn brake pads. Most pads have wear indicators that make this sound when it\'s time for replacement.',
      '## Grinding Sounds',
      'If squealing has progressed to grinding, your brake pads are completely worn and metal is contacting metal. This is dangerous and damages rotors. Get this fixed immediately.',
      '## Vibration or Pulsation',
      'If your brake pedal or steering wheel vibrates when braking, you likely have warped rotors. This happens from excessive heat, often from hard braking.',
      '## Soft or Spongy Pedal',
      'If the brake pedal feels soft or goes further down than usual, you may have air in the brake lines or a brake fluid leak. This is a serious safety concern.',
      '## Car Pulls to One Side',
      'If your car pulls left or right when braking, you may have uneven brake wear, a stuck caliper, or a brake fluid issue on one side.',
      '## Warning Light',
      'Never ignore your brake warning light. It could indicate low brake fluid, worn pads, or a system malfunction.',
      '## Burning Smell',
      'A burning smell after repeated hard braking indicates overheated brakes. Pull over and let them cool. If it persists, have them checked.',
      '## Prevention Tips',
      'Avoid riding your brakes, especially on hills. Allow extra following distance. Replace brake fluid every 2-3 years as it absorbs moisture over time.',
    ],
    relatedArticles: [
      { id: '2', title: 'Understanding Dashboard Warning Lights', image: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400' },
      { id: '4', title: 'Tire Pressure: Why It Matters', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    ],
  },
};

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const article = articles[id || '1'];

  if (!article) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <View className="flex-1 items-center justify-center p-6">
          <Text className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Article not found
          </Text>
          <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title} - DriveAssist`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const renderContent = (content: string[]) => {
    return content.map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return (
          <Text
            key={index}
            className={`text-xl font-bold mt-6 mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {paragraph.replace('## ', '')}
          </Text>
        );
      }
      return (
        <Text
          key={index}
          className={`text-base leading-7 mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
        >
          {paragraph}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative">
          <Image
            source={{ uri: article.image }}
            className="w-full h-64"
            resizeMode="cover"
          />
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 h-10 w-10 rounded-full bg-black/30 items-center justify-center"
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Action Buttons */}
          <View className="absolute top-4 right-4 flex-row gap-2">
            <TouchableOpacity
              onPress={() => setIsBookmarked(!isBookmarked)}
              className="h-10 w-10 rounded-full bg-black/30 items-center justify-center"
            >
              <MaterialIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="h-10 w-10 rounded-full bg-black/30 items-center justify-center"
            >
              <MaterialIcons name="share" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 py-6">
          {/* Category & Read Time */}
          <View className="flex-row items-center gap-3 mb-3">
            <Badge label={article.category} variant="primary" size="sm" />
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {article.readTime}
            </Text>
          </View>

          {/* Title */}
          <Text className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {article.title}
          </Text>

          {/* Author & Date */}
          <View className="flex-row items-center mb-6">
            <View className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center mr-3">
              <MaterialIcons name="auto-stories" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {article.author}
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {article.date}
              </Text>
            </View>
          </View>

          {/* Article Content */}
          <View className="mb-8">
            {renderContent(article.content)}
          </View>

          {/* Related Articles */}
          {article.relatedArticles.length > 0 && (
            <View className="mb-8">
              <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Related Articles
              </Text>
              <View className="gap-3">
                {article.relatedArticles.map((related) => (
                  <TouchableOpacity
                    key={related.id}
                    onPress={() => router.push(`/(driver)/learn/article/${related.id}`)}
                    className={`flex-row rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                  >
                    <Image
                      source={{ uri: related.image }}
                      className="h-20 w-20"
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-4 justify-center">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {related.title}
                      </Text>
                    </View>
                    <View className="items-center justify-center pr-4">
                      <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Button
          title="Ask DriveAssist About This Topic"
          onPress={() => router.push('/(driver)/diagnose')}
          leftIcon="smart-toy"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
