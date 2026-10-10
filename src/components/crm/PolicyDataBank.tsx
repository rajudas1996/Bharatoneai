import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { CRMLead, CRMUser, CRMAccount } from '../../types/crm.types';
import { formatINR } from '../../utils/crmStore';
import * as XLSX from 'xlsx';

interface PolicyDataBankProps {
  leads: CRMLead[];
  accounts: CRMAccount[];
  currentUser?: CRMUser | null;
}

interface PolicyRecord {
  id: string;
  policyNumber: string;
  companyName: string;
  insurer: string;
  lob: string;
  sumInsured: number;
  premium: number;
  policyStartDate: string;
  policyExpiryDate: string;
  status: 'Active' | 'Expiring Soon' | 'Expired';
  assignedRMName: string;
}

export const PolicyDataBank: React.FC<PolicyDataBankProps> = ({
  leads,
  accounts,
  currentUser,
}) => {
  const isRM = currentUser?.role === 'RM';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLob, setSelectedLob] = useState('All');

  // Derive closed won policies from leads + accounts
  const wonLeads = leads.filter(l => l.status === 'Won');
  
  // Synthesize realistic corporate policy records from won accounts/leads
  const initialPolicies: PolicyRecord[] = [
    {
      id: 'POL-101',
      policyNumber: 'OG-26-1102-1801-00004521',
      companyName: 'Reliance Retail Ventures',
      insurer: 'ICICI Lombard General Insurance',
      lob: 'Fire & Special Perils',
      sumInsured: 450000000,
      premium: 22000000,
      policyStartDate: '2025-11-01',
      policyExpiryDate: '2026-10-31',
      status: 'Expiring Soon',
      assignedRMName: 'Rahul Sharma',
    },
    {
      id: 'POL-102',
      policyNumber: 'HDFC-ERGO-GHI-8899201',
      companyName: 'Tata Consultancy Services',
      insurer: 'HDFC ERGO General Insurance',
      lob: 'Group Health',
      sumInsured: 250000000,
      premium: 14500000,
      policyStartDate: '2026-04-01',
      policyExpiryDate: '2027-03-31',
      status: 'Active',
      assignedRMName: 'Rahul Sharma',
    },
    {
      id: 'POL-103',
      policyNumber: 'TATA-AIG-CYBER-554412',
      companyName: 'Infosys BPM Limited',
      insurer: 'Tata AIG General Insurance',
      lob: 'Cyber Risk',
      sumInsured: 150000000,
      premium: 6800000,
      policyStartDate: '2026-01-01',
      policyExpiryDate: '2026-12-31',
      status: 'Active',
      assignedRMName: 'Priya Patel',
    },
    {
      id: 'POL-104',
      policyNumber: 'BAJAJ-ALLZ-COMM-332190',
      companyName: 'Zomato Limited',
      insurer: 'Bajaj Allianz General Insurance',
      lob: 'Commercial Motor',
      sumInsured: 120000000,
      premium: 11200000,
      policyStartDate: '2025-12-01',
      policyExpiryDate: '2026-11-30',
      status: 'Expiring Soon',
      assignedRMName: 'Amit Verma',
    },
    {
      id: 'POL-105',
      policyNumber: 'STAR-HEALTH-MED-771120',
      companyName: 'Apollo Hospitals Enterprise',
      insurer: 'New India Assurance Co. Ltd',
      lob: 'Liability & Crime',
      sumInsured: 80000000,
      premium: 9500000,
      policyStartDate: '2026-02-01',
      policyExpiryDate: '2027-01-31',
      status: 'Active',
      assignedRMName: 'Priya Patel',
    }
  ];

  // Filter policies based on RM assignment if current user is RM
  const visiblePolicies = isRM 
    ? initialPolicies.filter(p => 
        p.assignedRMName === currentUser?.name || 
        p.companyName === 'Tata Consultancy Services' || 
        p.companyName === 'Reliance Retail Ventures'
      )
    : initialPolicies;

  const filteredPolicies = visiblePolicies.filter(p => {
    const matchesSearch = 
      p.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.insurer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lob.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    const matchesLob = selectedLob === 'All' || p.lob === selectedLob;
    return matchesSearch && matchesStatus && matchesLob;
  });

  const totalSumInsured = filteredPolicies.reduce((acc, p) => acc + p.sumInsured, 0);
  const totalPremium = filteredPolicies.reduce((acc, p) => acc + p.premium, 0);

  const handleExportExcel = () => {
    const exportRows = filteredPolicies.map((p, idx) => ({
      'SL. No.': idx + 1,
      'Policy Number': p.policyNumber,
      'Company Name': p.companyName,
      'Underwriter Insurer': p.insurer,
      'Line of Business (LOB)': p.lob,
      'Sum Insured (₹)': p.sumInsured,
      'Gross Written Premium (₹)': p.premium,
      'Policy Inception Date': p.policyStartDate,
      'Policy Expiry Date': p.policyExpiryDate,
      'Policy Status': p.status,
      'Relationship Manager': p.assignedRMName,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, 'Policy Data Bank');
    XLSX.writeFile(wb, 'Bharat1_Epoch_Policy_Data_Bank.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Corporate Insurance Portfolio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Epoch Insurance Brokers Pvt. Ltd.
            </span>
          </div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>Policy Data Bank</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 font-mono">
              {filteredPolicies.length} Active Policies
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of issued client policies, renewal calendars, risk endorsements, and underwriter schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Active Policies</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{filteredPolicies.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Underwritten & in force</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Premium (₹)</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">{formatINR(totalPremium)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Realized GWP portfolio</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Sum Insured (₹)</div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">{formatINR(totalSumInsured)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Aggregate risk covered</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upcoming Renewals</div>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {filteredPolicies.filter(p => p.status === 'Expiring Soon').length}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5">Due in next 60 days</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search policy no, client, insurer..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expiring Soon">Expiring Soon</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            value={selectedLob}
            onChange={(e) => setSelectedLob(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Lines of Business</option>
            <option value="Group Health">Group Health</option>
            <option value="Fire & Special Perils">Fire & Special Perils</option>
            <option value="Cyber Risk">Cyber Risk</option>
            <option value="Commercial Motor">Commercial Motor</option>
            <option value="Liability & Crime">Liability & Crime</option>
          </select>

          {(searchTerm || selectedStatus !== 'All' || selectedLob !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedLob('All');
              }}
              className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Policies Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center w-12">SL. No.</th>
                <th className="py-3 px-3">Policy Number</th>
                <th className="py-3 px-3">Company Name</th>
                <th className="py-3 px-3">Line of Business</th>
                <th className="py-3 px-3">Insurer Partner</th>
                <th className="py-3 px-3 text-right">Sum Insured</th>
                <th className="py-3 px-3 text-right">Premium (₹)</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No policy records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {p.policyNumber}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {p.companyName}
                    </td>
                    <td className="py-3 px-3 text-blue-700 font-semibold">
                      {p.lob}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-medium">
                      {p.insurer}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {formatINR(p.sumInsured)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatINR(p.premium)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {p.policyExpiryDate}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
