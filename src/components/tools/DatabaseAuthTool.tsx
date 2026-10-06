import React, { useState } from 'react';
import { 
  Database, 
  Shield, 
  Users, 
  Key, 
  Server, 
  CheckCircle2, 
  Copy, 
  Check, 
  Plus, 
  Terminal, 
  Lock, 
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';

export const DatabaseAuthTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'auth' | 'database' | 'api' | 'sql'>('auth');
  const [copiedKey, setCopiedKey] = useState(false);

  const [users, setUsers] = useState([
    { id: 'usr-101', name: 'Raju Das', email: 'rajudaszoology22@gmail.com', role: 'Super Admin', status: 'Active', created: '2026-10-01' },
    { id: 'usr-102', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'Underwriter', status: 'Active', created: '2026-10-02' },
    { id: 'usr-103', name: 'Amit Verma', email: 'amit.verma@example.com', role: 'Regional RM', status: 'Active', created: '2026-10-04' },
    { id: 'usr-104', name: 'Neha Gupta', email: 'neha.gupta@example.com', role: 'Analyst', status: 'Invited', created: '2026-10-05' },
  ]);

  const [newUserModal, setNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Analyst');

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setUsers((prev) => [
      ...prev,
      {
        id: `usr-${Date.now().toString().slice(-3)}`,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: 'Active',
        created: 'Just now',
      },
    ]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserModal(false);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('epk_live_9b0932fa0f3e44a3ab40bbdd63dd9e14');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Database & Authentication</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              Connected • Cloud SQL & Firebase
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Developer infrastructure control plane for authentication, database pooling, and API credentials
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'auth' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users & Auth</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'database' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database Tables</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'sql' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SQL Console</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'api' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Keys</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Users & Authentication */}
      {activeTab === 'auth' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">User Authentication Directory</h2>
              <p className="text-xs text-slate-500">Manage user accounts, credentials, and role-based permissions</p>
            </div>
            <button
              onClick={() => setNewUserModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">User</th>
                  <th className="py-2.5 px-4 font-semibold">Role</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Created Date</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'Super Admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">{u.created}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Password reset email sent to ${u.email}`)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Reset Key
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Database Schema & Tables */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Engine</span>
              <div className="text-base font-bold text-slate-900 mt-1">Cloud SQL PostgreSQL 16</div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">● Operational & Healthy</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Records</span>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">1,248,930 rows</div>
              <div className="text-xs text-slate-500 mt-0.5">Across 8 tables</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Connection Pool</span>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">14 / 50 connections</div>
              <div className="text-xs text-slate-500 mt-0.5">Latency 4ms</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Database Tables</h3>
            <div className="space-y-2">
              {[
                { name: 'leads_master', rows: '482,100', size: '64 MB', cols: '18 columns' },
                { name: 'policies_underwritten', rows: '124,500', size: '28 MB', cols: '14 columns' },
                { name: 'rms_directory', rows: '1,420', size: '2 MB', cols: '8 columns' },
                { name: 'audit_logs', rows: '640,910', size: '92 MB', cols: '10 columns' },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-red-600" />
                    <span className="font-bold font-mono text-slate-800">{t.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 font-mono">
                    <span>{t.cols}</span>
                    <span>{t.rows} rows</span>
                    <span className="text-slate-900 font-bold">{t.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive SQL Console */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Interactive SQL Query Workspace
            </h3>
            <p className="text-xs text-slate-500">Execute test queries against safe sandbox database</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400">
            <p className="text-slate-400">// Select top 5 records by turnover</p>
            <p className="text-white mt-1">
              SELECT company_name, state, turnover, rm_owner FROM leads_master WHERE status = 'Active' ORDER BY turnover DESC LIMIT 5;
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border-b">company_name</th>
                  <th className="p-2 border-b">state</th>
                  <th className="p-2 border-b">turnover</th>
                  <th className="p-2 border-b">rm_owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr><td className="p-2">Larsen & Toubro Ltd</td><td className="p-2">Maharashtra</td><td className="p-2 text-red-600 font-bold">₹ 145.20 Cr</td><td className="p-2">Vikram Rao</td></tr>
                <tr><td className="p-2">Tata Consultancy Services</td><td className="p-2">Maharashtra</td><td className="p-2 text-red-600 font-bold">₹ 118.50 Cr</td><td className="p-2">Sneha Patel</td></tr>
                <tr><td className="p-2">Infosys Technologies</td><td className="p-2">Karnataka</td><td className="p-2 text-red-600 font-bold">₹ 98.40 Cr</td><td className="p-2">Amit Shah</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: API Keys */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">API Credentials & Keys</h3>
            <p className="text-xs text-slate-500 mt-0.5">Use your secure token to connect external services</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Production Live Key</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value="epk_live_9b0932fa0f3e44a3ab40bbdd63dd9e14"
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 outline-none"
              />
              <button
                onClick={handleCopyApiKey}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {newUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 border border-slate-200 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900">Add New Team Member</h3>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="ramesh@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Role</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
              >
                <option value="Underwriter">Underwriter</option>
                <option value="Regional RM">Regional RM</option>
                <option value="Analyst">Analyst</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setNewUserModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
