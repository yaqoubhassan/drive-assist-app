import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Image, Platform, ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Card, Chip, IconButton, Button, Avatar } from '../../src/components/common';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import appointmentService, { Appointment, formatAppointmentDate, getStatusLabel } from '../../src/services/appointment';
import vehicleService, { Vehicle, formatMileage } from '../../src/services/vehicle';
import diagnosisService, { DiagnosisResult } from '../../src/services/diagnosis';
import maintenanceService, { MaintenanceReminder } from '../../src/services/maintenance';
import { articlesService, Article } from '../../src/services/learn';

const quickCategories = [
  { id: 'engine', label: 'Engine', icon: 'settings' as const },
  { id: 'brakes', label: 'Brakes', icon: 'warning' as const },
  { id: 'tires', label: 'Tires', icon: 'tire-repair' as const },
  { id: 'battery', label: 'Battery', icon: 'battery-charging-full' as const },
  { id: 'electrical', label: 'Electrical', icon: 'electrical-services' as const },
];

// Guest-specific content
const popularArticles = [
  {
    id: '1',
    slug: 'how-to-check-engine-oil',
    title: 'How to Check Your Engine Oil',
    category: 'Maintenance',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400',
  },
  {
    id: '2',
    slug: 'understanding-dashboard-warning-lights',
    title: 'Understanding Dashboard Warning Lights',
    category: 'Safety',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400',
  },
  {
    id: '3',
    slug: 'when-to-change-brake-pads',
    title: 'When to Change Your Brake Pads',
    category: 'Brakes',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  },
];

const topExperts = [
  {
    id: '1',
    name: 'AutoFix Ghana',
    specialty: 'Engine & Transmission',
    rating: 4.9,
    reviews: 128,
    distance: '2.3 km',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400',
  },
  {
    id: '2',
    name: 'Kwame Auto Services',
    specialty: 'Electrical & Diagnostics',
    rating: 4.8,
    reviews: 95,
    distance: '3.1 km',
    image: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6d7b6?w=400',
  },
  {
    id: '3',
    name: 'Premium Auto Care',
    specialty: 'Full Service',
    rating: 4.7,
    reviews: 156,
    distance: '4.5 km',
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400',
  },
];

const learnCategories = [
  { id: '1', title: 'Road Signs', icon: 'signpost' as const, color: '#EF4444', route: '/(driver)/learn/road-signs' },
  { id: '2', title: 'Maintenance', icon: 'build' as const, color: '#3B82F6', route: '/(driver)/learn/category/maintenance' },
  { id: '3', title: 'Safety Tips', icon: 'security' as const, color: '#10B981', route: '/(driver)/learn/category/safety' },
  { id: '4', title: 'Driving Tips', icon: 'directions-car' as const, color: '#F59E0B', route: '/(driver)/learn/category/driving' },
];

