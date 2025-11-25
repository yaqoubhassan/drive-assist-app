import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Button, Input } from '../../../src/components/common';
import { formatCurrency } from '../../../src/constants';

const withdrawMethods = [
  {
    id: 'momo',
    name: 'MTN Mobile Money',
    icon: 'phone-android' as const,
    details: '**** 1234',
    color: '#FFCC00',
  },
  {
    id: 'bank',
    name: 'GTBank Ghana',
    icon: 'account-balance' as const,
    details: '**** 5678',
    color: '#E34A27',
  },
  {
    id: 'vodafone',
    name: 'Vodafone Cash',
    icon: 'phone-android' as const,
    details: '**** 9012',
    color: '#E60000',
  },
];

const quickAmounts = [500, 1000, 2000, 5000];

export default function WithdrawScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [processing, setProcessing] = useState(false);

  const availableBalance = 12450;
  const minWithdrawal = 50;

  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount);

    if (!withdrawAmount || withdrawAmount < minWithdrawal) {
      Alert.alert('Invalid Amount', `Minimum withdrawal is ${formatCurrency(minWithdrawal)}`);
      return;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance for this withdrawal.');
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);

    Alert.alert(
      'Withdrawal Initiated',
      `${formatCurrency(withdrawAmount)} will be sent to your ${withdrawMethods.find((m) => m.id === selectedMethod)?.name} account within 24 hours.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
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
        <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Withdraw
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Available Balance */}
        <Card variant="default" className="mb-6">
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Available Balance
          </Text>
          <Text className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {formatCurrency(availableBalance)}
          </Text>
        </Card>

        {/* Amount Input */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            AMOUNT
          </Text>
          <View
            className={`flex-row items-center p-4 rounded-xl border-2 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}
          >
            <Text className={`text-2xl font-bold mr-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              GH₵
            </Text>
            <Input
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0"
              keyboardType="numeric"
              containerClassName="flex-1"
              inputClassName="text-3xl font-bold border-0 p-0"
            />
          </View>
          <Text className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Minimum withdrawal: {formatCurrency(minWithdrawal)}
          </Text>
        </View>

        {/* Quick Amounts */}
        <View className="mb-6">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            QUICK AMOUNTS
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {quickAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleQuickAmount(value)}
                className={`px-6 py-3 rounded-xl ${
                  amount === value.toString()
                    ? 'bg-primary-500'
                    : isDark
                    ? 'bg-slate-800'
                    : 'bg-white'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    amount === value.toString()
                      ? 'text-white'
                      : isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  {formatCurrency(value)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Withdraw To */}
        <View className="mb-8">
          <Text className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            WITHDRAW TO
          </Text>
          <View className="gap-3">
            {withdrawMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => setSelectedMethod(method.id)}
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-500/10'
                    : isDark
                    ? 'border-slate-700 bg-slate-800'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <View
                  className="h-12 w-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: method.color + '20' }}
                >
                  <MaterialIcons name={method.icon} size={24} color={method.color} />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {method.name}
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {method.details}
                  </Text>
                </View>
                <View
                  className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                    selectedMethod === method.id
                      ? 'border-primary-500 bg-primary-500'
                      : isDark
                      ? 'border-slate-600'
                      : 'border-slate-300'
                  }`}
                >
                  {selectedMethod === method.id && (
                    <MaterialIcons name="check" size={14} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push('/(expert)/profile/payment-accounts')}
            className="flex-row items-center justify-center mt-4"
          >
            <MaterialIcons name="add" size={20} color="#3B82F6" />
            <Text className="text-primary-500 font-semibold ml-1">Manage Payment Accounts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Withdraw Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Button
          title={amount ? `Withdraw ${formatCurrency(parseInt(amount) || 0)}` : 'Enter Amount'}
          onPress={handleWithdraw}
          loading={processing}
          disabled={!amount || parseInt(amount) < minWithdrawal}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
