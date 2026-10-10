import { CRMRoleType } from './crm.types';

export type SubscriptionStatus = 'Trial' | 'Active' | 'Suspended' | 'Expired';

export interface CustomerCompany {
  id: string; // e.g. 'B1AI-C0001'
  companyName: string;
  companyAddress: string;
  contactPersonName: string;
  designation?: string;
  contactNumber: string;
  email: string;
  adminPasswordHash?: string;
  status: 'Active' | 'Inactive';
  subscriptionStatus: SubscriptionStatus;
  logoUrl?: string; // Company specific custom logo
  createdAt: string;
  updatedAt: string;
}

export type PlatformRole = 
  | 'Bharat 1 AI Admin'   // Platform Administrator
  | 'Super Admin'         // Customer Company Super Admin
  | 'Company Super Admin'  // Customer Company Administrator alias
  | 'Lead Manager'        // CRM Lead Manager
  | 'RM';                 // Relationship Manager

export interface MultiTenantUser {
  id: string; // e.g. 'usr-1' or 'EIB152'
  companyId: string; // 'B1AI-PLATFORM' for Bharat One AI, or 'B1AI-C0001' for customer companies
  rmId?: string; // e.g. 'ADM-01', 'RM-101', 'EIB152'
  name: string;
  userName: string;
  email: string;
  phone?: string;
  password?: string;
  role: PlatformRole;
  isActive: boolean;
  department?: string;
  createdAt: string;
}

export interface BrandingConfig {
  platformLogoUrl?: string; // Default Bharat 1 AI platform logo
  companyLogos: Record<string, string>; // companyId -> dataUrl or image url
}

export interface VisualElementConfig {
  id: string;
  section: string; // 'homepage' | 'navigation' | 'crm' | 'dashboard'
  label: string;
  customText?: string;
  isVisible: boolean;
  orderIndex: number;
}
