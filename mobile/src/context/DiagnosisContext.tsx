/**
 * Diagnosis Context
 * Manages diagnosis state and API interactions for both guests and authenticated users
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { diagnosisService, DiagnosisResult, GuestDiagnosisResponse, GuestQuotaResponse } from '../services/diagnosis';
import { useAuth } from './AuthContext';

// Diagnosis input data collected through the flow
export interface DiagnosisInput {
  category?: string;
  description: string;
  photos?: string[];
  voiceRecordingUri?: string;
  vehicleId?: number;
  vehicleInfo?: {
    year?: string;
    make?: string;
    model?: string;
    mileage?: string;
  };
}

interface DiagnosisState {
  // Input data being collected
  input: DiagnosisInput;
  // Result from API
  result: DiagnosisResult | null;
  // Guest-specific data
  remainingDiagnoses: number | null;
  // Whether guest can still diagnose
  canDiagnose: boolean;
  // Loading/error states
  isLoading: boolean;
  isSubmitting: boolean;
  isCheckingQuota: boolean;
  error: string | null;
}

interface DiagnosisContextType extends DiagnosisState {
  // Update input during flow
  updateInput: (data: Partial<DiagnosisInput>) => void;
  // Clear all input data
  clearInput: () => void;
  // Check guest quota before proceeding
  checkGuestQuota: () => Promise<GuestQuotaResponse>;
  // Submit diagnosis (handles both guest and authenticated)
  submitDiagnosis: () => Promise<DiagnosisResult>;
  // Clear result
  clearResult: () => void;
  // Clear error
  clearError: () => void;
  // Check if user is guest
  isGuest: boolean;
}

const initialInput: DiagnosisInput = {
  category: undefined,
  description: '',
  photos: [],
  voiceRecordingUri: undefined,
  vehicleId: undefined,
  vehicleInfo: undefined,
};

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

export function DiagnosisProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userType } = useAuth();
  const isGuest = !isAuthenticated || userType === 'guest';

  const [state, setState] = useState<DiagnosisState>({
    input: initialInput,
    result: null,
    remainingDiagnoses: null,
    canDiagnose: true,
    isLoading: false,
    isSubmitting: false,
    isCheckingQuota: false,
    error: null,
  });

  const updateInput = useCallback((data: Partial<DiagnosisInput>) => {
    setState(prev => ({
      ...prev,
      input: { ...prev.input, ...data },
    }));
  }, []);

  const clearInput = useCallback(() => {
    setState(prev => ({
      ...prev,
      input: initialInput,
    }));
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({
      ...prev,
      result: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const checkGuestQuota = useCallback(async (): Promise<GuestQuotaResponse> => {
    setState(prev => ({ ...prev, isCheckingQuota: true, error: null }));

    try {
      const quota = await diagnosisService.checkGuestQuota();

      setState(prev => ({
        ...prev,
        remainingDiagnoses: quota.remaining,
        canDiagnose: quota.can_diagnose,
        isCheckingQuota: false,
      }));

      return quota;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isCheckingQuota: false,
        error: error?.message || 'Failed to check quota',
      }));
      throw error;
    }
  }, []);

  const submitDiagnosis = useCallback(async (): Promise<DiagnosisResult> => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      if (isGuest) {
        // Build guest diagnosis request
        const guestRequest: {
          symptoms_description?: string;
          voice_recording?: { uri: string; name: string; type: string };
        } = {};

        // Add text description if provided
        if (state.input.description?.trim()) {
          guestRequest.symptoms_description = state.input.description;
        }

        // Add voice recording if provided
        if (state.input.voiceRecordingUri) {
          const uri = state.input.voiceRecordingUri;
          // Extract file extension from URI
          const extension = uri.split('.').pop()?.toLowerCase() || 'm4a';
          const mimeType = extension === 'wav' ? 'audio/wav' :
                          extension === 'mp3' ? 'audio/mpeg' :
                          'audio/m4a';

          guestRequest.voice_recording = {
            uri: uri,
            name: `voice_recording_${Date.now()}.${extension}`,
            type: mimeType,
          };
        }

        // Guest diagnosis
        const response: GuestDiagnosisResponse = await diagnosisService.createGuestDiagnosis(guestRequest);

        setState(prev => ({
          ...prev,
          result: response.diagnosis,
          remainingDiagnoses: response.remaining_diagnoses,
          isSubmitting: false,
        }));

        return response.diagnosis;
      } else {
        // Authenticated user diagnosis
        const result = await diagnosisService.createDiagnosis({
          symptoms_description: state.input.description,
          vehicle_id: state.input.vehicleId,
          // TODO: Handle image uploads
          // images: state.input.photos,
        });

        setState(prev => ({
          ...prev,
          result,
          isSubmitting: false,
        }));

        return result;
      }
    } catch (error: any) {
      // Extract user-friendly error message
      let errorMessage = 'Failed to create diagnosis. Please try again.';

      if (error?.errors) {
        // Handle validation errors - format them nicely
        const validationErrors = Object.entries(error.errors)
          .map(([field, messages]) => {
            const fieldName = field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
            return `${fieldName}: ${(messages as string[]).join(', ')}`;
          })
          .join('\n');
        errorMessage = validationErrors || error.message || errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [isGuest, state.input]);

  return (
    <DiagnosisContext.Provider
      value={{
        ...state,
        updateInput,
        clearInput,
        checkGuestQuota,
        submitDiagnosis,
        clearResult,
        clearError,
        isGuest,
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
}

export function useDiagnosis() {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error('useDiagnosis must be used within a DiagnosisProvider');
  }
  return context;
}

export default DiagnosisContext;
