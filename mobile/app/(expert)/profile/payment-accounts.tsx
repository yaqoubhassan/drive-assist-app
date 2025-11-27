import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Button, Input, SuccessModal } from '../../../src/components/common';

// Types
interface PaymentAccount {
  id: string;
  type: 'mobile_money' | 'bank';
  provider: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
  color: string;
  icon: 'phone-android' | 'account-balance';
}

// Mobile Money Providers
const mobileMoneyProviders = [
  { id: 'mtn', name: 'MTN Mobile Money', color: '#FFCC00' },
  { id: 'vodafone', name: 'Vodafone Cash', color: '#E60000' },
  { id: 'airteltigo', name: 'AirtelTigo Money', color: '#E40046' },
];

// Popular Banks in Ghana
const banks = [
  { id: 'gcb', name: 'GCB Bank' },
  { id: 'ecobank', name: 'Ecobank Ghana' },
  { id: 'stanbic', name: 'Stanbic Bank' },
  { id: 'absa', name: 'Absa Bank Ghana' },
  { id: 'zenith', name: 'Zenith Bank' },
  { id: 'fidelity', name: 'Fidelity Bank' },
  { id: 'gtbank', name: 'GTBank Ghana' },
  { id: 'uba', name: 'UBA Ghana' },
  { id: 'calbank', name: 'CalBank' },
  { id: 'access', name: 'Access Bank' },
  { id: 'other', name: 'Other Bank' },
];

// Mock initial accounts
const initialAccounts: PaymentAccount[] = [
  {
    id: '1',
    type: 'mobile_money',
    provider: 'MTN Mobile Money',
    accountName: 'John Doe',
    accountNumber: '0541234567',
    isDefault: true,
    color: '#FFCC00',
    icon: 'phone-android',
  },
  {
    id: '2',
    type: 'bank',
    provider: 'GTBank Ghana',
    accountName: 'John Doe',
    accountNumber: '0123456789',
    isDefault: false,
    color: '#E34A27',
    icon: 'account-balance',
  },
];

