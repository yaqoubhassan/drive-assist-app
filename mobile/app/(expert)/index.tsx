import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Card } from '../../src/components/common';
import { formatCurrency } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

const stats = [
  { id: 'leads', label: 'New Leads', value: 8, icon: 'person-add' as const, color: '#3B82F6', trend: '+12%' },
  { id: 'active', label: 'Active Jobs', value: 3, icon: 'work' as const, color: '#10B981', trend: '' },
  { id: 'completed', label: 'Completed', value: 47, icon: 'check-circle' as const, color: '#8B5CF6', trend: '+5' },
  { id: 'rating', label: 'Rating', value: '4.8', icon: 'star' as const, color: '#F59E0B', trend: '' },
];

const recentLeads = [
  {
    id: '1',
    name: 'Kwame Asante',
    issue: 'Engine Overheating',
    vehicle: 'Toyota Corolla 2019',
    location: 'East Legon, Accra',
    distance: '2.3 km',
    time: '10 min ago',
    urgency: 'high',
  },
  {
    id: '2',
    name: 'Ama Serwaa',
    issue: 'Brake Pad Replacement',
    vehicle: 'Honda Civic 2020',
    location: 'Osu, Accra',
    distance: '4.1 km',
    time: '25 min ago',
    urgency: 'medium',
  },
  {
    id: '3',
    name: 'Kofi Mensah',
    issue: 'AC Not Working',
    vehicle: 'Hyundai Elantra 2018',
    location: 'Tema, Greater Accra',
    distance: '12.5 km',
    time: '1 hour ago',
    urgency: 'low',
  },
];

const activeJobs = [
  {
    id: '1',
    customer: 'Yaw Boateng',
    issue: 'Transmission Repair',
    status: 'in_progress',
    dueDate: 'Today, 4:00 PM',
    amount: 1500,
  },
  {
    id: '2',
    customer: 'Akua Mansa',
    issue: 'Oil Change & Filter',
    status: 'scheduled',
    dueDate: 'Tomorrow, 10:00 AM',
    amount: 250,
  },
];

