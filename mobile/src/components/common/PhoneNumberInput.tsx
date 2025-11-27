import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PhoneInput, { PhoneInputProps } from 'react-native-phone-number-input';
import { useTheme } from '../../context/ThemeContext';

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
        defaultValue={value}
        defaultCode={defaultCode}
        layout="first"
        onChangeText={onChangeText}
        onChangeFormattedText={onChangeFormattedText}
        placeholder={placeholder}
        disabled={disabled}
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
