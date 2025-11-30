/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api, { ApiResponse, isApiError, getErrorMessage } from './api';
import { apiConfig } from '../config/api';
import { tokenStorage, storage, StorageKeys, clearAuthStorage } from './storage';
import { User, UserType, DriverProfile, ExpertProfile, KycStatus, ExpertOnboardingData } from '../types';

// Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User | DriverProfile | ExpertProfile;
  token: string;
  token_type: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: 'driver' | 'expert';
}

export interface RegisterResponse {
  user: User | DriverProfile | ExpertProfile;
  token: string;
  token_type: string;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface ResendOtpRequest {
  email: string;
  type: 'email_verification' | 'password_reset';
}

export interface UserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: 'driver' | 'expert' | 'admin';
  email_verified: boolean;
  is_onboarded: boolean;
  free_diagnoses_remaining: number;
  created_at: string;
  updated_at: string;
  driver_profile?: DriverProfileResponse | null;
  expert_profile?: ExpertProfileResponse | null;
}

export interface DriverProfileResponse {
  id: number;
  user_id: number;
  region_id: number | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpertProfileResponse {
  id: number;
  user_id: number;
  business_name: string | null;
  bio: string | null;
  region_id: number | null;
  city: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  whatsapp_number: string | null;
  experience_years: number | null;
  rating: string;
  rating_count: number;
  jobs_completed: number;
  kyc_status: KycStatus;
  free_leads_remaining: number;
  is_available: boolean;
  accepts_emergency: boolean;
  service_radius_km: number | null;
  working_hours: Record<string, unknown> | null;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
  specializations?: Array<{ id: number; name: string; slug: string }>;
}

/**
 * Transform API user response to app User type
 */
function transformUserResponse(apiUser: UserResponse): User | DriverProfile | ExpertProfile {
  // Check email verification status from API response
  const isEmailVerified = apiUser.email_verified === true;

  // Debug log avatar URL from API
  console.log('[Auth] User avatar from API:', apiUser.avatar);

  const baseUser: User = {
    id: apiUser.id.toString(),
    email: apiUser.email,
    fullName: `${apiUser.first_name} ${apiUser.last_name}`,
    phone: apiUser.phone || undefined,
    avatar: apiUser.avatar || undefined,
    userType: apiUser.role === 'admin' ? 'driver' : apiUser.role, // Treat admin as driver for now
    emailVerified: isEmailVerified, // Add email verification status to all users
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
  };

  if (apiUser.role === 'driver' || apiUser.role === 'admin') {
    const driverProfile: DriverProfile = {
      ...baseUser,
      userType: 'driver',
      emailVerified: isEmailVerified,
      vehicles: [],
      savedExperts: [],
      diagnosisCount: 0,
      reviewsGiven: 0,
    };
    return driverProfile;
  }

  if (apiUser.role === 'expert' && apiUser.expert_profile) {
    const ep = apiUser.expert_profile;
    const expertProfile: ExpertProfile = {
      ...baseUser,
      userType: 'expert',
      businessName: ep.business_name || '',
      bio: ep.bio || undefined,
      specialties: ep.specializations?.map(s => s.slug) || [],
      services: [],
      rating: parseFloat(ep.rating) || 0,
      reviewCount: ep.rating_count,
      yearsExperience: ep.experience_years || undefined,
      verified: ep.kyc_status === 'approved',
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
      emailVerified: isEmailVerified,
      onboardingComplete: ep.is_onboarding_complete,
      kycStatus: ep.kyc_status,
      businessAddress: ep.address || undefined,
      serviceRadiusKm: ep.service_radius_km || undefined,
      acceptsEmergency: ep.accepts_emergency,
    };

    // Parse working hours if available
    if (ep.working_hours) {
      expertProfile.hours = ep.working_hours as ExpertProfile['hours'];
    }

    return expertProfile;
  }

  return baseUser;
}

/**
 * Auth Service
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<{
    user: User | DriverProfile | ExpertProfile;
    token: string;
  }> {
    try {
      const response = await api.post<{ user: UserResponse; token: string; token_type: string }>(
        apiConfig.endpoints.auth.login,
        credentials
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Login failed');
      }

      const { user: apiUser, token } = response.data;

      // Save token securely
      await tokenStorage.saveToken(token);

      // Transform and save user
      const user = transformUserResponse(apiUser);
      await storage.setObject(StorageKeys.USER, user);
      await storage.setItem(StorageKeys.USER_TYPE, user.userType);

      // Save email verification status for all users
      const emailVerified = 'emailVerified' in user ? user.emailVerified : false;
      await storage.setItem(StorageKeys.EMAIL_VERIFIED, emailVerified ? 'true' : 'false');

      // Save expert-specific data
      if (user.userType === 'expert') {
        const expertUser = user as ExpertProfile;
        await storage.setItem(StorageKeys.EXPERT_ONBOARDING_COMPLETE, expertUser.onboardingComplete ? 'true' : 'false');
        await storage.setItem(StorageKeys.EXPERT_KYC_STATUS, expertUser.kycStatus);
      }

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    userType: UserType;
  }): Promise<{
    user: User | DriverProfile | ExpertProfile;
    token: string;
  }> {
    try {
      // Split fullName into first_name and last_name
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName; // Use first name if no last name

      const requestData: RegisterRequest = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        password_confirmation: data.password,
        role: data.userType === 'guest' ? 'driver' : data.userType,
      };

      const response = await api.post<{ user: UserResponse; token: string; token_type: string }>(
        apiConfig.endpoints.auth.register,
        requestData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed');
      }

      const { user: apiUser, token } = response.data;

      // Save token securely
      await tokenStorage.saveToken(token);

      // Transform and save user
      const user = transformUserResponse(apiUser);
      await storage.setObject(StorageKeys.USER, user);
      await storage.setItem(StorageKeys.USER_TYPE, user.userType);

      // Save email verification status for all users (false after registration)
      await storage.setItem(StorageKeys.EMAIL_VERIFIED, 'false');

      // Save expert-specific data
      if (user.userType === 'expert') {
        await storage.setItem(StorageKeys.EXPERT_ONBOARDING_COMPLETE, 'false');
        await storage.setItem(StorageKeys.EXPERT_KYC_STATUS, 'not_started');
      }

      return { user, token };
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Call logout API (optional - will invalidate server-side token)
      const token = await tokenStorage.getToken();
      if (token) {
        try {
          await api.post(apiConfig.endpoints.auth.logout);
        } catch (error) {
          // Ignore API errors during logout - we'll clear local storage anyway
          console.warn('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local storage
      await clearAuthStorage();
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await api.post(apiConfig.endpoints.auth.logoutAll);
    } finally {
      await clearAuthStorage();
    }
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<User | DriverProfile | ExpertProfile> {
    const response = await api.get<UserResponse>(apiConfig.endpoints.auth.me);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to get user');
    }

    // The API returns user data directly in response.data (not wrapped in 'user' key)
    const user = transformUserResponse(response.data);

    // Update local storage
    await storage.setObject(StorageKeys.USER, user);

    return user;
  },

  /**
   * Request password reset OTP
   */
  async forgotPassword(email: string): Promise<void> {
    const response = await api.post(apiConfig.endpoints.auth.forgotPassword, { email });

    if (!response.success) {
      throw new Error(response.message || 'Failed to send reset email');
    }
  },

