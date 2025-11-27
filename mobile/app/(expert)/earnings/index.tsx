import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';
import { useTheme } from '../../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'processing';
}

const transactions: Transaction[] = [
  { id: '1', type: 'earning', description: 'Transmission Repair - Yaw Boateng', amount: 1500, date: 'Today, 4:30 PM', status: 'completed' },
  { id: '2', type: 'earning', description: 'Brake Pad Replacement - Ama Serwaa', amount: 350, date: 'Nov 20, 2:15 PM', status: 'completed' },
  { id: '3', type: 'withdrawal', description: 'Bank Transfer - GTBank', amount: -5000, date: 'Nov 19, 10:00 AM', status: 'completed' },
  { id: '4', type: 'earning', description: 'AC Repair - Kofi Mensah', amount: 400, date: 'Nov 18, 5:45 PM', status: 'completed' },
  { id: '5', type: 'bonus', description: '5-Star Rating Bonus', amount: 50, date: 'Nov 18, 5:46 PM', status: 'completed' },
  { id: '6', type: 'earning', description: 'Oil Change - Akua Mansa', amount: 250, date: 'Nov 17, 11:30 AM', status: 'completed' },
  { id: '7', type: 'earning', description: 'Engine Diagnostic - Abena Pokua', amount: 150, date: 'Nov 15, 3:00 PM', status: 'completed' },
  { id: '8', type: 'withdrawal', description: 'Mobile Money - MTN', amount: -3000, date: 'Nov 14, 9:00 AM', status: 'completed' },
];

const periods = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
];

