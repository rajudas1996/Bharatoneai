import { CustomerCompany, MultiTenantUser, BrandingConfig, VisualElementConfig } from '../types/multiCompany.types';
import { safeStorage } from './safeStorage';

const STORAGE_KEYS = {
  COMPANIES: 'bharat1_customer_companies',
  COMPANY_USERS: 'bharat1_company_users',
  BRANDING: 'bharat1_branding_config',
  VISUAL_EDITOR: 'bharat1_visual_editor_config',
  ACTIVE_COMPANY_ID: 'bharat1_active_company_id',
};

// Default Customer Company (Migrated Epoch Insurance Brokers Pvt. Ltd. per Section 8)
export const INITIAL_COMPANIES: CustomerCompany[] = [
  {
    id: 'B1AI-C0001',
    companyName: 'Epoch Insurance Brokers Pvt. Ltd.',
    companyAddress: 'Unit 402, Trade Tower, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
    contactPersonName: 'Sunil Mehta (Director)',
    contactNumber: '+91 98200 45678',
    email: 'contact@epochbrokers.com',
    status: 'Active',
    subscriptionStatus: 'Active',
    createdAt: '2026-01-10',
    updatedAt: '2026-10-10'
  },
  {
    id: 'B1AI-C0002',
    companyName: 'Tata Consultancy Services (TCS)',
    companyAddress: 'TCS House, Raveline Street, Fort, Mumbai 400001',
    contactPersonName: 'Rajesh Sharma (Head of Corporate Risk)',
    contactNumber: '+91 98201 12345',
    email: 'corporate.risk@tcs.com',
    status: 'Active',
    subscriptionStatus: 'Active',
    createdAt: '2026-02-15',
    updatedAt: '2026-10-10'
  },
  {
    id: 'B1AI-C0003',
    companyName: 'Reliance Retail Ventures',
    companyAddress: 'Reliance Corporate Park, Thane-Belapur Road, Navi Mumbai 400701',
    contactPersonName: 'Priya Sundaram (VP Procurement)',
    contactNumber: '+91 98450 67890',
    email: 'procurement@relianceretail.in',
    status: 'Active',
    subscriptionStatus: 'Active',
    createdAt: '2026-03-01',
    updatedAt: '2026-10-10'
  }
];