export default function ExpertDashboardScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, kycStatus, isExpertOnboardingComplete } = useAuth();

  const showKycBanner = kycStatus !== 'approved';

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

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Avatar
                size="md"
                source={user?.avatar ? { uri: user.avatar } : undefined}
                name={user?.fullName || 'Expert'}
              />
              <View className="ml-3">
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Good morning
                </Text>
                <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.fullName?.split(' ')[0] || 'Expert'}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => router.push('/(shared)/notifications')}
                className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              >
                <MaterialIcons name="notifications" size={22} color={isDark ? '#FFFFFF' : '#111827'} />
                <View className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 items-center justify-center">
                  <Text className="text-white text-xs font-bold">3</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* KYC Banner */}
        {showKycBanner && (
          <TouchableOpacity
            onPress={() => router.navigate('/(expert)/profile/documents')}
            className="mx-4 mb-4"
          >
            <View
              className={`p-4 rounded-xl border ${
                kycStatus === 'submitted' || kycStatus === 'under_review'
                  ? 'bg-yellow-500/10 border-yellow-500/20'
                  : 'bg-blue-500/10 border-blue-500/20'
              }`}
            >
              <View className="flex-row items-center">
                <View
                  className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${
                    kycStatus === 'submitted' || kycStatus === 'under_review'
                      ? 'bg-yellow-500/20'
                      : 'bg-blue-500/20'
                  }`}
                >
                  <MaterialIcons
                    name={
                      kycStatus === 'submitted' || kycStatus === 'under_review'
                        ? 'hourglass-empty'
                        : 'verified-user'
                    }
                    size={20}
                    color={kycStatus === 'submitted' || kycStatus === 'under_review' ? '#F59E0B' : '#3B82F6'}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {kycStatus === 'submitted' || kycStatus === 'under_review'
                      ? 'KYC Under Review'
                      : 'Complete Your KYC'}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {kycStatus === 'submitted' || kycStatus === 'under_review'
                      ? 'Your documents are being reviewed'
                      : 'Verify your account to unlock all features'}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Earnings Card */}
        <View className="px-4 pb-4">
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5"
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <View className={`flex-row items-center justify-between mb-4 ${Platform.OS === 'ios' ? 'p-5' : ''}`}>
              <Text className="text-white/80">This Month's Earnings</Text>
              <TouchableOpacity onPress={() => router.push('/(expert)/earnings')}>
                <Text className="text-white font-semibold">See Details</Text>
              </TouchableOpacity>
            </View>
            <Text className={`text-white text-3xl font-bold mb-2 ${Platform.OS === 'ios' ? 'px-5' : ''}`}>
              {formatCurrency(12450)}
            </Text>
            <View className={`flex-row items-center ${Platform.OS === 'ios' ? 'px-5' : ''}`}>
              <MaterialIcons name="trending-up" size={18} color="#4ADE80" />
              <Text className="text-green-300 ml-1">+18% from last month</Text>
            </View>
            <View className={`flex-row mt-4 gap-4 ${Platform.OS === 'ios' ? 'px-5 pb-5' : ''}`}>
              <View className="flex-1 bg-white/20 rounded-xl p-3">
                <Text className="text-white/70 text-xs">Pending</Text>
                <Text className="text-white font-bold text-lg">{formatCurrency(2800)}</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-xl p-3">
                <Text className="text-white/70 text-xs">This Week</Text>
                <Text className="text-white font-bold text-lg">{formatCurrency(3200)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View className="px-4 pb-6">
          <View className="flex-row flex-wrap gap-3">
            {stats.map((stat) => (
              <TouchableOpacity
                key={stat.id}
                className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                style={{ width: (width - 44) / 2 }}
                onPress={() => {
                  if (stat.id === 'leads') router.push('/(expert)/leads');
                  else if (stat.id === 'active' || stat.id === 'completed') router.push('/(expert)/jobs');
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View
                    className="h-10 w-10 rounded-lg items-center justify-center"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <MaterialIcons name={stat.icon} size={22} color={stat.color} />
                  </View>
                  {stat.trend && (
                    <Text className="text-green-500 text-xs font-semibold">{stat.trend}</Text>
                  )}
                </View>
                <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Leads */}
        <View className="pb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              New Leads
            </Text>
            <TouchableOpacity onPress={() => router.push('/(expert)/leads')}>
              <Text className="text-primary-500 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {recentLeads.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                onPress={() => router.push(`/(expert)/leads/${lead.id}` as any)}
                className={`w-72 p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-white'}`}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Avatar size="sm" name={lead.name} />
                    <View className="ml-2">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {lead.name}
                      </Text>
                      <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lead.time}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: getUrgencyColor(lead.urgency) }}
                  />
                </View>
                <Text className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lead.issue}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {lead.vehicle}
                </Text>
                <View className="flex-row items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <MaterialIcons name="location-on" size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                  <Text className={`text-sm ml-1 flex-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {lead.location}
                  </Text>
                  <Text className="text-primary-500 font-semibold text-sm">{lead.distance}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Jobs */}
        <View className="px-4 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Active Jobs
            </Text>
            <TouchableOpacity onPress={() => router.push('/(expert)/jobs')}>
              <Text className="text-primary-500 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <View className="gap-3">
            {activeJobs.map((job) => (
              <Card key={job.id} variant="default">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Avatar size="sm" name={job.customer} />
                    <Text className={`font-semibold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {job.customer}
                    </Text>
                  </View>
                  <Badge
                    label={job.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                    variant={job.status === 'in_progress' ? 'success' : 'info'}
                    size="sm"
                  />
                </View>
                <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {job.issue}
                </Text>
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                    <Text className={`text-sm ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {job.dueDate}
                    </Text>
                  </View>
                  <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(job.amount)}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
