import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Phone, 
  Mail, 
  Building2, 
  DollarSign, 
  Calendar, 
  Download, 
  Trash2, 
  Edit3, 
  ChevronRight,
  Kanban,
  Table as TableIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';

export type CRMStage = 
  | 'lead' 
  | 'contacted' 
  | 'proposal' 
  | 'negotiation' 
  | 'won' 
  | 'lost';

export interface CRMDeal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  value: number; // in INR (₹)
  stage: CRMStage;
  priority: 'High' | 'Medium' | 'Low';
  expectedClose: string;
  notes?: string;
}

const INITIAL_DEALS: CRMDeal[] = [
  {
    id: 'deal-101',
    title: 'Enterprise AI Dashboard Suite',
    company: 'Tata Consultancy Services',
    contactName: 'Rajesh Sharma',
    email: 'r.sharma@tcs.com',
    phone: '+91 98201 12345',
    value: 1250000,
    stage: 'negotiation',
    priority: 'High',
    expectedClose: '2026-10-25',
    notes: 'Contract review in progress with legal team'
  },
  {
    id: 'deal-102',
    title: 'Retail Analytics & Live Workbook Sync',
    company: 'Reliance Retail Ventures',
    contactName: 'Priya Sundaram',
    email: 'priya.s@relianceretail.in',
    phone: '+91 98450 67890',
    value: 1800000,
    stage: 'won',
    priority: 'High',
    expectedClose: '2026-10-05',
    notes: 'Signed annual enterprise subscription'
  },
  {
    id: 'deal-103',
    title: 'Financial Risk Visualizer',
    company: 'HDFC Bank Corporate Banking',
    contactName: 'Amitabh Sen',
    email: 'amitabh.sen@hdfcbank.com',
    phone: '+91 99100 45678',
    value: 850000,
    stage: 'proposal',
    priority: 'Medium',
    expectedClose: '2026-11-10',
    notes: 'Proposal submitted; awaiting budget committee meeting'
  },
  {
    id: 'deal-104',
    title: 'Cloud Data Pipeline & Map Analytics',
    company: 'Infosys BPM Limited',
    contactName: 'Sneha Kulkarni',
    email: 'sneha.k@infosys.com',
    phone: '+91 97312 34567',
    value: 620000,
    stage: 'contacted',
    priority: 'Medium',
    expectedClose: '2026-11-18',
    notes: 'Product demo conducted with technical leads'
  },
  {
    id: 'deal-105',
    title: 'Student Analytics Platform',
    company: 'Amity Education Group',
    contactName: 'Dr. Vivek Malhotra',
    email: 'vmalhotra@amity.edu',
    phone: '+91 98111 89012',
    value: 350000,
    stage: 'lead',
    priority: 'Low',
    expectedClose: '2026-12-01',
    notes: 'Inbound inquiry from educational webinar'
  },
  {
    id: 'deal-106',
    title: 'Automated KPI Tracking System',
    company: 'Mahindra Logistics',
    contactName: 'Kunal Joshi',
    email: 'joshi.kunal@mahindra.com',
    phone: '+91 98220 98765',
    value: 450000,
    stage: 'won',
    priority: 'Medium',
    expectedClose: '2026-09-30',
    notes: 'Implementation scheduled for next week'
  }
];

