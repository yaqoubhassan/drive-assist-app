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
  isGuest?: boolean;
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
  businessType?: string;
  bio?: string;
  specialties: string[];
  services: Service[];
  rating: number;
  reviewCount: number;
  yearsExperience?: number;
  employeeCount?: number;
  verified: boolean;
  certifications: string[];
  hours: BusinessHours;
  gallery: string[];
  priceRange: PriceRange;
  // Expert status flags
  emailVerified: boolean;
  onboardingComplete: boolean;
  kycStatus: KycStatus;
  // Location
  businessAddress?: string;
  serviceRadiusKm?: number;
  // Accepts emergency calls
  acceptsEmergency?: boolean;
}

// Expert KYC Types
export type KycStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'resubmission_required';

export interface ExpertKyc {
  // Business Documents
  businessLicenseNumber?: string;
  businessLicenseDocumentPath?: string;
  businessLicenseExpiry?: string;
  // Insurance
  insurancePolicyNumber?: string;
  insuranceCertificatePath?: string;
  insuranceExpiry?: string;
  insuranceProvider?: string;
  // Identity
  idType?: 'national_id' | 'drivers_license' | 'passport';
  idNumber?: string;
  idDocumentFrontPath?: string;
  idDocumentBackPath?: string;
  // Background Check
  backgroundCheckConsent?: boolean;
  // Status
  kycStatus: KycStatus;
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  rejectionReason?: string;
  completionPercentage: number;
  currentStep: number;
}

// Expert Onboarding Data
export interface ExpertOnboardingData {
  // Step 1: Basic Info
  phone?: string;
  businessName?: string;
  businessType?: string;
  yearsExperience?: number;
  employeeCount?: number;
  bio?: string;
  // Step 2: Location
  businessAddress?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  serviceRadiusKm?: number;
  // Step 3: Services
  specialties: string[];
  // Step 4: Operating Hours
  operatingHours?: BusinessHours;
  acceptsEmergency?: boolean;
}

// Business Types for Ghana
export const BusinessTypes: Record<string, string> = {
  independent_mechanic: 'Independent Mechanic',
  auto_repair_shop: 'Auto Repair Shop',
  dealership_service: 'Dealership Service Center',
  mobile_mechanic: 'Mobile Mechanic',
  specialty_shop: 'Specialty Shop (Electrical, AC, etc.)',
  tire_shop: 'Tire & Wheel Shop',
  body_shop: 'Body & Paint Shop',
  auto_electrician: 'Auto Electrician',
  towing_service: 'Towing Service',
  other: 'Other',
};

// Expert Specialties
export const ExpertSpecialties: Record<string, string> = {
  engine_repair: 'Engine Repair',
  transmission: 'Transmission',
  brakes: 'Brakes & Suspension',
  electrical: 'Electrical Systems',
  ac_heating: 'AC & Heating',
  oil_change: 'Oil Change & Fluids',
  tire_service: 'Tire Service',
  body_work: 'Body Work',
  paint: 'Paint & Refinishing',
  diagnostics: 'Diagnostics',
  hybrid_ev: 'Hybrid & Electric Vehicles',
  towing: 'Towing & Recovery',
  windshield: 'Windshield & Glass',
  exhaust: 'Exhaust Systems',
  steering: 'Steering & Alignment',
  general_maintenance: 'General Maintenance',
};

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
  plateNumber?: string;
  fuelType?: string;
  transmission?: string;
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
