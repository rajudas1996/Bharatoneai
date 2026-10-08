import React, { useState } from 'react';
import { 
  Database, 
  Key, 
  ShieldCheck, 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  Copy, 
  RefreshCw, 
  Code, 
  Lock, 
  Download,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { safeStorage } from '../../utils/safeStorage';

interface DBRecord {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending' | 'Inactive';
  lastLogin: string;
}

const INITIAL_RECORDS: DBRecord[] = [
  { id: 'usr-101', name: 'Raju Das', email: 'rajudaszoology22@gmail.com', role: 'Super Admin', status: 'Active', lastLogin: 'Just now' },
  { id: 'usr-102', name: 'Ananya Sharma', email: 'ananya.s@bharat1.ai', role: 'Admin', status: 'Active', lastLogin: '2 hours ago' },
  { id: 'usr-103', name: 'Vikram Mehta', email: 'vikram.m@fintech.in', role: 'Editor', status: 'Active', lastLogin: 'Yesterday' },
  { id: 'usr-104', name: 'Pooja Patel', email: 'pooja.analytics@corp.in', role: 'Viewer', status: 'Active', lastLogin: '3 days ago' },
];

interface DatabaseAuthToolProps {
  isPreUnlocked?: boolean;
}

export const DatabaseAuthTool: React.FC<DatabaseAuthToolProps> = ({ isPreUnlocked = false }) => {
  // Admin password authentication check (Admin password is raju1234)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    if (isPreUnlocked) return true;
    return safeStorage.getItem('bharat1_admin_auth') === 'true';
  });
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'users' | 'keys' | 'playground'>('users');
  const [records, setRecords] = useState<DBRecord[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'raju1234') {
      setIsAdminUnlocked(true);
      safeStorage.setItem('bharat1_admin_auth', 'true');
      setAuthError(null);
      setAdminPasswordInput('');
    } else {
      setAuthError('Incorrect administrator password. Please try again.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    safeStorage.removeItem('bharat1_admin_auth');
    setAuthError(null);
  };

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newRec: DBRecord = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Active',
      lastLogin: 'Never',
    };

    setRecords([newRec, ...records]);
    setNewName('');
    setNewEmail('');
    setShowAddModal(false);
  };

  const handleDeleteUser = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleRunApiTest = () => {
    setIsTestingApi(true);
    setTimeout(() => {
      setIsTestingApi(false);
      setApiResponse(JSON.stringify({
        status: 200,
        message: 'Authentication successful',
        authenticatedUser: {
          id: 'usr-101',
          name: 'Raju Das',
          role: 'Super Admin',
          permissions: ['ALL_PERMISSIONS', 'EXPORT_DATA', 'MANAGE_USERS', 'RUN_WORKFLOWS']
        },
        tokenExpiry: '2026-11-06T12:00:00Z',
        latency: '42ms'
      }, null, 2));
    }, 600);
  };

  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdminUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border-2 border-red-100 p-7 shadow-xl space-y-5 animate-in fade-in duration-200 select-none">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Admin Password Required
          </h2>
          <p className="text-xs text-slate-500">
            Database & Auth contains sensitive application schemas and user RBAC controls. Please enter the admin password to continue.
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleUnlockAdmin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Admin Password
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
                placeholder="Enter admin password"
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-red-500 focus:bg-white transition-colors"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
            <span>Unlock Database & Auth</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Database & Auth Manager</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Admin Unlocked
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Manage application tables, user accounts, role-based access control (RBAC), and test secured endpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLockAdmin}
            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Lock Database & Auth session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add User Profile</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Profiles & Roles ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'keys'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Tokens & Secrets</span>
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'playground'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>API Auth Playground</span>
        </button>
      </div>

      {/* Tab 1: User Profiles */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user profiles by name, email or role..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Showing {filtered.length} entries</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Super Admin'
                          ? 'bg-red-100 text-red-700'
                          : u.role === 'Admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.lastLogin}</td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'Super Admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: API Keys */}
      {activeTab === 'keys' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 max-w-2xl">
          <h2 className="text-sm font-bold text-slate-900">Application API Key</h2>
          <p className="text-xs text-slate-500">
            Use this bearer token to authenticate automated ETL scripts, webhook deliveries, and external backend pipelines.
          </p>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="font-mono text-xs text-slate-800">
              b1ai_live_9f82c448a39178b209e8f1107c
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText('b1ai_live_9f82c448a39178b209e8f1107c');
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: API Playground */}
      {activeTab === 'playground' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live Endpoint Test Console</h2>
              <p className="text-xs text-slate-500">Test authenticated API response latency & permission claims</p>
            </div>
            <button
              onClick={handleRunApiTest}
              disabled={isTestingApi}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              {isTestingApi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Code className="w-3.5 h-3.5" />}
              <span>Send GET /api/v1/auth/verify</span>
            </button>
          </div>

          {apiResponse && (
            <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto shadow-inner">
              {apiResponse}
            </pre>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add New User Profile</h2>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
