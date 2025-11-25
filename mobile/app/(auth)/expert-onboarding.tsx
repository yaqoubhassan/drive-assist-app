import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Button, Input, AddressAutocomplete, LocationData } from '../../src/components/common';
import {
  ExpertOnboardingData,
  BusinessTypes,
  ExpertSpecialties,
  BusinessHours,
  DayHours,
} from '../../src/types';

const TOTAL_STEPS = 5;

const DAYS: { key: keyof BusinessHours; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const DEFAULT_HOURS: BusinessHours = {
  monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
  tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
  wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
  thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
  friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
  saturday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
  sunday: { isOpen: false },
};

export default function ExpertOnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { user, completeExpertOnboarding, isExpertOnboardingComplete, isEmailVerified } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBusinessTypePicker, setShowBusinessTypePicker] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | undefined>();

  // Form data
  const [formData, setFormData] = useState<ExpertOnboardingData>({
    phone: user?.phone || '',
    businessName: '',
    businessType: '',
    yearsExperience: undefined,
    employeeCount: undefined,
    bio: '',
    businessAddress: '',
    serviceRadiusKm: 25,
    specialties: [],
    operatingHours: DEFAULT_HOURS,
    acceptsEmergency: false,
  });

  // Redirect if already completed or not verified
  useEffect(() => {
    if (isExpertOnboardingComplete) {
      router.replace('/(expert)');
    }
  }, [isExpertOnboardingComplete]);

  const updateFormData = (updates: Partial<ExpertOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  const handleLocationChange = (location: LocationData) => {
    setLocationData(location);
    updateFormData({
      businessAddress: location.address,
      locationLatitude: location.latitude,
      locationLongitude: location.longitude,
    });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.businessName?.trim()) {
          newErrors.businessName = 'Business name is required';
        }
        if (!formData.businessType) {
          newErrors.businessType = 'Please select a business type';
        }
        if (!formData.phone?.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        break;

      case 2: // Location
        if (!formData.businessAddress?.trim()) {
          newErrors.businessAddress = 'Business address is required';
        }
        break;

      case 3: // Services
        if (formData.specialties.length === 0) {
          newErrors.specialties = 'Please select at least one specialty';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await completeExpertOnboarding(formData);
      router.replace('/(expert)');
    } catch (err) {
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    const newSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter((s) => s !== specialty)
      : [...formData.specialties, specialty];
    updateFormData({ specialties: newSpecialties });
  };

  const updateDayHours = (day: keyof BusinessHours, updates: Partial<DayHours>) => {
    const newHours = {
      ...formData.operatingHours,
      [day]: { ...formData.operatingHours?.[day], ...updates },
    };
    updateFormData({ operatingHours: newHours as BusinessHours });
  };

  const applyToAllDays = (sourceDay: keyof BusinessHours) => {
    const sourceHours = formData.operatingHours?.[sourceDay];
    if (!sourceHours) return;

    const newHours: BusinessHours = { ...formData.operatingHours } as BusinessHours;
    DAYS.forEach((day) => {
      newHours[day.key] = { ...sourceHours };
    });
    updateFormData({ operatingHours: newHours });
  };

  // Step 1: Basic Info
  const renderBasicInfoStep = () => (
    <View className="gap-4">
      <View className="mb-4">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Basic Information
        </Text>
        <Text className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Let's start with your business details
        </Text>
      </View>

      <Input
        label="Business Name *"
        placeholder="e.g., John's Auto Repair"
        value={formData.businessName}
        onChangeText={(value) => updateFormData({ businessName: value })}
        error={errors.businessName}
      />

      <Input
        label="Phone Number *"
        placeholder="+233 XX XXX XXXX"
        value={formData.phone}
        onChangeText={(value) => updateFormData({ phone: value })}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <View>
        <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Business Type *
        </Text>
        <TouchableOpacity
          onPress={() => setShowBusinessTypePicker(true)}
          className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${
            formData.businessType
              ? 'border-primary-500 bg-primary-500/5'
              : errors.businessType
              ? 'border-red-500'
              : isDark
              ? 'border-slate-700 bg-slate-800'
              : 'border-slate-200 bg-white'
          }`}
        >
          <View className="flex-row items-center flex-1">
            <MaterialIcons
              name="business"
              size={22}
              color={formData.businessType ? '#3B82F6' : isDark ? '#64748B' : '#94A3B8'}
            />
            <Text
              className={`ml-3 ${
                formData.businessType
                  ? isDark
                    ? 'text-white'
                    : 'text-slate-900'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-slate-400'
              }`}
            >
              {formData.businessType
                ? BusinessTypes[formData.businessType as keyof typeof BusinessTypes]
                : 'Select your business type'}
            </Text>
          </View>
          <MaterialIcons
            name="keyboard-arrow-down"
            size={24}
            color={isDark ? '#64748B' : '#94A3B8'}
          />
        </TouchableOpacity>
        {errors.businessType && (
          <Text className="text-red-500 text-sm mt-1">{errors.businessType}</Text>
        )}
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1">
          <Input
            label="Years of Experience"
            placeholder="e.g., 5"
            value={formData.yearsExperience?.toString() || ''}
            onChangeText={(value) => updateFormData({ yearsExperience: parseInt(value) || undefined })}
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Input
            label="Number of Employees"
            placeholder="e.g., 3"
            value={formData.employeeCount?.toString() || ''}
            onChangeText={(value) => updateFormData({ employeeCount: parseInt(value) || undefined })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View>
        <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          About Your Business (Optional)
        </Text>
        <TextInput
          value={formData.bio}
          onChangeText={(value) => updateFormData({ bio: value })}
          placeholder="Tell customers about your business, experience, and what makes you special..."
          multiline
          numberOfLines={4}
          maxLength={500}
          className={`p-4 rounded-xl border-2 text-base min-h-[120px] ${
            isDark
              ? 'border-slate-700 bg-slate-800 text-white'
              : 'border-slate-200 bg-white text-slate-900'
          }`}
          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          textAlignVertical="top"
        />
        <Text className={`text-xs mt-1 text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          {formData.bio?.length || 0}/500
        </Text>
      </View>
    </View>
  );

  // Step 2: Location
  const renderLocationStep = () => (
    <View className="gap-4">
      <View className="mb-4">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Business Location
        </Text>
        <Text className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Help customers find you
        </Text>
      </View>

      <AddressAutocomplete
        label="Business Address *"
        placeholder="Search for your address..."
        value={locationData}
        onChange={handleLocationChange}
        error={errors.businessAddress}
      />

      <View>
        <Text className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          Service Radius
        </Text>
        <View className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          {/* Selected radius display */}
          <View className="items-center mb-4">
            <Text className={`text-3xl font-bold text-primary-500`}>
              {formData.serviceRadiusKm} km
            </Text>
          </View>

          {/* Slider with minus/plus buttons */}
          <View className="flex-row items-center gap-3">
            {/* Minus button */}
            <TouchableOpacity
              onPress={() => {
                const newValue = Math.max(5, (formData.serviceRadiusKm || 25) - 5);
                updateFormData({ serviceRadiusKm: newValue });
              }}
              className={`h-10 w-10 rounded-full items-center justify-center ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            >
              <MaterialIcons name="remove" size={24} color={isDark ? '#FFFFFF' : '#374151'} />
            </TouchableOpacity>

            {/* Progress bar */}
            <View className="flex-1">
              <View className={`h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`}>
                <View
                  className="h-full bg-primary-500 rounded-full"
                  style={{ width: `${((formData.serviceRadiusKm || 25) - 5) / 95 * 100}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>5 km</Text>
                <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>100 km</Text>
              </View>
            </View>

            {/* Plus button */}
            <TouchableOpacity
              onPress={() => {
                const newValue = Math.min(100, (formData.serviceRadiusKm || 25) + 5);
                updateFormData({ serviceRadiusKm: newValue });
              }}
              className={`h-10 w-10 rounded-full items-center justify-center ${
                isDark ? 'bg-slate-700' : 'bg-slate-200'
              }`}
            >
              <MaterialIcons name="add" size={24} color={isDark ? '#FFFFFF' : '#374151'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          This is how far you're willing to travel for jobs
        </Text>
      </View>

      <View className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
        <View className="flex-row items-center">
          <MaterialIcons name="info" size={20} color="#3B82F6" />
          <Text className={`flex-1 ml-2 text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            You can update your location anytime from your profile settings
          </Text>
        </View>
      </View>
    </View>
  );

  // Step 3: Services
  const renderServicesStep = () => (
    <View className="gap-4">
      <View className="mb-4">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Services & Specialties
        </Text>
        <Text className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Select the services you offer (at least one)
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {Object.entries(ExpertSpecialties).map(([key, label]) => {
          const isSelected = formData.specialties.includes(key);
          return (
            <TouchableOpacity
              key={key}
              onPress={() => toggleSpecialty(key)}
              className={`px-4 py-3 rounded-xl border-2 ${
                isSelected
                  ? 'border-primary-500 bg-primary-500/10'
                  : isDark
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <View className="flex-row items-center">
                {isSelected && (
                  <MaterialIcons name="check-circle" size={18} color="#3B82F6" style={{ marginRight: 6 }} />
                )}
                <Text
                  className={`font-medium ${
                    isSelected ? 'text-primary-500' : isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {errors.specialties && (
        <Text className="text-red-500 text-sm">{errors.specialties}</Text>
      )}

      {formData.specialties.length > 0 && (
        <View className={`p-4 rounded-xl ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
          <Text className={`font-semibold mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            {formData.specialties.length} service{formData.specialties.length > 1 ? 's' : ''} selected
          </Text>
          <Text className={`text-sm ${isDark ? 'text-green-400/70' : 'text-green-600/70'}`}>
            You can add more services later from your profile
          </Text>
        </View>
      )}
    </View>
  );

  // Step 4: Operating Hours
  const renderAvailabilityStep = () => (
    <View className="gap-4">
      <View className="mb-2">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Operating Hours
        </Text>
        <Text className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Set your business hours (optional - can be updated later)
        </Text>
      </View>

      {DAYS.map((day, index) => {
        const hours = formData.operatingHours?.[day.key];
        return (
          <View
            key={day.key}
            className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {day.label}
              </Text>
              <View className="flex-row items-center gap-2">
                {index === 0 && (
                  <TouchableOpacity
                    onPress={() => applyToAllDays(day.key)}
                    className="px-2 py-1 bg-primary-500/20 rounded"
                  >
                    <Text className="text-primary-500 text-xs font-semibold">Apply to all</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => updateDayHours(day.key, { isOpen: !hours?.isOpen })}
                  className={`w-12 h-6 rounded-full ${hours?.isOpen ? 'bg-green-500' : 'bg-slate-400'}`}
                >
                  <View
                    className={`w-5 h-5 bg-white rounded-full m-0.5 ${
                      hours?.isOpen ? 'ml-auto mr-0.5' : ''
                    }`}
                  />
                </TouchableOpacity>
              </View>
            </View>
            {hours?.isOpen && (
              <View className="flex-row items-center gap-4">
                <View className="flex-1">
                  <Text className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Open
                  </Text>
                  <TextInput
                    value={hours.openTime || ''}
                    onChangeText={(value) => updateDayHours(day.key, { openTime: value })}
                    placeholder="08:00"
                    className={`px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'border-slate-600 bg-slate-700 text-white'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
                <Text className={`pt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>to</Text>
                <View className="flex-1">
                  <Text className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Close
                  </Text>
                  <TextInput
                    value={hours.closeTime || ''}
                    onChangeText={(value) => updateDayHours(day.key, { closeTime: value })}
                    placeholder="18:00"
                    className={`px-3 py-2 rounded-lg border ${
                      isDark
                        ? 'border-slate-600 bg-slate-700 text-white'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity
        onPress={() => updateFormData({ acceptsEmergency: !formData.acceptsEmergency })}
        className={`p-4 rounded-xl border-2 ${
          formData.acceptsEmergency
            ? 'border-orange-500 bg-orange-500/10'
            : isDark
            ? 'border-slate-700 bg-slate-800'
            : 'border-slate-200 bg-white'
        }`}
      >
        <View className="flex-row items-center">
          <View
            className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
              formData.acceptsEmergency
                ? 'bg-orange-500 border-orange-500'
                : isDark
                ? 'border-slate-600'
                : 'border-slate-300'
            }`}
          >
            {formData.acceptsEmergency && (
              <MaterialIcons name="check" size={16} color="#FFFFFF" />
            )}
          </View>
          <View className="flex-1">
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Accept Emergency Calls
            </Text>
            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Allow customers to contact you outside business hours
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Step 5: Complete
  const renderCompleteStep = () => (
    <View className="items-center justify-center flex-1 py-8">
      <View className="h-24 w-24 rounded-full bg-green-500/20 items-center justify-center mb-6">
        <MaterialIcons name="check-circle" size={60} color="#10B981" />
      </View>
      <Text className={`text-3xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        You're All Set!
      </Text>
      <Text className={`text-center text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Your profile is ready. Start receiving leads{'\n'}and grow your business.
      </Text>

      <View className={`w-full p-6 rounded-2xl mb-8 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
        <Text className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          What's Next?
        </Text>
        <View className="gap-4">
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-full bg-primary-500/20 items-center justify-center mr-4">
              <MaterialIcons name="verified-user" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Complete KYC Verification
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Get verified badge & unlock all features
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-full bg-green-500/20 items-center justify-center mr-4">
              <MaterialIcons name="build" size={20} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Add Your Services
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Set prices and details for your services
              </Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="h-10 w-10 rounded-full bg-orange-500/20 items-center justify-center mr-4">
              <MaterialIcons name="notifications-active" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Enable Notifications
              </Text>
              <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Never miss a lead or booking
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Button
        title="Go to Dashboard"
        onPress={handleComplete}
        loading={loading}
        fullWidth
        icon={<MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />}
      />
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderBasicInfoStep();
      case 2:
        return renderLocationStep();
      case 3:
        return renderServicesStep();
      case 4:
        return renderAvailabilityStep();
      case 5:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-4">
            {step > 1 && step < 5 ? (
              <TouchableOpacity
                onPress={handleBack}
                className="h-10 w-10 items-center justify-center"
              >
                <MaterialIcons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#111827'} />
              </TouchableOpacity>
            ) : (
              <View className="h-10 w-10" />
            )}
            {step < 5 && (
              <Text className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Step {step} of {TOTAL_STEPS - 1}
              </Text>
            )}
            <View className="h-10 w-10" />
          </View>

          {/* Progress bar */}
          {step < 5 && (
            <View className={`h-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
              <View
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${(step / (TOTAL_STEPS - 1)) * 100}%` }}
              />
            </View>
          )}
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {renderStep()}
        </ScrollView>

        {/* Bottom Actions */}
        {step < 5 && (
          <View className={`px-6 py-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            {step === 4 ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setStep(5)}
                  className={`flex-1 h-12 rounded-xl items-center justify-center ${
                    isDark ? 'bg-slate-800' : 'bg-slate-200'
                  }`}
                >
                  <Text className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    Skip for now
                  </Text>
                </TouchableOpacity>
                <View className="flex-1">
                  <Button title="Continue" onPress={() => setStep(5)} fullWidth />
                </View>
              </View>
            ) : (
              <Button title="Continue" onPress={handleNext} fullWidth />
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Business Type Bottom Sheet Modal */}
      <Modal
        visible={showBusinessTypePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBusinessTypePicker(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setShowBusinessTypePicker(false)}
          />
          <View
            className={`rounded-t-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            style={{ maxHeight: '70%' }}
          >
            {/* Handle bar */}
            <View className="items-center py-3">
              <View className={`w-10 h-1 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />
            </View>

            {/* Header */}
            <View className={`flex-row items-center justify-between px-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Select Business Type
              </Text>
              <TouchableOpacity onPress={() => setShowBusinessTypePicker(false)}>
                <MaterialIcons name="close" size={24} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <ScrollView className="px-4 py-2" showsVerticalScrollIndicator={false}>
              {Object.entries(BusinessTypes).map(([key, label]) => {
                const isSelected = formData.businessType === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      updateFormData({ businessType: key });
                      setShowBusinessTypePicker(false);
                    }}
                    className={`flex-row items-center p-4 rounded-xl mb-2 ${
                      isSelected
                        ? 'bg-primary-500/10 border-2 border-primary-500'
                        : isDark
                        ? 'bg-slate-800'
                        : 'bg-slate-50'
                    }`}
                  >
                    <View
                      className={`h-10 w-10 rounded-full items-center justify-center mr-4 ${
                        isSelected ? 'bg-primary-500' : isDark ? 'bg-slate-700' : 'bg-slate-200'
                      }`}
                    >
                      <MaterialIcons
                        name="business"
                        size={20}
                        color={isSelected ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B'}
                      />
                    </View>
                    <Text
                      className={`flex-1 font-medium ${
                        isSelected
                          ? 'text-primary-500'
                          : isDark
                          ? 'text-white'
                          : 'text-slate-900'
                      }`}
                    >
                      {label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={24} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                );
              })}
              {/* Safe area padding for bottom */}
              <View style={{ height: 34 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
