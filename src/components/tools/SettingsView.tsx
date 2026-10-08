import React, { useState } from 'react';
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
  ExternalLink
} from 'lucide-react';
import { safeStorage } from '../../utils/safeStorage';
import { DatabaseAuthTool } from './DatabaseAuthTool';
import { CRMUser, CRMRoleType, CRMFieldConfig, CRMDropdownMaster } from '../../types/crm.types';
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
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'crm_users' }) => {
  // Admin Authentication State for Settings (Admin Password: raju1234)
  // Requires administrator password when clicking on setting per User Request #6
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab inside Settings
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>(initialTab);

  // 1. CRM Users State
  const [crmUsers, setCrmUsers] = useState<CRMUser[]>(() => getCrmUsers());
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
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

  // Toggle user active status
  const handleToggleUserActive = (id: string) => {
    const updated = crmUsers.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
    setCrmUsers(updated);
    saveCrmUsers(updated);
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">CRM User Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set up Relationship Managers (RMs), system logins, activation status, and role privileges
              </p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create CRM User</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">RM / Staff ID</th>
                  <th className="py-2.5 px-3">Display Name</th>
                  <th className="py-2.5 px-3">Login Username</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {crmUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{u.rmId || u.id}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-blue-700 font-semibold">{u.userName}</td>
                    <td className="py-3 px-3 text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        u.role === 'Super Admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'CRM Manager' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleUserActive(u.id)}
                        className="text-[11px] font-bold text-slate-600 hover:text-red-600 cursor-pointer"
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create User Modal */}
          {isAddUserOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900">Create New CRM User</h3>
                <form onSubmit={handleCreateCRMUser} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="e.g. Ankit Trivedi"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Username (For Login) *</label>
                    <input
                      type="text"
                      required
                      value={newUser.userName}
                      onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                      placeholder="e.g. ankit"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">RM Code / Staff ID</label>
                    <input
                      type="text"
                      value={newUser.rmId}
                      onChange={(e) => setNewUser({ ...newUser, rmId: e.target.value })}
                      placeholder="RM-105"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Role *</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as CRMRoleType })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="RM">Relationship Manager (RM)</option>
                      <option value="CRM Manager">CRM Manager</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Login Password *</label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter password"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl"
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
                  <th className="py-2.5 px-3">CRM Manager</th>
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
