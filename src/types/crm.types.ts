export type CRMRoleType = 'Super Admin' | 'Lead Manager' | 'CRM Manager' | 'RM';

export interface CRMUser {
  id: string;
  rmId?: string; // e.g. 'RM-101'
  name: string;
  userName: string;
  email: string;
  password?: string;
  phone?: string;
  role: CRMRoleType;
  isActive: boolean;
  department?: string;
  createdAt: string;
}

export type LeadStatus = 'New' | 'Contacted' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export type LOBType = 
  | 'Group Health' 
  | 'Fire & Special Perils' 
  | 'Marine Cargo' 
  | 'Directors & Officers' 
  | 'Cyber Risk' 
  | 'Commercial Motor' 
  | 'Keyman Life' 
  | 'Liability & Crime';

export interface CRMLead {
  id: string; // e.g. 'LEAD-1001'
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  state: string;
  city: string;
  industry: string;
  lob: LOBType;
  expectedPremium: number; // in INR (₹)
  renewalMonth: string; // e.g. 'October', 'November'
  source: string; // e.g. 'Website', 'Referral', 'Broker', 'Cold Outreach'
  assignedRMId?: string;
  assignedRMName?: string;
  status: LeadStatus;
  lastFollowUp?: string;
  nextFollowUp?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMAccount {
  id: string; // e.g. 'ACC-201'
  companyName: string;
  industry: string;
  gstin?: string;
  pan?: string;
  state: string;
  city: string;
  address?: string;
  website?: string;
  annualTurnover?: string;
  totalLeadsCount: number;
  activePoliciesCount: number;
  assignedRMName?: string;
  status: 'Active' | 'Prospect' | 'Inactive';
}

export interface CRMContact {
  id: string; // e.g. 'CON-301'
  accountId: string;
  companyName: string;
  name: string;
  designation: string;
  department?: string;
  phone: string;
  email: string;
  isPrimary: boolean;
  notes?: string;
}

export interface CRMAssignment {
  id: string;
  leadId: string;
  leadCompany: string;
  rmId: string;
  rmName: string;
  assignedBy: string;
  assignedDate: string;
  notes?: string;
}

export interface CRMActivity {
  id: string;
  leadId?: string;
  leadCompany?: string;
  type: 'Call' | 'Meeting' | 'Demo' | 'Email' | 'Follow-up' | 'Quotation';
  title: string;
  description?: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
  createdBy: string;
  completedAt?: string;
}

export interface CRMFieldConfig {
  key: string;
  label: string;
  visible: boolean;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'date';
}

export interface CRMDropdownMaster {
  lobs: string[];
  sources: string[];
  statuses: string[];
  stages: string[];
  industries: string[];
  states: string[];
}

export interface CRMAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  details: string;
}

export type CRMNavTab = 
  | 'dashboard'
  | 'manage_leads'
  | 'assign_leads'
  | 'my_leads'
  | 'accounts'
  | 'contacts'
  | 'pipeline'
  | 'policy_data_bank'
  | 'activities'
  | 'reports';
