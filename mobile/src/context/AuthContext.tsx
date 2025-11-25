import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, DriverProfile, ExpertProfile, KycStatus, ExpertOnboardingData } from '../types';
import { AppConstants } from '../constants';

interface AuthState {
  user: User | DriverProfile | ExpertProfile | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;
  // Expert-specific state
  isEmailVerified: boolean;
  isExpertOnboardingComplete: boolean;
  kycStatus: KycStatus;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  switchUserType: (type: UserType) => Promise<void>;
  // Email verification
  verifyEmail: (code: string) => Promise<boolean>;
  resendVerificationCode: () => Promise<void>;
  // Password reset
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (code: string, newPassword: string) => Promise<boolean>;
  // Expert onboarding
  completeExpertOnboarding: (data: ExpertOnboardingData) => Promise<void>;
  // KYC
  updateKycStatus: (status: KycStatus) => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  userType: UserType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userType: null,
    isAuthenticated: false,
    isLoading: true,
    isOnboardingComplete: false,
    // Expert-specific defaults
    isEmailVerified: false,
    isExpertOnboardingComplete: false,
    kycStatus: 'not_started',
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [token, userData, userType, onboardingComplete, emailVerified, expertOnboardingComplete, kycStatus] = await Promise.all([
        AsyncStorage.getItem(AppConstants.storageKeys.authToken),
        AsyncStorage.getItem(AppConstants.storageKeys.user),
        AsyncStorage.getItem(AppConstants.storageKeys.userType),
        AsyncStorage.getItem(AppConstants.storageKeys.onboardingComplete),
        AsyncStorage.getItem(AppConstants.storageKeys.emailVerified),
        AsyncStorage.getItem(AppConstants.storageKeys.expertOnboardingComplete),
        AsyncStorage.getItem(AppConstants.storageKeys.expertKycStatus),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        setState({
          user,
          userType: (userType as UserType) || 'driver',
          isAuthenticated: true,
          isLoading: false,
          isOnboardingComplete: onboardingComplete === 'true',
          isEmailVerified: emailVerified === 'true',
          isExpertOnboardingComplete: expertOnboardingComplete === 'true',
          kycStatus: (kycStatus as KycStatus) || 'not_started',
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isOnboardingComplete: onboardingComplete === 'true',
        }));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      // Simulating API response - check if email ends with @expert for expert login
      const isExpert = email.includes('expert');

      if (isExpert) {
        const mockExpert: ExpertProfile = {
          id: '1',
          email,
          fullName: 'Kwame Auto Services',
          phone: '+233 24 123 4567',
          userType: 'expert',
          businessName: 'Kwame Auto Services',
          businessType: 'auto_repair_shop',
          specialties: ['engine_repair', 'brakes', 'electrical'],
          services: [],
          rating: 4.8,
          reviewCount: 47,
          yearsExperience: 10,
          verified: true,
          certifications: [],
          hours: {
            monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
            saturday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
            sunday: { isOpen: false },
          },
          gallery: [],
          priceRange: 'average',
          emailVerified: true,
          onboardingComplete: true,
          kycStatus: 'approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AppConstants.storageKeys.authToken, 'mock_token');
        await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(mockExpert));
        await AsyncStorage.setItem(AppConstants.storageKeys.userType, 'expert');
        await AsyncStorage.setItem(AppConstants.storageKeys.emailVerified, 'true');
        await AsyncStorage.setItem(AppConstants.storageKeys.expertOnboardingComplete, 'true');
        await AsyncStorage.setItem(AppConstants.storageKeys.expertKycStatus, 'approved');

        setState(prev => ({
          ...prev,
          user: mockExpert,
          userType: 'expert',
          isAuthenticated: true,
          isEmailVerified: true,
          isExpertOnboardingComplete: true,
          kycStatus: 'approved',
        }));
      } else {
        const mockUser: DriverProfile = {
          id: '1',
          email,
          fullName: 'Kwame Asante',
          phone: '+233 24 123 4567',
          userType: 'driver',
          vehicles: [],
          savedExperts: [],
          diagnosisCount: 12,
          reviewsGiven: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AppConstants.storageKeys.authToken, 'mock_token');
        await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(mockUser));
        await AsyncStorage.setItem(AppConstants.storageKeys.userType, mockUser.userType);

        setState(prev => ({
          ...prev,
          user: mockUser,
          userType: mockUser.userType,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      // TODO: Replace with actual API call
      if (data.userType === 'expert') {
        const mockExpert: ExpertProfile = {
          id: Date.now().toString(),
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          userType: 'expert',
          businessName: '',
          specialties: [],
          services: [],
          rating: 0,
          reviewCount: 0,
          verified: false,
          certifications: [],
          hours: {
            monday: { isOpen: false },
            tuesday: { isOpen: false },
            wednesday: { isOpen: false },
            thursday: { isOpen: false },
            friday: { isOpen: false },
            saturday: { isOpen: false },
            sunday: { isOpen: false },
          },
          gallery: [],
          priceRange: 'average',
          emailVerified: false,
          onboardingComplete: false,
          kycStatus: 'not_started',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AppConstants.storageKeys.authToken, 'mock_token');
        await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(mockExpert));
        await AsyncStorage.setItem(AppConstants.storageKeys.userType, 'expert');
        await AsyncStorage.setItem(AppConstants.storageKeys.emailVerified, 'false');
        await AsyncStorage.setItem(AppConstants.storageKeys.expertOnboardingComplete, 'false');
        await AsyncStorage.setItem(AppConstants.storageKeys.expertKycStatus, 'not_started');

        setState(prev => ({
          ...prev,
          user: mockExpert,
          userType: 'expert',
          isAuthenticated: true,
          isEmailVerified: false,
          isExpertOnboardingComplete: false,
          kycStatus: 'not_started',
        }));
      } else {
        const mockUser: User = {
          id: Date.now().toString(),
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          userType: data.userType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorage.setItem(AppConstants.storageKeys.authToken, 'mock_token');
        await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(mockUser));
        await AsyncStorage.setItem(AppConstants.storageKeys.userType, mockUser.userType);

        setState(prev => ({
          ...prev,
          user: mockUser,
          userType: mockUser.userType,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        AppConstants.storageKeys.authToken,
        AppConstants.storageKeys.user,
        AppConstants.storageKeys.userType,
        AppConstants.storageKeys.emailVerified,
        AppConstants.storageKeys.expertOnboardingComplete,
        AppConstants.storageKeys.expertKycStatus,
      ]);

      setState(prev => ({
        ...prev,
        user: null,
        userType: null,
        isAuthenticated: false,
        isEmailVerified: false,
        isExpertOnboardingComplete: false,
        kycStatus: 'not_started',
      }));
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    try {
      const guestUser: User = {
        id: 'guest',
        email: '',
        fullName: 'Guest User',
        userType: 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(AppConstants.storageKeys.userType, 'guest');

      setState(prev => ({
        ...prev,
        user: guestUser,
        userType: 'guest',
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Continue as guest error:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(AppConstants.storageKeys.onboardingComplete, 'true');
      setState(prev => ({ ...prev, isOnboardingComplete: true }));
    } catch (error) {
      console.error('Complete onboarding error:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!state.user) return;

      const updatedUser = { ...state.user, ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(updatedUser));

      setState(prev => ({
        ...prev,
        user: updatedUser as User,
      }));
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const switchUserType = async (type: UserType) => {
    try {
      await AsyncStorage.setItem(AppConstants.storageKeys.userType, type);
      setState(prev => ({ ...prev, userType: type }));
    } catch (error) {
      console.error('Switch user type error:', error);
      throw error;
    }
  };

  // Email verification methods
  const verifyEmail = async (code: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // Simulate verification - accept any 6-digit code
      if (code.length === 6) {
        await AsyncStorage.setItem(AppConstants.storageKeys.emailVerified, 'true');

        // Update user object
        if (state.user) {
          const updatedUser = { ...state.user, emailVerified: true };
          await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(updatedUser));
          setState(prev => ({
            ...prev,
            isEmailVerified: true,
            user: updatedUser as ExpertProfile,
          }));
        } else {
          setState(prev => ({ ...prev, isEmailVerified: true }));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  };

  const resendVerificationCode = async () => {
    try {
      // TODO: Replace with actual API call
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Resend verification code error:', error);
      throw error;
    }
  };

  // Password reset methods
  const requestPasswordReset = async (email: string) => {
    try {
      // TODO: Replace with actual API call
      // Simulate sending password reset email
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  };

  const resetPassword = async (code: string, newPassword: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual API call
      // Simulate password reset - accept any 6-digit code
      if (code.length === 6 && newPassword.length >= 8) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Expert onboarding
  const completeExpertOnboarding = async (data: ExpertOnboardingData) => {
    try {
      if (!state.user || state.userType !== 'expert') return;

      const updatedUser: ExpertProfile = {
        ...(state.user as ExpertProfile),
        businessName: data.businessName || '',
        businessType: data.businessType,
        phone: data.phone,
        bio: data.bio,
        yearsExperience: data.yearsExperience,
        employeeCount: data.employeeCount,
        specialties: data.specialties,
        businessAddress: data.businessAddress,
        serviceRadiusKm: data.serviceRadiusKm,
        hours: data.operatingHours || (state.user as ExpertProfile).hours,
        acceptsEmergency: data.acceptsEmergency,
        onboardingComplete: true,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(updatedUser));
      await AsyncStorage.setItem(AppConstants.storageKeys.expertOnboardingComplete, 'true');

      setState(prev => ({
        ...prev,
        user: updatedUser,
        isExpertOnboardingComplete: true,
      }));
    } catch (error) {
      console.error('Complete expert onboarding error:', error);
      throw error;
    }
  };

  // KYC status
  const updateKycStatus = async (status: KycStatus) => {
    try {
      await AsyncStorage.setItem(AppConstants.storageKeys.expertKycStatus, status);

      // Update user object if expert
      if (state.user && state.userType === 'expert') {
        const updatedUser = { ...(state.user as ExpertProfile), kycStatus: status };
        await AsyncStorage.setItem(AppConstants.storageKeys.user, JSON.stringify(updatedUser));
        setState(prev => ({
          ...prev,
          kycStatus: status,
          user: updatedUser,
        }));
      } else {
        setState(prev => ({ ...prev, kycStatus: status }));
      }
    } catch (error) {
      console.error('Update KYC status error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
        completeOnboarding,
        updateUser,
        switchUserType,
        verifyEmail,
        resendVerificationCode,
        requestPasswordReset,
        resetPassword,
        completeExpertOnboarding,
        updateKycStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
