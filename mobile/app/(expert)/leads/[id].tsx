import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useAlert } from '../../../src/context/AlertContext';
import { Card, Avatar, Badge, Button } from '../../../src/components/common';

const leadData: Record<string, {
  id: string;
  name: string;
  phone: string;
  email: string;
  issue: string;
  category: string;
  vehicle: { make: string; model: string; year: number; plate: string };
  location: { address: string; distance: string; coordinates: { lat: number; lng: number } };
  time: string;
  urgency: 'high' | 'medium' | 'low';
  description: string;
  photos: string[];
  aiDiagnosis: { issue: string; confidence: number; estimatedCost: { min: number; max: number } };
}> = {
  '1': {
    id: '1',
    name: 'Kwame Asante',
    phone: '+233 24 123 4567',
    email: 'kwame.asante@email.com',
    issue: 'Engine Overheating',
    category: 'Engine',
    vehicle: { make: 'Toyota', model: 'Corolla', year: 2019, plate: 'GR-1234-20' },
    location: { address: 'East Legon, Accra', distance: '2.3 km', coordinates: { lat: 5.6421, lng: -0.1554 } },
    time: '10 min ago',
    urgency: 'high',
    description: 'My car has been overheating after about 15-20 minutes of driving. The temperature gauge goes all the way to red. I\'ve tried topping up the coolant but it keeps happening. There\'s also a sweet smell coming from the engine bay.',
    photos: [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
    ],
    aiDiagnosis: {
      issue: 'Possible coolant leak or thermostat failure',
      confidence: 85,
      estimatedCost: { min: 300, max: 800 },
    },
  },
};

export default function LeadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isDark } = useTheme();
  const { showSuccess, showConfirm } = useAlert();
  const [accepting, setAccepting] = useState(false);

  const lead = leadData[id || '1'] || leadData['1'];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const handleCall = () => {
    Linking.openURL(`tel:${lead.phone.replace(/\s/g, '')}`);
  };

  const handleMessage = () => {
    Linking.openURL(`sms:${lead.phone.replace(/\s/g, '')}`);
  };

  const handleAccept = async () => {
    setAccepting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setAccepting(false);
    showSuccess(
      'Lead Accepted',
      'You can now contact the customer and schedule the job.',
      () => router.push('/(expert)/jobs')
    );
  };

  const handleDecline = () => {
    showConfirm({
      title: 'Decline Lead',
      message: 'Are you sure you want to decline this lead?',
      variant: 'danger',
      confirmLabel: 'Decline',
      cancelLabel: 'Cancel',
      onConfirm: () => router.back(),
    });
  };

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
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Lead Details
          </Text>
        </View>
        <View className="flex-row items-center">
          <View
            className="h-3 w-3 rounded-full mr-1"
            style={{ backgroundColor: getUrgencyColor(lead.urgency) }}
          />
          <Text
            className="text-sm font-semibold capitalize"
            style={{ color: getUrgencyColor(lead.urgency) }}
          >
            {lead.urgency} Priority
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center mb-4">
              <Avatar size="lg" name={lead.name} />
              <View className="ml-4 flex-1">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lead.name}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Customer • {lead.time}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCall}
                className="flex-1 flex-row items-center justify-center py-3 rounded-lg bg-primary-500"
              >
                <MaterialIcons name="phone" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMessage}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}
              >
                <MaterialIcons name="message" size={20} color={isDark ? '#FFFFFF' : '#111827'} />
                <Text className={`font-semibold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Issue Details */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ISSUE
            </Text>
            <Text className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lead.issue}
            </Text>
            <Badge label={lead.category} variant="info" size="sm" className="self-start mb-4" />

            <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              DESCRIPTION
            </Text>
            <Text className={`text-base leading-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {lead.description}
            </Text>
          </Card>
        </View>

        {/* Vehicle Info */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              VEHICLE
            </Text>
            <View className="flex-row items-center">
              <View
                className="h-14 w-14 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
              >
                <MaterialIcons name="directions-car" size={28} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lead.vehicle.make} {lead.vehicle.model}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lead.vehicle.year} • {lead.vehicle.plate}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Location */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              LOCATION
            </Text>
            <View className="flex-row items-center">
              <View
                className="h-14 w-14 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
              >
                <MaterialIcons name="location-on" size={28} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lead.location.address}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lead.location.distance} away
                </Text>
              </View>
              <TouchableOpacity className="h-10 w-10 rounded-full bg-primary-500 items-center justify-center">
                <MaterialIcons name="directions" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Photos */}
        {lead.photos.length > 0 && (
          <View className="px-4 pb-4">
            <Card variant="default">
              <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                PHOTOS ({lead.photos.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {lead.photos.map((photo, index) => (
                    <TouchableOpacity key={index}>
                      <Image
                        source={{ uri: photo }}
                        className="h-24 w-24 rounded-lg"
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Card>
          </View>
        )}

        {/* AI Diagnosis */}
        <View className="px-4 pb-8">
          <Card variant="default" className="border-2 border-primary-500/20">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="smart-toy" size={20} color="#3B82F6" />
              <Text className={`text-sm font-semibold ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AI DIAGNOSIS
              </Text>
            </View>
            <Text className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {lead.aiDiagnosis.issue}
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center">
                <MaterialIcons name="analytics" size={16} color="#10B981" />
                <Text className="text-green-500 font-semibold ml-1">
                  {lead.aiDiagnosis.confidence}% confidence
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="payments" size={16} color="#F59E0B" />
                <Text className={`ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  GH₵{lead.aiDiagnosis.estimatedCost.min} - GH₵{lead.aiDiagnosis.estimatedCost.max}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className={`flex-row gap-3 px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <TouchableOpacity
          onPress={handleDecline}
          className={`flex-1 py-4 rounded-xl items-center justify-center border ${isDark ? 'border-slate-600' : 'border-slate-300'}`}
        >
          <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Decline
          </Text>
        </TouchableOpacity>
        <Button
          title="Accept Lead"
          onPress={handleAccept}
          loading={accepting}
          className="flex-1"
        />
      </View>
    </SafeAreaView>
  );
}
