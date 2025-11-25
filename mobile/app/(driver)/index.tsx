import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Image, Platform, ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, Chip, IconButton, Button } from '../../src/components/common';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const quickCategories = [
  { id: 'engine', label: 'Engine', icon: 'settings' as const },
  { id: 'brakes', label: 'Brakes', icon: 'warning' as const },
  { id: 'tires', label: 'Tires', icon: 'tire-repair' as const },
  { id: 'battery', label: 'Battery', icon: 'battery-charging-full' as const },
  { id: 'electrical', label: 'Electrical', icon: 'electrical-services' as const },
];

// Mock data for authenticated users (will come from API later)
const mockRecentDiagnoses = [
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

const mockVehicles = [
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
  const { user, userType } = useAuth();

  const isGuest = userType === 'guest';
  const firstName = isGuest ? 'Guest' : (user?.fullName?.split(' ')[0] || 'Driver');

  // For guests, show empty arrays. For authenticated users, show mock data
  const recentDiagnoses = isGuest ? [] : mockRecentDiagnoses;
  const vehicles = isGuest ? [] : mockVehicles;

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* Guest Banner */}
        {isGuest && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            className="mx-4 mt-4 p-4 rounded-xl bg-primary-500/10 flex-row items-center"
          >
            <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-3">
              <MaterialIcons name="person-add" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Welcome, Guest!
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Sign up to unlock all features
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#3B82F6" />
          </TouchableOpacity>
        )}

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
            className="p-5"
            style={{ borderRadius: 16, overflow: 'hidden' }}  // 16 = rounded-2xl
          >
            {/* Decorative circles */}
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <View className="absolute -left-12 -bottom-16 h-40 w-40 rounded-full bg-white/10" />

            <View className={`relative z-10 ${Platform.OS === 'ios' ? 'p-5' : ''}`}>
              <Text className="text-white text-lg font-bold mb-3">
                What can we help with today?
              </Text>

              {/* Replace gap with margin-based spacing */}
              <View className="flex-row flex-wrap" style={{ margin: -4 }}>
                <View style={{ padding: 4, flexGrow: 1, flexBasis: 140 }}>
                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/diagnose')}
                    className="flex-row items-center justify-center h-11 bg-white/90 rounded-xl px-3"
                    style={{ gap: 6 }}
                  >
                    <MaterialIcons name="photo-camera" size={18} color="#1E293B" />
                    <Text className="font-semibold text-slate-900 text-sm" numberOfLines={1}>
                      Diagnose Issue
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ padding: 4, flexGrow: 1, flexBasis: 140 }}>
                  <TouchableOpacity
                    onPress={() => router.push('/(driver)/experts')}
                    className="flex-row items-center justify-center h-11 bg-white/20 rounded-xl px-3"
                    style={{ gap: 6 }}
                  >
                    <MaterialIcons name="search" size={18} color="#FFFFFF" />
                    <Text className="font-semibold text-white text-sm" numberOfLines={1}>
                      Find Expert
                    </Text>
                  </TouchableOpacity>
                </View>
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
            {!isGuest && recentDiagnoses.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(driver)/profile/history')}>
                <Text className="text-primary-500 font-semibold text-sm">
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="px-4 gap-3">
            {recentDiagnoses.length === 0 ? (
              <Card variant="outlined" padding="lg">
                <View className="items-center py-4">
                  <View className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <MaterialIcons name="search" size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                  <Text className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    No Diagnoses Yet
                  </Text>
                  <Text className={`text-sm text-center mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isGuest
                      ? 'Sign up to save your diagnosis history and track your vehicle health.'
                      : 'Start your first diagnosis to get AI-powered insights about your vehicle.'
                    }
                  </Text>
                  {isGuest ? (
                    <Button
                      title="Sign Up Free"
                      variant="primary"
                      size="sm"
                      onPress={() => router.push('/(auth)/sign-up')}
                    />
                  ) : (
                    <Button
                      title="Start Diagnosis"
                      variant="primary"
                      size="sm"
                      icon="add"
                      onPress={() => router.push('/(driver)/diagnose')}
                    />
                  )}
                </View>
              </Card>
            ) : (
              recentDiagnoses.map((diagnosis) => (
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
              ))
            )}
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
            {!isGuest && (
              <TouchableOpacity
                className="flex-row items-center gap-1"
                onPress={() => router.push('/(driver)/profile/vehicle-edit')}
              >
                <MaterialIcons name="add" size={18} color="#3B82F6" />
                <Text className="text-primary-500 font-semibold text-sm">
                  Add Vehicle
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {vehicles.length === 0 ? (
            <View className="px-4">
              <Card variant="outlined" padding="lg">
                <View className="items-center py-4">
                  <View className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <MaterialIcons name="directions-car" size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                  <Text className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    No Vehicles Added
                  </Text>
                  <Text className={`text-sm text-center mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {isGuest
                      ? 'Sign up to add your vehicles and get personalized diagnoses.'
                      : 'Add your vehicle to get more accurate diagnosis results.'
                    }
                  </Text>
                  {isGuest ? (
                    <Button
                      title="Sign Up Free"
                      variant="primary"
                      size="sm"
                      onPress={() => router.push('/(auth)/sign-up')}
                    />
                  ) : (
                    <Button
                      title="Add Vehicle"
                      variant="primary"
                      size="sm"
                      icon="add"
                      onPress={() => router.push('/(driver)/profile/vehicle-edit')}
                    />
                  )}
                </View>
              </Card>
            </View>
          ) : (
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
          )}
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
