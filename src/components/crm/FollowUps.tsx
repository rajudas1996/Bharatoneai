import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Phone, 
  Mail, 
  Users, 
  Check, 
  X, 
  Filter, 
  AlertCircle 
} from 'lucide-react';
import { CRMActivity, CRMLead } from '../../types/crm.types';

interface FollowUpsProps {
  activities: CRMActivity[];
  leads: CRMLead[];
  onUpdateActivities: (activities: CRMActivity[]) => void;
}

export const FollowUps: React.FC<FollowUpsProps> = ({
  activities,
  leads,
  onUpdateActivities,
}) => {
  const [filterType, setFilterType] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<CRMActivity>>({
    type: 'Meeting',
    title: '',
    leadCompany: leads[0]?.companyName || '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'High',
    assignedTo: 'Rahul Sharma'
  });

  const filtered = activities.filter(a => filterType === 'All' || a.type === filterType);

  const handleToggleComplete = (id: string) => {
    const updated = activities.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: a.status === 'Completed' ? 'Pending' : 'Completed' as any,
          completedAt: a.status !== 'Completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return a;
    });
    onUpdateActivities(updated);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title) return;

    const activity: CRMActivity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      type: newActivity.type as any || 'Meeting',
      title: newActivity.title || '',
      leadCompany: newActivity.leadCompany,
      description: newActivity.description || '',
      dueDate: newActivity.dueDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: newActivity.priority as any || 'Medium',
      assignedTo: newActivity.assignedTo || 'Rahul Sharma',
      createdBy: 'CurrentUser'
    };

    onUpdateActivities([activity, ...activities]);
    setIsAddOpen(false);
    setNewActivity({
      type: 'Meeting',
      title: '',
      leadCompany: leads[0]?.companyName || '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'High',
      assignedTo: 'Rahul Sharma'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Follow-ups, Tasks & Client Activities</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of corporate meetings, underwriting proposal discussions, and renewal follow-up timelines
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Task / Activity</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Activity Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Activities</option>
            <option value="Meeting">Meetings</option>
            <option value="Call">Phone Calls</option>
            <option value="Quotation">Quotations</option>
            <option value="Follow-up">Follow-ups</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="font-bold text-slate-900">{filtered.length}</span> items
        </div>
      </div>

      {/* Activity Cards List */}
      <div className="space-y-3">
        {filtered.map((act) => {
          const isDone = act.status === 'Completed';

          return (
            <div
              key={act.id}
              className={`p-4 bg-white rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDone ? 'border-slate-200 opacity-60 bg-slate-50/50' : 'border-slate-200/90 shadow-2xs hover:border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggleComplete(act.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                    isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-blue-500 text-transparent'
                  }`}
                  title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                >
                  <Check className="w-4 h-4" />
                </button>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700">
                      {act.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      act.priority === 'High' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {act.priority} Priority
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {act.title}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500">
                    Client: <strong className="text-slate-800">{act.leadCompany || 'Corporate Lead'}</strong> • Assigned: <span className="font-semibold">{act.assignedTo}</span>
                  </div>

                  {act.description && (
                    <div className="text-[11px] text-slate-400 mt-1 max-w-xl">
                      {act.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{act.dueDate}</span>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase ${
                    isDone ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {act.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SCHEDULE ACTIVITY MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-extrabold text-slate-900">Schedule Task / Meeting</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Corporate Client</label>
                <select
                  value={newActivity.leadCompany}
                  onChange={(e) => setNewActivity({ ...newActivity, leadCompany: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {leads.map(l => (
                    <option key={l.id} value={l.companyName}>{l.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Activity Type</label>
                <select
                  value={newActivity.type}
                  onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="Meeting">Meeting (In-person / Virtual)</option>
                  <option value="Call">Phone Call</option>
                  <option value="Quotation">Quotation Submission</option>
                  <option value="Follow-up">General Follow-up</option>
                  <option value="Demo">Platform Demo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="e.g. Discuss Group Health TPA exclusions with HR"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newActivity.dueDate}
                    onChange={(e) => setNewActivity({ ...newActivity, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newActivity.priority}
                    onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  placeholder="Key agenda items, meeting link or venue details"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
