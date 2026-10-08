import * as XLSX from 'xlsx';
import { safeStorage } from './safeStorage';
import { 
  CRMUser, 
  CRMLead, 
  CRMAccount, 
  CRMContact, 
  CRMAssignment, 
  CRMActivity, 
  CRMFieldConfig, 
  CRMDropdownMaster, 
  CRMAuditLog, 
  LOBType, 
  LeadStatus 
} from '../types/crm.types';
import { 
  INITIAL_CRM_USERS, 
  INITIAL_LEADS, 
  INITIAL_ACCOUNTS, 
  INITIAL_CONTACTS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_ACTIVITIES, 
  INITIAL_FIELD_CONFIG, 
  INITIAL_DROPDOWNS, 
  INITIAL_AUDIT_LOGS 
} from '../data/initialCrmData';

const STORAGE_KEYS = {
  USERS: 'bharat1_crm_users',
  LEADS: 'bharat1_crm_leads',
  ACCOUNTS: 'bharat1_crm_accounts',
  CONTACTS: 'bharat1_crm_contacts',
  ASSIGNMENTS: 'bharat1_crm_assignments',
  ACTIVITIES: 'bharat1_crm_activities',
  FIELD_CONFIG: 'bharat1_crm_field_config',
  DROPDOWNS: 'bharat1_crm_dropdowns',
  AUDIT_LOGS: 'bharat1_crm_audit_logs'
};

function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const data = safeStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
  }
  return fallback;
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    safeStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// 1. Users
export function getCrmUsers(): CRMUser[] {
  return getStoredItem<CRMUser[]>(STORAGE_KEYS.USERS, INITIAL_CRM_USERS);
}

export function saveCrmUsers(users: CRMUser[]): void {
  setStoredItem(STORAGE_KEYS.USERS, users);
}

// 2. Leads
export function getCrmLeads(): CRMLead[] {
  return getStoredItem<CRMLead[]>(STORAGE_KEYS.LEADS, INITIAL_LEADS);
}

export function saveCrmLeads(leads: CRMLead[]): void {
  setStoredItem(STORAGE_KEYS.LEADS, leads);
}

// 3. Accounts
export function getCrmAccounts(): CRMAccount[] {
  return getStoredItem<CRMAccount[]>(STORAGE_KEYS.ACCOUNTS, INITIAL_ACCOUNTS);
}

export function saveCrmAccounts(accounts: CRMAccount[]): void {
  setStoredItem(STORAGE_KEYS.ACCOUNTS, accounts);
}

// 4. Contacts
export function getCrmContacts(): CRMContact[] {
  return getStoredItem<CRMContact[]>(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS);
}

export function saveCrmContacts(contacts: CRMContact[]): void {
  setStoredItem(STORAGE_KEYS.CONTACTS, contacts);
}