// Initial Platform-level and Migrated Users
// Platform users have companyId: 'B1AI-PLATFORM'
// Epoch Insurance Brokers users have companyId: 'B1AI-C0001'
export const INITIAL_MULTI_TENANT_USERS: MultiTenantUser[] = [
  // 1. Platform Admin: Bharat 1 AI Platform Administrator
  {
    id: 'usr-platform-admin',
    companyId: 'B1AI-PLATFORM',
    rmId: 'ADM-01',
    name: 'Raju Das',
    userName: 'raju',
    email: 'rajudaszoology22@gmail.com',
    phone: '+91 98301 11223',
    password: 'raju',
    role: 'Bharat 1 AI Admin',
    isActive: true,
    department: 'Bharat 1 AI Platform Engineering',
    createdAt: '2026-01-01'
  },
  // 2. Platform Operations Manager
  {
    id: 'usr-platform-ops',
    companyId: 'B1AI-PLATFORM',
    rmId: 'OPS-01',
    name: 'Suresh Raina',
    userName: 'suresh',
    email: 'suresh@bharatai.in',
    phone: '+91 98111 22334',
    password: 'ops',
    role: 'Bharat 1 AI Admin',
    isActive: true,
    department: 'Platform Operations',
    createdAt: '2026-01-15'
  },

  // 3. Migrated Epoch Insurance Brokers Pvt. Ltd. (B1AI-C0001) Users:
  // - EIB152 Raju Das (Company Super Admin)
  {
    id: 'usr-epoch-1',
    companyId: 'B1AI-C0001',
    rmId: 'EIB152',
    name: 'Raju Das',
    userName: 'raju.epoch',
    email: 'raju.das@epochbrokers.com',
    phone: '+91 98301 11223',
    password: 'raju',
    role: 'Company Super Admin',
    isActive: true,
    department: 'Epoch Management',
    createdAt: '2026-01-15'
  },
  // - EIB250 Ratan Bera (Lead Manager)
  {
    id: 'usr-epoch-2',
    companyId: 'B1AI-C0001',
    rmId: 'EIB250',
    name: 'Ratan Bera',
    userName: 'ratan',
    email: 'ratan.bera@epochbrokers.com',
    phone: '+91 98202 33445',
    password: 'mgr',
    role: 'Lead Manager',
    isActive: true,
    department: 'Commercial Sales & Allocation',
    createdAt: '2026-02-01'
  },
  // - EIB017 Nitin Sharma (Relationship Manager)
  {
    id: 'usr-epoch-3',
    companyId: 'B1AI-C0001',
    rmId: 'EIB017',
    name: 'Nitin Sharma',
    userName: 'nitin',
    email: 'nitin.sharma@epochbrokers.com',
    phone: '+91 98199 55667',
    password: 'rm',
    role: 'RM',
    isActive: true,
    department: 'North & West Regional Accounts',
    createdAt: '2026-02-10'
  },
  // - Additional RM for Epoch: Priya Patel
  {
    id: 'usr-epoch-4',
    companyId: 'B1AI-C0001',
    rmId: 'EIB018',
    name: 'Priya Patel',
    userName: 'priya',
    email: 'priya.patel@epochbrokers.com',
    phone: '+91 98451 77889',
    password: 'rm',
    role: 'RM',
    isActive: true,
    department: 'South Regional Sales',
    createdAt: '2026-02-15'
  },

  // 4. TCS Users (B1AI-C0002)
  {
    id: 'usr-tcs-1',
    companyId: 'B1AI-C0002',
    rmId: 'TCS-ADM01',
    name: 'Rajesh Sharma',
    userName: 'rajesh.tcs',
    email: 'rajesh.s@tcs.com',
    phone: '+91 98201 12345',
    password: 'admin',
    role: 'Company Super Admin',
    isActive: true,
    department: 'Enterprise Risk Management',
    createdAt: '2026-02-15'
  },
  {
    id: 'usr-tcs-2',
    companyId: 'B1AI-C0002',
    rmId: 'TCS-RM01',
    name: 'Anjali Deshmukh',
    userName: 'anjali.tcs',
    email: 'anjali.d@tcs.com',
    phone: '+91 98205 99887',
    password: 'rm',
    role: 'RM',
    isActive: true,
    department: 'Financial Services Group',
    createdAt: '2026-02-20'
  }
];

// Helper to get stored items safely
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

