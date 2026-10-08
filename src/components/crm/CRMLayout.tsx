import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Phone, 
  Kanban, 
  Calendar, 
  FileSpreadsheet, 
  Sparkles, 
  Lock, 
  LogIn, 
  CheckCircle2, 
  ShieldCheck, 
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  CRMLead, 
  CRMAccount, 
  CRMContact, 
  CRMAssignment, 
  CRMActivity, 
  CRMUser, 
  CRMNavTab 
} from '../../types/crm.types';
import { 
  getCrmLeads, 
  saveCrmLeads, 
  getCrmAccounts, 
  saveCrmAccounts, 
  getCrmContacts, 
  saveCrmContacts, 
  getCrmAssignments, 
  saveCrmAssignments, 
  getCrmActivities, 
  saveCrmActivities, 
  getCrmUsers, 
  findCrmUser 
} from '../../utils/crmStore';
import { CRMDashboard } from './CRMDashboard';
import { ManageLeads } from './ManageLeads';
import { AssignLeads } from './AssignLeads';
import { MyLeads } from './MyLeads';
import { AllAccounts } from './AllAccounts';
import { AllContacts } from './AllContacts';
import { PipelineBoard } from './PipelineBoard';
import { FollowUps } from './FollowUps';
import { CRMReports } from './CRMReports';

interface CRMLayoutProps {
  isLoggedIn?: boolean;
  currentUserProfile?: {
    name: string;
    userName?: string;
    role: string;
    email?: string;
    isLoggedIn: boolean;
  };
  onOpenLoginModal: () => void;
}

