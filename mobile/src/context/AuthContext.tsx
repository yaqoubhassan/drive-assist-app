import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserType, DriverProfile, ExpertProfile } from '../types';
import { AppConstants } from '../constants';

interface AuthState {
  user: User | DriverProfile | ExpertProfile | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnboardingComplete: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  switchUserType: (type: UserType) => Promise<void>;
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
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const [token, userData, userType, onboardingComplete] = await Promise.all([
        AsyncStorage.getItem(AppConstants.storageKeys.authToken),
        AsyncStorage.getItem(AppConstants.storageKeys.user),
        AsyncStorage.getItem(AppConstants.storageKeys.userType),
        AsyncStorage.getItem(AppConstants.storageKeys.onboardingComplete),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        setState({
          user,
          userType: (userType as UserType) || 'driver',
          isAuthenticated: true,
          isLoading: false,
          isOnboardingComplete: onboardingComplete === 'true',
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
      // Simulating API response
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
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      // TODO: Replace with actual API call
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
      ]);

      setState(prev => ({
        ...prev,
        user: null,
        userType: null,
        isAuthenticated: false,
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
