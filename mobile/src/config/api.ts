/**
 * API Configuration
 * Contains base URL and other API-related settings
 */

// Default to localhost for development
// In production, this would be your actual API URL
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';

// For iOS simulator, use localhost
// For Android emulator, use 10.0.2.2 (which maps to host machine's localhost)
// For physical device, use your machine's IP address or production URL

export const apiConfig = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds

  endpoints: {
    // Auth endpoints
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      logoutAll: '/auth/logout-all',
      me: '/auth/me',
      forgotPassword: '/auth/forgot-password',
      verifyOtp: '/auth/verify-otp',
      resetPassword: '/auth/reset-password',
      resendOtp: '/auth/resend-otp',
      updateFcmToken: '/auth/update-fcm-token',
    },

    // Profile endpoints
    profile: {
      show: '/profile',
      update: '/profile',
      updatePassword: '/profile/password',
      updateAvatar: '/profile/avatar',
      deleteAvatar: '/profile/avatar',
      preferences: '/preferences',
      updatePreferences: '/preferences',
    },

    // Driver endpoints
    driver: {
      onboardingStatus: '/driver/onboarding/status',
      completeOnboarding: '/driver/onboarding/complete',
    },

    // Expert endpoints
    expert: {
      onboardingStatus: '/expert/onboarding/status',
      updateProfile: '/expert/onboarding/profile',
      completeOnboarding: '/expert/onboarding/complete',
      profile: '/expert/profile',
      availability: '/expert/profile/availability',
      workingHours: '/expert/profile/working-hours',
    },

    // KYC endpoints
    kyc: {
      status: '/kyc/status',
      documents: '/kyc/documents',
      uploadDocument: '/kyc/documents',
      deleteDocument: (id: string) => `/kyc/documents/${id}`,
      submit: '/kyc/submit',
    },

    // Vehicle endpoints
    vehicles: {
      list: '/vehicles',
      create: '/vehicles',
      show: (id: string) => `/vehicles/${id}`,
      update: (id: string) => `/vehicles/${id}`,
      delete: (id: string) => `/vehicles/${id}`,
      setPrimary: (id: string) => `/vehicles/${id}/primary`,
    },

    // Diagnosis endpoints
    diagnoses: {
      list: '/diagnoses',
      create: '/diagnoses',
      guest: '/diagnoses/guest',
      guestQuota: '/diagnoses/guest/quota',
      show: (id: string) => `/diagnoses/${id}`,
      matchingExperts: (id: string) => `/diagnoses/${id}/experts`,
    },

    // Expert search (for drivers)
    experts: {
      list: '/experts',
      nearby: '/experts/nearby',
      show: (id: string) => `/experts/${id}`,
      specializations: '/specializations',
    },

    // Lead endpoints (for experts)
    leads: {
      list: '/leads',
      stats: '/leads/stats',
      show: (id: string) => `/leads/${id}`,
      markViewed: (id: string) => `/leads/${id}/view`,
      markContacted: (id: string) => `/leads/${id}/contact`,
      markConverted: (id: string) => `/leads/${id}/convert`,
      close: (id: string) => `/leads/${id}/close`,
    },

    // Messaging endpoints
    messages: {
      conversations: '/messages/conversations',
      getMessages: (id: string) => `/messages/conversations/${id}`,
      sendMessage: (id: string) => `/messages/conversations/${id}`,
      markAsRead: (id: string) => `/messages/conversations/${id}/read`,
      typing: (id: string) => `/messages/conversations/${id}/typing`,
      unreadCount: '/messages/unread-count',
      deleteMessage: (id: string) => `/messages/${id}`,
    },

    // Broadcasting
    broadcasting: {
      auth: '/broadcasting/auth',
    },

    // Packages
    packages: {
      diagnosis: '/packages/diagnosis',
      lead: '/packages/lead',
      subscription: '/packages/subscription',
      purchaseDiagnosis: '/packages/diagnosis/purchase',
      purchaseLead: '/packages/lead/purchase',
      subscribe: '/packages/subscription/subscribe',
      cancelSubscription: '/packages/subscription/cancel',
    },

    // Road signs & Learning
    roadSigns: {
      list: '/road-signs',
      categories: '/road-signs/categories',
      byCategory: (slug: string) => `/road-signs/categories/${slug}`,
      show: (slug: string) => `/road-signs/${slug}`,
    },

    // Articles
    articles: {
      list: '/articles',
      categories: '/articles/categories',
      byCategory: (slug: string) => `/articles/categories/${slug}`,
      show: (slug: string) => `/articles/${slug}`,
      like: (id: string) => `/articles/${id}/like`,
      bookmark: (id: string) => `/articles/${id}/bookmark`,
      bookmarked: '/articles/bookmarked',
    },

    // Quiz
    quiz: {
      categories: '/quiz/categories',
      questions: (category: string) => `/quiz/questions/${category}`,
      submit: '/quiz/submit',
      history: '/quiz/history',
    },

    // Videos (Learning)
    videos: {
      list: '/videos',
      categories: '/videos/categories',
      featured: '/videos/featured',
      byCategory: (slug: string) => `/videos/categories/${slug}`,
      show: (slug: string) => `/videos/${slug}`,
    },

    // Maintenance
    maintenance: {
      types: '/maintenance-types',
      reminders: '/maintenance/reminders',
      reminderShow: (id: string) => `/maintenance/reminders/${id}`,
      complete: (id: string) => `/maintenance/reminders/${id}/complete`,
      snooze: (id: string) => `/maintenance/reminders/${id}/snooze`,
      logs: '/maintenance/logs',
    },

    // Reviews
    reviews: {
      submit: '/reviews',
      expertReviews: '/expert/reviews',
      respond: (id: string) => `/expert/reviews/${id}/respond`,
    },

    // Settings/Data
    settings: {
      regions: '/regions',
      vehicleMakes: '/vehicle-makes',
      vehicleModels: (make: string) => `/vehicle-makes/${make}/models`,
    },
  },
};

export default apiConfig;