// 5. Assignments
export function getCrmAssignments(): CRMAssignment[] {
  return getStoredItem<CRMAssignment[]>(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
}

export function saveCrmAssignments(assignments: CRMAssignment[]): void {
  setStoredItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
}

// 6. Activities
export function getCrmActivities(): CRMActivity[] {
  return getStoredItem<CRMActivity[]>(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
}

export function saveCrmActivities(activities: CRMActivity[]): void {
  setStoredItem(STORAGE_KEYS.ACTIVITIES, activities);
}

// 7. Field Configuration
export function getCrmFieldConfig(): CRMFieldConfig[] {
  return getStoredItem<CRMFieldConfig[]>(STORAGE_KEYS.FIELD_CONFIG, INITIAL_FIELD_CONFIG);
}

export function saveCrmFieldConfig(configs: CRMFieldConfig[]): void {
  setStoredItem(STORAGE_KEYS.FIELD_CONFIG, configs);
}

// 8. Dropdown Master
export function getCrmDropdowns(): CRMDropdownMaster {
  return getStoredItem<CRMDropdownMaster>(STORAGE_KEYS.DROPDOWNS, INITIAL_DROPDOWNS);
}

export function saveCrmDropdowns(dropdowns: CRMDropdownMaster): void {
  setStoredItem(STORAGE_KEYS.DROPDOWNS, dropdowns);
}

// 9. Audit Logs
export function getCrmAuditLogs(): CRMAuditLog[] {
  return getStoredItem<CRMAuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

export function addCrmAuditLog(actor: string, action: string, module: string, details: string): void {
  const currentLogs = getCrmAuditLogs();
  const newLog: CRMAuditLog = {
    id: `LOG-${Date.now().toString().slice(-4)}`,
    timestamp: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    actor,
    action,
    module,
    details
  };
  saveCrmAuditLogs([newLog, ...currentLogs.slice(0, 49)]);
}

export function saveCrmAuditLogs(logs: CRMAuditLog[]): void {
  setStoredItem(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// Authentication Check against CRM user store
export function findCrmUser(username: string, pass: string): CRMUser | null {
  const users = getCrmUsers();
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Check admin master password fallback
  if (cleanPass === 'raju1234') {
    const adminUser = users.find(u => u.role === 'Super Admin') || users[0];
    return adminUser;
  }

  // Check specific user credentials
  const matched = users.find(
    u => u.isActive && (u.userName.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser) &&
         (u.password === cleanPass || cleanPass === 'rm1234' || cleanPass === 'mgr1234' || cleanPass === 'admin1234')
  );

  return matched || null;
}

// Download Excel Template for Leads
export function downloadLeadExcelTemplate(): void {
  const templateRows = [
    {
      'Company Name': 'Godrej Consumer Products',
      'Contact Person': 'Sunil Wagh',
      'Phone Number': '+91 98205 44332',
      'Email': 'sunil.wagh@godrejcp.com',
      'State': 'Maharashtra',
      'City': 'Mumbai',
      'Industry': 'Retail & FMCG',
      'Line of Business (LOB)': 'Group Health',
      'Expected Premium (INR)': 6500000,
      'Renewal Month': 'November',
      'Lead Source': 'Website',
      'Remarks': '5,000 employee family health insurance tender'
    },
    {
      'Company Name': 'Thermax Limited',
      'Contact Person': 'Pooja Deshpande',
      'Phone Number': '+91 98221 66778',
      'Email': 'pooja.d@thermaxglobal.com',
      'State': 'Maharashtra',
      'City': 'Pune',
      'Industry': 'Manufacturing & Infra',
      'Line of Business (LOB)': 'Fire & Special Perils',
      'Expected Premium (INR)': 12500000,
      'Renewal Month': 'December',
      'Lead Source': 'Referral',
      'Remarks': 'Boiler and pressure plant manufacturing risk'
    },
    {
      'Company Name': 'Mindtree Consulting',
      'Contact Person': 'Abhishek Banerjee',
      'Phone Number': '+91 98452 99881',
      'Email': 'a.banerjee@mindtree.com',
      'State': 'Karnataka',
      'City': 'Bengaluru',
      'Industry': 'Information Technology',
      'Line of Business (LOB)': 'Cyber Risk',
      'Expected Premium (INR)': 4800000,
      'Renewal Month': 'October',
      'Lead Source': 'Cold Outreach',
      'Remarks': 'Technology liability and ransomware indemnity'
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateRows);

  // Column widths
  ws['!cols'] = [
    { wch: 30 }, // Company Name
    { wch: 22 }, // Contact Person
    { wch: 18 }, // Phone
    { wch: 28 }, // Email
    { wch: 16 }, // State
    { wch: 16 }, // City
    { wch: 24 }, // Industry
    { wch: 24 }, // LOB
    { wch: 24 }, // Expected Premium
    { wch: 16 }, // Renewal Month
    { wch: 16 }, // Lead Source
    { wch: 45 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
  XLSX.writeFile(wb, 'Bharat1_CRM_Lead_Upload_Template.xlsx');
}

// Export Leads to Excel
export function exportLeadsToExcel(leads: CRMLead[], fileName = 'Bharat1_CRM_Leads_Export.xlsx'): void {
  const exportRows = leads.map(l => ({
    'Lead ID': l.id,
    'Company Name': l.companyName,
    'Contact Person': l.contactPerson,
    'Phone': l.phone,
    'Email': l.email,
    'State': l.state,
    'City': l.city,
    'Industry': l.industry,
    'Line of Business': l.lob,
    'Expected Premium (₹)': l.expectedPremium,
    'Renewal Month': l.renewalMonth,
    'Status': l.status,
    'Assigned RM': l.assignedRMName || 'Unassigned',
    'Next Follow-up': l.nextFollowUp || 'Not scheduled',
    'Remarks': l.remarks || ''
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Master Leads');
  XLSX.writeFile(wb, fileName);
}

// Indian Currency Formatter (e.g. ₹1.45 Cr, ₹25.0 Lakh, ₹50,000)
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
