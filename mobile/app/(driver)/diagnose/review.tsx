import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useDiagnosis } from '../../../src/context/DiagnosisContext';
import { Button, Card } from '../../../src/components/common';

export default function DiagnoseReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTheme();
  const { input, isGuest } = useDiagnosis();
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Get data from params or context
  const category = (params.category as string) || input.category;
  const description = (params.description as string) || input.description;
  const isGuestFromParams = params.isGuest === 'true';
  const isGuestUser = isGuest || isGuestFromParams;

  // Vehicle info for authenticated users
  const { year, make, model, mileage } = params;
  const hasVehicle = make || model || year || input.vehicleInfo;

  // Step number depends on whether it's a guest (3 steps) or authenticated (4 steps)
  const stepText = isGuestUser ? 'Step 3 of 3' : 'Step 4 of 4';

  const handleSubmit = () => {
    // Navigate to loading screen which will handle the actual API call
    router.push('/(driver)/diagnose/loading');
  };

  const handleClose = () => {
    // If guest, go back to welcome/index; if authenticated, go to driver dashboard
    if (isGuestUser) {
      router.replace('/');
    } else {
      router.replace('/(driver)/');
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
        <Text
          className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          {stepText}
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          className="h-12 w-12 items-center justify-center"
        >
          <MaterialIcons
            name="close"
            size={24}
            color={isDark ? '#FFFFFF' : '#111827'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View className="pt-4 pb-3">
          <Text
            className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Review Your Submission
          </Text>
          <Text
            className={`text-base mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            Make sure everything looks good
          </Text>
        </View>

        {/* Guest Notice */}
        {isGuestUser && (
          <View
            className={`p-4 rounded-xl mb-4 ${
              isDark ? 'bg-amber-500/10' : 'bg-amber-50'
            }`}
          >
            <View className="flex-row items-start">
              <MaterialIcons
                name="info"
                size={20}
                color="#F59E0B"
                style={{ marginRight: 12, marginTop: 2 }}
              />
              <View className="flex-1">
                <Text
                  className={`font-semibold ${
                    isDark ? 'text-amber-200' : 'text-amber-800'
                  }`}
                >
                  Guest Diagnosis
                </Text>
                <Text
                  className={`text-sm mt-1 ${
                    isDark ? 'text-amber-200/80' : 'text-amber-700'
                  }`}
                >
                  You have limited free diagnoses. Sign up to unlock unlimited diagnoses and expert connections.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Review Cards */}
        <View className="gap-4 py-4">
          {/* Category */}
          <Card variant="outlined">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-10 w-10 rounded-lg bg-primary-500/20 items-center justify-center mr-3">
                  <MaterialIcons name="category" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text
                    className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    Category
                  </Text>
                  <Text
                    className={`font-semibold capitalize ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {category || 'Not specified'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/(driver)/diagnose')}>
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={isDark ? '#64748B' : '#94A3B8'}
                />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Description */}
          <Card variant="outlined">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 flex-row items-start">
                <View className="h-10 w-10 rounded-lg bg-primary-500/20 items-center justify-center mr-3">
                  <MaterialIcons name="description" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    Description
                  </Text>
                  <Text
                    className={`font-medium mt-1 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                    numberOfLines={3}
                  >
                    {description || 'No description provided'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons
                  name="edit"
                  size={20}
                  color={isDark ? '#64748B' : '#94A3B8'}
                />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Vehicle - Only show for authenticated users with vehicle */}
          {hasVehicle && !isGuestUser && (
            <Card variant="outlined">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 rounded-lg bg-primary-500/20 items-center justify-center mr-3">
                    <MaterialIcons name="directions-car" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text
                      className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      Vehicle
                    </Text>
                    <Text
                      className={`font-semibold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {year || input.vehicleInfo?.year} {make || input.vehicleInfo?.make} {model || input.vehicleInfo?.model}
                    </Text>
                    {(mileage || input.vehicleInfo?.mileage) && (
                      <Text
                        className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {mileage || input.vehicleInfo?.mileage} km
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity>
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={isDark ? '#64748B' : '#94A3B8'}
                  />
                </TouchableOpacity>
              </View>
            </Card>
          )}
        </View>

        {/* Terms */}
        <TouchableOpacity
          onPress={() => setTermsAccepted(!termsAccepted)}
          className="flex-row items-start py-4"
        >
          <View
            className={`h-5 w-5 rounded border-2 mr-3 mt-0.5 items-center justify-center ${
              termsAccepted
                ? 'bg-primary-500 border-primary-500'
                : isDark
                ? 'border-slate-600'
                : 'border-slate-300'
            }`}
          >
            {termsAccepted && (
              <MaterialIcons name="check" size={14} color="#FFFFFF" />
            )}
          </View>
          <Text
            className={`flex-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
          >
            I confirm this information is accurate. By submitting, you agree to our{' '}
            <Text className="text-primary-500 font-semibold">Terms of Service</Text>.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View
        className={`px-4 py-4 border-t ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
      >
        <Button
          title="Get AI Diagnosis"
          icon="auto-fix-high"
          onPress={handleSubmit}
          disabled={!termsAccepted}
          fullWidth
        />
        <Text
          className={`text-center text-sm mt-3 ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          Usually takes 15-30 seconds
        </Text>
      </View>
    </SafeAreaView>
  );
}