export default function DriverHomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, userType } = useAuth();

  // State for authenticated users
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisResult[]>([]);
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [articles, setArticles] = useState<Article[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const isGuest = userType === 'guest';
  const firstName = isGuest ? 'Guest' : (user?.fullName?.split(' ')[0] || 'Driver');

  // Fetch all data for authenticated users
  const fetchAllData = useCallback(async () => {
    if (isGuest) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all data in parallel
      const [
        appointmentsResult,
        vehiclesResult,
        diagnosesResult,
        maintenanceResult,
        articlesResult,
      ] = await Promise.allSettled([
        // Appointments
        (async () => {
          const countResponse = await appointmentService.getUpcomingCount();
          const confirmed = await appointmentService.getAppointments({ status: 'confirmed' });
          const pending = await appointmentService.getAppointments({ status: 'pending' });
          return { count: countResponse, confirmed: confirmed.data, pending: pending.data };
        })(),
        // Vehicles
        vehicleService.getVehicles(),
        // Diagnoses
        diagnosisService.getDiagnoses(1),
        // Maintenance
        (async () => {
          const reminders = await maintenanceService.getReminders();
          const dueReminders = reminders.filter(r => r.status === 'due' || r.status === 'overdue');
          return { reminders: dueReminders, count: dueReminders.length };
        })(),
        // Articles (for Learn Something New)
        articlesService.getArticles({ page: 1 }),
      ]);

      // Process appointments
      if (appointmentsResult.status === 'fulfilled') {
        const { count, confirmed, pending } = appointmentsResult.value;
        setAppointmentsCount(count);
        const allUpcoming = [...confirmed, ...pending]
          .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
          .slice(0, 3);
        setUpcomingAppointments(allUpcoming);
      }

      // Process vehicles
      if (vehiclesResult.status === 'fulfilled') {
        setVehicles(vehiclesResult.value);
      }

      // Process diagnoses
      if (diagnosesResult.status === 'fulfilled') {
        setRecentDiagnoses(diagnosesResult.value.diagnoses.slice(0, 3));
      }

      // Process maintenance
      if (maintenanceResult.status === 'fulfilled') {
        setMaintenanceReminders(maintenanceResult.value.reminders);
        setMaintenanceCount(maintenanceResult.value.count);
      }

      // Process articles
      if (articlesResult.status === 'fulfilled') {
        setArticles(articlesResult.value.articles.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch home data:', error);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  // Format diagnosis date
  const formatDiagnosisDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get diagnosis title from AI diagnosis or symptoms
  const getDiagnosisTitle = (diagnosis: DiagnosisResult) => {
    if (diagnosis.ai_diagnosis) {
      // Get first line or first 50 chars of AI diagnosis
      const firstLine = diagnosis.ai_diagnosis.split('\n')[0];
      return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
    }
    return diagnosis.symptoms_description?.substring(0, 50) + '...' || 'Diagnosis';
  };

  // Render guest home screen
  if (isGuest) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
        edges={['top']}
      >
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4">
            <View>
              <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Welcome to DriveAssist
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Your car's smart companion
              </Text>
            </View>
          </View>

          {/* Sign Up CTA Banner */}
          <View className="px-4 py-2">
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, overflow: 'hidden' }}
            >
              <View className="p-5">
                <View className="flex-row items-center mb-3">
                  <View className="h-12 w-12 rounded-full bg-white/20 items-center justify-center mr-3">
                    <MaterialIcons name="auto-awesome" size={24} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                      Unlock Full Access
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Save diagnoses, add vehicles & more
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/sign-up')}
                    className="flex-1 bg-white py-3 rounded-xl items-center"
                  >
                    <Text className="font-bold text-primary-500">Sign Up Free</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/(auth)/sign-in')}
                    className="flex-1 bg-white/20 py-3 rounded-xl items-center"
                  >
                    <Text className="font-bold text-white">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Quick Actions Card */}
          <View className="px-4 py-3">
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, overflow: 'hidden' }}
            >
              <View className="p-5">
                <Text className="text-white text-lg font-bold mb-3">
                  Try Our Free Tools
                </Text>
                <View className="flex-row flex-wrap" style={{ margin: -4 }}>
                  <View style={{ padding: 4, flexGrow: 1, flexBasis: 140 }}>
                    <TouchableOpacity
                      onPress={() => router.push('/(driver)/diagnose')}
                      className="flex-row items-center justify-center h-11 bg-white/90 rounded-xl px-3"
                      style={{ gap: 6 }}
                    >
                      <MaterialIcons name="search" size={18} color="#1E293B" />
                      <Text className="font-semibold text-slate-900 text-sm">AI Diagnosis</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ padding: 4, flexGrow: 1, flexBasis: 140 }}>
                    <TouchableOpacity
                      onPress={() => router.push('/(driver)/experts')}
                      className="flex-row items-center justify-center h-11 bg-white/20 rounded-xl px-3"
                      style={{ gap: 6 }}
                    >
                      <MaterialIcons name="person-search" size={18} color="#FFFFFF" />
                      <Text className="font-semibold text-white text-sm">Find Expert</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Learning Categories */}
          <View className="pt-4">
            <Text className={`text-lg font-bold px-4 pb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Learn & Explore
            </Text>
            <View className="flex-row flex-wrap px-4 gap-3">
              {learnCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => router.push(category.route as any)}
                  className={`flex-row items-center p-4 rounded-xl flex-1 min-w-[45%] ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                  style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
                >
                  <View
                    className="h-10 w-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <MaterialIcons name={category.icon} size={20} color={category.color} />
                  </View>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Top Rated Experts */}
          <View className="pt-6">
            <View className="flex-row items-center justify-between px-4 pb-3">
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Top Rated Experts
              </Text>
              <TouchableOpacity onPress={() => router.push('/(driver)/experts')}>
                <Text className="text-primary-500 font-semibold text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {topExperts.map((expert) => (
                <TouchableOpacity
                  key={expert.id}
                  onPress={() => router.push(`/(driver)/experts/${expert.id}`)}
                  className={`w-72 rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                  style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
                >
                  <View className={`h-24 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <Image source={{ uri: expert.image }} className="h-full w-full" resizeMode="cover" />
                  </View>
                  <View className="p-4">
                    <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {expert.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {expert.specialty}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <View className="flex-row items-center">
                        <MaterialIcons name="star" size={16} color="#F59E0B" />
                        <Text className={`ml-1 font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {expert.rating}
                        </Text>
                        <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({expert.reviews})
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <MaterialIcons name="location-on" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                        <Text className={`ml-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {expert.distance}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Popular Articles */}
          <View className="pt-6">
            <View className="flex-row items-center justify-between px-4 pb-3">
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Popular Articles
              </Text>
              <TouchableOpacity onPress={() => router.push('/(driver)/learn')}>
                <Text className="text-primary-500 font-semibold text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="px-4 gap-3">
              {popularArticles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  onPress={() => router.push(`/(driver)/learn/article/${article.slug}`)}
                  className={`flex-row rounded-xl overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                  style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
                >
                  <Image source={{ uri: article.image }} className="h-24 w-24" resizeMode="cover" />
                  <View className="flex-1 p-3 justify-center">
                    <Text className={`text-xs font-medium text-primary-500 mb-1`}>
                      {article.category}
                    </Text>
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {article.readTime}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom CTA */}
          <View className="px-4 py-8">
            <Card variant="outlined" padding="lg">
              <View className="items-center">
                <View className={`h-16 w-16 rounded-full items-center justify-center mb-4 ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                  <MaterialIcons name="verified-user" size={32} color="#3B82F6" />
                </View>
                <Text className={`text-lg font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Ready to Get Started?
                </Text>
                <Text className={`text-sm text-center mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Create a free account to save your diagnosis history, add your vehicles, and connect with trusted mechanics.
                </Text>
                <Button
                  title="Create Free Account"
                  variant="primary"
                  fullWidth
                  onPress={() => router.push('/(auth)/sign-up')}
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render authenticated user home screen
  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            className="p-5"
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
            <View className="absolute -left-12 -bottom-16 h-40 w-40 rounded-full bg-white/10" />

            <View className={`relative z-10 ${Platform.OS === 'ios' ? 'p-5' : ''}`}>
              <Text className="text-white text-lg font-bold mb-3">
                What can we help with today?
              </Text>

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

        {/* Maintenance Reminder Banner */}
        {maintenanceCount > 0 && (
          <View className="px-4 pt-4">
            <TouchableOpacity
              onPress={() => router.push('/(driver)/profile/reminders')}
              activeOpacity={0.8}
            >
              <View className={`rounded-xl overflow-hidden border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
              }`}>
                <View className="p-4">
                  <View className="flex-row items-center">
                    <View className="h-10 w-10 rounded-full bg-amber-500/20 items-center justify-center mr-3">
                      <MaterialIcons name="event" size={22} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Maintenance Due
                        </Text>
                        <View className="ml-2 bg-amber-500 px-2 py-0.5 rounded-full">
                          <Text className="text-white text-xs font-bold">{maintenanceCount}</Text>
                        </View>
                      </View>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`} numberOfLines={1}>
                        {maintenanceReminders.slice(0, 2).map(r => r.maintenance_type?.name || 'Maintenance').join(' • ')}
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Upcoming Appointments */}
        {(upcomingAppointments.length > 0 || appointmentsCount > 0) && (
          <View className="pt-6">
            <View className="flex-row items-center justify-between px-4 pb-3">
              <View className="flex-row items-center">
                <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Upcoming Appointments
                </Text>
                {appointmentsCount > 0 && (
                  <View className="ml-2 bg-primary-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-xs font-bold">{appointmentsCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => router.push('/(driver)/appointments')}>
                <Text className="text-primary-500 font-semibold text-sm">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="px-4 gap-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const expertName = appointment.expert?.profile?.business_name || appointment.expert?.full_name || 'Expert';
                  return (
                    <Card
                      key={appointment.id}
                      variant="default"
                      onPress={() => router.push(`/(driver)/appointments/${appointment.id}`)}
                    >
                      <View className="flex-row items-center gap-3">
                        <Avatar
                          size="md"
                          name={expertName}
                          source={appointment.expert?.avatar ? { uri: appointment.expert.avatar } : undefined}
                        />
                        <View className="flex-1">
                          <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {expertName}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <MaterialIcons name="event" size={14} color="#3B82F6" />
                            <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {formatAppointmentDate(appointment.scheduled_date, appointment.scheduled_time)}
                            </Text>
                          </View>
                        </View>
                        <Badge
                          label={getStatusLabel(appointment.status)}
                          variant={appointment.status === 'confirmed' ? 'info' : 'warning'}
                          size="sm"
                        />
                      </View>
                    </Card>
                  );
                })
              ) : (
                <TouchableOpacity
                  onPress={() => router.push('/(driver)/appointments')}
                  className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
                >
                  <View className="flex-row items-center justify-center">
                    <MaterialIcons name="event" size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text className={`ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      View all appointments
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Recent Diagnoses */}
        <View className="pt-6">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text
              className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'
                }`}
            >
              Recent Diagnoses
            </Text>
            {recentDiagnoses.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(driver)/profile/history')}>
                <Text className="text-primary-500 font-semibold text-sm">
                  View All
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View className="px-4 gap-3">
            {recentDiagnoses.length > 0 ? (
              recentDiagnoses.map((diagnosis) => (
                <Card key={diagnosis.id} variant="default" onPress={() => router.push(`/(driver)/diagnose/results?id=${diagnosis.id}`)}>
                  <View className="flex-row items-center gap-4">
                    <View
                      className={`h-12 w-12 rounded-full items-center justify-center ${diagnosis.status === 'completed'
                        ? 'bg-green-500/20'
                        : diagnosis.status === 'failed'
                        ? 'bg-red-500/20'
                        : 'bg-orange-500/20'
                        }`}
                    >
                      <MaterialIcons
                        name={diagnosis.status === 'completed' ? 'check-circle' : diagnosis.status === 'failed' ? 'error' : 'pending'}
                        size={24}
                        color={diagnosis.status === 'completed' ? '#22C55E' : diagnosis.status === 'failed' ? '#EF4444' : '#F97316'}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        numberOfLines={1}
                      >
                        {getDiagnosisTitle(diagnosis)}
                      </Text>
                      <Text
                        className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {formatDiagnosisDate(diagnosis.created_at)}
                      </Text>
                    </View>
                    <Badge
                      label={diagnosis.status === 'completed' ? 'Complete' : diagnosis.status === 'failed' ? 'Failed' : 'Pending'}
                      variant={diagnosis.status === 'completed' ? 'success' : diagnosis.status === 'failed' ? 'error' : 'warning'}
                    />
                  </View>
                </Card>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => router.push('/(driver)/diagnose')}
                className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <View className="items-center py-4">
                  <MaterialIcons name="search" size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text className={`mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No diagnoses yet
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tap to diagnose your first issue
                  </Text>
                </View>
              </TouchableOpacity>
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
          {vehicles.length > 0 ? (
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
                    {vehicle.image_url ? (
                      <Image
                        source={{ uri: vehicle.image_url }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <MaterialIcons name="directions-car" size={48} color={isDark ? '#475569' : '#94A3B8'} />
                    )}
                    {vehicle.is_primary && (
                      <View className="absolute top-2 right-2 bg-primary-500 px-2 py-0.5 rounded-full">
                        <Text className="text-white text-xs font-bold">Primary</Text>
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-1">
                      <Text
                        className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                        numberOfLines={1}
                      >
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Text>
                      <Text
                        className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                      >
                        {formatMileage(vehicle.mileage)}
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
          ) : (
            <View className="px-4">
              <TouchableOpacity
                onPress={() => router.push('/(driver)/profile/vehicle-edit')}
                className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <View className="items-center py-4">
                  <MaterialIcons name="directions-car" size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text className={`mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    No vehicles added
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Tap to add your first vehicle
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Learn Something New */}
        <View className="pt-6 pb-8">
          <View className="flex-row items-center justify-between px-4 pb-3">
            <Text
              className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Learn Something New
            </Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/learn')}>
              <Text className="text-primary-500 font-semibold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {articles.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            >
              {articles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  className="w-60 h-36 rounded-xl overflow-hidden"
                  onPress={() => router.push(`/(driver)/learn/article/${article.slug}`)}
                >
                  {article.image_url ? (
                    <Image
                      source={{ uri: article.image_url }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className={`h-full w-full items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                      <MaterialIcons name="article" size={48} color={isDark ? '#475569' : '#94A3B8'} />
                    </View>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    className="absolute inset-0"
                  />
                  <View className="absolute bottom-3 left-3 right-3">
                    <Text className="text-xs text-white/80 mb-1">
                      {article.category?.name || 'Article'}
                    </Text>
                    <Text className="font-bold text-white" numberOfLines={2}>
                      {article.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="px-4">
              <TouchableOpacity
                onPress={() => router.push('/(driver)/learn')}
                className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`}
              >
                <View className="items-center py-4">
                  <MaterialIcons name="school" size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text className={`mt-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Explore learning content
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Road signs, maintenance tips, and more
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
