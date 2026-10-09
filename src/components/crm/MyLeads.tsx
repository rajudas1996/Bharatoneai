import React, { useState } from 'react';
import { 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Search, 
  Filter, 
  Save, 
  X, 
  Building2,
  DollarSign,
  Undo2,
  AlertTriangle
} from 'lucide-react';
import { CRMLead, CRMUser, LeadStatus } from '../../types/crm.types';
import { formatINR, addCrmAuditLog } from '../../utils/crmStore';

interface MyLeadsProps {
  leads: CRMLead[];
  currentUser: CRMUser | null;
  users: CRMUser[];
  onUpdateLeads: (leads: CRMLead[]) => void;
  onOpenScheduleActivity?: (lead: CRMLead) => void;
}

export const MyLeads: React.FC<MyLeadsProps> = ({
  leads,
  currentUser,
  users,
  onUpdateLeads,
  onOpenScheduleActivity,
}) => {
  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'CRM Manager';
  
  // Selected RM view (defaults to current user or RM-101)
  const [selectedRmId, setSelectedRmId] = useState<string>(
    currentUser?.rmId || 'RM-101'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Updating lead modal
  const [updatingLead, setUpdatingLead] = useState<CRMLead | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>('Contacted');
  const [newRemarks, setNewRemarks] = useState('');
  const [newNextFollowUp, setNewNextFollowUp] = useState('');

  // Move back to raw leads state
  const [leadToReturn, setLeadToReturn] = useState<CRMLead | null>(null);
  const [returnReason, setReturnReason] = useState<string>('');

  const rms = users.filter(u => u.role === 'RM');
  const activeRm = rms.find(r => r.rmId === selectedRmId) || rms[0];

  // Leads for the selected RM
  const rmLeads = leads.filter(l => 
    l.assignedRMId === selectedRmId || l.assignedRMName === activeRm?.name
  );

  // Key metrics for RM
  const totalAllocated = rmLeads.length;
  const wonLeads = rmLeads.filter(l => l.status === 'Won');
  const wonAmount = wonLeads.reduce((s, l) => s + (l.expectedPremium || 0), 0);
  const activePipelineAmount = rmLeads
    .filter(l => l.status !== 'Won' && l.status !== 'Lost')
    .reduce((s, l) => s + (l.expectedPremium || 0), 0);

  // Filtered leads
  const filteredRmLeads = rmLeads.filter(l => {
    const matchesSearch = 
      l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle Quick Status Change directly
  const handleQuickStatusChange = (leadId: string, status: LeadStatus) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });
    onUpdateLeads(updated);
    addCrmAuditLog(
      currentUser?.name || 'RM',
      'STATUS_UPDATED',
      'My Leads',
      `Updated status to ${status} for lead ${leadId}`
    );
  };

  // Handle Save Update Modal
  const handleSaveLeadUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingLead) return;

    const updated = leads.map(l => {
      if (l.id === updatingLead.id) {
        return {
          ...l,
          status: newStatus,
          remarks: newRemarks || l.remarks,
          nextFollowUp: newNextFollowUp || l.nextFollowUp,
          lastFollowUp: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });

    onUpdateLeads(updated);
    addCrmAuditLog(
      currentUser?.name || 'RM',
      'LEAD_PROGRESS_SAVED',
      'My Leads',
      `Updated notes & follow-up for ${updatingLead.companyName}`
    );
    setUpdatingLead(null);
  };

  // Confirm Move Back to Raw Leads (Unassign and return to lead pool)
  const handleConfirmMoveBackToRawLeads = () => {
    if (!leadToReturn) return;

    const updated = leads.map(l => {
      if (l.id === leadToReturn.id) {
        return {
          ...l,
          assignedRMId: undefined,
          assignedRMName: undefined,
          status: 'New' as LeadStatus,
          remarks: returnReason 
            ? `Returned to Raw Leads: ${returnReason} (by ${currentUser?.name || 'RM'})` 
            : `Returned to Raw Leads Pool (by ${currentUser?.name || 'RM'})`,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });

    onUpdateLeads(updated);
    addCrmAuditLog(
      currentUser?.name || 'RM',
      'LEAD_RETURNED_TO_RAW',
      'My Leads',
      `Returned lead ${leadToReturn.companyName} (${leadToReturn.id}) back to Raw Leads pool`
    );
    setLeadToReturn(null);
    setReturnReason('');
  };

  return (
    <div className="space-y-6">
      {/* RM Personal Portfolio Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/20">
              Relationship Manager Portfolio
            </span>
            <span className="text-xs text-blue-200 font-mono">
              RM ID: {activeRm?.rmId || 'RM-101'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white">
            {activeRm?.name || 'Rahul Sharma'}’s Assigned Accounts
          </h2>
          <p className="text-xs text-blue-200 mt-1">
            Review allocated enterprise accounts, log client interactions, update tender stages, and meet your monthly premium realization target.
          </p>
        </div>

        {/* If Admin, can switch RM view */}
        {isAdmin && (
          <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/15">
            <label className="text-[10px] font-bold text-blue-200 block mb-1 uppercase tracking-wider">
              Switch RM Portfolio View:
            </label>
            <select
              value={selectedRmId}
              onChange={(e) => setSelectedRmId(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 text-white border border-slate-700 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
              {rms.map(r => (
                <option key={r.id} value={r.rmId}>
                  {r.name} ({r.rmId})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 Summary Stat Badges for RM */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">My Allocated Leads</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalAllocated}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Corporate accounts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Pipeline (₹)</div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">{formatINR(activePipelineAmount)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">In negotiation / proposal</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Won Realized (₹)</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{formatINR(wonAmount)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{wonLeads.length} policies closed</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Conversion Ratio</div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {totalAllocated > 0 ? ((wonLeads.length / totalAllocated) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Win realization</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my leads..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* My Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRmLeads.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No leads currently assigned</p>
            <p className="text-xs text-slate-400 mt-1">Check back once administrator allocates new leads to this RM</p>
          </div>
        ) : (
          filteredRmLeads.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3.5 hover:shadow-xs transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{l.companyName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {l.id} • {l.city}, {l.state} • {l.industry}
                  </div>
                </div>

                {/* Inline Status Dropdown */}
                <select
                  value={l.status}
                  onChange={(e) => handleQuickStatusChange(l.id, e.target.value as LeadStatus)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase outline-none cursor-pointer border ${
                    l.status === 'Won' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    l.status === 'Negotiation' ? 'bg-purple-50 text-purple-800 border-purple-300' :
                    l.status === 'Proposal' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                    l.status === 'Contacted' ? 'bg-cyan-50 text-cyan-800 border-cyan-300' :
                    l.status === 'Lost' ? 'bg-red-50 text-red-800 border-red-300' :
                    'bg-blue-50 text-blue-800 border-blue-300'
                  }`}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Closed Won</option>
                  <option value="Lost">Closed Lost</option>
                </select>
              </div>

              {/* LOB & Premium realization */}
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Line of Business</span>
                  <span className="text-xs font-bold text-blue-700">{l.lob}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Premium</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{formatINR(l.expectedPremium)}</span>
                </div>
              </div>

              {/* Contact Details */}
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{l.contactPerson}</span>
                  <span className="text-slate-500 font-mono">{l.phone}</span>
                </div>
                {l.email && (
                  <div className="text-[11px] text-slate-500">{l.email}</div>
                )}
              </div>

              {/* Remarks & Follow-up */}
              {l.remarks && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-[11px] text-amber-900">
                  <span className="font-bold">Latest Remark:</span> {l.remarks}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Next Follow-up: <strong>{l.nextFollowUp || 'Not scheduled'}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setLeadToReturn(l);
                      setReturnReason('');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    title="Release and move lead back to Raw Leads database"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>Raw Leads</span>
                  </button>

                  <button
                    onClick={() => {
                      setUpdatingLead(l);
                      setNewStatus(l.status);
                      setNewRemarks(l.remarks || '');
                      setNewNextFollowUp(l.nextFollowUp || '');
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Update Progress
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPDATE PROGRESS MODAL */}
      {updatingLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-extrabold text-slate-900">
                Update Progress: {updatingLead.companyName}
              </h3>
              <button
                onClick={() => setUpdatingLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadUpdate} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Sales Stage Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Proposal">Proposal Submitted</option>
                  <option value="Negotiation">In Negotiation</option>
                  <option value="Won">Closed Won (Policy Issued)</option>
                  <option value="Lost">Closed Lost</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={newNextFollowUp}
                  onChange={(e) => setNewNextFollowUp(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Meeting Remarks / Client Quotation Feedback
                </label>
                <textarea
                  rows={3}
                  required
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  placeholder="Record summary of discussion, underwriting requirements, premium discount requested..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdatingLead(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MOVE BACK TO RAW LEADS CONFIRMATION MODAL */}
      {leadToReturn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Move Back to Raw Leads?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to release <strong>{leadToReturn.companyName}</strong> ({leadToReturn.id})? It will be unassigned from your portfolio and moved back to the Master Raw Leads pool for re-allocation.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason for Return / Handover Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Territory mismatch, client requested another branch RM, or policy not feasible..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLeadToReturn(null)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Keep in My Leads
              </button>
              <button
                type="button"
                onClick={handleConfirmMoveBackToRawLeads}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Yes, Return to Raw Leads
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