  /**
   * Verify OTP code
   */
  async verifyOtp(email: string, otp: string, type: 'email_verification' | 'password_reset' = 'email_verification'): Promise<boolean> {
    const response = await api.post(apiConfig.endpoints.auth.verifyOtp, { email, otp, type });

    if (!response.success) {
      throw new Error(response.message || 'Invalid OTP');
    }

    return true;
  },

  /**
   * Reset password with OTP
   */
  async resetPassword(email: string, otp: string, newPassword: string): Promise<boolean> {
    const response = await api.post(apiConfig.endpoints.auth.resetPassword, {
      email,
      otp,
      password: newPassword,
      password_confirmation: newPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to reset password');
    }

    return true;
  },

  /**
   * Resend OTP code
   */
  async resendOtp(email: string, type: 'email_verification' | 'password_reset' = 'email_verification'): Promise<void> {
    const response = await api.post(apiConfig.endpoints.auth.resendOtp, { email, type });

    if (!response.success) {
      throw new Error(response.message || 'Failed to resend OTP');
    }
  },

  /**
   * Update FCM token for push notifications
   */
  async updateFcmToken(fcmToken: string): Promise<void> {
    await api.put(apiConfig.endpoints.auth.updateFcmToken, { fcm_token: fcmToken });
    await storage.setItem(StorageKeys.FCM_TOKEN, fcmToken);
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await tokenStorage.getToken();
    if (!token) return false;

    // Optionally validate token with API
    try {
      await this.getMe();
      return true;
    } catch (error) {
      // Token is invalid, clear it
      await tokenStorage.removeToken();
      return false;
    }
  },

  /**
   * Get stored user data
   */
  async getStoredUser(): Promise<User | DriverProfile | ExpertProfile | null> {
    return await storage.getObject<User | DriverProfile | ExpertProfile>(StorageKeys.USER);
  },

  /**
   * Get stored user type
   */
  async getStoredUserType(): Promise<UserType | null> {
    const userType = await storage.getItem(StorageKeys.USER_TYPE);
    return userType as UserType | null;
  },
};

export default authService;
