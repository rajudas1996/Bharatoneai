import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  Plus, 
  X, 
  Check, 
  MessageSquare
} from 'lucide-react';
import { CRMContact, CRMAccount } from '../../types/crm.types';

interface AllContactsProps {
  contacts: CRMContact[];
  accounts: CRMAccount[];
  onUpdateContacts: (contacts: CRMContact[]) => void;
}

export const AllContacts: React.FC<AllContactsProps> = ({
  contacts,
  accounts,
  onUpdateContacts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<CRMContact>>({
    name: '',
    companyName: accounts[0]?.companyName || '',
    designation: '',
    department: 'Corporate Risk',
    phone: '',
    email: '',
    isPrimary: true
  });

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;

    const matchedAcc = accounts.find(a => a.companyName === newContact.companyName);

    const contact: CRMContact = {
      id: `CON-${Date.now().toString().slice(-4)}`,
      accountId: matchedAcc?.id || 'ACC-201',
      companyName: newContact.companyName || 'Corporate Client',
      name: newContact.name || '',
      designation: newContact.designation || 'Head of Procurement',
      department: newContact.department || 'Corporate Risk',
      phone: newContact.phone || '',
      email: newContact.email || '',
      isPrimary: Boolean(newContact.isPrimary),
      notes: ''
    };

    onUpdateContacts([contact, ...contacts]);
    setIsAddOpen(false);
    setNewContact({
      name: '',
      companyName: accounts[0]?.companyName || '',
      designation: '',
      department: 'Corporate Risk',
      phone: '',
      email: '',
      isPrimary: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Client & Corporate Contacts Directory</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 font-mono">
              {filteredContacts.length} Contacts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Key enterprise decision-makers, CHROs, Chief Risk Officers, and procurement heads across all accounts
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact Person</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contact, company, designation..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 hover:shadow-xs transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{c.name}</h3>
                <div className="text-xs font-semibold text-blue-700 mt-0.5">{c.designation}</div>
                <div className="text-[11px] text-slate-500">{c.department}</div>
              </div>
              {c.isPrimary && (
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                  Primary
                </span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.companyName}</span>
              </div>
              <div className="text-slate-600 flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.phone}</span>
              </div>
              {c.email && (
                <div className="text-blue-600 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{c.email}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`tel:${c.phone}`}
                className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
              {c.email && (
                <a
                  href={`mailto:${c.email}`}
                  className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD CONTACT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Contact Person</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
                <select
                  value={newContact.companyName}
                  onChange={(e) => setNewContact({ ...newContact, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {accounts.map(a => (
                    <option key={a.id} value={a.companyName}>{a.companyName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={newContact.designation}
                  onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                  placeholder="e.g. Head of Procurement & Risk"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+91 98200 12345"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="ramesh@company.com"
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
