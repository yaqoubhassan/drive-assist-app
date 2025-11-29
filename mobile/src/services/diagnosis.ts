/**
 * Diagnosis Service
 * Handles all diagnosis-related API calls including guest diagnosis
 */

import api, { ApiResponse } from './api';
import { apiConfig } from '../config/api';

// Types
export interface DiagnosisImage {
  id: number;
  url: string;
  thumbnail_url: string;
  file_name: string;
}

export interface RecommendedAction {
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimated_cost?: string;
  diy_possible?: boolean;
}

export interface DiagnosisResult {
  id: number;
  uuid: string;
  input_type: 'text' | 'voice' | 'text_image';
  symptoms_description: string;
  voice_transcription?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  ai_diagnosis: string | null;
  ai_possible_causes: string[] | null;
  ai_recommended_actions: RecommendedAction[] | null;
  ai_urgency_level: 'critical' | 'high' | 'medium' | 'low' | null;
  urgency_color: string | null;
  ai_confidence_score: number | null;
  ai_provider: string | null;
  is_free: boolean;
  expert_contact_unlocked: boolean;
  error_message: string | null;
  created_at: string;
  vehicle?: {
    id: number;
    make_name: string;
    model_name: string;
    year: number;
  } | null;
  images?: DiagnosisImage[];
}

export interface GuestDiagnosisResponse {
  diagnosis: DiagnosisResult;
  remaining_diagnoses: number;
}

export interface CreateDiagnosisRequest {
  symptoms_description: string;
  vehicle_id?: number;
  region_id?: number;
  images?: File[];
}

export interface GuestDiagnosisRequest {
  symptoms_description?: string;
  voice_recording?: {
    uri: string;
    name: string;
    type: string;
  };
}

export interface GuestQuotaResponse {
  total_free: number;
  used: number;
  remaining: number;
  can_diagnose: boolean;
}

/**
 * Diagnosis Service
 */
export const diagnosisService = {
  /**
   * Check guest diagnosis quota before submitting
   * Requires device headers to be set in API client
   */
  async checkGuestQuota(): Promise<GuestQuotaResponse> {
    const response = await api.get<GuestQuotaResponse>(
      apiConfig.endpoints.diagnoses.guestQuota
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to check quota');
    }

    return response.data;
  },

  /**
   * Create a guest diagnosis (no authentication required)
   * Requires device headers to be set in API client
   * Supports text, audio, or both
   */
  async createGuestDiagnosis(data: GuestDiagnosisRequest): Promise<GuestDiagnosisResponse> {
    // If there's a voice recording, use FormData
    if (data.voice_recording) {
      const formData = new FormData();

      // Add text description if provided
      if (data.symptoms_description) {
        formData.append('symptoms_description', data.symptoms_description);
      }

      // Add voice recording as a file
      formData.append('voice_recording', {
        uri: data.voice_recording.uri,
        name: data.voice_recording.name,
        type: data.voice_recording.type,
      } as unknown as Blob);

      const response = await api.postFormData<GuestDiagnosisResponse>(
        apiConfig.endpoints.diagnoses.guest,
        formData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create diagnosis');
      }

      return response.data;
    }

    // No voice recording, use JSON
    const response = await api.post<GuestDiagnosisResponse>(
      apiConfig.endpoints.diagnoses.guest,
      { symptoms_description: data.symptoms_description }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create diagnosis');
    }

    return response.data;
  },

  /**
   * Create a diagnosis for authenticated users
   */
  async createDiagnosis(data: CreateDiagnosisRequest): Promise<DiagnosisResult> {
    // If there are images, use FormData
    if (data.images && data.images.length > 0) {
      const formData = new FormData();
      formData.append('symptoms_description', data.symptoms_description);

      if (data.vehicle_id) {
        formData.append('vehicle_id', data.vehicle_id.toString());
      }
      if (data.region_id) {
        formData.append('region_id', data.region_id.toString());
      }

      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      const response = await api.postFormData<DiagnosisResult>(
        apiConfig.endpoints.diagnoses.create,
        formData
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create diagnosis');
      }

      return response.data;
    }

    // No images, use JSON
    const response = await api.post<DiagnosisResult>(
      apiConfig.endpoints.diagnoses.create,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create diagnosis');
    }

    return response.data;
  },

  /**
   * Get list of user's diagnoses (authenticated)
   */
  async getDiagnoses(page: number = 1): Promise<{
    diagnoses: DiagnosisResult[];
    currentPage: number;
    lastPage: number;
    total: number;
  }> {
    const response = await api.get<{
      data: DiagnosisResult[];
      current_page: number;
      last_page: number;
      total: number;
    }>(apiConfig.endpoints.diagnoses.list, { page });

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch diagnoses');
    }

    return {
      diagnoses: response.data.data,
      currentPage: response.data.current_page,
      lastPage: response.data.last_page,
      total: response.data.total,
    };
  },

  /**
   * Get a single diagnosis by ID (authenticated)
   */
  async getDiagnosis(id: number | string): Promise<DiagnosisResult> {
    const response = await api.get<DiagnosisResult>(
      apiConfig.endpoints.diagnoses.show(id.toString())
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch diagnosis');
    }

    return response.data;
  },

  /**
   * Get matching experts for a diagnosis
   */
  async getMatchingExperts(diagnosisId: number | string, params?: {
    lat?: number;
    lng?: number;
  }): Promise<any[]> {
    const response = await api.get<any[]>(
      apiConfig.endpoints.diagnoses.matchingExperts(diagnosisId.toString()),
      params
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch matching experts');
    }

    return response.data;
  },
};

export default diagnosisService;
