/**
 * DriveAssist Type Definitions
 */

// User Types
export type UserType = 'driver' | 'expert' | 'guest';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  userType: UserType;
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile extends User {
  userType: 'driver';
  vehicles: Vehicle[];
  savedExperts: string[]; // Expert IDs
  diagnosisCount: number;
  reviewsGiven: number;
}

export interface ExpertProfile extends User {
  userType: 'expert';
  businessName: string;
  bio?: string;
  specialties: string[];
  services: Service[];
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  verified: boolean;
  certifications: string[];
  hours: BusinessHours;
  gallery: string[];
  priceRange: PriceRange;
}

// Location
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city: string;
  region?: string;
  country: string;
}

// Vehicle
export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  mileage?: number;
  vin?: string;
  color?: string;
  imageUrl?: string;
  isDefault: boolean;
  createdAt: string;
}

// Diagnosis
export type DiagnosisCategory =
  | 'engine'
  | 'brakes'
  | 'electrical'
  | 'transmission'
  | 'tires'
  | 'other';

export type DiagnosisStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'resolved';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Diagnosis {
  id: string;
  userId: string;
  vehicleId?: string;
  category: DiagnosisCategory;
  description: string;
  photos: string[];
  voiceNote?: string;
  status: DiagnosisStatus;
  result?: DiagnosisResult;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosisResult {
  issue: string;
  confidence: number; // 0-100
  explanation: string;
  urgency: UrgencyLevel;
  safeToVehicle: boolean;
  safeToVehicleNote?: string;
  estimatedCostMin: number;
  estimatedCostMax: number;
  estimatedTimeHours: number;
  diySteps?: string[];
  safetyWarnings?: string[];
  relatedIssues?: string[];
}

// Expert/Service
export interface Service {
  id: string;
  name: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  estimatedTimeMinutes: number;
}

export type PriceRange = 'budget' | 'average' | 'premium';

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

// Expert Lead
export type LeadStatus =
  | 'new'
  | 'responded'
  | 'in_progress'
  | 'closed'
  | 'declined';

export interface Lead {
  id: string;
  expertId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  diagnosisId?: string;
  message: string;
  preferredContact: 'email' | 'phone' | 'text';
  bestTimeToContact?: string;
  status: LeadStatus;
  distance?: number;
  createdAt: string;
  respondedAt?: string;
}

// Job
export type JobStatus =
  | 'scheduled'
  | 'in_progress'
  | 'awaiting_parts'
  | 'awaiting_approval'
  | 'completed'
  | 'cancelled';

export interface Job {
  id: string;
  expertId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  vehicle?: Vehicle;
  serviceType: string;
  description: string;
  status: JobStatus;
  scheduledAt: string;
  estimatedTimeHours: number;
  estimatedCost: number;
  actualCost?: number;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
}

// Review
export interface Review {
  id: string;
  expertId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  serviceType?: string;
  photos?: string[];
  expertResponse?: string;
  helpful: number;
  createdAt: string;
}

// Message/Conversation
export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'diagnosis' | 'system';
  attachments?: string[];
  diagnosisId?: string;
  read: boolean;
  createdAt: string;
}

// Educational Content
export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  readTimeMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
}

export interface RoadSign {
  id: string;
  name: string;
  imageUrl: string;
  category: 'warning' | 'regulatory' | 'information' | 'construction' | 'school';
  meaning: string;
  whatToDo: string;
  commonLocations?: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'diagnosis' | 'message' | 'lead' | 'job' | 'review' | 'system';
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Analytics (for experts)
export interface ExpertAnalytics {
  profileViews: number;
  profileViewsChange: number;
  responseRate: number;
  leadConversion: number;
  averageRating: number;
  totalJobs: number;
  totalRevenue: number;
  revenueChange: number;
  topServices: { name: string; count: number }[];
}

// Form State Types
export interface DiagnosisFormState {
  category?: DiagnosisCategory;
  description: string;
  photos: string[];
  voiceNote?: string;
  vehicleId?: string;
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    mileage?: number;
  };
}

// Navigation Types
export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  ForgotPassword: undefined;
};

export type DriverTabParamList = {
  Home: undefined;
  Diagnose: undefined;
  Experts: undefined;
  Learn: undefined;
  Profile: undefined;
};

export type ExpertTabParamList = {
  Dashboard: undefined;
  Leads: undefined;
  Jobs: undefined;
  Earnings: undefined;
  Profile: undefined;
};