// 1. Get all customer companies
export function getCustomerCompanies(): CustomerCompany[] {
  return getStoredItem<CustomerCompany[]>(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
}

// Save customer companies
export function saveCustomerCompanies(companies: CustomerCompany[]): void {
  setStoredItem(STORAGE_KEYS.COMPANIES, companies);
}

// Automatic Company ID Generator: B1AI-C0001, B1AI-C0002, etc. (Section 6)
export function generateNextCompanyId(): string {
  const companies = getCustomerCompanies();
  let maxSeq = 0;
  companies.forEach(c => {
    const match = c.id.match(/^B1AI-C(\d+)$/i);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  const nextSeq = maxSeq + 1;
  const formatted = String(nextSeq).padStart(4, '0');
  return `B1AI-C${formatted}`;
}

// 2. Get Multi-Tenant Users
export function getMultiTenantUsers(): MultiTenantUser[] {
  return getStoredItem<MultiTenantUser[]>(STORAGE_KEYS.COMPANY_USERS, INITIAL_MULTI_TENANT_USERS);
}

export function saveMultiTenantUsers(users: MultiTenantUser[]): void {
  setStoredItem(STORAGE_KEYS.COMPANY_USERS, users);
}

// 3. Branding & Logo Store
export function getBrandingConfig(): BrandingConfig {
  return getStoredItem<BrandingConfig>(STORAGE_KEYS.BRANDING, {
    platformLogoUrl: undefined,
    companyLogos: {}
  });
}

export function saveBrandingConfig(config: BrandingConfig): void {
  setStoredItem(STORAGE_KEYS.BRANDING, config);
}

// Save company logo
export function updateCompanyLogo(companyId: string, logoUrl: string | undefined): void {
  const current = getBrandingConfig();
  const updated = {
    ...current,
    companyLogos: {
      ...current.companyLogos,
      [companyId]: logoUrl || ''
    }
  };
  saveBrandingConfig(updated);

  // Also update customer company record logoUrl
  const companies = getCustomerCompanies();
  const updatedCompanies = companies.map(c => {
    if (c.id === companyId) {
      return { ...c, logoUrl: logoUrl, updatedAt: new Date().toISOString().split('T')[0] };
    }
    return c;
  });
  saveCustomerCompanies(updatedCompanies);
}

// Update platform default logo
export function updatePlatformLogo(logoUrl: string | undefined): void {
  const current = getBrandingConfig();
  const updated = {
    ...current,
    platformLogoUrl: logoUrl
  };
  saveBrandingConfig(updated);
}

// 4. Visual Website Editor Configuration (Section 11)
export const DEFAULT_VISUAL_ELEMENTS: VisualElementConfig[] = [
  { id: 'home_hero_title', section: 'homepage', label: 'Home: Main Feature Title', customText: 'Turn Your Excel Data into Insights', isVisible: true, orderIndex: 1 },
  { id: 'home_hero_subtitle', section: 'homepage', label: 'Home: Main Subtitle', customText: 'Upload your Excel file, view a live dashboard and get AI-powered analysis instantly.', isVisible: true, orderIndex: 2 },
  { id: 'home_tools_title', section: 'homepage', label: 'Home: Tools Section Title', customText: 'Explore AI Tools', isVisible: true, orderIndex: 3 },
  { id: 'nav_dashboard_label', section: 'navigation', label: 'Sidebar: Live Dashboard Label', customText: 'Live Dashboard', isVisible: true, orderIndex: 4 },
  { id: 'nav_sales_crm_label', section: 'navigation', label: 'Sidebar: Sales CRM Label', customText: 'Sales CRM', isVisible: true, orderIndex: 5 },
  { id: 'nav_image_editor_label', section: 'navigation', label: 'Sidebar: Image Editor Label', customText: 'Image Editor', isVisible: true, orderIndex: 6 },
  { id: 'nav_video_editor_label', section: 'navigation', label: 'Sidebar: Video Editor Label', customText: 'Video Editor', isVisible: true, orderIndex: 7 },
  { id: 'nav_music_gen_label', section: 'navigation', label: 'Sidebar: Music Generation Label', customText: 'Music Generation', isVisible: true, orderIndex: 8 },
  { id: 'nav_maps_data_label', section: 'navigation', label: 'Sidebar: Maps Data Label', customText: 'Maps Data', isVisible: true, orderIndex: 9 },
  { id: 'nav_projects_label', section: 'navigation', label: 'Sidebar: Projects Label', customText: 'Projects', isVisible: true, orderIndex: 10 }
];

export function getVisualEditorConfig(): VisualElementConfig[] {
  return getStoredItem<VisualElementConfig[]>(STORAGE_KEYS.VISUAL_EDITOR, DEFAULT_VISUAL_ELEMENTS);
}

export function saveVisualEditorConfig(elements: VisualElementConfig[]): void {
  setStoredItem(STORAGE_KEYS.VISUAL_EDITOR, elements);
  fetch('/api/visual-editor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ elements })
  }).catch(() => {});
}

// ==========================================
// BACKEND API SYNC & CRUD HELPERS
// ==========================================

export async function syncMultiTenantFromBackend(): Promise<void> {
  try {
    const [compRes, userRes, brandRes, visualRes] = await Promise.all([
      fetch('/api/companies').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/multi-tenant-users').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/branding').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/visual-editor').then(r => r.ok ? r.json() : null).catch(() => null),
    ]);

    if (compRes?.companies && Array.isArray(compRes.companies)) {
      setStoredItem(STORAGE_KEYS.COMPANIES, compRes.companies);
    }
    if (userRes?.users && Array.isArray(userRes.users)) {
      setStoredItem(STORAGE_KEYS.COMPANY_USERS, userRes.users);
    }
    if (brandRes?.branding) {
      setStoredItem(STORAGE_KEYS.BRANDING, brandRes.branding);
    }
    if (visualRes?.elements && Array.isArray(visualRes.elements)) {
      setStoredItem(STORAGE_KEYS.VISUAL_EDITOR, visualRes.elements);
    }
  } catch (err) {
    console.warn('Backend sync notice (using safe local store):', err);
  }
}

export async function createCustomerCompanyAsync(company: Omit<CustomerCompany, 'id' | 'createdAt' | 'updatedAt'> & { adminPassword?: string }): Promise<CustomerCompany> {
  const newId = generateNextCompanyId();
  const newCompany: CustomerCompany = {
    ...company,
    id: newId,
    subscriptionStatus: company.subscriptionStatus || 'Active',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  const current = getCustomerCompanies();
  const updated = [...current, newCompany];
  saveCustomerCompanies(updated);

  // If initial admin password provided, also create default Company Super Admin user
  if (company.adminPassword) {
    const adminUser: MultiTenantUser = {
      id: `usr-${newId.toLowerCase()}-admin`,
      companyId: newId,
      rmId: `${newId.split('-')[1] || 'C'}-ADM01`,
      name: company.contactPersonName.trim(),
      userName: `${company.contactPersonName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newId.toLowerCase()}`,
      email: company.email.trim(),
      phone: company.contactNumber.trim(),
      password: company.adminPassword,
      role: 'Company Super Admin',
      isActive: true,
      department: 'Corporate Administration',
      createdAt: new Date().toISOString().split('T')[0]
    };
    const currentUsers = getMultiTenantUsers();
    saveMultiTenantUsers([...currentUsers, adminUser]);
  }

  try {
    await fetch('/api/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCompany, adminPassword: company.adminPassword })
    });
  } catch {}

  return newCompany;
}

export async function updateCustomerCompanyAsync(id: string, updates: Partial<CustomerCompany>): Promise<void> {
  const current = getCustomerCompanies();
  const updated = current.map(c => c.id === id ? { ...c, ...updates, id, updatedAt: new Date().toISOString().split('T')[0] } : c);
  saveCustomerCompanies(updated);

  try {
    await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch {}
}

export async function deleteCustomerCompanyAsync(id: string): Promise<void> {
  const current = getCustomerCompanies();
  const updated = current.filter(c => c.id !== id);
  saveCustomerCompanies(updated);

  try {
    await fetch(`/api/companies/${id}`, { method: 'DELETE' });
  } catch {}
}

export async function createMultiTenantUserAsync(user: Omit<MultiTenantUser, 'id' | 'createdAt'>): Promise<MultiTenantUser> {
  const newUser: MultiTenantUser = {
    ...user,
    id: `usr-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString().split('T')[0]
  };

  const current = getMultiTenantUsers();
  const updated = [...current, newUser];
  saveMultiTenantUsers(updated);

  try {
    await fetch('/api/multi-tenant-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
  } catch {}

  return newUser;
}

export async function updateMultiTenantUserAsync(id: string, updates: Partial<MultiTenantUser>): Promise<void> {
  const current = getMultiTenantUsers();
  const updated = current.map(u => u.id === id ? { ...u, ...updates, id } : u);
  saveMultiTenantUsers(updated);

  try {
    await fetch(`/api/multi-tenant-users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch {}
}

export async function deleteMultiTenantUserAsync(id: string): Promise<void> {
  const current = getMultiTenantUsers();
  const updated = current.filter(u => u.id !== id);
  saveMultiTenantUsers(updated);

  try {
    await fetch(`/api/multi-tenant-users/${id}`, { method: 'DELETE' });
  } catch {}
}
