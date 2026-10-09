import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Building2, 
  AlertCircle, 
  Briefcase, 
  ArrowUpRight, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { CRMLead, CRMUser, CRMAccount, CRMActivity } from '../../types/crm.types';
import { formatINR } from '../../utils/crmStore';

interface CRMDashboardProps {
  leads: CRMLead[];
  accounts: CRMAccount[];
  activities: CRMActivity[];
  currentUser: CRMUser | null;
  onNavigateTab: (tab: any) => void;
  onSelectLead?: (lead: CRMLead) => void;
}

export const CRMDashboard: React.FC<CRMDashboardProps> = ({
  leads,
  accounts,
  activities,
  currentUser,
  onNavigateTab,
  onSelectLead,
}) => {
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'Lead Manager' || (currentUser?.role as string) === 'CRM Manager';
  const isRM = currentUser?.role === 'RM';
  const [dashboardMode, setDashboardMode] = useState<'admin' | 'rm'>(
    isRM ? 'rm' : 'admin'
  );

  // Filter leads based on mode
  const currentRmId = currentUser?.rmId || 'RM-101';
  const displayLeads = dashboardMode === 'rm'
    ? leads.filter(l => l.assignedRMId === currentRmId || l.assignedRMName === currentUser?.name)
    : leads;

  // Key Metrics
  const totalLeads = displayLeads.length;
  const wonLeads = displayLeads.filter(l => l.status === 'Won');
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.expectedPremium || 0), 0);
  const pipelineLeads = displayLeads.filter(l => l.status !== 'Won' && l.status !== 'Lost');
  const pipelineValue = pipelineLeads.reduce((sum, l) => sum + (l.expectedPremium || 0), 0);
  const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : '0';
  const pendingActivities = activities.filter(a => a.status === 'Pending').length;

  // LOB Breakdown
  const lobDistribution: { [key: string]: { count: number; value: number } } = {};
  displayLeads.forEach(l => {
    if (!lobDistribution[l.lob]) {
      lobDistribution[l.lob] = { count: 0, value: 0 };
    }
    lobDistribution[l.lob].count += 1;
    lobDistribution[l.lob].value += l.expectedPremium || 0;
  });

  // Stages Count
  const stageCounts: { [key: string]: number } = {
    'New': displayLeads.filter(l => l.status === 'New').length,
    'Contacted': displayLeads.filter(l => l.status === 'Contacted').length,
    'Proposal': displayLeads.filter(l => l.status === 'Proposal').length,
    'Negotiation': displayLeads.filter(l => l.status === 'Negotiation').length,
    'Won': displayLeads.filter(l => l.status === 'Won').length,
    'Lost': displayLeads.filter(l => l.status === 'Lost').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Toggle for Admin */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {dashboardMode === 'admin' ? '🏢 Corporate Enterprise Suite' : `👤 RM Workspace: ${currentUser?.name || 'Rahul Sharma'}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentUser?.rmId ? `(${currentUser.rmId})` : ''}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
            {dashboardMode === 'admin' ? 'Executive Overview & Sales Command' : 'My Individual Sales Performance & Targets'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {dashboardMode === 'admin'
              ? 'Real-time corporate pipeline health, team allocations, LOB premium realization, and conversion analytics.'
              : `Tracking assigned enterprise leads, scheduled follow-ups, and annual premium targets for ${currentUser?.name || 'Relationship Manager'}.`}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center bg-white/10 p-1 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
            <button
              onClick={() => setDashboardMode('admin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dashboardMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin Overview
            </button>
            <button
              onClick={() => setDashboardMode('rm')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dashboardMode === 'rm'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              My RM View
            </button>
          </div>
        )}
      </div>

      {/* 6 High-Impact KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total Leads */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Leads</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{totalLeads}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-blue-600 font-bold">100%</span> in system
          </div>
        </div>

        {/* 2. Active Pipeline Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{formatINR(pipelineValue)}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-amber-600 font-bold">{pipelineLeads.length}</span> open deals
          </div>
        </div>

        {/* 3. Won Realized Value */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Won Premium</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600">{formatINR(wonValue)}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 font-bold">{wonLeads.length}</span> policies issued
          </div>
        </div>

        {/* 4. Conversion Rate */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversion %</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-700">{conversionRate}%</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            Lead to Win ratio
          </div>
        </div>

        {/* 5. Accounts Managed */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Accounts</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">{accounts.length}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            Corporate clients
          </div>
        </div>

        {/* 6. Pending Follow-ups */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Tasks</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-red-600">{pendingActivities}</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
            Calls & Meetings
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pipeline Distribution & LOB Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pipeline Stage Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Opportunity Pipeline by Stage</span>
              </h3>
              <p className="text-[11px] text-slate-400">Current progress from new lead to closed policy</p>
            </div>
            <button
              onClick={() => onNavigateTab('pipeline')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>View Kanban</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(stageCounts).map(([stage, count]) => {
              const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              const colorMap: { [k: string]: string } = {
                'New': 'bg-blue-500',
                'Contacted': 'bg-cyan-500',
                'Proposal': 'bg-amber-500',
                'Negotiation': 'bg-indigo-600',
                'Won': 'bg-emerald-500',
                'Lost': 'bg-red-400',
              };

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{stage}</span>
                    <span className="text-slate-900 font-bold">{count} leads ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorMap[stage] || 'bg-blue-500'} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOB Distribution (Line of Business Premium Share) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Premium Distribution by Line of Business</span>
              </h3>
              <p className="text-[11px] text-slate-400">Group Health, Fire, Marine, Liability, Cyber</p>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
            {Object.entries(lobDistribution).map(([lob, item]) => {
              const totalVal = displayLeads.reduce((s, l) => s + (l.expectedPremium || 0), 0);
              const pct = totalVal > 0 ? (item.value / totalVal) * 100 : 0;

              return (
                <div key={lob} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 truncate">{lob}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.count} enterprise accounts • {pct.toFixed(1)}% of portfolio
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-blue-900 font-mono">
                      {formatINR(item.value)}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* High-Priority Active Deals & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top 4 Active Deals Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
              <span>High-Value Opportunities in Focus</span>
            </h3>
            <button
              onClick={() => onNavigateTab(dashboardMode === 'rm' ? 'my_leads' : 'manage_leads')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View All Leads
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">LOB</th>
                  <th className="py-2.5 px-3">Expected Premium</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Assigned RM</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {displayLeads.slice(0, 5).map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{l.companyName}</div>
                      <div className="text-[11px] text-slate-400">{l.city}, {l.state}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                        {l.lob}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900 font-mono">
                      {formatINR(l.expectedPremium)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        l.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'Negotiation' ? 'bg-purple-100 text-purple-800' :
                        l.status === 'Proposal' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-semibold">
                      {l.assignedRMName || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectLead?.(l)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scheduled Follow-ups & Reminders (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Upcoming Follow-ups</span>
            </h3>
            <button
              onClick={() => onNavigateTab('activities')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Activities
            </button>
          </div>

          <div className="space-y-2.5">
            {activities.slice(0, 4).map((act) => (
              <div key={act.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800">
                    {act.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-bold">
                    {act.dueDate}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{act.title}</div>
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>{act.leadCompany || 'Corporate Lead'}</span>
                  <span className="text-slate-600 font-semibold">{act.assignedTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