export default function PaymentAccountsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [accounts, setAccounts] = useState<PaymentAccount[]>(initialAccounts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [accountType, setAccountType] = useState<'mobile_money' | 'bank' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const resetForm = () => {
    setAccountType(null);
    setSelectedProvider('');
    setAccountName('');
    setAccountNumber('');
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleAddAccount = async () => {
    if (!selectedProvider || !accountName || !accountNumber) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    // Validate phone number for mobile money
    if (accountType === 'mobile_money' && accountNumber.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const providerInfo =
      accountType === 'mobile_money'
        ? mobileMoneyProviders.find((p) => p.id === selectedProvider)
        : banks.find((b) => b.id === selectedProvider);

    const newAccount: PaymentAccount = {
      id: Date.now().toString(),
      type: accountType!,
      provider: providerInfo?.name || selectedProvider,
      accountName,
      accountNumber,
      isDefault: accounts.length === 0,
      color:
        accountType === 'mobile_money'
          ? (providerInfo as (typeof mobileMoneyProviders)[0])?.color || '#3B82F6'
          : '#3B82F6',
      icon: accountType === 'mobile_money' ? 'phone-android' : 'account-balance',
    };

    setAccounts([...accounts, newAccount]);
    setSaving(false);
    handleCloseModal();
    setShowSuccessModal(true);
  };

  const handleSetDefault = (accountId: string) => {
    setAccounts(
      accounts.map((acc) => ({
        ...acc,
        isDefault: acc.id === accountId,
      }))
    );
  };

  const handleDeleteAccount = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    Alert.alert(
      'Delete Account',
      `Are you sure you want to remove ${account?.provider} (${account?.accountNumber})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedAccounts = accounts.filter((a) => a.id !== accountId);
            // If deleted account was default, set first remaining as default
            if (account?.isDefault && updatedAccounts.length > 0) {
              updatedAccounts[0].isDefault = true;
            }
            setAccounts(updatedAccounts);
          },
        },
      ]
    );
  };

  const maskAccountNumber = (number: string, type: 'mobile_money' | 'bank') => {
    if (type === 'mobile_money') {
      return `${number.slice(0, 3)}****${number.slice(-3)}`;
    }
    return `****${number.slice(-4)}`;
  };

  const renderAccountCard = (account: PaymentAccount) => (
    <Card key={account.id} variant="default" className="mb-3">
      <View className="flex-row items-center">
        <View
          className="h-12 w-12 rounded-xl items-center justify-center mr-4"
          style={{ backgroundColor: account.color + '20' }}
        >
          <MaterialIcons name={account.icon} size={24} color={account.color} />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {account.provider}
            </Text>
            {account.isDefault && (
              <View className="ml-2 px-2 py-0.5 bg-green-500/20 rounded">
                <Text className="text-green-500 text-xs font-semibold">Default</Text>
              </View>
            )}
          </View>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {account.accountName}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {maskAccountNumber(account.accountNumber, account.type)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {!account.isDefault && (
            <TouchableOpacity
              onPress={() => handleSetDefault(account.id)}
              className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
            >
              <MaterialIcons
                name="star-outline"
                size={20}
                color={isDark ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleDeleteAccount(account.id)}
            className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-50'}`}
          >
            <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderAddAccountModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <SafeAreaView
          className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
          edges={['top', 'bottom']}
        >
          {/* Modal Header */}
          <View
            className={`flex-row items-center justify-between px-4 py-4 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <TouchableOpacity onPress={handleCloseModal}>
              <Text className="text-primary-500 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Add Payment Account
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
            {/* Account Type Selection */}
            {!accountType && (
              <View>
                <Text
                  className={`text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  SELECT ACCOUNT TYPE
                </Text>
                <View className="gap-3">
                  <TouchableOpacity
                    onPress={() => setAccountType('mobile_money')}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <View className="h-14 w-14 rounded-xl bg-yellow-500/20 items-center justify-center mr-4">
                      <MaterialIcons name="phone-android" size={28} color="#FFCC00" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        Mobile Money
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        MTN MoMo, Vodafone Cash, AirtelTigo
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={isDark ? '#475569' : '#94A3B8'}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setAccountType('bank')}
                    className={`flex-row items-center p-4 rounded-xl border-2 ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <View className="h-14 w-14 rounded-xl bg-blue-500/20 items-center justify-center mr-4">
                      <MaterialIcons name="account-balance" size={28} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}
                      >
                        Bank Account
                      </Text>
                      <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Local and international banks
                      </Text>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color={isDark ? '#475569' : '#94A3B8'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Provider Selection */}
            {accountType && !selectedProvider && (
              <View>
                <TouchableOpacity
                  onPress={() => setAccountType(null)}
                  className="flex-row items-center mb-4"
                >
                  <MaterialIcons name="arrow-back" size={20} color="#3B82F6" />
                  <Text className="text-primary-500 font-semibold ml-1">Back</Text>
                </TouchableOpacity>

                <Text
                  className={`text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {accountType === 'mobile_money' ? 'SELECT PROVIDER' : 'SELECT BANK'}
                </Text>

                <View className="gap-2">
                  {(accountType === 'mobile_money' ? mobileMoneyProviders : banks).map(
                    (provider) => (
                      <TouchableOpacity
                        key={provider.id}
                        onPress={() => setSelectedProvider(provider.id)}
                        className={`flex-row items-center p-4 rounded-xl ${
                          isDark ? 'bg-slate-800' : 'bg-white'
                        }`}
                      >
                        <View
                          className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                          style={{
                            backgroundColor:
                              accountType === 'mobile_money'
                                ? (provider as (typeof mobileMoneyProviders)[0]).color + '20'
                                : '#3B82F620',
                          }}
                        >
                          <MaterialIcons
                            name={accountType === 'mobile_money' ? 'phone-android' : 'account-balance'}
                            size={20}
                            color={
                              accountType === 'mobile_money'
                                ? (provider as (typeof mobileMoneyProviders)[0]).color
                                : '#3B82F6'
                            }
                          />
                        </View>
                        <Text
                          className={`flex-1 font-semibold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {provider.name}
                        </Text>
                        <MaterialIcons
                          name="chevron-right"
                          size={24}
                          color={isDark ? '#475569' : '#94A3B8'}
                        />
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            )}

            {/* Account Details Form */}
            {accountType && selectedProvider && (
              <View>
                <TouchableOpacity
                  onPress={() => setSelectedProvider('')}
                  className="flex-row items-center mb-4"
                >
                  <MaterialIcons name="arrow-back" size={20} color="#3B82F6" />
                  <Text className="text-primary-500 font-semibold ml-1">Back</Text>
                </TouchableOpacity>

                <Text
                  className={`text-sm font-semibold mb-3 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  ACCOUNT DETAILS
                </Text>

                {/* Selected Provider Display */}
                <View
                  className={`flex-row items-center p-4 rounded-xl mb-4 ${
                    isDark ? 'bg-slate-800' : 'bg-white'
                  }`}
                >
                  <View
                    className="h-10 w-10 rounded-lg items-center justify-center mr-3"
                    style={{
                      backgroundColor:
                        accountType === 'mobile_money'
                          ? (mobileMoneyProviders.find((p) => p.id === selectedProvider)?.color ||
                              '#3B82F6') + '20'
                          : '#3B82F620',
                    }}
                  >
                    <MaterialIcons
                      name={accountType === 'mobile_money' ? 'phone-android' : 'account-balance'}
                      size={20}
                      color={
                        accountType === 'mobile_money'
                          ? mobileMoneyProviders.find((p) => p.id === selectedProvider)?.color ||
                            '#3B82F6'
                          : '#3B82F6'
                      }
                    />
                  </View>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {accountType === 'mobile_money'
                      ? mobileMoneyProviders.find((p) => p.id === selectedProvider)?.name
                      : banks.find((b) => b.id === selectedProvider)?.name}
                  </Text>
                </View>

                <View className="gap-4">
                  <Input
                    label="Account Holder Name"
                    placeholder="Enter full name as on account"
                    value={accountName}
                    onChangeText={setAccountName}
                    autoCapitalize="words"
                  />

                  <Input
                    label={accountType === 'mobile_money' ? 'Phone Number' : 'Account Number'}
                    placeholder={
                      accountType === 'mobile_money' ? 'e.g., 0541234567' : 'Enter account number'
                    }
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="numeric"
                    maxLength={accountType === 'mobile_money' ? 10 : 20}
                  />

                  {accountType === 'mobile_money' && (
                    <View
                      className={`flex-row items-center p-3 rounded-lg ${
                        isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                      }`}
                    >
                      <MaterialIcons name="info" size={20} color="#3B82F6" />
                      <Text
                        className={`flex-1 ml-2 text-sm ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        Enter the phone number registered with your mobile money account
                      </Text>
                    </View>
                  )}

                  {accountType === 'bank' && (
                    <Input
                      label="Branch (Optional)"
                      placeholder="Enter branch name"
                    />
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Add Button */}
          {accountType && selectedProvider && (
            <View
              className={`px-4 py-4 border-t ${
                isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
              }`}
            >
              <Button
                title="Add Account"
                onPress={handleAddAccount}
                loading={saving}
                disabled={!accountName || !accountNumber}
                fullWidth
              />
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );

  const mobileMoneyAccounts = accounts.filter((a) => a.type === 'mobile_money');
  const bankAccounts = accounts.filter((a) => a.type === 'bank');

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View
        className={`flex-row items-center px-4 py-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-2"
        >
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <Text className={`text-xl font-bold flex-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Payment Accounts
        </Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="h-10 w-10 items-center justify-center rounded-lg bg-primary-500"
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <Card variant="default" className="mb-6">
          <View className="flex-row items-center">
            <View className="h-12 w-12 rounded-xl bg-primary-500/20 items-center justify-center mr-4">
              <MaterialIcons name="account-balance-wallet" size={24} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Manage Your Payout Accounts
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Add accounts to receive your earnings
              </Text>
            </View>
          </View>
        </Card>

        {/* Mobile Money Accounts */}
        {mobileMoneyAccounts.length > 0 && (
          <View className="mb-6">
            <Text
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              MOBILE MONEY
            </Text>
            {mobileMoneyAccounts.map(renderAccountCard)}
          </View>
        )}

        {/* Bank Accounts */}
        {bankAccounts.length > 0 && (
          <View className="mb-6">
            <Text
              className={`text-sm font-semibold mb-3 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              BANK ACCOUNTS
            </Text>
            {bankAccounts.map(renderAccountCard)}
          </View>
        )}

        {/* Empty State */}
        {accounts.length === 0 && (
          <View className="items-center py-12">
            <View className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center mb-4">
              <MaterialIcons
                name="account-balance-wallet"
                size={40}
                color={isDark ? '#64748B' : '#94A3B8'}
              />
            </View>
            <Text
              className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              No Payment Accounts
            </Text>
            <Text
              className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Add a mobile money or bank account{'\n'}to receive your earnings
            </Text>
            <Button
              title="Add Account"
              onPress={() => setShowAddModal(true)}
              className="mt-6"
              icon={<MaterialIcons name="add" size={20} color="#FFFFFF" />}
            />
          </View>
        )}

        {/* Tips Section */}
        {accounts.length > 0 && (
          <Card variant="default" className="mb-6">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
              <Text className={`font-semibold ml-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Tips
              </Text>
            </View>
            <View className="gap-2">
              <View className="flex-row items-start">
                <Text className={`mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>•</Text>
                <Text className={`flex-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your default account will be used for automatic withdrawals
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className={`mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>•</Text>
                <Text className={`flex-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Mobile money withdrawals are typically processed within 24 hours
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className={`mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>•</Text>
                <Text className={`flex-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Bank transfers may take 1-3 business days
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {renderAddAccountModal()}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Account Added!"
        message="Your payment account has been added successfully."
        primaryButtonLabel="Done"
      />
    </SafeAreaView>
  );
}
