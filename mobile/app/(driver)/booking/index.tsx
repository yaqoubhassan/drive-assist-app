import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../src/context/ThemeContext';
import { Card, Avatar, Badge, Button } from '../../../src/components/common';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM',
];

const expertInfo = {
  id: '1',
  name: 'Emmanuel Auto Services',
  rating: 4.9,
  reviews: 127,
  specialty: 'Engine & Transmission',
  image: null,
};

export default function BookingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { expertId } = useLocalSearchParams<{ expertId: string }>();

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth &&
      selectedDate.getFullYear() === currentYear
    );
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setSelectedTime(null); // Reset time when date changes
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isPrevMonthDisabled = () => {
    return currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      router.push({
        pathname: '/(driver)/booking/confirm',
        params: {
          expertId: expertId || '1',
          date: selectedDate.toISOString(),
          time: selectedTime,
        },
      });
    }
  };

  const calendarDays = generateCalendarDays();

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
          Book Appointment
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Expert Info */}
        <View className="px-4 py-4">
          <Card variant="default">
            <View className="flex-row items-center">
              <Avatar size="lg" name={expertInfo.name} />
              <View className="ml-3 flex-1">
                <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {expertInfo.name}
                </Text>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {expertInfo.specialty}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MaterialIcons name="star" size={14} color="#F59E0B" />
                  <Text className={`text-sm ml-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {expertInfo.rating} ({expertInfo.reviews} reviews)
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        </View>

        {/* Calendar */}
        <View className="px-4 pb-4">
          <Card variant="default">
            {/* Month Navigation */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={handlePrevMonth}
                disabled={isPrevMonthDisabled()}
                className={`h-10 w-10 rounded-full items-center justify-center ${
                  isPrevMonthDisabled() ? 'opacity-30' : ''
                } ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
              >
                <MaterialIcons
                  name="chevron-left"
                  size={24}
                  color={isDark ? '#FFFFFF' : '#111827'}
                />
              </TouchableOpacity>
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {months[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity
                onPress={handleNextMonth}
                className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
              >
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={isDark ? '#FFFFFF' : '#111827'}
                />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View className="flex-row mb-2">
              {daysOfWeek.map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap">
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => day && handleDateSelect(day)}
                  disabled={!day || isDateDisabled(day)}
                  className="w-[14.28%] aspect-square items-center justify-center"
                >
                  {day && (
                    <View
                      className={`h-10 w-10 rounded-full items-center justify-center ${
                        isDateSelected(day)
                          ? 'bg-primary-500'
                          : isDateDisabled(day)
                          ? ''
                          : ''
                      }`}
                    >
                      <Text
                        className={`text-base ${
                          isDateSelected(day)
                            ? 'text-white font-bold'
                            : isDateDisabled(day)
                            ? isDark
                              ? 'text-slate-600'
                              : 'text-slate-300'
                            : isDark
                            ? 'text-white'
                            : 'text-slate-900'
                        }`}
                      >
                        {day}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>

        {/* Time Slots */}
        {selectedDate && (
          <View className="px-4 pb-6">
            <Text className={`text-lg font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Available Times
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => setSelectedTime(time)}
                  className={`px-4 py-3 rounded-xl ${
                    selectedTime === time
                      ? 'bg-primary-500'
                      : isDark
                      ? 'bg-slate-800'
                      : 'bg-white'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      selectedTime === time
                        ? 'text-white'
                        : isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <View className="px-4 pb-8">
            <Card variant="default" className="bg-primary-500/10 border border-primary-500/20">
              <View className="flex-row items-center">
                <MaterialIcons name="event" size={24} color="#3B82F6" />
                <View className="ml-3">
                  <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedDate.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                  <Text className="text-primary-500 font-semibold">{selectedTime}</Text>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View className={`px-4 py-4 border-t ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedDate || !selectedTime}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}
