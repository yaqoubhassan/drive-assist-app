import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Badge, Chip } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

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
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white/80">Available Balance</Text>
              <TouchableOpacity>
                <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text className="text-white text-4xl font-bold mb-4">
              {formatCurrency(stats.totalEarnings)}
            </Text>

            <View className="flex-row gap-3">
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
            <TouchableOpacity>
              <Text className="text-primary-500 font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          <Card variant="default" padding="none">
            {transactions.map((transaction, index) => (
              <View
                key={transaction.id}
                className={`flex-row items-center p-4 ${
                  index !== transactions.length - 1
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
