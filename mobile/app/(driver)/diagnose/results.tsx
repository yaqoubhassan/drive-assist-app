import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { useDiagnosis } from '../../../src/context/DiagnosisContext';
import { Button, Card } from '../../../src/components/common';

export default function DiagnoseResultsScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { result, remainingDiagnoses, isGuest, clearInput, clearResult } = useDiagnosis();
  const [diyExpanded, setDiyExpanded] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);

  const urgencyColors = {
    low: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Low', icon: 'check-circle', iconColor: '#10B981' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-500', label: 'Medium', icon: 'warning', iconColor: '#F59E0B' },
    high: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'High', icon: 'error', iconColor: '#EF4444' },
    critical: { bg: 'bg-red-600/20', text: 'text-red-600', label: 'Critical', icon: 'error', iconColor: '#DC2626' },
  };

  // Handle case where there's no result
  if (!result) {
    return (
      <SafeAreaView
        className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
        edges={['top', 'bottom']}
      >
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Loading results...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const urgencyLevel = result.ai_urgency_level || 'medium';
  const urgency = urgencyColors[urgencyLevel] || urgencyColors.medium;
  const confidence = result.ai_confidence_score || 0;

  const handleClose = () => {
    // Clear data and navigate appropriately
    clearInput();
    clearResult();
    if (isGuest) {
      router.replace('/');
    } else {
      router.replace('/(driver)/');
    }
  };

  const handleFindExpert = () => {
    if (isGuest) {
      // For guests, prompt to sign up first
      router.push('/(auth)/sign-up');
    } else {
      router.push('/(driver)/experts');
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
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
          <Text
            className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            Diagnosis Results
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity className="h-12 w-12 items-center justify-center">
              <MaterialIcons
                name="share"
                size={24}
                color={isDark ? '#FFFFFF' : '#111827'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Remaining Diagnoses Notice */}
        {isGuest && remainingDiagnoses !== null && (
          <View className="px-4 mb-2">
            <View
              className={`p-3 rounded-xl ${
                remainingDiagnoses > 0
                  ? isDark ? 'bg-primary-500/10' : 'bg-primary-50'
                  : isDark ? 'bg-red-500/10' : 'bg-red-50'
              }`}
            >
              <View className="flex-row items-center">
                <MaterialIcons
                  name={remainingDiagnoses > 0 ? 'info' : 'warning'}
                  size={20}
                  color={remainingDiagnoses > 0 ? '#3B82F6' : '#EF4444'}
                  style={{ marginRight: 8 }}
                />
                <Text
                  className={`flex-1 text-sm ${
                    remainingDiagnoses > 0
                      ? isDark ? 'text-primary-300' : 'text-primary-700'
                      : isDark ? 'text-red-300' : 'text-red-700'
                  }`}
                >
                  {remainingDiagnoses > 0
                    ? `You have ${remainingDiagnoses} free ${remainingDiagnoses === 1 ? 'diagnosis' : 'diagnoses'} remaining.`
                    : 'No free diagnoses remaining. Sign up for unlimited access!'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Hero Card */}
        <View className="px-4 py-3">
          <LinearGradient
            colors={
              urgencyLevel === 'low'
                ? isDark ? ['#05966940', '#1F293760'] : ['#DCFCE740', '#FFFFFF60']
                : urgencyLevel === 'medium'
                ? isDark ? ['#78350F40', '#1F293760'] : ['#FEF3C740', '#FFFFFF60']
                : isDark ? ['#7F1D1D40', '#1F293760'] : ['#FEE2E240', '#FFFFFF60']
            }
            className="rounded-2xl p-6 items-center"
          >
            <View className={`h-16 w-16 rounded-full ${urgency.bg} items-center justify-center mb-4`}>
              <MaterialIcons name={urgency.icon as any} size={32} color={urgency.iconColor} />
            </View>
            <Text
              className={`text-xl font-bold mb-1 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Diagnosis Complete!
            </Text>
            <Text
              className={`text-base text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
            >
              {result.ai_diagnosis || 'Analysis complete'}
            </Text>
          </LinearGradient>
        </View>

        {/* Confidence */}
        {confidence > 0 && (
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
                {Math.round(confidence * 100)}%
              </Text>
            </View>
            <View
              className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
            >
              <View
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${confidence * 100}%` }}
              />
            </View>
          </View>
        )}

        {/* Quick Summary */}
        <View className="flex-row flex-wrap gap-3 px-4 py-4">
          <Card variant="outlined" padding="md" className="flex-1 min-w-[150px]">
            <MaterialIcons name={urgency.icon as any} size={24} color={urgency.iconColor} />
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
              name={result.status === 'completed' ? 'check-circle' : 'pending'}
              size={24}
              color={result.status === 'completed' ? '#10B981' : '#F59E0B'}
            />
            <Text
              className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {result.status === 'completed' ? 'Complete' : 'Processing'}
            </Text>
            <Text
              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              Status
            </Text>
          </Card>
        </View>

        {/* Possible Causes */}
        {result.ai_possible_causes && result.ai_possible_causes.length > 0 && (
          <View className="px-4 py-4">
            <Text
              className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Possible Causes
            </Text>
            {result.ai_possible_causes.map((cause, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="h-6 w-6 rounded-full bg-primary-500/20 items-center justify-center mr-3 mt-0.5">
                  <Text className="text-primary-500 font-bold text-xs">
                    {index + 1}
                  </Text>
                </View>
                <Text
                  className={`flex-1 text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  {cause}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommended Actions */}
        {result.ai_recommended_actions && result.ai_recommended_actions.length > 0 && (
          <View className="px-4 py-2">
            <Card variant="outlined" padding="none">
              <TouchableOpacity
                onPress={() => setDiyExpanded(!diyExpanded)}
                className="flex-row items-center justify-between p-4"
              >
                <Text
                  className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  Recommended Actions
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
                      If you are unsure, please consult a professional mechanic.
                    </Text>
                  </View>

                  {result.ai_recommended_actions.map((action, index) => (
                    <View key={index} className="flex-row items-start mb-3">
                      <View className="h-6 w-6 rounded-full bg-primary-500/20 items-center justify-center mr-3">
                        <Text className="text-primary-500 font-bold text-xs">
                          {index + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                        >
                          {typeof action === 'string' ? action : action.action}
                        </Text>
                        {typeof action === 'object' && action.priority && (
                          <View className={`mt-1 self-start px-2 py-0.5 rounded-full ${
                            action.priority === 'high' ? 'bg-red-500/20' :
                            action.priority === 'medium' ? 'bg-amber-500/20' : 'bg-green-500/20'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              action.priority === 'high' ? 'text-red-500' :
                              action.priority === 'medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>
                              {action.priority} priority
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Error Message if failed */}
        {result.error_message && (
          <View className="px-4 py-4">
            <Card
              variant="outlined"
              padding="md"
              className="border-red-500/30 bg-red-500/5"
            >
              <Text className="text-lg font-bold text-red-500 mb-2">
                Note
              </Text>
              <Text
                className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}
              >
                {result.error_message}
              </Text>
            </Card>
          </View>
        )}

        {/* Bottom padding for footer */}
        <View className="h-48" />
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
          title={isGuest ? "Sign Up to Connect with Experts" : "Find Local Expert"}
          icon={isGuest ? "person-add" : "search"}
          onPress={handleFindExpert}
          fullWidth
        />

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
