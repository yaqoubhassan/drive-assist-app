import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PhoneInput, { PhoneInputProps } from 'react-native-phone-number-input';
import { useTheme } from '../../context/ThemeContext';

// Country code mapping for common countries
const COUNTRY_CODES: Record<string, string> = {
  '+233': 'GH', // Ghana
  '+234': 'NG', // Nigeria
  '+254': 'KE', // Kenya
  '+27': 'ZA',  // South Africa
  '+1': 'US',   // USA/Canada
  '+44': 'GB',  // UK
  '+49': 'DE',  // Germany
  '+33': 'FR',  // France
  '+91': 'IN',  // India
  '+86': 'CN',  // China
  '+81': 'JP',  // Japan
  '+82': 'KR',  // South Korea
  '+61': 'AU',  // Australia
  '+55': 'BR',  // Brazil
  '+52': 'MX',  // Mexico
  '+228': 'TG', // Togo
  '+225': 'CI', // Ivory Coast
  '+226': 'BF', // Burkina Faso
  '+229': 'BJ', // Benin
};

// Dial codes mapping (country code to dial code)
const DIAL_CODES: Record<string, string> = {
  'GH': '+233',
  'NG': '+234',
  'KE': '+254',
  'ZA': '+27',
  'US': '+1',
  'GB': '+44',
  'DE': '+49',
  'FR': '+33',
  'IN': '+91',
  'CN': '+86',
  'JP': '+81',
  'KR': '+82',
  'AU': '+61',
  'BR': '+55',
  'MX': '+52',
  'TG': '+228',
  'CI': '+225',
  'BF': '+226',
  'BJ': '+229',
};

interface PhoneNumberInputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onChangeFormattedText?: (text: string) => void;
  placeholder?: string;
  defaultCode?: PhoneInputProps['defaultCode'];
  error?: string;
  disabled?: boolean;
}

// Helper function to parse a phone number and extract country code and national number
const parsePhoneNumber = (phoneNumber: string): { countryCode: string | null; nationalNumber: string } => {
  if (!phoneNumber) {
    return { countryCode: null, nationalNumber: '' };
  }

  // Clean the phone number
  let cleaned = phoneNumber.replace(/\s+/g, '').trim();

  // Check if it starts with a + and try to extract country code
  if (cleaned.startsWith('+')) {
    // Try to match known country codes (longer codes first)
    const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);

    for (const code of sortedCodes) {
      if (cleaned.startsWith(code)) {
        const nationalNumber = cleaned.substring(code.length);
        return {
          countryCode: COUNTRY_CODES[code],
          nationalNumber: nationalNumber.replace(/^0+/, ''), // Remove leading zeros
        };
      }
    }
  }

  // If no country code found, just return the number without leading zeros
  // But only remove the first zero if it looks like a local number
  let nationalNumber = cleaned.replace(/^\+/, '');
  if (nationalNumber.startsWith('0') && nationalNumber.length >= 9) {
    nationalNumber = nationalNumber.substring(1);
  }

  return { countryCode: null, nationalNumber };
};

export function PhoneNumberInput({
  label,
  value,
  onChangeText,
  onChangeFormattedText,
  placeholder = 'Phone number',
  defaultCode = 'GH',
  error,
  disabled = false,
}: PhoneNumberInputProps) {
  const { isDark } = useTheme();
  const phoneInput = useRef<PhoneInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState('');
  const [countryCode, setCountryCode] = useState<PhoneInputProps['defaultCode']>(defaultCode);
  const [isInitialized, setIsInitialized] = useState(false);

  // Parse the initial value to extract country code and national number
  useEffect(() => {
    if (value && !isInitialized) {
      const { countryCode: parsedCode, nationalNumber } = parsePhoneNumber(value);
      if (parsedCode) {
        setCountryCode(parsedCode as PhoneInputProps['defaultCode']);
      }
      setInternalValue(nationalNumber);
      setIsInitialized(true);
    } else if (!value && !isInitialized) {
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle text changes - strip leading zeros
  const handleChangeText = useCallback((text: string) => {
    // Remove leading zeros from the input
    let cleanedText = text;
    if (text.startsWith('0')) {
      cleanedText = text.substring(1);
    }

    setInternalValue(cleanedText);

    if (onChangeText) {
      onChangeText(cleanedText);
    }
  }, [onChangeText]);

  // Handle formatted text changes
  const handleChangeFormattedText = useCallback((text: string) => {
    if (onChangeFormattedText) {
      // The library returns the formatted number with country code
      // Make sure we're not duplicating country codes
      onChangeFormattedText(text);
    }
  }, [onChangeFormattedText]);

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
  const codeTextColor = isDark ? '#CBD5E1' : '#475569';
  const flagButtonBg = isDark ? '#334155' : '#F1F5F9';

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: isDark ? '#CBD5E1' : '#374151' },
          ]}
        >
          {label}
        </Text>
      )}
      <PhoneInput
        ref={phoneInput}
        defaultValue={internalValue}
        defaultCode={countryCode}
        layout="first"
        onChangeText={handleChangeText}
        onChangeFormattedText={handleChangeFormattedText}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={false}
        containerStyle={[
          styles.phoneContainer,
          {
            backgroundColor,
            borderColor,
            borderWidth: 2,
          },
        ]}
        textContainerStyle={[
          styles.textContainer,
          { backgroundColor: 'transparent' },
        ]}
        textInputStyle={[
          styles.textInput,
          { color: textColor },
        ]}
        codeTextStyle={[
          styles.codeText,
          { color: codeTextColor },
        ]}
        flagButtonStyle={[
          styles.flagButton,
          { backgroundColor: flagButtonBg },
        ]}
        countryPickerButtonStyle={styles.countryPickerButton}
        textInputProps={{
          placeholderTextColor: placeholderColor,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        countryPickerProps={{
          withFilter: true,
          withFlag: true,
          withCountryNameButton: false,
          withAlphaFilter: true,
          withCallingCode: true,
          withEmoji: true,
          theme: isDark
            ? {
                backgroundColor: '#1E293B',
                onBackgroundTextColor: '#FFFFFF',
                fontSize: 16,
                fontFamily: 'System',
                filterPlaceholderTextColor: '#64748B',
                activeOpacity: 0.7,
                itemHeight: 50,
              }
            : undefined,
        }}
      />
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

// Helper function to validate phone number
export const isValidPhoneNumber = (
  phoneInputRef: React.RefObject<PhoneInput>
): boolean => {
  return phoneInputRef.current?.isValidNumber(
    phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero().formattedNumber || ''
  ) ?? false;
};

// Helper function to get formatted number with country code
export const getFormattedPhoneNumber = (
  phoneInputRef: React.RefObject<PhoneInput>
): string => {
  const checkValid = phoneInputRef.current?.isValidNumber(
    phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero().formattedNumber || ''
  );
  if (checkValid) {
    return phoneInputRef.current?.getNumberAfterPossiblyEliminatingZero().formattedNumber || '';
  }
  return '';
};

// Helper to format a phone number for display
export const formatPhoneForDisplay = (phone: string, countryCode: string = 'GH'): string => {
  if (!phone) return '';

  const { nationalNumber } = parsePhoneNumber(phone);
  const dialCode = DIAL_CODES[countryCode] || '+233';

  return `${dialCode}${nationalNumber}`;
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
  phoneContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  textContainer: {
    paddingVertical: 0,
    borderRadius: 12,
  },
  textInput: {
    fontSize: 16,
    height: 50,
    paddingVertical: 0,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  flagButton: {
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 4,
  },
  countryPickerButton: {
    marginLeft: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default PhoneNumberInput;
