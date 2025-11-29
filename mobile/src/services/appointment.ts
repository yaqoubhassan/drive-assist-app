/**
 * Appointment Service
 * Handles all appointment-related API calls for drivers
 */

import api from './api';
import { apiConfig } from '../config/api';

// ================== Types ==================

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rejected';

export type ServiceType = 'diagnostic' | 'repair' | 'maintenance' | 'inspection';

export type LocationType = 'expert_shop' | 'driver_location';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded';

export interface AppointmentExpert {
  id: number;
  full_name: string;
  avatar: string | null;
}

export interface AppointmentExpertProfile {
  business_name: string | null;
  rating: number;
  address: string | null;
  city: string | null;
  phone: string | null;
}

export interface AppointmentVehicle {
  id: number;
  display_name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  mileage?: number | null;
}

export interface AppointmentService {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total?: number;
}

export interface AppointmentDiagnosis {
  id: number;
  title?: string;
  urgency?: string;
  category?: string;
  symptoms?: string;
  ai_diagnosis?: any;
}

export interface Appointment {
  id: number;
  status: AppointmentStatus;
  scheduled_date: string;
  scheduled_time: string;
  service_type: ServiceType;
  estimated_duration_minutes: number;
  location_type: LocationType;
  estimated_cost: number | null;
  final_cost: number | null;
  currency: string;
  payment_status: PaymentStatus;
  expert: AppointmentExpert | null;
  expert_profile: AppointmentExpertProfile | null;
  vehicle: AppointmentVehicle | null;
  created_at: string;
  // Detailed fields (only in show)
  description?: string;
  notes?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  confirmed_at?: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  services?: AppointmentService[];
  diagnosis?: AppointmentDiagnosis;
}

export interface CreateAppointmentRequest {
  expert_id: number;
  vehicle_id?: number;
  diagnosis_id?: number;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm
  service_type: ServiceType;
  description?: string;
  notes?: string;
  location_type?: LocationType;
  address?: string;
  latitude?: number;
  longitude?: number;
  service_package_ids?: number[];
}

export interface RescheduleRequest {
  scheduled_date: string;
  scheduled_time: string;
}

export interface AppointmentListParams {
  status?: 'upcoming' | 'past' | 'active' | AppointmentStatus;
  page?: number;
}

export interface PaginatedAppointments {
  data: Appointment[];
  current_page: number;
  last_page: number;
  total: number;
}

// ================== Service Functions ==================

/**
 * Get list of driver's appointments
 */
export async function getAppointments(
  params?: AppointmentListParams
): Promise<PaginatedAppointments> {
  const response = await api.get<PaginatedAppointments>(
    apiConfig.endpoints.appointments.list,
    params
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch appointments');
  }

  return response.data;
}

/**
 * Get appointment details
 */
export async function getAppointment(id: number | string): Promise<Appointment> {
  const response = await api.get<Appointment>(
    apiConfig.endpoints.appointments.show(id.toString())
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch appointment');
  }

  return response.data;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  data: CreateAppointmentRequest
): Promise<Appointment> {
  const response = await api.post<Appointment>(
    apiConfig.endpoints.appointments.create,
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create appointment');
  }

  return response.data;
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(
  id: number | string,
  reason?: string
): Promise<Appointment> {
  const response = await api.post<Appointment>(
    apiConfig.endpoints.appointments.cancel(id.toString()),
    { reason }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to cancel appointment');
  }

  return response.data;
}

/**
 * Reschedule an appointment
 */
export async function rescheduleAppointment(
  id: number | string,
  data: RescheduleRequest
): Promise<Appointment> {
  const response = await api.post<Appointment>(
    apiConfig.endpoints.appointments.reschedule(id.toString()),
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to reschedule appointment');
  }

  return response.data;
}

/**
 * Get upcoming appointments count
 */
export async function getUpcomingCount(): Promise<number> {
  const response = await api.get<{ count: number }>(
    apiConfig.endpoints.appointments.upcomingCount
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch count');
  }

  return response.data.count;
}

// ================== Helper Functions ==================

/**
 * Get status color for UI
 */
export function getStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case 'pending':
      return '#F59E0B'; // amber
    case 'confirmed':
      return '#3B82F6'; // blue
    case 'in_progress':
      return '#8B5CF6'; // purple
    case 'completed':
      return '#10B981'; // green
    case 'cancelled':
    case 'rejected':
    case 'no_show':
      return '#EF4444'; // red
    default:
      return '#64748B'; // slate
  }
}

/**
 * Get status label for UI
 */
export function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'pending':
      return 'Awaiting Confirmation';
    case 'confirmed':
      return 'Confirmed';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'rejected':
      return 'Rejected';
    case 'no_show':
      return 'No Show';
    default:
      return status;
  }
}

/**
 * Get service type label
 */
export function getServiceTypeLabel(type: ServiceType): string {
  switch (type) {
    case 'diagnostic':
      return 'Diagnostic';
    case 'repair':
      return 'Repair';
    case 'maintenance':
      return 'Maintenance';
    case 'inspection':
      return 'Inspection';
    default:
      return type;
  }
}

/**
 * Get service type icon (MaterialIcons name)
 */
export function getServiceTypeIcon(type: ServiceType): string {
  switch (type) {
    case 'diagnostic':
      return 'search';
    case 'repair':
      return 'build';
    case 'maintenance':
      return 'settings';
    case 'inspection':
      return 'checklist';
    default:
      return 'directions-car';
  }
}

/**
 * Format appointment date for display
 */
export function formatAppointmentDate(date: string, time: string): string {
  const dateObj = new Date(`${date}T${time}`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = dateObj.toDateString() === today.toDateString();
  const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return `Today at ${formatTime(time)}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${formatTime(time)}`;
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  return `${dateObj.toLocaleDateString('en-US', options)} at ${formatTime(time)}`;
}

/**
 * Format time for display (24h to 12h)
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number | null, currency = 'GHS'): string {
  if (amount === null) return 'TBD';
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Check if appointment can be cancelled
 */
export function canCancel(status: AppointmentStatus): boolean {
  return ['pending', 'confirmed'].includes(status);
}

/**
 * Check if appointment can be rescheduled
 */
export function canReschedule(status: AppointmentStatus): boolean {
  return ['pending', 'confirmed'].includes(status);
}

// ================== Default Export ==================

const appointmentService = {
  getAppointments,
  getAppointment,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  getUpcomingCount,
  // Helpers
  getStatusColor,
  getStatusLabel,
  getServiceTypeLabel,
  getServiceTypeIcon,
  formatAppointmentDate,
  formatTime,
  formatCurrency,
  canCancel,
  canReschedule,
};

export default appointmentService;
