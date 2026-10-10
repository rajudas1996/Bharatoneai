import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Check, 
  Server, 
  Users, 
  Shield, 
  AlertCircle,
  RefreshCw,
  User as UserIcon,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
  ListFilter,
  History,
  Key,
  KeyRound,
  ExternalLink,
  Building2,
  ArrowLeft,
  Search,
  Sparkles,
  Building,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { safeStorage } from '../../utils/safeStorage';
import { DatabaseAuthTool } from './DatabaseAuthTool';
import { CRMUser, CRMRoleType, CRMFieldConfig, CRMDropdownMaster } from '../../types/crm.types';
import { 
  CustomerCompany, 
  MultiTenantUser, 
  PlatformRole 
} from '../../types/multiCompany.types';
import { 
  getCustomerCompanies, 
  saveCustomerCompanies, 
  generateNextCompanyId, 
  getMultiTenantUsers, 
  saveMultiTenantUsers,
  createCustomerCompanyAsync,
  updateCustomerCompanyAsync,
  deleteCustomerCompanyAsync,
  createMultiTenantUserAsync,
  updateMultiTenantUserAsync,
  deleteMultiTenantUserAsync,
  syncMultiTenantFromBackend
} from '../../utils/multiCompanyStore';
import { 
  getCrmUsers, 
  saveCrmUsers, 
  getCrmFieldConfig, 
  saveCrmFieldConfig, 
  getCrmDropdowns, 
  saveCrmDropdowns, 
  getCrmAuditLogs, 
  downloadLeadExcelTemplate,
  addCrmAuditLog 
} from '../../utils/crmStore';