const STAGES_CONFIG: { id: CRMStage; label: string; color: string; border: string; bg: string }[] = [
  { id: 'lead', label: 'New Leads', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
  { id: 'contacted', label: 'Contacted / Demo', color: 'text-purple-700', border: 'border-purple-200', bg: 'bg-purple-50' },
  { id: 'proposal', label: 'Proposal Sent', color: 'text-amber-700', border: 'border-amber-200', bg: 'bg-amber-50' },
  { id: 'negotiation', label: 'In Negotiation', color: 'text-orange-700', border: 'border-orange-200', bg: 'bg-orange-50' },
  { id: 'won', label: 'Closed Won', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { id: 'lost', label: 'Closed Lost', color: 'text-slate-600', border: 'border-slate-200', bg: 'bg-slate-50' },
];

export const SalesCRMTool: React.FC = () => {
  const [deals, setDeals] = useState<CRMDeal[]>(INITIAL_DEALS);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new deal
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newStage, setNewStage] = useState<CRMStage>('lead');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newExpectedClose, setNewExpectedClose] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Calculations
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = selectedStageFilter === 'all' || deal.stage === selectedStageFilter;
    return matchesSearch && matchesStage;
  });

  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const activeDealsCount = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
  const wonCount = deals.filter(d => d.stage === 'won').length;
  const winRate = deals.length > 0 ? Math.round((wonCount / deals.length) * 100) : 0;

  const formatCurrency = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    const newDeal: CRMDeal = {
      id: `deal-${Date.now()}`,
      title: newTitle.trim(),
      company: newCompany.trim(),
      contactName: newContact.trim() || 'Direct Contact',
      email: newEmail.trim() || 'contact@client.com',
      phone: newPhone.trim() || '+91 90000 00000',
      value: Number(newValue) || 100000,
      stage: newStage,
      priority: newPriority,
      expectedClose: newExpectedClose || new Date().toISOString().split('T')[0],
      notes: newNotes.trim()
    };

    setDeals([newDeal, ...deals]);
    setIsAddModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewCompany('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewValue('');
    setNewNotes('');
  };

  const handleChangeStage = (dealId: string, nextStage: CRMStage) => {
    setDeals(deals.map(d => d.id === dealId ? { ...d, stage: nextStage } : d));
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals(deals.filter(d => d.id !== dealId));
  };

  const handleExportToExcel = () => {
    const exportData = deals.map((d, index) => ({
      'S.No': index + 1,
      'Deal Title': d.title,
      'Company Name': d.company,
      'Contact Person': d.contactName,
      'Email': d.email,
      'Mobile Phone': d.phone,
      'Deal Value (INR)': d.value,
      'Pipeline Stage': d.stage.toUpperCase(),
      'Priority': d.priority,
      'Expected Close Date': d.expectedClose,
      'Notes': d.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales CRM Deals');
    XLSX.writeFile(workbook, `Bharat1_Sales_CRM_${Date.now()}.xlsx`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center shadow-xs">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Sales CRM & Pipeline Manager
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                Live Deals
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track customer accounts, deal stages, pipeline values, and convert prospects into closed revenue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportToExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Deals to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Deal</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Pipeline Value
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(totalPipelineValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">{deals.length} Total</span> deals across all stages
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Revenue Closed Won
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(wonValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{wonCount} Won Customers</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Deals In Progress
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-1">
            {activeDealsCount} Deals
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Avg size {formatCurrency(Math.round(totalPipelineValue / (deals.length || 1)))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Win Conversion Rate
          </div>
          <div className="text-xl font-extrabold text-purple-600 mt-1">
            {winRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            <span>High conversion momentum</span>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deals, company, or contact..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">All Stages</option>
            {STAGES_CONFIG.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* 1. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {STAGES_CONFIG.map((stage) => {
            const stageDeals = filteredDeals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div 
                key={stage.id} 
                className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-3 space-y-3 min-h-[420px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <h3 className="text-xs font-extrabold text-slate-900 truncate">
                      {stage.label}
                    </h3>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="text-[10px] font-semibold text-slate-500 font-mono">
                  {formatCurrency(stageValue)}
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto no-scrollbar">
                  {stageDeals.map((deal) => (
                    <div 
                      key={deal.id}
                      className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:shadow-xs transition-shadow space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-2">
                          {deal.title}
                        </h4>
                        <button
                          onClick={() => handleDeleteDeal(deal.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity cursor-pointer"
                          title="Delete deal"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{deal.company}</span>
                      </div>

                      <div className="text-xs font-extrabold text-red-600 font-mono">
                        {formatCurrency(deal.value)}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate">{deal.contactName}</span>
                        <span className="font-mono">{deal.expectedClose}</span>
                      </div>

                      {/* Quick stage transition button */}
                      <div className="pt-1 flex items-center gap-1 justify-end">
                        <select
                          value={deal.stage}
                          onChange={(e) => handleChangeStage(deal.id, e.target.value as CRMStage)}
                          className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 cursor-pointer font-semibold outline-none"
                        >
                          {STAGES_CONFIG.map(s => (
                            <option key={s.id} value={s.id}>Move: {s.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="text-center py-8 text-[11px] text-slate-400 italic">
                      No deals in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Deal & Company</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Target Close</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{deal.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{deal.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{deal.contactName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{deal.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-extrabold text-red-600 font-mono">
                      {formatCurrency(deal.value)}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={deal.stage}
                        onChange={(e) => handleChangeStage(deal.id, e.target.value as CRMStage)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 cursor-pointer outline-none"
                      >
                        {STAGES_CONFIG.map(s => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        deal.priority === 'High' ? 'bg-red-100 text-red-700' :
                        deal.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {deal.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {deal.expectedClose}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteDeal(deal.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete deal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Add New CRM Deal</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Annual Software License"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Reliance Group"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Deal Value (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    placeholder="e.g. Amit Verma"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Initial Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as CRMStage)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-semibold"
                  >
                    {STAGES_CONFIG.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-semibold"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Close</label>
                  <input
                    type="date"
                    value={newExpectedClose}
                    onChange={(e) => setNewExpectedClose(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-98"
                >
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
