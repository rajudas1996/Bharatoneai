import React, { useState } from 'react';
import { 
  Kanban, 
  Plus, 
  ArrowRight, 
  Building2, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  DollarSign
} from 'lucide-react';
import { CRMLead, LeadStatus, CRMUser } from '../../types/crm.types';
import { formatINR, addCrmAuditLog } from '../../utils/crmStore';

interface PipelineBoardProps {
  leads: CRMLead[];
  currentUser?: CRMUser | null;
  onUpdateLeads: (leads: CRMLead[]) => void;
}

const STAGES: { id: LeadStatus; label: string; color: string; badge: string }[] = [
  { id: 'New', label: '1. New Lead', color: 'border-blue-300 bg-blue-50/40', badge: 'bg-blue-100 text-blue-800' },
  { id: 'Contacted', label: '2. Contacted', color: 'border-cyan-300 bg-cyan-50/40', badge: 'bg-cyan-100 text-cyan-800' },
  { id: 'Proposal', label: '3. Proposal Sent', color: 'border-amber-300 bg-amber-50/40', badge: 'bg-amber-100 text-amber-800' },
  { id: 'Negotiation', label: '4. In Negotiation', color: 'border-purple-300 bg-purple-50/40', badge: 'bg-purple-100 text-purple-800' },
  { id: 'Won', label: '5. Closed Won', color: 'border-emerald-300 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800' },
  { id: 'Lost', label: '6. Closed Lost', color: 'border-red-300 bg-red-50/40', badge: 'bg-red-100 text-red-800' },
];

export const PipelineBoard: React.FC<PipelineBoardProps> = ({
  leads,
  currentUser,
  onUpdateLeads,
}) => {
  const isRM = currentUser?.role === 'RM';
  const [pipelineScope, setPipelineScope] = useState<'mine' | 'all'>(isRM ? 'mine' : 'all');

  const visibleLeads = pipelineScope === 'mine' && currentUser
    ? leads.filter(l => l.assignedRMId === currentUser.rmId || l.assignedRMName === currentUser.name)
    : leads;

  const moveLeadToStage = (leadId: string, newStage: LeadStatus) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: newStage,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return l;
    });
    onUpdateLeads(updated);
    addCrmAuditLog(
      'User',
      'PIPELINE_MOVED',
      'Sales Pipeline',
      `Moved lead ${leadId} to stage ${newStage}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Kanban className="w-5 h-5 text-blue-600" />
            <span>{isRM ? 'Active Pipeline Board' : 'Interactive Sales Pipeline Kanban'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRM
              ? `Real-time active deals, quotes, and opportunity stages for ${currentUser?.name || 'Relationship Manager'}`
              : 'Drag and track deal progressions through corporate underwriting, proposal submission, and policy closure'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isRM && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setPipelineScope('mine')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pipelineScope === 'mine' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Deals ({leads.filter(l => l.assignedRMId === currentUser?.rmId || l.assignedRMName === currentUser?.name).length})
              </button>
              <button
                type="button"
                onClick={() => setPipelineScope('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pipelineScope === 'all' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Team ({leads.length})
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <span>Pipeline Value:</span>
            <span className="font-extrabold text-blue-900 font-mono text-sm">
              {formatINR(visibleLeads.reduce((s, l) => s + (l.expectedPremium || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
        {STAGES.map((stage, stageIdx) => {
          const stageLeads = visibleLeads.filter(l => l.status === stage.id);
          const stageValue = stageLeads.reduce((s, l) => s + (l.expectedPremium || 0), 0);

          return (
            <div
              key={stage.id}
              className={`rounded-2xl border ${stage.color} p-3 space-y-3 flex flex-col min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    {stage.label}
                  </span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${stage.badge}`}>
                    {stageLeads.length}
                  </span>
                </div>
                <div className="text-[11px] font-black text-slate-700 font-mono">
                  {formatINR(stageValue)}
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[650px] no-scrollbar">
                {stageLeads.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-200/60 rounded-xl">
                    No active deals in this stage
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:shadow-xs transition-all"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 line-clamp-1">
                          {lead.companyName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {lead.id} • {lead.city}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          {lead.lob}
                        </span>
                        <span className="font-extrabold text-slate-900 font-mono">
                          {formatINR(lead.expectedPremium)}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate max-w-[90px] font-medium">
                          {lead.assignedRMName || 'Unassigned'}
                        </span>

                        {/* Move stage buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {stageIdx > 0 && (
                            <button
                              onClick={() => moveLeadToStage(lead.id, STAGES[stageIdx - 1].id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-800 cursor-pointer"
                              title={`Move to ${STAGES[stageIdx - 1].label}`}
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {stageIdx < STAGES.length - 1 && (
                            <button
                              onClick={() => moveLeadToStage(lead.id, STAGES[stageIdx + 1].id)}
                              className="p-1 hover:bg-blue-50 rounded text-blue-600 hover:text-blue-800 cursor-pointer"
                              title={`Move to ${STAGES[stageIdx + 1].label}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
