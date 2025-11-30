/**
 * Expert Service
 * Handles all expert-related API calls
 */

import api from './api';
import apiConfig from '../config/api';

export interface ExpertProfile {
  id: number;
  user_id?: number;
  business_name: string | null;
  bio: string | null;
  experience_years: number;
  city: string | null;
  address: string | null;
  location?: {
    latitude: number | null;
    longitude: number | null;
  };
  whatsapp_number: string | null;
  rating: number;
  rating_count: number;
  jobs_completed: number;
  is_available: boolean;
  is_priority_listed: boolean;
  specializations: Specialization[];
}

export interface Expert {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar: string | null;
  profile: ExpertProfile;
  distance_km?: number;
}

export interface Specialization {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  expert_response: string | null;
  expert_responded_at: string | null;
  created_at: string;
  driver: {
    id: number;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
}

export interface NearbyExpertsRequest {
  latitude: number;
  longitude: number;
  radius?: number; // km, default 25
  limit?: number; // default 10
  specialization_id?: number;
}

export interface NearbyExpertsResponse {
  success: boolean;
  data: Expert[];
  message?: string;
}

export interface ExpertListResponse {
  success: boolean;
  data: {
    data: Expert[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

export interface SpecializationsResponse {
  success: boolean;
  data: Specialization[];
  message?: string;
}

export const expertService = {
  /**
   * Get nearby experts based on location
   * This endpoint is publicly accessible (works for guests)
   */
  async getNearbyExperts(params: NearbyExpertsRequest): Promise<Expert[]> {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
    });

    if (params.radius) {
      queryParams.append('radius', params.radius.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params.specialization_id) {
      queryParams.append('specialization_id', params.specialization_id.toString());
    }

    const response = await api.get<NearbyExpertsResponse>(
      `${apiConfig.endpoints.experts.nearby}?${queryParams.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch nearby experts');
    }

    return response.data;
  },

  /**
   * Get list of experts with optional filters (requires authentication)
   */
  async getExperts(params?: {
    region_id?: number;
    specialization_id?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
  }): Promise<ExpertListResponse['data']> {
    const queryParams = new URLSearchParams();

    if (params?.region_id) {
      queryParams.append('region_id', params.region_id.toString());
    }
    if (params?.specialization_id) {
      queryParams.append('specialization_id', params.specialization_id.toString());
    }
    if (params?.latitude) {
      queryParams.append('latitude', params.latitude.toString());
    }
    if (params?.longitude) {
      queryParams.append('longitude', params.longitude.toString());
    }
    if (params?.radius) {
      queryParams.append('radius', params.radius.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }

    const url = queryParams.toString()
      ? `${apiConfig.endpoints.experts.list}?${queryParams.toString()}`
      : apiConfig.endpoints.experts.list;

    const response = await api.get<ExpertListResponse>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch experts');
    }

    return response.data;
  },

  /**
   * Get expert details by ID (requires authentication)
   */
  async getExpert(id: number): Promise<Expert> {
    const response = await api.get<{ success: boolean; data: Expert }>(
      apiConfig.endpoints.experts.show(id.toString())
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch expert details');
    }

    return response.data;
  },

  /**
   * Get available specializations
   */
  async getSpecializations(): Promise<Specialization[]> {
    const response = await api.get<SpecializationsResponse>(
      apiConfig.endpoints.experts.specializations
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch specializations');
    }

    return response.data;
  },

  /**
   * Get reviews for an expert (publicly accessible)
   */
  async getExpertReviews(expertId: number, page: number = 1): Promise<{
    reviews: Review[];
    currentPage: number;
    lastPage: number;
    total: number;
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        data: Review[];
        current_page: number;
        last_page: number;
        total: number;
      };
    }>(`/api/v1/experts/${expertId}/reviews?page=${page}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch reviews');
    }

    return {
      reviews: response.data.data,
      currentPage: response.data.current_page,
      lastPage: response.data.last_page,
      total: response.data.total,
    };
  },
};

export default expertService;