export const CRMLayout: React.FC<CRMLayoutProps> = ({
  isLoggedIn = false,
  currentUserProfile,
  onOpenLoginModal,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<CRMNavTab>('dashboard');

  // Load centralized CRM data from crmStore
  const [users, setUsers] = useState<CRMUser[]>(() => getCrmUsers());
  const [leads, setLeads] = useState<CRMLead[]>(() => getCrmLeads());
  const [accounts, setAccounts] = useState<CRMAccount[]>(() => getCrmAccounts());
  const [contacts, setContacts] = useState<CRMContact[]>(() => getCrmContacts());
  const [assignments, setAssignments] = useState<CRMAssignment[]>(() => getCrmAssignments());
  const [activities, setActivities] = useState<CRMActivity[]>(() => getCrmActivities());

  // Resolve current CRM User
  const [currentCrmUser, setCurrentCrmUser] = useState<CRMUser | null>(() => {
    if (!isLoggedIn) return null;
    const allUsers = getCrmUsers();
    // Match by username or name
    const matched = allUsers.find(
      u => u.userName.toLowerCase() === (currentUserProfile?.userName || '').toLowerCase() ||
           u.name.toLowerCase() === (currentUserProfile?.name || '').toLowerCase()
    );
    if (matched) return matched;

    // Fallback if logged in as Admin
    if (currentUserProfile?.role === 'Administrator') {
      return allUsers[0]; // Super Admin Raju Das
    }

    // Default RM fallback for demo
    return allUsers.find(u => u.role === 'RM') || allUsers[2];
  });

  useEffect(() => {
    if (isLoggedIn) {
      const allUsers = getCrmUsers();
      const matched = allUsers.find(
        u => u.userName.toLowerCase() === (currentUserProfile?.userName || '').toLowerCase() ||
             u.name.toLowerCase() === (currentUserProfile?.name || '').toLowerCase()
      );
      if (matched) {
        setCurrentCrmUser(matched);
      } else if (currentUserProfile?.role === 'Administrator') {
        setCurrentCrmUser(allUsers[0]);
      } else {
        setCurrentCrmUser(allUsers[2]);
      }
    } else {
      setCurrentCrmUser(null);
    }
  }, [isLoggedIn, currentUserProfile]);

  // Handlers to synchronize and persist data
  const handleUpdateLeads = (newLeads: CRMLead[]) => {
    setLeads(newLeads);
    saveCrmLeads(newLeads);
  };

  const handleUpdateAccounts = (newAccounts: CRMAccount[]) => {
    setAccounts(newAccounts);
    saveCrmAccounts(newAccounts);
  };

  const handleUpdateContacts = (newContacts: CRMContact[]) => {
    setContacts(newContacts);
    saveCrmContacts(newContacts);
  };

  const handleUpdateAssignments = (newAssignments: CRMAssignment[]) => {
    setAssignments(newAssignments);
    saveCrmAssignments(newAssignments);
  };

  const handleUpdateActivities = (newActivities: CRMActivity[]) => {
    setActivities(newActivities);
    saveCrmActivities(newActivities);
  };

  // 1. UN-AUTHENTICATED STATE: Prompt to Sign In
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6 text-center animate-in fade-in select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
          <Briefcase className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Please sign in to your account to access Sales CRM
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sales CRM contains enterprise leads, client policy accounts, tender assignments, and RM performance targets. Please authenticate using your credentials to continue.
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2.5 max-w-md mx-auto">
          <div className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Available Role-Based Credentials:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Super Admin:</span>
              <span className="text-slate-500 font-mono">User: <strong>raju</strong></span><br />
              <span className="text-slate-500 font-mono">Pass: <strong>raju1234</strong></span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Sales RM (Rahul):</span>
              <span className="text-slate-500 font-mono">User: <strong>rahul</strong></span><br />
              <span className="text-slate-500 font-mono">Pass: <strong>rm1234</strong></span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenLoginModal}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access Sales CRM</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED STATE: Full CRM Navigation and Workspaces
  const isSuperAdmin = currentCrmUser?.role === 'Super Admin';
  const isManager = currentCrmUser?.role === 'CRM Manager';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200 select-none">
      {/* CRM Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* 2. Manage Leads */}
          <button
            type="button"
            onClick={() => setActiveTab('manage_leads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manage_leads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Manage Leads</span>
          </button>

          {/* 3. Assign Leads (Only for Admin / Manager or preview) */}
          {(isSuperAdmin || isManager) && (
            <button
              type="button"
              onClick={() => setActiveTab('assign_leads')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'assign_leads'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assign Leads</span>
            </button>
          )}

          {/* 4. My Leads */}
          <button
            type="button"
            onClick={() => setActiveTab('my_leads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'my_leads'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>My Leads</span>
          </button>

          {/* 5. All Accounts */}
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>All Accounts</span>
          </button>

          {/* 6. All Contacts */}
          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>All Contacts</span>
          </button>

          {/* 7. Sales Pipeline */}
          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Sales Pipeline</span>
          </button>

          {/* 8. Follow-ups & Activities */}
          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'activities'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Follow-ups</span>
          </button>

          {/* 9. Reports & Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports</span>
          </button>
        </div>

        {/* User Role Badge in Top-Right */}
        <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
              {currentCrmUser?.name || 'Authorized User'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {currentCrmUser?.role} • {currentCrmUser?.rmId || 'USR'}
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0" title="Active Session" />
        </div>
      </div>

      {/* Render Active Inner View */}
      {activeTab === 'dashboard' && (
        <CRMDashboard
          leads={leads}
          accounts={accounts}
          activities={activities}
          currentUser={currentCrmUser}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'manage_leads' && (
        <ManageLeads
          leads={leads}
          users={users}
          currentUser={currentCrmUser}
          onUpdateLeads={handleUpdateLeads}
          onNavigateToAssign={() => setActiveTab('assign_leads')}
        />
      )}

      {activeTab === 'assign_leads' && (
        <AssignLeads
          leads={leads}
          users={users}
          assignments={assignments}
          currentUser={currentCrmUser}
          onUpdateLeads={handleUpdateLeads}
          onUpdateAssignments={handleUpdateAssignments}
        />
      )}

      {activeTab === 'my_leads' && (
        <MyLeads
          leads={leads}
          currentUser={currentCrmUser}
          users={users}
          onUpdateLeads={handleUpdateLeads}
          onOpenScheduleActivity={() => setActiveTab('activities')}
        />
      )}

      {activeTab === 'accounts' && (
        <AllAccounts
          accounts={accounts}
          contacts={contacts}
          leads={leads}
          onUpdateAccounts={handleUpdateAccounts}
        />
      )}

      {activeTab === 'contacts' && (
        <AllContacts
          contacts={contacts}
          accounts={accounts}
          onUpdateContacts={handleUpdateContacts}
        />
      )}

      {activeTab === 'pipeline' && (
        <PipelineBoard
          leads={leads}
          onUpdateLeads={handleUpdateLeads}
        />
      )}

      {activeTab === 'activities' && (
        <FollowUps
          activities={activities}
          leads={leads}
          onUpdateActivities={handleUpdateActivities}
        />
      )}

      {activeTab === 'reports' && (
        <CRMReports
          leads={leads}
          users={users}
        />
      )}
    </div>
  );
};
