/**
 * Maintenance Service
 * Handles all maintenance-related API calls including reminders and logs
 */

import api from './api';
import { apiConfig } from '../config/api';

// ================== Types ==================

export interface MaintenanceType {
  id: number;
  name: string;
  slug: string;
  description: string;
  default_interval_months: number;
  default_interval_km: number;
  icon: string;
  color: string;
}

export interface MaintenanceReminder {
  id: number;
  user_id: number;
  vehicle_id: number;
  maintenance_type_id: number;
  maintenance_type: MaintenanceType;
  vehicle: {
    id: number;
    display_name?: string;
    make_name?: string;
    model_name?: string;
    year: number;
  };
  custom_title: string | null;
  notes: string | null;
  due_date: string;
  due_mileage: number | null;
  interval_km: number | null;
  interval_months: number | null;
  last_completed_date: string | null;
  last_completed_mileage: number | null;
  last_completed_cost: number | null;
  currency: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed' | 'snoozed';
  notifications_enabled: boolean;
  notification_days: number[] | null;
  snoozed_until: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
  // Computed attributes
  completed_at?: string | null; // Alias for last_completed_date
  completed_mileage?: number | null; // Alias for last_completed_mileage
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  maintenance_type_id: number;
  maintenance_type: MaintenanceType;
  vehicle: {
    id: number;
    display_name: string;
  };
  performed_date: string;
  mileage: number | null;
  cost: number | null;
  notes: string | null;
  service_provider: string | null;
  created_at: string;
}

export interface CreateReminderRequest {
  vehicle_id: number;
  maintenance_type_id: number;
  due_date: string;
  due_mileage?: number;
  notes?: string;
}

export interface CompleteReminderRequest {
  completed_mileage?: number;
  cost?: number;
  notes?: string;
  service_provider?: string;
}

// ================== Service Functions ==================

/**
 * Get maintenance types
 */
export async function getMaintenanceTypes(): Promise<MaintenanceType[]> {
  const response = await api.get<MaintenanceType[]>(
    apiConfig.endpoints.maintenance.types
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch maintenance types');
  }

  return response.data;
}

/**
 * Get maintenance reminders
 */
export async function getReminders(params?: {
  status?: string;
  vehicle_id?: number;
}): Promise<MaintenanceReminder[]> {
  // Backend returns paginated response
  const response = await api.get<{
    data: MaintenanceReminder[];
    current_page: number;
    last_page: number;
    total: number;
  }>(apiConfig.endpoints.maintenance.reminders, params);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch maintenance reminders');
  }

  // Extract the data array from paginated response
  return response.data.data || [];
}

/**
 * Get a single reminder
 */
export async function getReminder(id: number | string): Promise<MaintenanceReminder> {
  const response = await api.get<MaintenanceReminder>(
    apiConfig.endpoints.maintenance.reminderShow(id.toString())
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch maintenance reminder');
  }

  return response.data;
}

/**
 * Create a new reminder
 */
export async function createReminder(data: CreateReminderRequest): Promise<MaintenanceReminder> {
  const response = await api.post<MaintenanceReminder>(
    apiConfig.endpoints.maintenance.reminders,
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create maintenance reminder');
  }

  return response.data;
}

/**
 * Mark reminder as complete
 */
export async function completeReminder(
  id: number | string,
  data?: CompleteReminderRequest
): Promise<MaintenanceReminder> {
  const response = await api.post<MaintenanceReminder>(
    apiConfig.endpoints.maintenance.complete(id.toString()),
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to complete maintenance reminder');
  }

  return response.data;
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  id: number | string,
  snoozeDays: number = 7
): Promise<MaintenanceReminder> {
  const response = await api.post<MaintenanceReminder>(
    apiConfig.endpoints.maintenance.snooze(id.toString()),
    { snooze_days: snoozeDays }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to snooze maintenance reminder');
  }

  return response.data;
}

/**
 * Get maintenance logs
 */
export async function getLogs(params?: {
  vehicle_id?: number;
  page?: number;
}): Promise<{
  logs: MaintenanceLog[];
  currentPage: number;
  lastPage: number;
  total: number;
}> {
  const response = await api.get<{
    data: MaintenanceLog[];
    current_page: number;
    last_page: number;
    total: number;
  }>(apiConfig.endpoints.maintenance.logs, params);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch maintenance logs');
  }

  return {
    logs: response.data.data,
    currentPage: response.data.current_page,
    lastPage: response.data.last_page,
    total: response.data.total,
  };
}

/**
 * Get due and overdue reminders count
 */
export async function getDueCount(): Promise<{ due: number; overdue: number; total: number }> {
  try {
    const reminders = await getReminders();
    const due = reminders.filter(r => r.status === 'due').length;
    const overdue = reminders.filter(r => r.status === 'overdue').length;
    return { due, overdue, total: due + overdue };
  } catch {
    return { due: 0, overdue: 0, total: 0 };
  }
}

// ================== Helper Functions ==================

/**
 * Get status color
 */
export function getStatusColor(status: MaintenanceReminder['status']): string {
  switch (status) {
    case 'overdue':
      return '#EF4444'; // red
    case 'due':
      return '#F59E0B'; // amber
    case 'upcoming':
      return '#3B82F6'; // blue
    case 'completed':
      return '#10B981'; // green
    case 'snoozed':
      return '#64748B'; // slate
    default:
      return '#64748B';
  }
}

/**
 * Get status label
 */
export function getStatusLabel(status: MaintenanceReminder['status']): string {
  switch (status) {
    case 'overdue':
      return 'Overdue';
    case 'due':
      return 'Due';
    case 'upcoming':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    case 'snoozed':
      return 'Snoozed';
    default:
      return status;
  }
}

/**
 * Format due date for display
 */
export function formatDueDate(date: string): string {
  const dueDate = new Date(date);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return 'Due tomorrow';
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  } else {
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// ================== Default Export ==================

const maintenanceService = {
  getMaintenanceTypes,
  getReminders,
  getReminder,
  createReminder,
  completeReminder,
  snoozeReminder,
  getLogs,
  getDueCount,
  getStatusColor,
  getStatusLabel,
  formatDueDate,
};

export default maintenanceService;
