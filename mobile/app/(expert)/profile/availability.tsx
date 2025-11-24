import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Button, Badge } from '../../../src/components/common';

interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface TimeSlot {
  label: string;
  value: string;
}

const timeOptions: TimeSlot[] = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

const initialSchedule: DaySchedule[] = [
  { day: 'Monday', enabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Tuesday', enabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Wednesday', enabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Thursday', enabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Friday', enabled: true, startTime: '08:00', endTime: '18:00' },
  { day: 'Saturday', enabled: true, startTime: '09:00', endTime: '15:00' },
  { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '13:00' },
];

export default function AvailabilityScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);
  const [acceptingLeads, setAcceptingLeads] = useState(true);
  const [instantBooking, setInstantBooking] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: string) => {
    setSchedule(schedule.map((s) =>
      s.day === day ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const updateTime = (day: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(schedule.map((s) =>
      s.day === day ? { ...s, [field]: value } : s
    ));
  };

  const getTimeLabel = (value: string) => {
    const option = timeOptions.find((t) => t.value === value);
    return option?.label || value;
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    Alert.alert('Saved', 'Your availability has been updated.');
    router.back();
  };

  const workingDays = schedule.filter((s) => s.enabled).length;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`} edges={['top']}>
      {/* Header */}
      <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center mr-2"
        >
          <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Availability
          </Text>
          <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {workingDays} working days set
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Cards */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <View className="flex-row items-center flex-1">
                <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${acceptingLeads ? 'bg-green-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <MaterialIcons
                    name={acceptingLeads ? 'check-circle' : 'pause-circle'}
                    size={24}
                    color={acceptingLeads ? '#10B981' : '#64748B'}
                  />
                </View>
                <View>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Accepting Leads
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {acceptingLeads ? 'You\'ll receive new leads' : 'Leads are paused'}
                  </Text>
                </View>
              </View>
              <Switch
                value={acceptingLeads}
                onValueChange={setAcceptingLeads}
                trackColor={{ false: '#E2E8F0', true: '#10B98180' }}
                thumbColor={acceptingLeads ? '#10B981' : '#94A3B8'}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className={`h-10 w-10 rounded-full items-center justify-center mr-3 ${instantBooking ? 'bg-primary-500/20' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <MaterialIcons
                    name="bolt"
                    size={24}
                    color={instantBooking ? '#3B82F6' : '#64748B'}
                  />
                </View>
                <View>
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Instant Booking
                  </Text>
                  <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {instantBooking ? 'Customers can book directly' : 'Approval required'}
                  </Text>
                </View>
              </View>
              <Switch
                value={instantBooking}
                onValueChange={setInstantBooking}
                trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                thumbColor={instantBooking ? '#3B82F6' : '#94A3B8'}
              />
            </View>
          </Card>
        </View>

        {/* Weekly Schedule */}
        <View className="px-4 pb-6">
          <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Weekly Schedule
          </Text>
          <View className="gap-3">
            {schedule.map((daySchedule) => (
              <Card key={daySchedule.day} variant="default">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Switch
                      value={daySchedule.enabled}
                      onValueChange={() => toggleDay(daySchedule.day)}
                      trackColor={{ false: '#E2E8F0', true: '#3B82F680' }}
                      thumbColor={daySchedule.enabled ? '#3B82F6' : '#94A3B8'}
                    />
                    <View className="ml-3">
                      <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {daySchedule.day}
                      </Text>
                      {daySchedule.enabled ? (
                        <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {getTimeLabel(daySchedule.startTime)} - {getTimeLabel(daySchedule.endTime)}
                        </Text>
                      ) : (
                        <Text className="text-sm text-slate-400">Closed</Text>
                      )}
                    </View>
                  </View>

                  {daySchedule.enabled && (
                    <TouchableOpacity
                      onPress={() => setEditingDay(editingDay === daySchedule.day ? null : daySchedule.day)}
                      className={`h-8 w-8 rounded-lg items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                    >
                      <MaterialIcons
                        name={editingDay === daySchedule.day ? 'expand-less' : 'edit'}
                        size={18}
                        color={isDark ? '#94A3B8' : '#64748B'}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Time Picker (expanded) */}
                {editingDay === daySchedule.day && daySchedule.enabled && (
                  <View className={`mt-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Start Time
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={{ gap: 8 }}
                        >
                          {timeOptions.slice(0, 8).map((time) => (
                            <TouchableOpacity
                              key={time.value}
                              onPress={() => updateTime(daySchedule.day, 'startTime', time.value)}
                              className={`px-3 py-2 rounded-lg ${
                                daySchedule.startTime === time.value
                                  ? 'bg-primary-500'
                                  : isDark
                                  ? 'bg-slate-800'
                                  : 'bg-slate-100'
                              }`}
                            >
                              <Text
                                className={`text-sm ${
                                  daySchedule.startTime === time.value
                                    ? 'text-white font-semibold'
                                    : isDark
                                    ? 'text-slate-300'
                                    : 'text-slate-600'
                                }`}
                              >
                                {time.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>

                    <View className="mt-3">
                      <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        End Time
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8 }}
                      >
                        {timeOptions.slice(6).map((time) => (
                          <TouchableOpacity
                            key={time.value}
                            onPress={() => updateTime(daySchedule.day, 'endTime', time.value)}
                            className={`px-3 py-2 rounded-lg ${
                              daySchedule.endTime === time.value
                                ? 'bg-primary-500'
                                : isDark
                                ? 'bg-slate-800'
                                : 'bg-slate-100'
                            }`}
                          >
                            <Text
                              className={`text-sm ${
                                daySchedule.endTime === time.value
                                  ? 'text-white font-semibold'
                                  : isDark
                                  ? 'text-slate-300'
                                  : 'text-slate-600'
                              }`}
                            >
                              {time.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>

        {/* Holiday Mode */}
        <View className="px-4 pb-8">
          <Card variant="default" className="border border-orange-500/20 bg-orange-500/5">
            <View className="flex-row items-center">
              <MaterialIcons name="beach-access" size={24} color="#F59E0B" />
              <View className="flex-1 ml-3">
                <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Holiday Mode
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Set specific dates when you're unavailable
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={isDark ? '#64748B' : '#94A3B8'} />
            </View>
          </Card>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Button title="Save Changes" onPress={handleSave} loading={saving} fullWidth />
      </View>
    </SafeAreaView>
  );
}
