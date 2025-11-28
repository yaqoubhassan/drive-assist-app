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
        // Guest diagnosis
        const response: GuestDiagnosisResponse = await diagnosisService.createGuestDiagnosis({
          symptoms_description: state.input.description,
        });

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
      const errorMessage = error?.message || 'Failed to create diagnosis';
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