export default function EarningsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const stats = {
    totalEarnings: 12450,
    pendingPayments: 2800,
    completedJobs: 47,
    averagePerJob: 265,
  };

  const performanceStats = {
    responseRate: 95,
    avgResponseTime: '15 min',
    jobCompletion: 98,
    customerSatisfaction: 4.8,
  };

  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5);

  const weeklyData = [
    { day: 'Mon', amount: 450 },
    { day: 'Tue', amount: 800 },
    { day: 'Wed', amount: 350 },
    { day: 'Thu', amount: 1200 },
    { day: 'Fri', amount: 650 },
    { day: 'Sat', amount: 900 },
    { day: 'Sun', amount: 0 },
  ];

  const maxAmount = Math.max(...weeklyData.map((d) => d.amount));

  const getTransactionIcon = (type: string): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case 'earning':
        return 'arrow-downward';
      case 'withdrawal':
        return 'arrow-upward';
      case 'bonus':
        return 'star';
      default:
        return 'payment';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning':
        return '#10B981';
      case 'withdrawal':
        return '#EF4444';
      case 'bonus':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Earnings
          </Text>
        </View>

        {/* Balance Card */}
        <View className="px-4 pb-4">
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-2xl p-5"
            style={{ borderRadius: 16, overflow: 'hidden' }}
          >
            <View className={`flex-row items-center justify-between mb-2 ${Platform.OS === 'ios' ? 'p-5' : ''}`}>
              <Text className="text-white/80">Available Balance</Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                <MaterialIcons name={showBalance ? 'visibility' : 'visibility-off'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text className={`text-white text-4xl font-bold mb-4 ${Platform.OS === 'ios' ? 'px-5' : ''}`}>
              {showBalance ? formatCurrency(stats.totalEarnings) : 'GH₵ ••••••'}
            </Text>

            <View className={`flex-row gap-3 ${Platform.OS === 'ios' ? 'px-5 pb-5' : ''}`}>
              <TouchableOpacity
                onPress={() => router.push('/(expert)/earnings/withdraw')}
                className="flex-1 bg-white/20 rounded-xl py-3 flex-row items-center justify-center"
              >
                <MaterialIcons name="account-balance" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">Withdraw</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-white/20 rounded-xl py-3 flex-row items-center justify-center">
                <MaterialIcons name="history" size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">History</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Cards */}
        <View className="px-4 pb-4">
          <View className="flex-row gap-3">
            <Card variant="default" className="flex-1">
              <View className="flex-row items-center justify-between mb-2">
                <MaterialIcons name="pending" size={20} color="#F59E0B" />
                <Text className="text-orange-500 text-xs font-semibold">Pending</Text>
              </View>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(stats.pendingPayments)}
              </Text>
            </Card>
            <Card variant="default" className="flex-1">
              <View className="flex-row items-center justify-between mb-2">
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <Text className="text-green-500 text-xs font-semibold">Jobs</Text>
              </View>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.completedJobs}
              </Text>
            </Card>
            <Card variant="default" className="flex-1">
              <View className="flex-row items-center justify-between mb-2">
                <MaterialIcons name="trending-up" size={20} color="#3B82F6" />
                <Text className="text-blue-500 text-xs font-semibold">Avg</Text>
              </View>
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(stats.averagePerJob)}
              </Text>
            </Card>
          </View>
        </View>

        {/* Performance Stats */}
        <View className="px-4 pb-4">
          <Card variant="default">
            <Text className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Performance Metrics
            </Text>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-green-500/20 items-center justify-center mr-3">
                    <MaterialIcons name="check-circle" size={18} color="#10B981" />
                  </View>
                  <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Response Rate
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {performanceStats.responseRate}%
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-blue-500/20 items-center justify-center mr-3">
                    <MaterialIcons name="schedule" size={18} color="#3B82F6" />
                  </View>
                  <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Avg. Response Time
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {performanceStats.avgResponseTime}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-yellow-500/20 items-center justify-center mr-3">
                    <MaterialIcons name="thumb-up" size={18} color="#F59E0B" />
                  </View>
                  <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Job Completion
                  </Text>
                </View>
                <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {performanceStats.jobCompletion}%
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-full bg-purple-500/20 items-center justify-center mr-3">
                    <MaterialIcons name="star" size={18} color="#8B5CF6" />
                  </View>
                  <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Customer Rating
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <MaterialIcons name="star" size={16} color="#F59E0B" />
                  <Text className={`font-bold ml-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {performanceStats.customerSatisfaction}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Weekly Chart */}
        <View className="px-4 pb-6">
          <Card variant="default">
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                This Week
              </Text>
              <Text className="text-primary-500 font-semibold">
                {formatCurrency(weeklyData.reduce((sum, d) => sum + d.amount, 0))}
              </Text>
            </View>

            {/* Simple Bar Chart */}
            <View className="flex-row items-end justify-between h-32">
              {weeklyData.map((data, index) => (
                <View key={data.day} className="items-center flex-1">
                  <View
                    className="w-8 rounded-t-lg bg-primary-500"
                    style={{
                      height: data.amount > 0 ? Math.max((data.amount / maxAmount) * 100, 8) : 4,
                      opacity: data.amount > 0 ? 1 : 0.3,
                    }}
                  />
                  <Text className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {data.day}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Period Filter */}
        <View className="px-4 mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {periods.map((period) => (
              <Chip
                key={period.id}
                label={period.label}
                selected={selectedPeriod === period.id}
                onPress={() => setSelectedPeriod(period.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Transactions */}
        <View className="px-4 pb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent Transactions
            </Text>
            {transactions.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllTransactions(!showAllTransactions)}>
                <Text className="text-primary-500 font-semibold">
                  {showAllTransactions ? 'Show Less' : 'See All'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Card variant="default" padding="none">
            {displayedTransactions.map((transaction, index) => (
              <View
                key={transaction.id}
                className={`flex-row items-center p-4 ${index !== displayedTransactions.length - 1
                  ? `border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`
                  : ''
                  }`}
              >
                <View
                  className="h-10 w-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getTransactionColor(transaction.type) + '20' }}
                >
                  <MaterialIcons
                    name={getTransactionIcon(transaction.type)}
                    size={20}
                    color={getTransactionColor(transaction.type)}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                    numberOfLines={1}
                  >
                    {transaction.description}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {transaction.date}
                  </Text>
                </View>
                <Text
                  className="font-bold"
                  style={{ color: transaction.amount > 0 ? '#10B981' : '#EF4444' }}
                >
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
