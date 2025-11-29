/**
 * Vehicle Service
 * Handles all vehicle-related API calls for drivers
 */

import api from './api';
import { apiConfig } from '../config/api';

// ================== Types ==================

export interface Vehicle {
  id: number;
  make: string;
  make_id?: number;
  model: string;
  model_id?: number;
  year: number;
  color: string | null;
  license_plate: string | null;
  vin: string | null;
  fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg' | null;
  transmission: 'automatic' | 'manual' | 'cvt' | null;
  mileage: number | null;
  is_primary: boolean;
  image_url: string | null;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleRequest {
  vehicle_make_id?: number;
  vehicle_model_id?: number;
  custom_make?: string;
  custom_model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  vin?: string;
  fuel_type?: string;
  transmission?: string;
  mileage?: number;
  is_primary?: boolean;
}

export interface VehicleImage {
  uri: string;
  name: string;
  type: string;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {}

export interface VehicleMake {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface VehicleModel {
  id: number;
  name: string;
  slug: string;
  make_id: number;
}

// ================== Service Functions ==================

/**
 * Get list of driver's vehicles
 */
export async function getVehicles(): Promise<Vehicle[]> {
  const response = await api.get<Vehicle[]>(apiConfig.endpoints.vehicles.list);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch vehicles');
  }

  return response.data;
}

/**
 * Get a single vehicle by ID
 */
export async function getVehicle(id: number | string): Promise<Vehicle> {
  const response = await api.get<Vehicle>(
    apiConfig.endpoints.vehicles.show(id.toString())
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch vehicle');
  }

  return response.data;
}

/**
 * Create FormData from vehicle data and optional image
 */
function createVehicleFormData(data: CreateVehicleRequest, image?: VehicleImage): FormData {
  const formData = new FormData();

  // Add all non-undefined fields to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Add image if provided
  if (image) {
    formData.append('image', {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);
  }

  return formData;
}

/**
 * Create a new vehicle
 */
export async function createVehicle(data: CreateVehicleRequest, image?: VehicleImage): Promise<Vehicle> {
  let response;

  if (image) {
    const formData = createVehicleFormData(data, image);
    response = await api.postFormData<Vehicle>(
      apiConfig.endpoints.vehicles.create,
      formData
    );
  } else {
    response = await api.post<Vehicle>(
      apiConfig.endpoints.vehicles.create,
      data
    );
  }

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create vehicle');
  }

  return response.data;
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(
  id: number | string,
  data: UpdateVehicleRequest,
  image?: VehicleImage
): Promise<Vehicle> {
  let response;

  if (image) {
    const formData = createVehicleFormData(data, image);
    response = await api.putFormData<Vehicle>(
      apiConfig.endpoints.vehicles.update(id.toString()),
      formData
    );
  } else {
    response = await api.put<Vehicle>(
      apiConfig.endpoints.vehicles.update(id.toString()),
      data
    );
  }

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update vehicle');
  }

  return response.data;
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(id: number | string): Promise<void> {
  const response = await api.delete(
    apiConfig.endpoints.vehicles.delete(id.toString())
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete vehicle');
  }
}

/**
 * Set a vehicle as primary
 */
export async function setPrimaryVehicle(id: number | string): Promise<Vehicle> {
  const response = await api.post<Vehicle>(
    apiConfig.endpoints.vehicles.setPrimary(id.toString())
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to set primary vehicle');
  }

  return response.data;
}

/**
 * Get available vehicle makes
 */
export async function getVehicleMakes(): Promise<VehicleMake[]> {
  const response = await api.get<VehicleMake[]>(
    apiConfig.endpoints.settings.vehicleMakes
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch vehicle makes');
  }

  return response.data;
}

/**
 * Get models for a specific make
 */
export async function getVehicleModels(makeSlug: string): Promise<VehicleModel[]> {
  const response = await api.get<VehicleModel[]>(
    apiConfig.endpoints.settings.vehicleModels(makeSlug)
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch vehicle models');
  }

  return response.data;
}

// ================== Helper Functions ==================

/**
 * Format mileage for display
 */
export function formatMileage(mileage: number | null): string {
  if (mileage === null || mileage === undefined) return 'N/A';
  return `${mileage.toLocaleString()} km`;
}

/**
 * Get fuel type label
 */
export function getFuelTypeLabel(fuelType: string | null): string {
  if (!fuelType) return 'Unknown';
  const labels: Record<string, string> = {
    petrol: 'Petrol',
    diesel: 'Diesel',
    hybrid: 'Hybrid',
    electric: 'Electric',
    lpg: 'LPG',
  };
  return labels[fuelType] || fuelType;
}

/**
 * Get transmission label
 */
export function getTransmissionLabel(transmission: string | null): string {
  if (!transmission) return 'Unknown';
  const labels: Record<string, string> = {
    automatic: 'Automatic',
    manual: 'Manual',
    cvt: 'CVT',
  };
  return labels[transmission] || transmission;
}

// ================== Default Export ==================

const vehicleService = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  setPrimaryVehicle,
  getVehicleMakes,
  getVehicleModels,
  formatMileage,
  getFuelTypeLabel,
  getTransmissionLabel,
};

export default vehicleService;
