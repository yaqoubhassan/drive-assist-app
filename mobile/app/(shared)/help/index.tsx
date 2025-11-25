import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
const MaterialIcons: any = require('react-native-vector-icons/MaterialIcons').default;
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, SearchBar } from '../../../src/components/common';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How does AI diagnosis work?',
    answer: 'Our AI analyzes your description, photos, and vehicle information to identify potential issues. It compares your symptoms with thousands of known problems to provide accurate diagnoses. The AI considers factors like vehicle make, model, year, and common issues for your specific car.',
    category: 'Diagnosis',
  },
  {
    id: '2',
    question: 'How accurate is the diagnosis?',
    answer: 'Our AI provides a confidence percentage with each diagnosis. Accuracy varies based on the information provided - clear descriptions and photos improve results. For critical issues, we always recommend verification by a certified expert.',
    category: 'Diagnosis',
  },
  {
    id: '3',
    question: 'How do I find a nearby expert?',
    answer: 'Go to the Experts tab and enable location services. You\'ll see experts sorted by distance. You can also use the map view to visualize nearby mechanics. Filter by specialty, rating, or availability to find the right expert.',
    category: 'Experts',
  },
  {
    id: '4',
    question: 'How do I book an appointment?',
    answer: 'Select an expert from the list, view their profile, and tap "Book Appointment". Choose a date and time from their available slots, select a service, and confirm. You\'ll receive a confirmation with the expert\'s contact details.',
    category: 'Booking',
  },
  {
    id: '5',
    question: 'How do payments work?',
    answer: 'DriveAssist facilitates connections between drivers and experts. Payments are typically handled directly with the expert. Some experts accept mobile money (MTN, Vodafone Cash), bank transfers, or cash. Discuss payment options before confirming your appointment.',
    category: 'Payments',
  },
  {
    id: '6',
    question: 'Can I save multiple vehicles?',
    answer: 'Yes! Go to Profile > My Vehicles to add and manage multiple cars. You can set a default vehicle for quicker diagnoses. Each vehicle\'s information is saved for future reference.',
    category: 'Account',
  },
  {
    id: '7',
    question: 'How do I become a verified expert?',
    answer: 'Sign up as an Expert, complete your profile with your qualifications, upload certifications or licenses, and submit for verification. Our team reviews applications within 2-3 business days. Once approved, you\'ll receive a verified badge.',
    category: 'Experts',
  },
  {
    id: '8',
    question: 'What if I\'m not satisfied with an expert\'s service?',
    answer: 'We encourage honest reviews to help the community. If you have a dispute, contact the expert directly first. For unresolved issues, reach out to our support team through the app. We take service quality seriously.',
    category: 'Support',
  },
  {
    id: '9',
    question: 'Is my personal data safe?',
    answer: 'Yes, we take privacy seriously. Your data is encrypted and stored securely. We never share personal information with third parties without consent. You can review and delete your data anytime in Settings > Privacy.',
    category: 'Privacy',
  },
  {
    id: '10',
    question: 'Can I use the app offline?',
    answer: 'Limited features work offline. You can view previously saved diagnoses, articles, and vehicle information. Real-time features like AI diagnosis, expert search, and messaging require an internet connection.',
    category: 'App',
  },
];

const categories = ['All', 'Diagnosis', 'Experts', 'Booking', 'Payments', 'Account', 'Support'];

const contactOptions = [
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    subtitle: 'Chat with support',
    icon: 'chat' as const,
    color: '#25D366',
    action: () => Linking.openURL('https://wa.me/233241234567'),
  },
  {
    id: 'phone',
    title: 'Call Us',
    subtitle: '+233 24 123 4567',
    icon: 'phone' as const,
    color: '#3B82F6',
    action: () => Linking.openURL('tel:+233241234567'),
  },
  {
    id: 'email',
    title: 'Email',
    subtitle: 'support@driveassist.com',
    icon: 'email' as const,
    color: '#F59E0B',
    action: () => Linking.openURL('mailto:support@driveassist.com'),
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center mr-2"
          >
            <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Help & Support
          </Text>
        </View>

        <SearchBar
          placeholder="Search FAQs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View className="px-4 py-4">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Contact Us
          </Text>
          <View className="flex-row gap-3">
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.action}
                className={`flex-1 p-4 rounded-xl items-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              >
                <View
                  className="h-12 w-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: option.color + '20' }}
                >
                  <MaterialIcons name={option.icon} size={24} color={option.color} />
                </View>
                <Text className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {option.title}
                </Text>
                <Text className={`text-xs text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {option.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Categories */}
        <View className="px-4 mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${selectedCategory === category
                    ? 'bg-primary-500'
                    : isDark
                      ? 'bg-slate-800'
                      : 'bg-white'
                  }`}
              >
                <Text
                  className={`font-medium ${selectedCategory === category
                      ? 'text-white'
                      : isDark
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQs */}
        <View className="px-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Frequently Asked Questions
          </Text>
          <View className="gap-3">
            {filteredFAQs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                activeOpacity={0.7}
              >
                <Card variant="default">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {faq.question}
                      </Text>
                      {expandedFAQ === faq.id && (
                        <Text className={`mt-3 leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          {faq.answer}
                        </Text>
                      )}
                    </View>
                    <MaterialIcons
                      name={expandedFAQ === faq.id ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={isDark ? '#64748B' : '#94A3B8'}
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {filteredFAQs.length === 0 && (
            <View className="items-center py-12">
              <MaterialIcons name="search-off" size={48} color={isDark ? '#475569' : '#94A3B8'} />
              <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No Results Found
              </Text>
              <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Try a different search term
              </Text>
            </View>
          )}
        </View>

        {/* Additional Resources */}
        <View className="px-4 pb-8">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Additional Resources
          </Text>
          <Card variant="default" padding="none">
            <TouchableOpacity
              className={`flex-row items-center p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
            >
              <View className="h-10 w-10 rounded-lg bg-primary-500/20 items-center justify-center mr-3">
                <MaterialIcons name="menu-book" size={22} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  User Guide
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Learn how to use DriveAssist
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
            >
              <View className="h-10 w-10 rounded-lg bg-green-500/20 items-center justify-center mr-3">
                <MaterialIcons name="feedback" size={22} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Send Feedback
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Help us improve the app
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-4">
              <View className="h-10 w-10 rounded-lg bg-orange-500/20 items-center justify-center mr-3">
                <MaterialIcons name="bug-report" size={22} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Report a Bug
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Let us know about issues
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
