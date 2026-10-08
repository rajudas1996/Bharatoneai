import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import { CRMAccount, CRMContact, CRMLead } from '../../types/crm.types';
import { formatINR } from '../../utils/crmStore';

interface AllAccountsProps {
  accounts: CRMAccount[];
  contacts: CRMContact[];
  leads: CRMLead[];
  onUpdateAccounts: (accounts: CRMAccount[]) => void;
}

export const AllAccounts: React.FC<AllAccountsProps> = ({
  accounts,
  contacts,
  leads,
  onUpdateAccounts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState<CRMAccount | null>(null);

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.gstin && acc.gstin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || acc.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Corporate Account Directory</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 font-mono">
              {filteredAccounts.length} Companies
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Master directory of corporate clients, registered entities, pan-India offices, and active insurance covers
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, city, GSTIN..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Industry:</span>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Industries</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Retail & FMCG">Retail & FMCG</option>
            <option value="IT & ITES">IT & ITES</option>
            <option value="Healthcare & Pharma">Healthcare & Pharma</option>
            <option value="Food Delivery & Tech">Food Delivery & Tech</option>
            <option value="IT Consulting">IT Consulting</option>
          </select>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const accContacts = contacts.filter(c => c.accountId === acc.id || c.companyName === acc.companyName);
          const accLeads = leads.filter(l => l.companyName === acc.companyName);

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{acc.companyName}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">{acc.industry}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    acc.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {acc.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{acc.city}, {acc.state}</span>
                  </div>
                  {acc.gstin && (
                    <div className="text-[11px] font-mono text-slate-500">
                      GSTIN: {acc.gstin}
                    </div>
                  )}
                  {acc.annualTurnover && (
                    <div className="text-[11px] text-slate-500 font-semibold">
                      Turnover: {acc.annualTurnover}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom stats & action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 font-medium">
                  <span className="font-bold text-slate-900">{accContacts.length}</span> contacts •{' '}
                  <span className="font-bold text-blue-700">{accLeads.length}</span> active leads
                </div>

                <button
                  onClick={() => setSelectedAccount(acc)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACCOUNT DETAIL MODAL */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{selectedAccount.companyName}</h3>
                <p className="text-[11px] text-slate-500">{selectedAccount.industry} • Account ID: {selectedAccount.id}</p>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Corporate Overview */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Location:</span>
                  <span className="font-semibold text-slate-800">{selectedAccount.city}, {selectedAccount.state}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">GSTIN:</span>
                  <span className="font-mono text-slate-800">{selectedAccount.gstin || 'Not submitted'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Annual Turnover:</span>
                  <span className="font-bold text-slate-800">{selectedAccount.annualTurnover || 'Confidential'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Relationship Manager:</span>
                  <span className="font-bold text-blue-700">{selectedAccount.assignedRMName || 'Unassigned'}</span>
                </div>
              </div>

              {/* Linked Contacts */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Key Contact Persons
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {contacts
                    .filter(c => c.accountId === selectedAccount.id || c.companyName === selectedAccount.companyName)
                    .map((c) => (
                      <div key={c.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{c.name}</div>
                          <div className="text-[11px] text-slate-500">{c.designation} • {c.department}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-600">
                          <div>{c.phone}</div>
                          <div className="text-blue-600">{c.email}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Linked Policies & Leads */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Associated Leads & In-Force Covers
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {leads
                    .filter(l => l.companyName === selectedAccount.companyName)
                    .map((l) => (
                      <div key={l.id} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{l.lob}</div>
                          <div className="text-[11px] text-slate-500">Status: <span className="font-bold">{l.status}</span></div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900 font-mono">{formatINR(l.expectedPremium)}</div>
                          <div className="text-[10px] text-slate-400">Renewal: {l.renewalMonth}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
