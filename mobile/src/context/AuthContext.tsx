import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType, DriverProfile, ExpertProfile, KycStatus, ExpertOnboardingData } from '../types';
import { AppConstants } from '../constants';
import {
  authService,
  storage,
  StorageKeys,
  tokenStorage,
  clearAuthStorage,
  getErrorMessage,
} from '../services';

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
  // Error state
  error: string | null;
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
  // Utility
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  userType: UserType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store email temporarily for OTP verification
let pendingEmail: string | null = null;

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
    error: null,
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check for existing token
      const hasToken = await tokenStorage.hasToken();

      if (hasToken) {
        // Try to get current user from API
        try {
          const user = await authService.getMe();
          const userType = user.userType;

          // Get email verification status - check all user types
          const isEmailVerified = 'emailVerified' in user ? user.emailVerified === true : false;

          setState({
            user,
            userType,
            isAuthenticated: true,
            isLoading: false,
            isOnboardingComplete: await storage.getItem(StorageKeys.ONBOARDING_COMPLETE) === 'true',
            isEmailVerified,
            isExpertOnboardingComplete: userType === 'expert' ? (user as ExpertProfile).onboardingComplete : false,
            kycStatus: userType === 'expert' ? (user as ExpertProfile).kycStatus : 'not_started',
            error: null,
          });
          return;
        } catch (error) {
          // Token is invalid, clear it
          console.warn('Token validation failed:', error);
          await clearAuthStorage();
        }
      }

      // No valid token, check for onboarding status
      const onboardingComplete = await storage.getItem(StorageKeys.ONBOARDING_COMPLETE);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isOnboardingComplete: onboardingComplete === 'true',
      }));
    } catch (error) {
      console.error('Error checking auth state:', error);
      setState(prev => ({ ...prev, isLoading: false, error: getErrorMessage(error) }));
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Store email for OTP verification if needed
      pendingEmail = email;

      const { user } = await authService.login({ email, password });
      const userType = user.userType;

      // Get email verification status - check all user types
      const isEmailVerified = 'emailVerified' in user ? user.emailVerified === true : false;

      setState(prev => ({
        ...prev,
        user,
        userType,
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified,
        isExpertOnboardingComplete: userType === 'expert' ? (user as ExpertProfile).onboardingComplete : false,
        kycStatus: userType === 'expert' ? (user as ExpertProfile).kycStatus : 'not_started',
        error: null,
      }));
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({ ...prev, isLoading: false, error: getErrorMessage(error) }));
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Store email for OTP verification
      pendingEmail = data.email;

      const { user } = await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        userType: data.userType,
      });

      const userType = user.userType;

      setState(prev => ({
        ...prev,
        user,
        userType,
        isAuthenticated: true,
        isLoading: false,
        isEmailVerified: false, // All new users need to verify email
        isExpertOnboardingComplete: false,
        kycStatus: userType === 'expert' ? 'not_started' : prev.kycStatus,
        error: null,
      }));
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({ ...prev, isLoading: false, error: getErrorMessage(error) }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      await authService.logout();

      setState(prev => ({
        ...prev,
        user: null,
        userType: null,
        isAuthenticated: false,
        isLoading: false,
        isEmailVerified: false,
        isExpertOnboardingComplete: false,
        kycStatus: 'not_started',
        error: null,
      }));
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if API call fails, clear local state
      setState(prev => ({
        ...prev,
        user: null,
        userType: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
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

      await storage.setItem(StorageKeys.USER_TYPE, 'guest');

      setState(prev => ({
        ...prev,
        user: guestUser,
        userType: 'guest',
        isAuthenticated: true,
        error: null,
      }));
    } catch (error) {
      console.error('Continue as guest error:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await storage.setItem(StorageKeys.ONBOARDING_COMPLETE, 'true');
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
      await storage.setObject(StorageKeys.USER, updatedUser);

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
      await storage.setItem(StorageKeys.USER_TYPE, type);
      setState(prev => ({ ...prev, userType: type }));
    } catch (error) {
      console.error('Switch user type error:', error);
      throw error;
    }
  };

  // Email verification methods
  const verifyEmail = async (code: string): Promise<boolean> => {
    try {
      const email = pendingEmail || state.user?.email;
      if (!email) {
        throw new Error('No email address found for verification');
      }

      const success = await authService.verifyOtp(email, code);

      if (success) {
        await storage.setItem(StorageKeys.EMAIL_VERIFIED, 'true');

        // Update user object
        if (state.user) {
          const updatedUser = { ...state.user, emailVerified: true };
          await storage.setObject(StorageKeys.USER, updatedUser);
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
      const email = pendingEmail || state.user?.email;
      if (!email) {
        throw new Error('No email address found');
      }

      await authService.resendOtp(email, 'email_verification');
    } catch (error) {
      console.error('Resend verification code error:', error);
      throw error;
    }
  };

  // Password reset methods
  const requestPasswordReset = async (email: string) => {
    try {
      // Store email for later steps
      pendingEmail = email;
      await authService.forgotPassword(email);
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  };

  const resetPassword = async (code: string, newPassword: string): Promise<boolean> => {
    try {
      const email = pendingEmail;
      if (!email) {
        throw new Error('No email address found for password reset');
      }

      const success = await authService.resetPassword(email, code, newPassword);

      if (success) {
        // Clear pending email
        pendingEmail = null;
      }

      return success;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Expert onboarding
  const completeExpertOnboarding = async (data: ExpertOnboardingData) => {
    try {
      if (!state.user || state.userType !== 'expert') return;

      // TODO: Call API to update expert profile when endpoint is ready
      // For now, update local state
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

      await storage.setObject(StorageKeys.USER, updatedUser);
      await storage.setItem(StorageKeys.EXPERT_ONBOARDING_COMPLETE, 'true');

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
      await storage.setItem(StorageKeys.EXPERT_KYC_STATUS, status);

      // Update user object if expert
      if (state.user && state.userType === 'expert') {
        const updatedUser = { ...(state.user as ExpertProfile), kycStatus: status };
        await storage.setObject(StorageKeys.USER, updatedUser);
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

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshUser = async () => {
    try {
      if (!state.isAuthenticated || state.userType === 'guest') return;

      const user = await authService.getMe();

      setState(prev => ({
        ...prev,
        user,
        isEmailVerified: user.userType === 'expert' ? (user as ExpertProfile).emailVerified : true,
        isExpertOnboardingComplete: user.userType === 'expert' ? (user as ExpertProfile).onboardingComplete : false,
        kycStatus: user.userType === 'expert' ? (user as ExpertProfile).kycStatus : 'not_started',
      }));
    } catch (error) {
      console.error('Refresh user error:', error);
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
        clearError,
        refreshUser,
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
