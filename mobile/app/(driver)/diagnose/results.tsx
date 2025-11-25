import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Button, Card, Badge } from '../../../src/components/common';
import { formatCurrencyRange } from '../../../src/constants';

// Mock diagnosis result
const diagnosisResult = {
  issue: 'Alternator Malfunction',
  confidence: 92,
  urgency: 'high' as const,
  safeToVehicle: false,
  safeToVehicleNote: 'No, battery will drain',
  estimatedCostMin: 400,
  estimatedCostMax: 800,
  estimatedTimeHours: 3,
  explanation:
    'Your alternator appears to be failing. This component charges your battery while the engine runs. Without a working alternator, your battery will drain and your car will eventually stop running. Common causes include worn bearings, damaged diodes, or a failing voltage regulator.',
  diySteps: [
    'Check battery connections for corrosion',
    'Test battery voltage (should be 12.6V when off)',
    'Inspect alternator drive belt for wear or damage',
    'Have alternator output tested (14V+ when running)',
  ],
  safetyWarnings: [
    "Don't drive long distances with failing alternator",
    'Battery may die suddenly, leaving you stranded',
    'Turn off non-essential electronics to extend battery',
  ],
  relatedIssues: ['Weak Battery', 'Serpentine Belt Wear'],
};

export default function DiagnoseResultsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [diyExpanded, setDiyExpanded] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);

  const urgencyColors = {
    low: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Low' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'Medium' },
    high: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'High' },
    critical: { bg: 'bg-red-600/20', text: 'text-red-600', label: 'Critical' },
  };

  const urgency = urgencyColors[diagnosisResult.urgency];

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => router.replace('/(driver)/')}
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
            Diagnosis Results
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="h-12 w-12 items-center justify-center">
              <MaterialIcons
                name="bookmark-border"
                size={24}
                color={isDark ? '#FFFFFF' : '#111827'}
              />
            </TouchableOpacity>
            <TouchableOpacity className="h-12 w-12 items-center justify-center">
              <MaterialIcons
                name="share"
                size={24}
                color={isDark ? '#FFFFFF' : '#111827'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <View className="px-4 py-3">
          <LinearGradient
            colors={isDark ? ['#7F1D1D40', '#1F293760'] : ['#FEE2E240', '#FFFFFF60']}
            className="rounded-2xl p-6 items-center"
          >
            <View className="h-16 w-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
              <MaterialIcons name="warning" size={32} color="#EF4444" />
            </View>
            <Text
              className={`text-xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Diagnosis Complete!
            </Text>
            <Text
              className={`text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
            >
              {diagnosisResult.issue}
            </Text>
          </LinearGradient>
        </View>

        {/* Confidence */}
        <View className="px-4 py-2">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              AI Confidence
            </Text>
            <Text
              className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {diagnosisResult.confidence}%
            </Text>
          </View>
          <View
            className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
          >
            <View
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${diagnosisResult.confidence}%` }}
            />
          </View>
        </View>

        {/* Quick Summary */}
        <View className="flex-row flex-wrap gap-3 px-4 py-4">
          <Card variant="outlined" padding="md" className="flex-1 min-w-[150px]">
            <MaterialIcons name="error" size={24} color="#EF4444" />
            <Text
              className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {urgency.label}
            </Text>
            <Text
              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Urgency
            </Text>
          </Card>

          <Card variant="outlined" padding="md" className="flex-1 min-w-[150px]">
            <MaterialIcons
              name={diagnosisResult.safeToVehicle ? 'check-circle' : 'cancel'}
              size={24}
              color={diagnosisResult.safeToVehicle ? '#10B981' : '#EF4444'}
            />
            <Text
              className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {diagnosisResult.safeToVehicle ? 'Yes' : 'No'}
            </Text>
            <Text
              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Safe to Drive
            </Text>
          </Card>

          <Card variant="outlined" padding="md" className="flex-1 min-w-[150px]">
            <MaterialIcons name="payments" size={24} color="#3B82F6" />
            <Text
              className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {formatCurrencyRange(
                diagnosisResult.estimatedCostMin,
                diagnosisResult.estimatedCostMax
              )}
            </Text>
            <Text
              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Est. Cost
            </Text>
          </Card>

          <Card variant="outlined" padding="md" className="flex-1 min-w-[150px]">
            <MaterialIcons name="schedule" size={24} color="#3B82F6" />
            <Text
              className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {diagnosisResult.estimatedTimeHours} Hours
            </Text>
            <Text
              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Est. Time
            </Text>
          </Card>
        </View>

        {/* Explanation */}
        <View className="px-4 py-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text
              className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              What's Happening
            </Text>
            <MaterialIcons
              name="info"
              size={20}
              color={isDark ? '#64748B' : '#94A3B8'}
            />
          </View>
          <Text
            className={`text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {diagnosisResult.explanation}
          </Text>
        </View>

        {/* DIY Steps */}
        <View className="px-4 py-2">
          <Card variant="outlined" padding="none">
            <TouchableOpacity
              onPress={() => setDiyExpanded(!diyExpanded)}
              className="flex-row items-center justify-between p-4"
            >
              <Text
                className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
              >
                What You Can Try
              </Text>
              <MaterialIcons
                name={diyExpanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={isDark ? '#64748B' : '#94A3B8'}
              />
            </TouchableOpacity>

            {diyExpanded && (
              <View
                className={`px-4 pb-4 border-t ${
                  isDark ? 'border-slate-700' : 'border-slate-200'
                }`}
              >
                <View
                  className={`flex-row items-start p-3 rounded-xl my-4 ${
                    isDark ? 'bg-amber-500/10' : 'bg-amber-50'
                  }`}
                >
                  <MaterialIcons
                    name="warning"
                    size={18}
                    color="#F59E0B"
                    style={{ marginRight: 12, marginTop: 2 }}
                  />
                  <Text
                    className={`flex-1 text-sm ${
                      isDark ? 'text-amber-200' : 'text-amber-700'
                    }`}
                  >
                    Proceed with caution. If you are unsure, please consult a
                    professional.
                  </Text>
                </View>

                {diagnosisResult.diySteps.map((step, index) => (
                  <View key={index} className="flex-row items-start mb-3">
                    <View className="h-6 w-6 rounded-full bg-primary-500/20 items-center justify-center mr-3">
                      <Text className="text-primary-500 font-bold text-xs">
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      className={`flex-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* Safety Warnings */}
        <View className="px-4 py-4">
          <Card
            variant="outlined"
            padding="md"
            className="border-red-500/30 bg-red-500/5"
          >
            <Text className="text-lg font-bold text-red-500 mb-3">
              Safety Warnings
            </Text>
            {diagnosisResult.safetyWarnings.map((warning, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <MaterialIcons
                  name="electric-bolt"
                  size={16}
                  color="#EF4444"
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <Text
                  className={`flex-1 text-sm ${
                    isDark ? 'text-red-300' : 'text-red-700'
                  }`}
                >
                  {warning}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Related Issues */}
        <View className="px-4 py-4 pb-48">
          <Text
            className={`text-xl font-bold mb-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Related Issues
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {diagnosisResult.relatedIssues.map((issue, index) => (
              <Card
                key={index}
                variant="outlined"
                padding="none"
                className="w-64 mr-4"
              >
                <View
                  className={`h-24 items-center justify-center ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  <MaterialIcons
                    name="battery-alert"
                    size={48}
                    color={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
                <View className="p-4">
                  <Text
                    className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                  >
                    {issue}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    A failing alternator can cause this issue.
                  </Text>
                </View>
              </Card>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View
        className={`absolute bottom-0 left-0 right-0 px-4 py-4 border-t ${
          isDark
            ? 'border-slate-800 bg-slate-900/95'
            : 'border-slate-200 bg-white/95'
        }`}
        style={{ paddingBottom: 32 }}
      >
        <Button
          title="Find Local Expert"
          icon="search"
          onPress={() => router.push('/(driver)/experts')}
          fullWidth
        />
        <View className="flex-row gap-3 mt-3">
          <Button
            title="Save"
            icon="bookmark"
            variant="secondary"
            className="flex-1"
            onPress={() => {}}
          />
          <Button
            title="Share"
            icon="share"
            variant="secondary"
            className="flex-1"
            onPress={() => {}}
          />
        </View>

        {/* Feedback */}
        <View className="flex-row items-center justify-center gap-4 mt-4">
          <Text
            className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            Was this helpful?
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setHelpful(true)}
              className={`h-10 w-10 rounded-full items-center justify-center border ${
                helpful === true
                  ? 'bg-green-500/20 border-green-500'
                  : isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              <MaterialIcons
                name="thumb-up"
                size={18}
                color={helpful === true ? '#10B981' : isDark ? '#64748B' : '#94A3B8'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setHelpful(false)}
              className={`h-10 w-10 rounded-full items-center justify-center border ${
                helpful === false
                  ? 'bg-red-500/20 border-red-500'
                  : isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              <MaterialIcons
                name="thumb-down"
                size={18}
                color={helpful === false ? '#EF4444' : isDark ? '#64748B' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          className={`text-xs text-center mt-2 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          This AI diagnosis is for informational purposes only.
        </Text>
      </View>
    </SafeAreaView>
  );
}