interface SettingsViewProps {
  initialTab?: string;
  currentUserProfile?: {
    name: string;
    userName?: string;
    role: string;
    email?: string;
    isLoggedIn: boolean;
  };
  onOpenLoginModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  initialTab = 'crm_users',
  currentUserProfile,
  onOpenLoginModal
}) => {
  // Check if user is logged in at all (Strict login requirement per user request)
  const isUserLoggedIn = Boolean(currentUserProfile?.isLoggedIn);

  // Check if current user is Bharat 1 AI Admin / Platform Admin
  const isBharatAdmin = Boolean(
    currentUserProfile?.isLoggedIn && (
      currentUserProfile?.role === 'Bharat 1 AI Admin' ||
      currentUserProfile?.role === 'BHARAT_1_AI_ADMIN' ||
      currentUserProfile?.role === 'Administrator' ||
      currentUserProfile?.userName?.toLowerCase() === 'raju'
    )
  );

  const isCompanySuperAdmin = Boolean(
    currentUserProfile?.isLoggedIn && (
      currentUserProfile?.role === 'Company Super Admin' ||
      currentUserProfile?.role === 'COMPANY_SUPER_ADMIN'
    )
  );

  // Admin Authentication State for Settings (Admin Password: raju1234)
  // Per Part 4: Bharat 1 AI Admin accesses Settings & DB without another password
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    if (isBharatAdmin) return true;
    return safeStorage.getItem('bharat1_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isBharatAdmin) {
      setIsAdminUnlocked(true);
    }
  }, [isBharatAdmin]);

  // Active Tab inside Settings
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>(initialTab);

  // CRM Users Sub-Tabs per Part 1:
  // 1. Bharat One AI User Management ('platform_users')
  // 2. Customer User Management ('customer_users')
  const [crmUserSubTab, setCrmUserSubTab] = useState<'platform_users' | 'customer_users'>(
    isCompanySuperAdmin ? 'customer_users' : 'platform_users'
  );

  // Multi-Company & Customer Management State per Part 2 & Part 3
  const [companies, setCompanies] = useState<CustomerCompany[]>(() => getCustomerCompanies());
  const [multiTenantUsers, setMultiTenantUsers] = useState<MultiTenantUser[]>(() => getMultiTenantUsers());
  const [selectedCustomerCompany, setSelectedCustomerCompany] = useState<CustomerCompany | null>(() => {
    if (isCompanySuperAdmin) {
      const all = getCustomerCompanies();
      return all[0] || null;
    }
    return null;
  });

  // Search & Filter for Companies
  const [companySearch, setCompanySearch] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Customer Modals State
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomerCompany, setEditingCustomerCompany] = useState<CustomerCompany | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<CustomerCompany | null>(null);
  const [passwordResetCompany, setPasswordResetCompany] = useState<CustomerCompany | null>(null);
  const [newCompanyAdminPassword, setNewCompanyAdminPassword] = useState('');
  const [showCompanyAdminPassword, setShowCompanyAdminPassword] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  // Add Customer Form state (auto Company ID in B1AI-C0001 format)
  const [newCustomerForm, setNewCustomerForm] = useState({
    companyName: '',
    companyAddress: '',
    contactPersonName: '',
    designation: '',
    contactNumber: '',
    email: '',
    adminPassword: '',
    status: 'Active' as 'Active' | 'Inactive',
    logoUrl: ''
  });

  // Edit Customer Form state
  const [editCompanyFormData, setEditCompanyFormData] = useState({
    companyName: '',
    companyAddress: '',
    contactPersonName: '',
    designation: '',
    contactNumber: '',
    email: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Dedicated Company User Management State (Part 3)
  const [companyUserSearch, setCompanyUserSearch] = useState('');
  const [isAddCompanyUserOpen, setIsAddCompanyUserOpen] = useState(false);
  const [editingCompanyUser, setEditingCompanyUser] = useState<MultiTenantUser | null>(null);
  const [companyUserToDelete, setCompanyUserToDelete] = useState<MultiTenantUser | null>(null);
  const [showCompanyUserPassword, setShowCompanyUserPassword] = useState(false);
  const [newCompanyUserForm, setNewCompanyUserForm] = useState({
    rmId: '',
    name: '',
    userName: '',
    email: '',
    phone: '',
    password: 'crm',
    role: 'RM' as PlatformRole,
    department: 'Corporate Accounts',
    isActive: true
  });
  const [editCompanyUserForm, setEditCompanyUserForm] = useState({
    id: '',
    rmId: '',
    name: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    role: 'RM' as PlatformRole,
    department: '',
    isActive: true
  });

  // Background sync from backend on mount
  useEffect(() => {
    syncMultiTenantFromBackend().then(() => {
      setCompanies(getCustomerCompanies());
      setMultiTenantUsers(getMultiTenantUsers());
    }).catch(() => {});
  }, []);

  // 1. CRM Users State
  const [crmUsers, setCrmUsers] = useState<CRMUser[]>(() => getCrmUsers());
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CRMUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<CRMUser | null>(null);
  const [showEditPassword, setShowEditPassword] = useState<boolean>(false);
  const [showNewUserPassword, setShowNewUserPassword] = useState<boolean>(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>({});
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});

  // Customer Company Table Eye Toggle States
  const [revealedCompanyAddresses, setRevealedCompanyAddresses] = useState<Record<string, boolean>>({});
  const [revealedContactPersons, setRevealedContactPersons] = useState<Record<string, boolean>>({});
  const [revealedCompanyPhones, setRevealedCompanyPhones] = useState<Record<string, boolean>>({});
  const [revealedCompanyEmails, setRevealedCompanyEmails] = useState<Record<string, boolean>>({});
  const [editFormData, setEditFormData] = useState({
    id: '',
    rmId: '',
    name: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    role: 'RM' as CRMRoleType,
    department: '',
    isActive: true
  });
  const [newUser, setNewUser] = useState<Partial<CRMUser>>({
    name: '',
    userName: '',
    rmId: `RM-${Math.floor(Math.random() * 800 + 105)}`,
    email: '',
    password: 'rm',
    phone: '',
    role: 'RM',
    department: 'Corporate Accounts'
  });

  // 2. Database Connection State
  const [dbProvider, setDbProvider] = useState<'local' | 'supabase' | 'firebase'>('local');
  const [supabaseUrl, setSupabaseUrl] = useState('https://bharat1-ai-crm.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9');
  const [dbConnected, setDbConnected] = useState(true);
  const [isTestingDb, setIsTestingDb] = useState(false);

  // 3. Field Config State
  const [fieldConfigs, setFieldConfigs] = useState<CRMFieldConfig[]>(() => getCrmFieldConfig());
  const [newColumnName, setNewColumnName] = useState('');

  // 4. Dropdowns Master State
  const [dropdowns, setDropdowns] = useState<CRMDropdownMaster>(() => getCrmDropdowns());
  const [newLob, setNewLob] = useState('');
  const [newSource, setNewSource] = useState('');

  // 5. Excel Import Rules State
  const [duplicateCheckField, setDuplicateCheckField] = useState('phone');
  const [skipHeaderRows, setSkipHeaderRows] = useState(1);

  // 6. Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => getCrmAuditLogs());

  // 7. Feature Options toggles
  const [rbacEnabled, setRbacEnabled] = useState(true);
  const [rlsEnabled, setRlsEnabled] = useState(true);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);

  // 8. Admin Profile state
  const [userName, setUserName] = useState('Raju Das');
  const [email, setEmail] = useState('rajudaszoology22@gmail.com');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'raju1234') {
      setIsAdminUnlocked(true);
      safeStorage.setItem('bharat1_admin_auth', 'true');
      setAuthError(null);
      setAdminPasswordInput('');
      addCrmAuditLog('Raju Das (Admin)', 'ADMIN_SETTINGS_UNLOCKED', 'Settings', 'Unlocked Settings & DB with administrator key');
    } else {
      setAuthError('Incorrect administrator password. Please try again.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    safeStorage.removeItem('bharat1_admin_auth');
    setAuthError(null);
  };

  // Add New CRM User
  const handleCreateCRMUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.userName) return;

    const userObj: CRMUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUser.name,
      userName: newUser.userName.toLowerCase().trim(),
      rmId: newUser.rmId || `RM-${Math.floor(Math.random() * 800 + 105)}`,
      email: newUser.email || `${newUser.userName}@bharatai.in`,
      password: newUser.password || 'rm',
      phone: newUser.phone || '+91 98000 00000',
      role: (newUser.role as CRMRoleType) || 'RM',
      isActive: true,
      department: newUser.department || 'Corporate Sales',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [...crmUsers, userObj];
    setCrmUsers(updated);
    saveCrmUsers(updated);
    addCrmAuditLog('Raju Das (Admin)', 'USER_CREATED', 'CRM User Management', `Created CRM user ${userObj.name} (${userObj.role})`);
    setIsAddUserOpen(false);
    setNewUser({
      name: '',
      userName: '',
      rmId: `RM-${Math.floor(Math.random() * 800 + 105)}`,
      email: '',
      password: 'rm',
      phone: '',
      role: 'RM',
      department: 'Corporate Accounts'
    });
  };

  // Toggle password reveal in table
  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle email reveal in table
  const toggleRevealEmail = (id: string) => {
    setRevealedEmails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle phone reveal in table
  const toggleRevealPhone = (id: string) => {
    setRevealedPhones(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to mask email: 4-5 chars visible, then ****
  const getMaskedEmail = (email: string) => {
    if (!email) return '—';
    const atIndex = email.indexOf('@');
    if (atIndex === -1) {
      const showCount = Math.min(4, email.length);
      return email.slice(0, showCount) + '****';
    }
    const namePart = email.slice(0, atIndex);
    const domainPart = email.slice(atIndex);
    const showCount = Math.min(4, namePart.length);
    return namePart.slice(0, showCount) + '****' + domainPart;
  };

  // Helper to mask contact: 5 digits visible, then *****
  const getMaskedPhone = (phone: string) => {
    if (!phone) return '—';
    const trimmed = phone.trim();
    if (trimmed.length <= 5) return trimmed + '*****';
    return trimmed.slice(0, 5) + '*****';
  };

  // Helper to mask contact person name: First name visible, then ••••
  const getMaskedPersonName = (name: string) => {
    if (!name) return '—';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      const p = parts[0];
      return p.slice(0, Math.min(3, p.length)) + '••••';
    }
    return parts[0] + ' ' + (parts[1] ? parts[1].slice(0, 1) + '••••' : '••••');
  };

  const toggleRevealCompanyAddress = (id: string) => {
    setRevealedCompanyAddresses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRevealContactPerson = (id: string) => {
    setRevealedContactPersons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRevealCompanyPhone = (id: string) => {
    setRevealedCompanyPhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRevealCompanyEmail = (id: string) => {
    setRevealedCompanyEmails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Edit User modal
  const handleOpenEditUser = (u: CRMUser) => {
    setEditingUser(u);
    setEditFormData({
      id: u.id,
      rmId: u.rmId || '',
      name: u.name,
      userName: u.userName,
      email: u.email,
      phone: u.phone || '',
      password: u.password || '',
      role: u.role,
      department: u.department || '',
      isActive: u.isActive ?? true
    });
    setShowEditPassword(false);
  };

  // Save Edit User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFormData.userName.trim()) return;

    const updated = crmUsers.map(u => {
      if (u.id === editingUser.id) {
        return {
          ...u,
          rmId: editFormData.rmId.trim() || u.rmId,
          name: editFormData.name.trim() || u.name,
          userName: editFormData.userName.trim().toLowerCase(),
          email: editFormData.email.trim() || u.email,
          phone: editFormData.phone.trim() || u.phone,
          password: editFormData.password.trim() || u.password,
          role: editFormData.role,
          department: editFormData.department.trim() || u.department,
          isActive: editFormData.isActive
        };
      }
      return u;
    });

    setCrmUsers(updated);
    saveCrmUsers(updated);
    addCrmAuditLog(
      'Raju Das (Admin)',
      'USER_UPDATED',
      'CRM User Management',
      `Modified CRM user ${editFormData.name} (${editFormData.userName}) - Role: ${editFormData.role}, Status: ${editFormData.isActive ? 'Active' : 'Inactive'}, Password updated`
    );
    setEditingUser(null);
  };

  // Confirm delete user
  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const deletedUser = userToDelete;
    const updated = crmUsers.filter(u => u.id !== deletedUser.id);
    setCrmUsers(updated);
    saveCrmUsers(updated);
    addCrmAuditLog(
      'Raju Das (Admin)',
      'USER_DELETED',
      'CRM User Management',
      `Deleted CRM user ${deletedUser.name} (User ID: ${deletedUser.rmId || deletedUser.id}, Login: ${deletedUser.userName})`
    );
    setUserToDelete(null);
  };

  // Toggle user active status
  const handleToggleUserActive = (id: string) => {
    const updated = crmUsers.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    setCrmUsers(updated);
    saveCrmUsers(updated);
  };

  // --- Customer Companies Handlers (Part 2) ---
  const handleSaveNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.companyName.trim() || !newCustomerForm.companyAddress.trim() || !newCustomerForm.contactPersonName.trim() || !newCustomerForm.contactNumber.trim() || !newCustomerForm.email.trim()) {
      return;
    }

    const created = await createCustomerCompanyAsync({
      companyName: newCustomerForm.companyName.trim(),
      companyAddress: newCustomerForm.companyAddress.trim(),
      contactPersonName: newCustomerForm.contactPersonName.trim(),
      designation: newCustomerForm.designation.trim(),
      contactNumber: newCustomerForm.contactNumber.trim(),
      email: newCustomerForm.email.trim(),
      adminPassword: newCustomerForm.adminPassword || 'admin',
      status: newCustomerForm.status,
      subscriptionStatus: 'Active',
      logoUrl: newCustomerForm.logoUrl || undefined
    });

    const updated = getCustomerCompanies();
    setCompanies(updated);
    setMultiTenantUsers(getMultiTenantUsers());

    addCrmAuditLog(
      'Raju Das (Admin)',
      'CUSTOMER_COMPANY_CREATED',
      'Customer User Management',
      `Registered customer company ${created.companyName} (${created.id})`
    );

    setIsAddCustomerOpen(false);
    setNewCustomerForm({
      companyName: '',
      companyAddress: '',
      contactPersonName: '',
      designation: '',
      contactNumber: '',
      email: '',
      adminPassword: '',
      status: 'Active',
      logoUrl: ''
    });
  };

  const handleOpenEditCompany = (c: CustomerCompany) => {
    setEditingCustomerCompany(c);
    setEditCompanyFormData({
      companyName: c.companyName,
      companyAddress: c.companyAddress,
      contactPersonName: c.contactPersonName,
      designation: c.designation || '',
      contactNumber: c.contactNumber,
      email: c.email,
      status: c.status
    });
  };

  const handleSaveEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomerCompany) return;

    await updateCustomerCompanyAsync(editingCustomerCompany.id, {
      companyName: editCompanyFormData.companyName.trim(),
      companyAddress: editCompanyFormData.companyAddress.trim(),
      contactPersonName: editCompanyFormData.contactPersonName.trim(),
      designation: editCompanyFormData.designation.trim(),
      contactNumber: editCompanyFormData.contactNumber.trim(),
      email: editCompanyFormData.email.trim(),
      status: editCompanyFormData.status
    });

    const updated = getCustomerCompanies();
    setCompanies(updated);
    if (selectedCustomerCompany?.id === editingCustomerCompany.id) {
      setSelectedCustomerCompany(updated.find(c => c.id === editingCustomerCompany.id) || null);
    }

    addCrmAuditLog(
      'Raju Das (Admin)',
      'CUSTOMER_COMPANY_UPDATED',
      'Customer User Management',
      `Updated company details for ${editCompanyFormData.companyName} (${editingCustomerCompany.id})`
    );

    setEditingCustomerCompany(null);
  };

  const handleToggleCompanyStatus = async (company: CustomerCompany) => {
    const nextStatus = company.status === 'Active' ? 'Inactive' : 'Active';
    await updateCustomerCompanyAsync(company.id, { status: nextStatus });
    const updated = getCustomerCompanies();
    setCompanies(updated);
    if (selectedCustomerCompany?.id === company.id) {
      setSelectedCustomerCompany({ ...company, status: nextStatus });
    }
  };

  const handleConfirmDeleteCompany = async () => {
    if (!companyToDelete) return;
    const cid = companyToDelete.id;
    const cname = companyToDelete.companyName;

    await deleteCustomerCompanyAsync(cid);
    const updated = getCustomerCompanies();
    setCompanies(updated);
    if (selectedCustomerCompany?.id === cid) {
      setSelectedCustomerCompany(null);
    }

    addCrmAuditLog(
      'Raju Das (Admin)',
      'CUSTOMER_COMPANY_DELETED',
      'Customer User Management',
      `Deleted customer company ${cname} (${cid})`
    );

    setCompanyToDelete(null);
  };

  const handleSaveCompanyAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetCompany || !newCompanyAdminPassword.trim()) return;

    const allUsers = getMultiTenantUsers();
    const updatedUsers = allUsers.map(u => {
      if (u.companyId === passwordResetCompany.id && (u.role === 'Company Super Admin' || u.role === 'Bharat 1 AI Admin')) {
        return { ...u, password: newCompanyAdminPassword.trim() };
      }
      return u;
    });
    saveMultiTenantUsers(updatedUsers);
    setMultiTenantUsers(updatedUsers);

    addCrmAuditLog(
      'Raju Das (Admin)',
      'COMPANY_ADMIN_PASSWORD_RESET',
      'Customer User Management',
      `Reset administrator password for ${passwordResetCompany.companyName} (${passwordResetCompany.id})`
    );

    setPasswordResetSuccess(true);
    setTimeout(() => {
      setPasswordResetCompany(null);
      setNewCompanyAdminPassword('');
      setPasswordResetSuccess(false);
    }, 900);
  };

  // --- Dedicated Company Users Handlers (Part 3) ---
  const handleCreateCompanyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerCompany || !newCompanyUserForm.name.trim() || !newCompanyUserForm.userName.trim()) return;

    const userObj = await createMultiTenantUserAsync({
      companyId: selectedCustomerCompany.id,
      rmId: newCompanyUserForm.rmId.trim() || `${selectedCustomerCompany.id.split('-')[1] || 'C'}-RM${Math.floor(Math.random() * 800 + 105)}`,
      name: newCompanyUserForm.name.trim(),
      userName: newCompanyUserForm.userName.trim().toLowerCase(),
      email: newCompanyUserForm.email.trim() || `${newCompanyUserForm.userName.trim().toLowerCase()}@${selectedCustomerCompany.id.toLowerCase()}.com`,
      phone: newCompanyUserForm.phone.trim() || '+91 98000 00000',
      password: newCompanyUserForm.password.trim() || 'crm',
      role: newCompanyUserForm.role,
      department: newCompanyUserForm.department.trim() || 'Corporate Accounts',
      isActive: newCompanyUserForm.isActive
    });

    setMultiTenantUsers(getMultiTenantUsers());

    // Also sync to crmUsers if Epoch company for Sales CRM
    if (selectedCustomerCompany.id === 'B1AI-C0001') {
      const crmObj: CRMUser = {
        id: userObj.id,
        rmId: userObj.rmId || 'RM-101',
        name: userObj.name,
        userName: userObj.userName,
        email: userObj.email,
        phone: userObj.phone,
        password: userObj.password || 'rm',
        role: userObj.role === 'Company Super Admin' ? 'Super Admin' : (userObj.role === 'Lead Manager' ? 'Lead Manager' : 'RM'),
        department: userObj.department,
        isActive: userObj.isActive,
        createdAt: userObj.createdAt
      };
      const updatedCrm = [...crmUsers, crmObj];
      setCrmUsers(updatedCrm);
      saveCrmUsers(updatedCrm);
    }

    addCrmAuditLog(
      'Raju Das (Admin)',
      'COMPANY_USER_CREATED',
      'Customer User Management',
      `Created CRM user ${userObj.name} (${userObj.role}) for company ${selectedCustomerCompany.companyName} (${selectedCustomerCompany.id})`
    );

    setIsAddCompanyUserOpen(false);
    setNewCompanyUserForm({
      rmId: '',
      name: '',
      userName: '',
      email: '',
      phone: '',
      password: 'crm',
      role: 'RM',
      department: 'Corporate Accounts',
      isActive: true
    });
  };

  const handleOpenEditCompanyUser = (u: MultiTenantUser) => {
    setEditingCompanyUser(u);
    setEditCompanyUserForm({
      id: u.id,
      rmId: u.rmId || '',
      name: u.name,
      userName: u.userName,
      email: u.email,
      phone: u.phone || '',
      password: u.password || '',
      role: u.role,
      department: u.department || '',
      isActive: u.isActive
    });
  };

  const handleSaveEditCompanyUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompanyUser || !editCompanyUserForm.name.trim() || !editCompanyUserForm.userName.trim()) return;

    await updateMultiTenantUserAsync(editingCompanyUser.id, {
      rmId: editCompanyUserForm.rmId.trim() || editingCompanyUser.rmId,
      name: editCompanyUserForm.name.trim(),
      userName: editCompanyUserForm.userName.trim().toLowerCase(),
      email: editCompanyUserForm.email.trim() || editingCompanyUser.email,
      phone: editCompanyUserForm.phone.trim() || editingCompanyUser.phone,
      password: editCompanyUserForm.password.trim() || editingCompanyUser.password,
      role: editCompanyUserForm.role,
      department: editCompanyUserForm.department.trim() || editingCompanyUser.department,
      isActive: editCompanyUserForm.isActive
    });

    setMultiTenantUsers(getMultiTenantUsers());

    addCrmAuditLog(
      'Raju Das (Admin)',
      'COMPANY_USER_UPDATED',
      'Customer User Management',
      `Updated user ${editCompanyUserForm.name} in company ${selectedCustomerCompany?.companyName || editingCompanyUser.companyId}`
    );

    setEditingCompanyUser(null);
  };

  const handleConfirmDeleteCompanyUser = async () => {
    if (!companyUserToDelete) return;
    const uid = companyUserToDelete.id;
    const uname = companyUserToDelete.name;

    await deleteMultiTenantUserAsync(uid);
    setMultiTenantUsers(getMultiTenantUsers());

    addCrmAuditLog(
      'Raju Das (Admin)',
      'COMPANY_USER_DELETED',
      'Customer User Management',
      `Deleted user ${uname} (${uid}) from company ${selectedCustomerCompany?.companyName || companyUserToDelete.companyId}`
    );

    setCompanyUserToDelete(null);
  };

  const handleToggleCompanyUserActive = async (u: MultiTenantUser) => {
    await updateMultiTenantUserAsync(u.id, { isActive: !u.isActive });
    setMultiTenantUsers(getMultiTenantUsers());
  };

  // Toggle field visibility
  const handleToggleField = (key: string) => {
    const updated = fieldConfigs.map(f => f.key === key ? { ...f, visible: !f.visible } : f);
    setFieldConfigs(updated);
    saveCrmFieldConfig(updated);
  };

  // Add custom field
  const handleAddCustomField = () => {
    if (!newColumnName.trim()) return;
    const key = newColumnName.toLowerCase().replace(/\s+/g, '_');
    const newField: CRMFieldConfig = {
      key,
      label: newColumnName.trim(),
      visible: true,
      required: false,
      type: 'text'
    };
    const updated = [...fieldConfigs, newField];
    setFieldConfigs(updated);
    saveCrmFieldConfig(updated);
    setNewColumnName('');
  };

  // Add LOB to Dropdown Master
  const handleAddLob = () => {
    if (!newLob.trim()) return;
    const updated = {
      ...dropdowns,
      lobs: [...dropdowns.lobs, newLob.trim()]
    };
    setDropdowns(updated);
    saveCrmDropdowns(updated);
    setNewLob('');
  };

  // Test Database Connection
  const handleTestDatabase = () => {
    setIsTestingDb(true);
    setTimeout(() => {
      setIsTestingDb(false);
      setDbConnected(true);
    }, 800);
  };

  // 0. RESTRICTED UN-AUTHENTICATED VIEW: Prompt user to login
  if (!isUserLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 animate-in fade-in duration-200 select-none text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Settings Access Restricted
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            Please sign in to your authorized account to access Settings and User Management.
          </p>
        </div>

        <div className="pt-2">
          {onOpenLoginModal ? (
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Access Settings</span>
            </button>
          ) : (
            <p className="text-xs text-red-600 font-bold">Authentication required. Please sign in via the top navigation bar.</p>
          )}
        </div>
      </div>
    );
  }

  // 1. LOCKED VIEW: Prompt for Administrator Password
  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6 animate-in fade-in duration-200 select-none">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Settings & DB
          </h2>
          <p className="text-xs font-semibold text-slate-600">
            Administrator Password Required
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleUnlockAdmin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Administrator Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={adminPasswordInput}
                onChange={(e) => {
                  setAdminPasswordInput(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="Enter Administrator password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Settings & DB</span>
          </button>
        </form>
      </div>
    );
  }

  // 2. UNLOCKED VIEW: Full Settings with Configuration Modules
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200 select-none">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Settings & DB</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Admin Verified
              </span>
            </h1>
          </div>
        </div>

        <button
          onClick={handleLockAdmin}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          title="Lock Administrator session"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Lock Session</span>
        </button>
      </div>

      {/* Sub-Tabs: 8 Configuration Modules */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {/* Tab 1: CRM User Management */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('crm_users')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'crm_users'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>CRM Users</span>
        </button>

        {/* Tab 2: Roles & Permissions */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('roles')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'roles'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Roles & Permissions</span>
        </button>

        {/* Tab 3: Database Connection */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('database')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'database'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Connection</span>
        </button>

        {/* Tab 4: Lead Field Configuration */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('fields')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'fields'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Lead Fields</span>
        </button>

        {/* Tab 5: Dropdown Master */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('dropdowns')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'dropdowns'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Dropdown Master</span>
        </button>

        {/* Tab 6: Excel Import Settings */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('excel_settings')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'excel_settings'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Excel Import Rules</span>
        </button>

        {/* Tab 7: Audit & Security */}
        <button
          type="button"
          onClick={() => setActiveSettingsTab('audit')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSettingsTab === 'audit'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit & Security</span>
        </button>
      </div>

      {/* 1. CRM USER MANAGEMENT */}
      {activeSettingsTab === 'crm_users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 animate-in fade-in">
          {/* Sub-Tabs: Bharat 1 AI User Management, Customer User Management */}
          {!isCompanySuperAdmin && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => {
                  setCrmUserSubTab('platform_users');
                  setSelectedCustomerCompany(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  crmUserSubTab === 'platform_users'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Bharat One AI User Management</span>
              </button>

              <button
                type="button"
                onClick={() => setCrmUserSubTab('customer_users')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  crmUserSubTab === 'customer_users'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Customer User Management</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 1: BHARAT ONE AI USER MANAGEMENT (Platform-Level Users) */}
          {/* ========================================================================= */}
          {crmUserSubTab === 'platform_users' && !isCompanySuperAdmin && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Bharat One AI User Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage platform administrators, system operators, and Bharat 1 AI platform-level accounts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Create User</span>
                </button>
              </div>

              {/* Exact Table Format per Part 1.1 */}
              <div className="overflow-x-auto xl:overflow-x-visible border border-slate-200 rounded-xl bg-white shadow-2xs">
                <table className="w-full text-left text-xs table-auto">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2">USER ID</th>
                      <th className="py-2.5 px-2">DISPLAY NAME</th>
                      <th className="py-2.5 px-2">EMAIL ID</th>
                      <th className="py-2.5 px-2">CONTACT NUMBER</th>
                      <th className="py-2.5 px-2">LOGIN ID</th>
                      <th className="py-2.5 px-2">LOGIN PASSWORD</th>
                      <th className="py-2.5 px-2">ROLE</th>
                      <th className="py-2.5 px-2">STATUS</th>
                      <th className="py-2.5 px-2 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {crmUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. USER ID */}
                        <td className="py-2.5 px-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {u.rmId || u.id}
                        </td>

                        {/* 2. DISPLAY NAME */}
                        <td className="py-2.5 px-2 font-bold text-slate-900 whitespace-nowrap">
                          {u.name}
                        </td>

                        {/* 3. EMAIL ID: masked with eye toggle */}
                        <td className="py-2.5 px-2">
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="text-slate-700 font-mono text-[11px]">
                              {revealedEmails[u.id] ? u.email : getMaskedEmail(u.email)}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRevealEmail(u.id)}
                              className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              title={revealedEmails[u.id] ? "Hide Email" : "View Email"}
                            >
                              {revealedEmails[u.id] ? (
                                <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 4. CONTACT NUMBER: masked with eye toggle */}
                        <td className="py-2.5 px-2">
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                            <span className="font-mono text-slate-700 text-[11px]">
                              {revealedPhones[u.id] ? (u.phone || '—') : getMaskedPhone(u.phone || '')}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRevealPhone(u.id)}
                              className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              title={revealedPhones[u.id] ? "Hide Contact" : "View Contact"}
                            >
                              {revealedPhones[u.id] ? (
                                <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 5. LOGIN ID */}
                        <td className="py-2.5 px-2 font-mono text-blue-700 font-semibold whitespace-nowrap">
                          {u.userName}
                        </td>

                        {/* 6. LOGIN PASSWORD with Reveal / Hide Eye Icon */}
                        <td className="py-2.5 px-2">
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs">
                            <span className="font-semibold text-slate-800 tracking-wider">
                              {revealedPasswords[u.id] ? (u.password || '—') : '••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRevealPassword(u.id)}
                              className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                              title={revealedPasswords[u.id] ? "Hide Password" : "Reveal Password"}
                            >
                              {revealedPasswords[u.id] ? (
                                <EyeOff className="w-3.5 h-3.5 text-red-600" />
                              ) : (
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 7. ROLE */}
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            (u.role === 'Super Admin' || (u.role as string) === 'Bharat 1 AI Admin') ? 'bg-red-100 text-red-800' :
                            (u.role === 'Lead Manager' || (u.role as string) === 'CRM Manager') ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {u.role === 'CRM Manager' ? 'Lead Manager' : u.role}
                          </span>
                        </td>

                        {/* 8. STATUS */}
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleUserActive(u.id)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              u.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title="Click to toggle Active / Inactive"
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* 9. ACTION: Edit & Delete icon only */}
                        <td className="py-2.5 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Edit user details, role, status and password"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUB-TAB 2: CUSTOMER USER MANAGEMENT (Company Directory or Dedicated View) */}
          {/* ========================================================================= */}
          {(crmUserSubTab === 'customer_users' || isCompanySuperAdmin) && (
            <div className="space-y-5 animate-in fade-in">
              {/* VIEW A: Global Customer Company Directory (Part 2) */}
              {!selectedCustomerCompany ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">Customer User Management</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage customer companies, CRM administrators, user accounts and company-specific access.
                      </p>
                    </div>
                    {/* Mandatory + Add New Customer button at upper-right */}
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerOpen(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Customer</span>
                    </button>
                  </div>

                  {/* Search and Status Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        placeholder="Search company by name, ID, or contact person..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-red-500"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Status:</span>
                      {(['all', 'Active', 'Inactive'] as const).map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setCompanyStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            companyStatusFilter === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {st === 'all' ? 'All' : st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Customer Company Table (Clean interface: Company Address, Contact Person Name, Contact Number, and Email ID moved to Company Profile view per user request) */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left text-xs table-auto">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Company ID</th>
                          <th className="py-2.5 px-3">Company Name</th>
                          <th className="py-2.5 px-3">Administrator Password</th>
                          <th className="py-2.5 px-3">Company Status</th>
                          <th className="py-2.5 px-3 text-center">Total CRM Users</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {companies
                          .filter(c => {
                            const matchTerm = 
                              c.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
                              c.id.toLowerCase().includes(companySearch.toLowerCase()) ||
                              c.contactPersonName.toLowerCase().includes(companySearch.toLowerCase()) ||
                              c.email.toLowerCase().includes(companySearch.toLowerCase());
                            const matchStatus = companyStatusFilter === 'all' || c.status === companyStatusFilter;
                            return matchTerm && matchStatus;
                          })
                          .map(company => {
                            const userCount = multiTenantUsers.filter(u => u.companyId === company.id).length;
                            return (
                              <tr key={company.id} className="hover:bg-slate-50/70 transition-colors">
                                {/* 1. Company ID (Clickable Shortcut to Profile & Users) */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCustomerCompany(company)}
                                    className="font-mono font-extrabold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs group"
                                    title={`Click to view company profile, contacts, and CRM users for ${company.companyName}`}
                                  >
                                    <span>{company.id}</span>
                                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                  </button>
                                </td>

                                {/* 2. Company Name */}
                                <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>{company.companyName}</span>
                                  </div>
                                </td>

                                {/* 3. Administrator Password (Masked + Reset Action) */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                    <span className="font-mono text-slate-400 font-bold">••••••••</span>
                                    <button
                                      type="button"
                                      onClick={() => setPasswordResetCompany(company)}
                                      className="text-[10px] font-bold text-red-600 hover:text-red-800 hover:underline cursor-pointer flex items-center gap-0.5 ml-1"
                                      title="Set / Reset Administrator Password"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Reset</span>
                                    </button>
                                  </div>
                                </td>

                                {/* 4. Company Status */}
                                <td className="py-2.5 px-3 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCompanyStatus(company)}
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                                      company.status === 'Active'
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                    title="Click to toggle company Active / Inactive"
                                  >
                                    {company.status}
                                  </button>
                                </td>

                                {/* 5. Total CRM Users (Clickable badge) */}
                                <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCustomerCompany(company)}
                                    className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 text-indigo-800 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                                    title={`Click to view ${company.companyName} CRM users`}
                                  >
                                    <Users className="w-3 h-3" />
                                    <span>{userCount} Users</span>
                                  </button>
                                </td>

                                {/* 6. Action: Edit and Delete only (No key icon, no extra buttons) */}
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditCompany(company)}
                                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      title="Edit company details"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setCompanyToDelete(company)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete company"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                /* VIEW B: Dedicated Company CRM User Management View (Part 3) */
                <div className="space-y-5 animate-in fade-in">
                  {/* Dedicated Header with dynamic title */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div className="space-y-1">
                      {!isCompanySuperAdmin && (
                        <button
                          type="button"
                          onClick={() => setSelectedCustomerCompany(null)}
                          className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 mb-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back to Customer List</span>
                        </button>
                      )}
                      <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                        <span>{selectedCustomerCompany.companyName} — CRM User Management</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          selectedCustomerCompany.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {selectedCustomerCompany.status}
                        </span>
                      </h2>
                      {/* Detailed Company Profile Info Card / Shortcut View per User Request */}
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Company ID</span>
                          <span className="font-mono font-bold text-blue-700">{selectedCustomerCompany.id}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Person & Role</span>
                          <span className="font-semibold text-slate-800">
                            {selectedCustomerCompany.contactPersonName}
                            {selectedCustomerCompany.designation ? ` (${selectedCustomerCompany.designation})` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Number</span>
                          <span className="font-mono text-slate-700">{selectedCustomerCompany.contactNumber || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Email ID</span>
                          <span className="font-mono text-slate-700 truncate block">{selectedCustomerCompany.email || '—'}</span>
                        </div>
                        <div className="sm:col-span-2 md:col-span-4 pt-1 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-600">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-700">Office Address:</strong> {selectedCustomerCompany.companyAddress}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewCompanyUserForm({
                          rmId: `${selectedCustomerCompany.id.split('-')[1] || 'C'}-RM${Math.floor(Math.random() * 800 + 105)}`,
                          name: '',
                          userName: '',
                          email: '',
                          phone: '',
                          password: 'crm',
                          role: 'RM',
                          department: 'Corporate Accounts',
                          isActive: true
                        });
                        setIsAddCompanyUserOpen(true);
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create CRM User</span>
                    </button>
                  </div>

                  {/* Company User Search Bar */}
                  <div className="relative max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={companyUserSearch}
                      onChange={(e) => setCompanyUserSearch(e.target.value)}
                      placeholder={`Search ${selectedCustomerCompany.companyName} users...`}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  {/* EXACT Same User-Management Table Style per Part 3 */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left text-xs table-auto">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-2">USER ID</th>
                          <th className="py-2.5 px-2">DISPLAY NAME</th>
                          <th className="py-2.5 px-2">EMAIL ID</th>
                          <th className="py-2.5 px-2">CONTACT NUMBER</th>
                          <th className="py-2.5 px-2">LOGIN ID</th>
                          <th className="py-2.5 px-2">LOGIN PASSWORD</th>
                          <th className="py-2.5 px-2">ROLE</th>
                          <th className="py-2.5 px-2">STATUS</th>
                          <th className="py-2.5 px-2 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {multiTenantUsers
                          .filter(u => u.companyId === selectedCustomerCompany.id)
                          .filter(u => {
                            if (!companyUserSearch) return true;
                            const q = companyUserSearch.toLowerCase();
                            return (
                              u.name.toLowerCase().includes(q) ||
                              u.userName.toLowerCase().includes(q) ||
                              (u.rmId || '').toLowerCase().includes(q) ||
                              u.email.toLowerCase().includes(q)
                            );
                          })
                          .map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* 1. USER ID */}
                              <td className="py-2.5 px-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                                {u.rmId || u.id}
                              </td>

                              {/* 2. DISPLAY NAME */}
                              <td className="py-2.5 px-2 font-bold text-slate-900 whitespace-nowrap">
                                {u.name}
                              </td>

                              {/* 3. EMAIL ID: masked with eye toggle */}
                              <td className="py-2.5 px-2">
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                  <span className="text-slate-700 font-mono text-[11px]">
                                    {revealedEmails[u.id] ? u.email : getMaskedEmail(u.email)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleRevealEmail(u.id)}
                                    className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                    title={revealedEmails[u.id] ? "Hide Email" : "View Email"}
                                  >
                                    {revealedEmails[u.id] ? (
                                      <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* 4. CONTACT NUMBER: masked with eye toggle */}
                              <td className="py-2.5 px-2">
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                                  <span className="font-mono text-slate-700 text-[11px]">
                                    {revealedPhones[u.id] ? (u.phone || '—') : getMaskedPhone(u.phone || '')}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleRevealPhone(u.id)}
                                    className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                    title={revealedPhones[u.id] ? "Hide Contact" : "View Contact"}
                                  >
                                    {revealedPhones[u.id] ? (
                                      <EyeOff className="w-3.5 h-3.5 text-blue-600" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* 5. LOGIN ID */}
                              <td className="py-2.5 px-2 font-mono text-blue-700 font-semibold whitespace-nowrap">
                                {u.userName}
                              </td>

                              {/* 6. LOGIN PASSWORD with Reveal / Hide Eye Icon */}
                              <td className="py-2.5 px-2">
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs">
                                  <span className="font-semibold text-slate-800 tracking-wider">
                                    {revealedPasswords[u.id] ? (u.password || '—') : '••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleRevealPassword(u.id)}
                                    className="p-0.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                                    title={revealedPasswords[u.id] ? "Hide Password" : "Reveal Password"}
                                  >
                                    {revealedPasswords[u.id] ? (
                                      <EyeOff className="w-3.5 h-3.5 text-red-600" />
                                    ) : (
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              {/* 7. ROLE */}
                              <td className="py-2.5 px-2 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  u.role === 'Company Super Admin' ? 'bg-red-100 text-red-800' :
                                  u.role === 'Lead Manager' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {u.role}
                                </span>
                              </td>

                              {/* 8. STATUS */}
                              <td className="py-2.5 px-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCompanyUserActive(u)}
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                    u.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                  }`}
                                  title="Click to toggle Active / Inactive"
                                >
                                  {u.isActive ? 'Active' : 'Inactive'}
                                </button>
                              </td>

                              {/* 9. ACTION: Edit & Delete */}
                              <td className="py-2.5 px-2 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditCompanyUser(u)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-all cursor-pointer shadow-2xs"
                                    title="Edit user details, role, status and password"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setCompanyUserToDelete(u)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete company user"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODALS & POPUPS */}
          {/* ========================================================================= */}

          {/* 1. Add New Customer Company Modal (Part 2.2 & 2.3) */}
          {isAddCustomerOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-red-600" />
                      <span>+ Add New Customer Company</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Register a new customer company with automatic permanent Company ID
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg font-mono text-xs font-extrabold border border-blue-200">
                    {generateNextCompanyId()}
                  </span>
                </div>

                <form onSubmit={handleSaveNewCustomer} className="space-y-3.5">
                  {/* Automatic Company ID: Read-Only per Part 2.3 */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Company ID <span className="text-slate-400 font-normal">(System-Generated • Permanent • Read-Only)</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={generateNextCompanyId()}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold font-mono text-blue-800 cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={newCustomerForm.companyName}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, companyName: e.target.value })}
                      placeholder="e.g. Acme Enterprises Pvt. Ltd."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  {/* Complete Company Address */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Complete Company Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={newCustomerForm.companyAddress}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, companyAddress: e.target.value })}
                      placeholder="Full office address, building, city, state, and pin code"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                    />
                  </div>

                  {/* Contact Person Name, Designation & Contact Number (All Required per User Request) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        value={newCustomerForm.contactPersonName}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactPersonName: e.target.value })}
                        placeholder="e.g. Amit Kapoor"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                      <input
                        type="text"
                        required
                        value={newCustomerForm.designation}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, designation: e.target.value })}
                        placeholder="e.g. Director / Head Procurement"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number *</label>
                      <input
                        type="text"
                        required
                        value={newCustomerForm.contactNumber}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactNumber: e.target.value })}
                        placeholder="+91 98000 00000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Email ID & Administrator Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email ID *</label>
                      <input
                        type="email"
                        required
                        value={newCustomerForm.email}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                        placeholder="admin@acme.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Administrator Password *</label>
                      <input
                        type="password"
                        required
                        value={newCustomerForm.adminPassword}
                        onChange={(e) => setNewCustomerForm({ ...newCustomerForm, adminPassword: e.target.value })}
                        placeholder="Initial admin password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono outline-none focus:border-red-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Company Status */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Company Status *</label>
                    <select
                      value={newCustomerForm.status}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, status: e.target.value as 'Active' | 'Inactive' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500"
                    >
                      <option value="Active">Active — Enabled for company operations</option>
                      <option value="Inactive">Inactive — Suspended / Deactivated</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAddCustomerOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Customer</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 2. Edit Customer Company Modal */}
          {editingCustomerCompany && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    <span>Edit Customer Company</span>
                  </h3>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-mono text-xs font-bold">
                    {editingCustomerCompany.id}
                  </span>
                </div>

                <form onSubmit={handleSaveEditCompany} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={editCompanyFormData.companyName}
                      onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, companyName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Complete Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={editCompanyFormData.companyAddress}
                      onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, companyAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person *</label>
                      <input
                        type="text"
                        required
                        value={editCompanyFormData.contactPersonName}
                        onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, contactPersonName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                      <input
                        type="text"
                        required
                        value={editCompanyFormData.designation}
                        onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, designation: e.target.value })}
                        placeholder="e.g. Director"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number *</label>
                      <input
                        type="text"
                        required
                        value={editCompanyFormData.contactNumber}
                        onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, contactNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email ID *</label>
                      <input
                        type="email"
                        required
                        value={editCompanyFormData.email}
                        onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status *</label>
                      <select
                        value={editCompanyFormData.status}
                        onChange={(e) => setEditCompanyFormData({ ...editCompanyFormData, status: e.target.value as 'Active' | 'Inactive' })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingCustomerCompany(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 3. Reset Company Administrator Password Modal */}
          {passwordResetCompany && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Reset Administrator Password
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Company: <strong className="text-slate-900">{passwordResetCompany.companyName}</strong> ({passwordResetCompany.id})
                  </p>
                </div>

                {passwordResetSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Administrator password successfully updated!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveCompanyAdminPassword} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        New Administrator Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCompanyAdminPassword ? 'text' : 'password'}
                          required
                          value={newCompanyAdminPassword}
                          onChange={(e) => setNewCompanyAdminPassword(e.target.value)}
                          placeholder="Enter new secure password"
                          className="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono outline-none focus:border-red-500 focus:bg-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowCompanyAdminPassword(!showCompanyAdminPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 rounded cursor-pointer"
                        >
                          {showCompanyAdminPassword ? <EyeOff className="w-4 h-4 text-red-600" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPasswordResetCompany(null);
                          setNewCompanyAdminPassword('');
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* 4. Delete Company Confirmation Modal */}
          {companyToDelete && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Confirm Delete Customer Company
                  </h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Are you sure you want to permanently delete <strong className="text-slate-900">{companyToDelete.companyName}</strong> (Company ID: <span className="font-mono font-bold text-red-600">{companyToDelete.id}</span>)?
                  </p>
                  <p className="text-[11px] text-red-500 mt-1.5 font-medium">
                    Per security requirements, Company ID is permanent and will never be reused.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompanyToDelete(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCompany}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Company</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. Create Dedicated CRM User Modal (Part 3) */}
          {isAddCompanyUserOpen && selectedCustomerCompany && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Create CRM User for {selectedCustomerCompany.companyName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    User will be automatically linked to Company ID: <strong className="text-blue-700 font-mono">{selectedCustomerCompany.id}</strong>
                  </p>
                </div>

                <form onSubmit={handleCreateCompanyUser} className="space-y-3">
                  {/* Company Association: Read-only per Part 3 */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Associated Company ID</label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={`${selectedCustomerCompany.id} — ${selectedCustomerCompany.companyName}`}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-700 cursor-not-allowed select-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={newCompanyUserForm.name}
                      onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">User ID</label>
                      <input
                        type="text"
                        value={newCompanyUserForm.rmId}
                        onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, rmId: e.target.value })}
                        placeholder="e.g. RM-101"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Login ID *</label>
                      <input
                        type="text"
                        required
                        value={newCompanyUserForm.userName}
                        onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, userName: e.target.value })}
                        placeholder="e.g. ramesh"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
                      <input
                        type="email"
                        value={newCompanyUserForm.email}
                        onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, email: e.target.value })}
                        placeholder="user@company.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={newCompanyUserForm.phone}
                        onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, phone: e.target.value })}
                        placeholder="+91 98000 00000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Company CRM Role *</label>
                    <select
                      value={newCompanyUserForm.role}
                      onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, role: e.target.value as PlatformRole })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="Super Admin">Super Admin (Full Company & Sales Access)</option>
                      <option value="Lead Manager">Lead Manager (Lead Directory, Raw Leads, RM Master)</option>
                      <option value="RM">RM (Relationship Manager)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Login Password *</label>
                    <input
                      type="password"
                      required
                      value={newCompanyUserForm.password}
                      onChange={(e) => setNewCompanyUserForm({ ...newCompanyUserForm, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddCompanyUserOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Save CRM User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 6. Edit Dedicated Company User Modal */}
          {editingCompanyUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                    <span>Edit Company User</span>
                  </h3>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-mono text-xs font-bold">
                    {editingCompanyUser.rmId || editingCompanyUser.id}
                  </span>
                </div>

                <form onSubmit={handleSaveEditCompanyUser} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">User ID</label>
                      <input
                        type="text"
                        value={editCompanyUserForm.rmId}
                        onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, rmId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Display Name *</label>
                      <input
                        type="text"
                        required
                        value={editCompanyUserForm.name}
                        onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
                      <input
                        type="email"
                        value={editCompanyUserForm.email}
                        onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={editCompanyUserForm.phone}
                        onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Login ID *</label>
                    <input
                      type="text"
                      required
                      value={editCompanyUserForm.userName}
                      onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, userName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Role *</label>
                      <select
                        value={editCompanyUserForm.role === 'Company Super Admin' ? 'Super Admin' : editCompanyUserForm.role}
                        onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, role: e.target.value as PlatformRole })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="Super Admin">Super Admin</option>
                        <option value="Lead Manager">Lead Manager</option>
                        <option value="RM">RM (Relationship Manager)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Status *</label>
                      <select
                        value={editCompanyUserForm.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, isActive: e.target.value === 'active' })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Login Password * (Reset)</label>
                    <input
                      type="password"
                      value={editCompanyUserForm.password}
                      onChange={(e) => setEditCompanyUserForm({ ...editCompanyUserForm, password: e.target.value })}
                      placeholder="Leave unchanged or enter new password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingCompanyUser(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 7. Delete Company User Modal */}
          {companyUserToDelete && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Confirm Delete User
                  </h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Are you sure you want to permanently delete user <strong className="text-slate-900">{companyUserToDelete.name}</strong> (User ID: <span className="font-mono font-bold text-blue-600">{companyUserToDelete.rmId || companyUserToDelete.id}</span>)?
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCompanyUserToDelete(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteCompanyUser}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 8. Delete Platform User Modal */}
          {userToDelete && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-xs">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Confirm Delete User
                  </h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Are you sure you want to permanently delete user <strong className="text-slate-900">{userToDelete.name}</strong> (User ID: <span className="font-mono font-bold text-blue-600">{userToDelete.rmId || userToDelete.id}</span>)?
                  </p>
                  <p className="text-[11px] text-red-500 mt-1.5 font-medium">
                    This action cannot be undone. User login access will be immediately revoked.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setUserToDelete(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeleteUser}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 9. Edit Platform User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-blue-600" />
                      <span>Edit Platform User</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Change role, reset password, modify username, and toggle active status
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-mono text-xs font-bold">
                    {editingUser.rmId || editingUser.id}
                  </span>
                </div>

                <form onSubmit={handleSaveEditUser} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">User ID</label>
                      <input
                        type="text"
                        value={editFormData.rmId}
                        onChange={(e) => setEditFormData({ ...editFormData, rmId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                        placeholder="e.g. ADM-01"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Display Name *</label>
                      <input
                        type="text"
                        required
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                        placeholder="e.g. Raju Das"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                        placeholder="user@bharatai.in"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                        placeholder="+91 98000 00000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Login ID * <span className="text-blue-600 font-normal">(Used for sign-in)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.userName}
                      onChange={(e) => setEditFormData({ ...editFormData, userName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      placeholder="e.g. raju"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Role * <span className="text-slate-500 font-normal">(Platform role privilege)</span>
                    </label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as CRMRoleType })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="Super Admin">Bharat 1 AI Admin / Super Admin (Full Platform Authority)</option>
                      <option value="Lead Manager">Lead Manager - Operations & allocation</option>
                      <option value="RM">Relationship Manager (RM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Status * <span className="text-slate-500 font-normal">(Active or Deactivated)</span>
                    </label>
                    <select
                      value={editFormData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'active' })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    >
                      <option value="active">Active - Permitted to sign in and operate</option>
                      <option value="inactive">Non-Active / Deactivated - Block sign in</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Login Password * <span className="text-slate-500 font-normal">(Reset password)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        required
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        placeholder="Enter password"
                        className="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                        title={showEditPassword ? "Hide password" : "Show password"}
                      >
                        {showEditPassword ? (
                          <EyeOff className="w-4 h-4 text-red-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 10. Create Platform User Modal */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-extrabold text-slate-900">Create Platform User</h3>
                <form onSubmit={handleCreateCRMUser} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Display Name *</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="e.g. Suresh Raina"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">User ID</label>
                    <input
                      type="text"
                      value={newUser.rmId}
                      onChange={(e) => setNewUser({ ...newUser, rmId: e.target.value })}
                      placeholder="e.g. ADM-02"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Login ID *</label>
                    <input
                      type="text"
                      required
                      value={newUser.userName}
                      onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                      placeholder="e.g. suresh"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="suresh@bharatai.in"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Contact Number</label>
                      <input
                        type="text"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        placeholder="+91 98000 00000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Platform Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as CRMRoleType })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                    >
                      <option value="Super Admin">Bharat 1 AI Admin / Super Admin</option>
                      <option value="Lead Manager">Lead Manager</option>
                      <option value="RM">Relationship Manager (RM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Login Password *</label>
                    <div className="relative">
                      <input
                        type={showNewUserPassword ? 'text' : 'password'}
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                        className="w-full pr-10 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 rounded transition-colors cursor-pointer"
                        title={showNewUserPassword ? "Hide password" : "Show password"}
                      >
                        {showNewUserPassword ? (
                          <EyeOff className="w-4 h-4 text-red-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Save User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. ROLES & PERMISSIONS MATRIX */}
      {activeSettingsTab === 'roles' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">CRM Role Permission Matrix</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Governs access levels between Executive Administrators, Team Managers, and individual RMs
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">CRM Feature</th>
                  <th className="py-2.5 px-3">Super Admin</th>
                  <th className="py-2.5 px-3">Lead Manager</th>
                  <th className="py-2.5 px-3">Relationship Manager (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {[
                  { feat: 'All leads master view', admin: 'Full Access (All)', mgr: 'Team Leads', rm: 'Own Allocated Leads' },
                  { feat: 'Excel bulk import', admin: 'Yes', mgr: 'Optional', rm: 'No' },
                  { feat: 'Assign / Reassign leads', admin: 'Yes', mgr: 'Team Only', rm: 'No' },
                  { feat: 'Update lead status & remarks', admin: 'Yes', mgr: 'Yes', rm: 'Own Leads' },
                  { feat: 'Account profile details', admin: 'All Accounts', mgr: 'Team Accounts', rm: 'Own Accounts' },
                  { feat: 'RM Performance dashboards', admin: 'All RMs', mgr: 'Team RMs', rm: 'Individual Only' },
                  { feat: 'Add follow-up activities', admin: 'Yes', mgr: 'Yes', rm: 'Yes' },
                  { feat: 'Create CRM users', admin: 'Yes (Admin Only)', mgr: 'No', rm: 'No' },
                  { feat: 'Customize global CRM fields', admin: 'Yes (Admin Only)', mgr: 'No', rm: 'No' },
                  { feat: 'Export CRM data', admin: 'Yes', mgr: 'Permission Required', rm: 'Permission Required' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{row.feat}</td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{row.admin}</td>
                    <td className="py-2.5 px-3 text-purple-700">{row.mgr}</td>
                    <td className="py-2.5 px-3 text-blue-700">{row.rm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. DATABASE CONNECTION */}
      {activeSettingsTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Database Connection & Sync Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect Supabase / Firebase / Central cloud database with schema validation and Row Level Security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Connection: Healthy</span>
              </div>
              <div className="text-[11px] text-emerald-700 mt-1">
                Local State & Cloud Schema synchronized with 0 latency
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-xs font-bold text-slate-700">Total Registered Tables</div>
              <div className="text-lg font-black text-slate-900 mt-1">12 Tables Active</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-xs font-bold text-slate-700">Security Rules</div>
              <div className="text-xs font-bold text-emerald-600 mt-1">RLS & RBAC Enforced</div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Database Provider</label>
              <select
                value={dbProvider}
                onChange={(e) => setDbProvider(e.target.value as any)}
                className="w-full max-w-md px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="local">Central Store & Safe Storage (Active)</option>
                <option value="supabase">Supabase PostgreSQL (Cloud)</option>
                <option value="firebase">Google Cloud Firestore</option>
              </select>
            </div>

            {dbProvider === 'supabase' && (
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Supabase Project URL</label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Anon / Public API Key</label>
                  <input
                    type="password"
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleTestDatabase}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
              <span>{isTestingDb ? 'Testing Connection...' : 'Test Connection & Sync'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. LEAD FIELD CONFIGURATION */}
      {activeSettingsTab === 'fields' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Lead Field & Column Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Control column visibility, required validation constraints, and add custom tender attributes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {fieldConfigs.map(f => (
              <div key={f.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{f.label}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{f.key} • {f.type}</div>
                </div>
                <button
                  onClick={() => handleToggleField(f.key)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    f.visible ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {f.visible ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Add custom attribute (e.g. Broker Commission)"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            />
            <button
              onClick={handleAddCustomField}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Add Column
            </button>
          </div>
        </div>
      )}

      {/* 5. DROPDOWN MASTER */}
      {activeSettingsTab === 'dropdowns' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Dropdown Master Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure master option lists for Lines of Business (LOB), lead sources, and pipeline stages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* LOB Master */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-800">
                Lines of Business (LOB) Master
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {dropdowns.lobs.map(lob => (
                  <span key={lob} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    {lob}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newLob}
                  onChange={(e) => setNewLob(e.target.value)}
                  placeholder="New LOB (e.g. Trade Credit)"
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                />
                <button
                  onClick={handleAddLob}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl"
                >
                  Add LOB
                </button>
              </div>
            </div>

            {/* Lead Sources */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black uppercase text-slate-800">
                Lead Sources Master
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {dropdowns.sources.map(src => (
                  <span key={src} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. EXCEL IMPORT SETTINGS */}
      {activeSettingsTab === 'excel_settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Excel Import & Validation Rules</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify duplicate checking rules, header skipping, and download the current official spreadsheet template
            </p>
          </div>

          <div className="max-w-xl space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Duplicate Detection Rule
              </label>
              <select
                value={duplicateCheckField}
                onChange={(e) => setDuplicateCheckField(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="phone">Check Duplicate by Phone Number</option>
                <option value="company">Check Duplicate by Company Name</option>
                <option value="email">Check Duplicate by Contact Email</option>
              </select>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-blue-950">Official CRM Lead Upload Template</div>
                <div className="text-[11px] text-blue-700 mt-0.5">
                  Pre-configured with standard headers: Company, Contact, State, LOB, Premium
                </div>
              </div>
              <button
                onClick={downloadLeadExcelTemplate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .xlsx</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT & SECURITY */}
      {activeSettingsTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Audit Trail & Security Logs</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of RM lead assignments, status transitions, user logins, and setting modifications
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action Type</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{log.actor}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-blue-50 text-blue-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.module}</td>
                    <td className="py-2.5 px-3 text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
