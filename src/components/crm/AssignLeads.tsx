import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Filter, 
  History, 
  Check, 
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { CRMLead, CRMUser, CRMAssignment } from '../../types/crm.types';
import { formatINR, addCrmAuditLog } from '../../utils/crmStore';

interface AssignLeadsProps {
  leads: CRMLead[];
  users: CRMUser[];
  assignments: CRMAssignment[];
  currentUser: CRMUser | null;
  onUpdateLeads: (leads: CRMLead[]) => void;
  onUpdateAssignments: (assignments: CRMAssignment[]) => void;
}

export const AssignLeads: React.FC<AssignLeadsProps> = ({
  leads,
  users,
  assignments,
  currentUser,
  onUpdateLeads,
  onUpdateAssignments,
}) => {
  // Filter states for leads selection
  const [filterState, setFilterState] = useState('All');
  const [filterLOB, setFilterLOB] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [filterAllocation, setFilterAllocation] = useState<'all' | 'unassigned' | 'assigned'>('all');

  // Selected lead IDs
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Target RM for assignment
  const [targetRMId, setTargetRMId] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rms = users.filter(u => u.role === 'RM');

  // Filtered Leads available for assignment
  const filteredLeads = leads.filter(l => {
    const matchesState = filterState === 'All' || l.state === filterState;
    const matchesLOB = filterLOB === 'All' || l.lob === filterLOB;
    const matchesIndustry = filterIndustry === 'All' || l.industry === filterIndustry;
    const matchesAlloc = 
      filterAllocation === 'all' ? true :
      filterAllocation === 'unassigned' ? !l.assignedRMId :
      Boolean(l.assignedRMId);

    return matchesState && matchesLOB && matchesIndustry && matchesAlloc;
  });

  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleToggleLead = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  // Execute Bulk Assignment
  const handleExecuteAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLeadIds.length === 0) {
      alert('Please select at least one lead from the table to assign.');
      return;
    }
    if (!targetRMId) {
      alert('Please select a target Relationship Manager (RM).');
      return;
    }

    const targetRM = rms.find(r => r.rmId === targetRMId);
    if (!targetRM) return;

    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newAssignments: CRMAssignment[] = [];

    // Update leads
    const updatedLeads = leads.map(l => {
      if (selectedLeadIds.includes(l.id)) {
        newAssignments.push({
          id: `ASG-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`,
          leadId: l.id,
          leadCompany: l.companyName,
          rmId: targetRM.rmId || 'RM',
          rmName: targetRM.name,
          assignedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Administrator',
          assignedDate: timestamp,
          notes: assignmentNotes || 'Allocated via Bulk Lead Management'
        });

        return {
          ...l,
          assignedRMId: targetRM.rmId,
          assignedRMName: targetRM.name,
          status: l.status === 'New' ? 'Contacted' : l.status,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });

    onUpdateLeads(updatedLeads);
    onUpdateAssignments([...newAssignments, ...assignments]);

    addCrmAuditLog(
      currentUser?.name || 'Admin',
      'LEADS_BULK_ASSIGNED',
      'Assign Leads',
      `Assigned ${selectedLeadIds.length} leads to ${targetRM.name} (${targetRM.rmId})`
    );

    setSuccessMessage(`Successfully allocated ${selectedLeadIds.length} leads to ${targetRM.name}!`);
    setSelectedLeadIds([]);
    setAssignmentNotes('');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Lead Allocation & Reassignment Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter by territory, state, industry, and line of business to bulk allocate enterprise accounts to RMs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Active Sales RMs:</span>
          <div className="flex -space-x-2">
            {rms.map((r, i) => (
              <div
                key={r.id}
                title={`${r.name} (${r.rmId})`}
                className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs"
              >
                {r.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Control Box */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Bulk Allocation Action Panel
            </h3>
          </div>
          <div className="text-xs font-bold text-blue-900">
            {selectedLeadIds.length} leads selected
          </div>
        </div>

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleExecuteAssignment} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Select Target Relationship Manager (RM) *
            </label>
            <select
              value={targetRMId}
              onChange={(e) => setTargetRMId(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              <option value="">-- Choose Relationship Manager --</option>
              {rms.map(r => (
                <option key={r.id} value={r.rmId}>
                  {r.name} ({r.rmId}) • {r.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Assignment Remarks / Territory Directive
            </label>
            <input
              type="text"
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              placeholder="e.g. Q4 Renewal Priority / Corporate Tenders"
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={selectedLeadIds.length === 0 || !targetRMId}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Assign {selectedLeadIds.length} Selected Leads</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* State Filter */}
        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
        >
          <option value="All">All States</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Delhi NCR">Delhi NCR</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Telangana">Telangana</option>
          <option value="West Bengal">West Bengal</option>
        </select>

        {/* LOB Filter */}
        <select
          value={filterLOB}
          onChange={(e) => setFilterLOB(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
        >
          <option value="All">All LOBs</option>
          <option value="Group Health">Group Health</option>
          <option value="Fire & Special Perils">Fire & Special Perils</option>
          <option value="Marine Cargo">Marine Cargo</option>
          <option value="Directors & Officers">Directors & Officers</option>
          <option value="Cyber Risk">Cyber Risk</option>
          <option value="Commercial Motor">Commercial Motor</option>
        </select>

        {/* Industry Filter */}
        <select
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
        >
          <option value="All">All Industries</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Retail & FMCG">Retail & FMCG</option>
          <option value="Healthcare & Pharma">Healthcare & Pharma</option>
          <option value="Manufacturing & Infra">Manufacturing & Infra</option>
          <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
        </select>

        {/* Allocation Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl ml-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterAllocation('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${filterAllocation === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterAllocation('unassigned')}
            className={`px-2.5 py-1 rounded-lg transition-all ${filterAllocation === 'unassigned' ? 'bg-amber-100 text-amber-900 shadow-2xs' : 'text-slate-500'}`}
          >
            Unassigned Only
          </button>
          <button
            type="button"
            onClick={() => setFilterAllocation('assigned')}
            className={`px-2.5 py-1 rounded-lg transition-all ${filterAllocation === 'assigned' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
          >
            Assigned
          </button>
        </div>
      </div>

      {/* Leads Selection Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>{selectedLeadIds.length === filteredLeads.length ? 'Deselect All' : 'Select All Leads'}</span>
            </button>
            <span className="text-xs text-slate-400 font-semibold">
              ({filteredLeads.length} matching leads)
            </span>
          </div>

          <div className="text-xs font-bold text-slate-700">
            Selected for Allocation: <span className="text-blue-600">{selectedLeadIds.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8">Select</th>
                <th className="py-2.5 px-3">Company Name</th>
                <th className="py-2.5 px-3">LOB</th>
                <th className="py-2.5 px-3">State / City</th>
                <th className="py-2.5 px-3">Expected Premium</th>
                <th className="py-2.5 px-3">Current Assigned RM</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.map((l) => {
                const isSelected = selectedLeadIds.includes(l.id);

                return (
                  <tr
                    key={l.id}
                    onClick={() => handleToggleLead(l.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50/70'}`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by row click
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-900">{l.companyName}</div>
                      <div className="text-[10px] text-slate-400">{l.contactPerson} • {l.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {l.lob}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div>{l.city}</div>
                      <div className="text-[11px] text-slate-400">{l.state}</div>
                    </td>
                    <td className="py-3 px-3 font-black text-slate-900 font-mono">
                      {formatINR(l.expectedPremium)}
                    </td>
                    <td className="py-3 px-3">
                      {l.assignedRMName ? (
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{l.assignedRMName} ({l.assignedRMId})</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment History Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-600" />
          <span>Recent Lead Allocation History</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Enterprise Account</th>
                <th className="py-2.5 px-3">Allocated To (RM)</th>
                <th className="py-2.5 px-3">Assigned By</th>
                <th className="py-2.5 px-3">Directive Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {assignments.slice(0, 6).map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {asg.assignedDate}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">
                    {asg.leadCompany}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-blue-700">
                    {asg.rmName} ({asg.rmId})
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {asg.assignedBy}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 italic">
                    {asg.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
