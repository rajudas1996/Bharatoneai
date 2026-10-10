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
import { PolicyDataBank } from './PolicyDataBank';

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

  useEffect(() => {
    if (currentCrmUser?.role === 'RM' && (activeTab === 'assign_leads')) {
      setActiveTab('dashboard');
    }
  }, [currentCrmUser, activeTab]);

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
  const isLeadManager = currentCrmUser?.role === 'Lead Manager' || (currentCrmUser?.role as string) === 'CRM Manager';
  const isRM = currentCrmUser?.role === 'RM';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200 select-none">
      {/* CRM Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {/* 1. Dashboard (All roles) */}
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

          {/* 2. My Lead (for RM) / Manage Leads (for Admin & Lead Manager) */}
          {isRM ? (
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
              <span>My Lead</span>
            </button>
          ) : (
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
          )}

          {/* 3. Assign Leads (Only for Super Admin & Lead Manager) */}
          {(isSuperAdmin || isLeadManager) && (
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

          {/* 4. My Leads (For Super Admin & Lead Manager) */}
          {(isSuperAdmin || isLeadManager) && (
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
          )}

          {/* All Accounts (for RM: All Accounts, for Admin/Manager: All Accounts) */}
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

          {/* Contact Directory */}
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
            <span>Contact Directory</span>
          </button>

          {/* Active Pipeline (RM: Active Pipeline, Admin: Sales Pipeline) */}
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
            <span>{isRM ? 'Active Pipeline' : 'Sales Pipeline'}</span>
          </button>

          {/* Policy Data Bank */}
          <button
            type="button"
            onClick={() => setActiveTab('policy_data_bank')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'policy_data_bank'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Policy Data Bank</span>
          </button>

          {/* Task (RM: Task, Admin/Manager: Task & Follow-up) */}
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
            <span>{isRM ? 'Task' : 'Task & Follow-up'}</span>
          </button>

          {/* Report (RM: Report, Admin/Manager: Reports) */}
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
            <span>{isRM ? 'Report' : 'Reports'}</span>
          </button>
        </div>


        {/* User Role Badge in Top-Right */}
        <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-slate-100">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
              {currentCrmUser?.name || 'Authorized User'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {currentCrmUser?.role === 'CRM Manager' ? 'Lead Manager' : currentCrmUser?.role} • {currentCrmUser?.rmId || 'USR'}
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
          contacts={contacts}
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
          currentUser={currentCrmUser}
          onUpdateAccounts={handleUpdateAccounts}
        />
      )}

      {activeTab === 'contacts' && (
        <AllContacts
          contacts={contacts}
          accounts={accounts}
          currentUser={currentCrmUser}
          onUpdateContacts={handleUpdateContacts}
        />
      )}

      {activeTab === 'pipeline' && (
        <PipelineBoard
          leads={leads}
          currentUser={currentCrmUser}
          onUpdateLeads={handleUpdateLeads}
        />
      )}

      {activeTab === 'policy_data_bank' && (
        <PolicyDataBank
          leads={leads}
          accounts={accounts}
          currentUser={currentCrmUser}
        />
      )}

      {activeTab === 'activities' && (
        <FollowUps
          activities={activities}
          leads={leads}
          currentUser={currentCrmUser}
          onUpdateActivities={handleUpdateActivities}
        />
      )}

      {activeTab === 'reports' && (
        <CRMReports
          leads={leads}
          users={users}
          currentUser={currentCrmUser}
        />
      )}
    </div>
  );
};
