import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// Country data with flag emoji, dial code, and country code
interface CountryData {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

// For now, we only support Ghana - but this can be expanded later
const COUNTRIES: CountryData[] = [
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  // Add more countries here when needed:
  // { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  // { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
];

// Country code to dial code mapping
const DIAL_CODE_MAP: Record<string, string> = {
  '+233': 'GH',
  '+234': 'NG',
  '+254': 'KE',
  '+27': 'ZA',
  '+1': 'US',
  '+44': 'GB',
};

interface PhoneNumberInputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  placeholder?: string;
  defaultCountryCode?: string;
  error?: string;
  disabled?: boolean;
}

// Helper function to parse existing phone number
const parsePhoneNumber = (phone: string): { countryCode: string | null; nationalNumber: string } => {
  if (!phone) return { countryCode: null, nationalNumber: '' };

  let cleaned = phone.replace(/\s+/g, '').trim();

  // Check for country code prefix
  if (cleaned.startsWith('+')) {
    // Sort by length descending to match longer codes first
    const sortedCodes = Object.keys(DIAL_CODE_MAP).sort((a, b) => b.length - a.length);

    for (const dialCode of sortedCodes) {
      if (cleaned.startsWith(dialCode)) {
        let nationalNumber = cleaned.substring(dialCode.length);
        // Remove leading zero if present
        if (nationalNumber.startsWith('0')) {
          nationalNumber = nationalNumber.substring(1);
        }
        return { countryCode: DIAL_CODE_MAP[dialCode], nationalNumber };
      }
    }
  }

  // No country code found - strip leading zero if present
  let nationalNumber = cleaned;
  if (nationalNumber.startsWith('0') && nationalNumber.length >= 9) {
    nationalNumber = nationalNumber.substring(1);
  }

  return { countryCode: null, nationalNumber };
};

// Format number for display (add spaces for readability)
const formatDisplayNumber = (number: string): string => {
  // Remove any existing formatting
  const digits = number.replace(/\D/g, '');

  // Ghana format: XXX XXX XXXX (3-3-4)
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
};

export function PhoneNumberInput({
  label,
  value,
  onChangeText,
  onChangeFormattedText,
  placeholder = 'XX XXX XXXX',
  defaultCountryCode = 'GH',
  error,
  disabled = false,
}: PhoneNumberInputProps) {
  const { isDark } = useTheme();
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    COUNTRIES.find(c => c.code === defaultCountryCode) || COUNTRIES[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse initial value
  useEffect(() => {
    if (value && !isInitialized) {
      const { countryCode, nationalNumber } = parsePhoneNumber(value);

      if (countryCode) {
        const country = COUNTRIES.find(c => c.code === countryCode);
        if (country) {
          setSelectedCountry(country);
        }
      }

      setPhoneNumber(nationalNumber);
      setIsInitialized(true);
    } else if (!value && !isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle phone number change
  const handlePhoneChange = useCallback((text: string) => {
    // Remove non-digit characters for processing
    let digits = text.replace(/\D/g, '');

    // Remove leading zero
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    // Limit to 10 digits (Ghana phone numbers without country code)
    digits = digits.slice(0, 10);

    setPhoneNumber(digits);

    // Call callbacks
    if (onChangeText) {
      onChangeText(digits);
    }

    if (onChangeFormattedText) {
      // Return full formatted number with country code
      const formattedNumber = digits ? `${selectedCountry.dialCode}${digits}` : '';
      onChangeFormattedText(formattedNumber);
    }
  }, [selectedCountry, onChangeText, onChangeFormattedText]);

  // Handle country selection
  const handleSelectCountry = useCallback((country: CountryData) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);

    // Update formatted text with new country code
    if (onChangeFormattedText && phoneNumber) {
      onChangeFormattedText(`${country.dialCode}${phoneNumber}`);
    }
  }, [phoneNumber, onChangeFormattedText]);

  // Theme colors
  const backgroundColor = isDark ? '#1E293B' : '#F8FAFC';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const borderColor = error
    ? '#EF4444'
    : isFocused
      ? '#3B82F6'
      : isDark
        ? '#334155'
        : '#E2E8F0';
  const flagBgColor = isDark ? '#334155' : '#F1F5F9';
  const separatorColor = isDark ? '#475569' : '#CBD5E1';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: isDark ? '#CBD5E1' : '#374151' }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor,
            borderWidth: 2,
          },
        ]}
      >
        {/* Country Selector with Flag */}
        <TouchableOpacity
          style={[styles.countryButton, { backgroundColor: flagBgColor }]}
          onPress={() => !disabled && COUNTRIES.length > 1 && setShowCountryPicker(true)}
          disabled={disabled || COUNTRIES.length <= 1}
          activeOpacity={COUNTRIES.length > 1 ? 0.7 : 1}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={[styles.dialCode, { color: textColor }]}>
            {selectedCountry.dialCode}
          </Text>
          {COUNTRIES.length > 1 && (
            <MaterialIcons
              name="arrow-drop-down"
              size={20}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          )}
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.separator, { backgroundColor: separatorColor }]} />

        {/* Phone Number Input */}
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={formatDisplayNumber(phoneNumber)}
          onChangeText={handlePhoneChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          keyboardType="phone-pad"
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={12} // Account for spaces in formatting
        />
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Country Picker Modal (only shown if multiple countries) */}
      {COUNTRIES.length > 1 && (
        <Modal
          visible={showCountryPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCountryPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCountryPicker(false)}
          >
            <View
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? '#FFFFFF' : '#0F172A' },
                ]}
              >
                Select Country
              </Text>

              <ScrollView style={styles.countryList}>
                {COUNTRIES.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[
                      styles.countryItem,
                      selectedCountry.code === country.code && {
                        backgroundColor: isDark ? '#334155' : '#F1F5F9',
                      },
                    ]}
                    onPress={() => handleSelectCountry(country)}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text
                      style={[
                        styles.countryName,
                        { color: isDark ? '#FFFFFF' : '#0F172A' },
                      ]}
                    >
                      {country.name}
                    </Text>
                    <Text
                      style={[
                        styles.countryDialCode,
                        { color: isDark ? '#94A3B8' : '#64748B' },
                      ]}
                    >
                      {country.dialCode}
                    </Text>
                    {selectedCountry.code === country.code && (
                      <MaterialIcons name="check" size={20} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

// Helper function to validate Ghana phone number
export const isValidGhanaPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  // Ghana phone numbers are 9-10 digits (without country code)
  // With country code (+233), total is 12-13 digits
  if (digits.startsWith('233')) {
    return digits.length >= 12 && digits.length <= 13;
  }
  return digits.length >= 9 && digits.length <= 10;
};

// Helper to format a phone number for display
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';

  const { nationalNumber } = parsePhoneNumber(phone);
  return `+233 ${formatDisplayNumber(nationalNumber)}`;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    height: 56,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    gap: 4,
  },
  flag: {
    fontSize: 24,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    width: 1,
    height: 28,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 12,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
  },
  countryDialCode: {
    fontSize: 14,
  },
});

export default PhoneNumberInput;
