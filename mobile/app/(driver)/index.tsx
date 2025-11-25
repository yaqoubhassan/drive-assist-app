import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Card, Badge, IconButton, Chip } from '../../src/components/common';
import { formatCurrency } from '../../src/constants';

const quickCategories = [
  { id: 'engine', label: 'Engine', icon: 'settings' as const },
  { id: 'brakes', label: 'Brakes', icon: 'warning' as const },
  { id: 'tires', label: 'Tires', icon: 'tire-repair' as const },
  { id: 'battery', label: 'Battery', icon: 'battery-charging-full' as const },
  { id: 'electrical', label: 'Electrical', icon: 'electrical-services' as const },
];

const recentDiagnoses = [
  {
    id: '1',
    title: 'P0420 - Catalyst System',
    date: 'May 20, 2024',
    status: 'pending' as const,
  },
  {
    id: '2',
    title: 'Brake Fluid Low',
    date: 'May 15, 2024',
    status: 'completed' as const,
  },
];

const vehicles = [
  {
    id: '1',
    name: 'Toyota Camry',
    year: 2018,
    mileage: '45,000 km',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  },
  {
    id: '2',
    name: 'Honda Civic',
    year: 2020,
    mileage: '28,000 km',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
  },
];

const educationalContent = [
  {
    id: '1',
    title: 'Basic Car Maintenance',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400',
  },
  {
    id: '2',
    title: 'Understanding Warning Lights',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400',
  },
  {
    id: '3',
    title: 'Seasonal Car Care Tips',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
];

export default function DriverHomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const firstName = user?.fullName?.split(' ')[0] || 'Driver';

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="location-on" size={20} color="#3B82F6" />
            <View>
              <Text
                className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'
                  }`}
              >
                Hi, {firstName}!
              </Text>
              <Text
                className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
              >
                Accra, Ghana
              </Text>
            </View>
          </View>
          <IconButton icon="notifications" onPress={() => router.push('/(shared)/notifications')} />
        </View>

        {/* Quick Actions Card */}
        <View className="px-4 py-3">
          <LinearGradient
            colors={['#3B82F6', '#10B981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-6 overflow-hidden"
          >
            {/* Decorative circles */}
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <View className="absolute -left-12 -bottom-16 h-40 w-40 rounded-full bg-white/10" />

            <View className="relative z-10">
              <Text className="text-white text-xl font-bold mb-4">
                What can we help with today?
              </Text>
              <View className={`flex-row gap-3 ${Platform.OS === 'ios' ? '' : 'flex-wrap'}`}>
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/diagnose')}
                  className={`flex-row items-center justify-center gap-2 h-12 bg-white/90 rounded-xl px-4 ${Platform.OS === 'ios' ? 'flex-1' : 'flex-1 min-w-[140px]'}`}
                >
                  <MaterialIcons name="photo-camera" size={20} color="#1E293B" />
                  <Text className="font-bold text-slate-900" numberOfLines={1}>Diagnose Issue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/experts')}
                  className={`flex-row items-center justify-center gap-2 h-12 bg-white/20 rounded-xl px-4 ${Platform.OS === 'ios' ? 'flex-1' : 'flex-1 min-w-[140px]'}`}
                >
                  <MaterialIcons name="search" size={20} color="#FFFFFF" />
                  <Text className="font-bold text-white" numberOfLines={1}>Find Expert</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Categories */}
        <View className="pt-4">
          <Text
            className={`text-lg font-bold px-4 pb-3 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            Quick Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {quickCategories.map((category, index) => (
              <Chip
                key={category.id}
                label={category.label}
                icon={category.icon}
                selected={index === 0}
                onPress={() => router.push('/(driver)/diagnose')}
              />
            ))}
          </ScrollView>
        </View>

        {/* Recent Diagnoses */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text
              className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              Recent Diagnoses
            </Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/profile/history')}>
              <Text className="text-primary-500 font-semibold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          <View className="px-4 gap-3">
            {recentDiagnoses.map((diagnosis) => (
              <Card key={diagnosis.id} variant="default" onPress={() => router.push(`/(driver)/diagnose/results?id=${diagnosis.id}`)}>
                <View className="flex-row items-center gap-4">
                  <View
                    className={`h-12 w-12 rounded-full items-center justify-center ${diagnosis.status === 'completed'
                        ? 'bg-green-500/20'
                        : 'bg-orange-500/20'
                      }`}
                  >
                    <MaterialIcons
                      name={diagnosis.status === 'completed' ? 'check-circle' : 'error'}
                      size={24}
                      color={diagnosis.status === 'completed' ? '#22C55E' : '#F97316'}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      {diagnosis.title}
                    </Text>
                    <Text
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                    >
                      {diagnosis.date}
                    </Text>
                  </View>
                  <Badge
                    label={diagnosis.status === 'completed' ? 'Complete' : 'Pending'}
                    variant={diagnosis.status === 'completed' ? 'success' : 'warning'}
                  />
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* My Vehicles */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text
              className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              My Vehicles
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1"
              onPress={() => router.push('/(driver)/profile/vehicle-edit')}
            >
              <MaterialIcons name="add" size={18} color="#3B82F6" />
              <Text className="text-primary-500 font-semibold text-sm">
                Add Vehicle
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          >
            {vehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                variant="default"
                padding="none"
                className="w-64"
                onPress={() => router.push(`/(driver)/profile/vehicle-edit?id=${vehicle.id}`)}
              >
                <View className={`h-28 items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <Image
                    source={{ uri: vehicle.image }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-row items-center justify-between p-4">
                  <View>
                    <Text
                      className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                      {vehicle.year} {vehicle.name}
                    </Text>
                    <Text
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                    >
                      {vehicle.mileage}
                    </Text>
                  </View>
                  <IconButton
                    icon="edit"
                    size="sm"
                    onPress={() => router.push(`/(driver)/profile/vehicle-edit?id=${vehicle.id}`)}
                  />
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Educational Highlights */}
        <View className="pt-6 pb-8">
          <Text
            className={`text-lg font-bold px-4 pb-3 ${isDark ? 'text-white' : 'text-slate-900'
              }`}
          >
            Learn Something New
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
          >
            {educationalContent.map((content) => (
              <TouchableOpacity
                key={content.id}
                className="w-60 h-36 rounded-xl overflow-hidden"
                onPress={() => router.push('/(driver)/learn')}
              >
                <Image
                  source={{ uri: content.image }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  className="absolute inset-0"
                />
                <Text className="absolute bottom-3 left-3 font-bold text-white">
                  {content.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
