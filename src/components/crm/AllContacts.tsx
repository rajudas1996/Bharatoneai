import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Building2, 
  Plus, 
  X, 
  Check, 
  MessageSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { CRMContact, CRMAccount, CRMUser } from '../../types/crm.types';
import * as XLSX from 'xlsx';

interface AllContactsProps {
  contacts: CRMContact[];
  accounts: CRMAccount[];
  currentUser?: CRMUser | null;
  onUpdateContacts: (contacts: CRMContact[]) => void;
}

type SortColumn = 'companyName' | 'name' | 'designation' | 'phone' | 'email';
type SortOrder = 'asc' | 'desc';

export const AllContacts: React.FC<AllContactsProps> = ({
  contacts,
  accounts,
  currentUser,
  onUpdateContacts,
}) => {
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('All');

  // Direct Click-to-Sort state
  // Default: Sort Company Name A-Z, then within company sort Contact Person Name A-Z
  const [sortColumn, setSortColumn] = useState<SortColumn>('companyName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Add Contact Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newContact, setNewContact] = useState<Partial<CRMContact>>({
    name: '',
    companyName: accounts[0]?.companyName || '',
    designation: '',
    phone: '',
    email: '',
    department: 'Corporate Risk',
    isPrimary: true
  });

  // Excel Import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unique companies list for dropdown
  const uniqueCompanies = useMemo(() => {
    const names = new Set<string>();
    contacts.forEach(c => {
      if (c.companyName) names.add(c.companyName);
    });
    accounts.forEach(a => {
      if (a.companyName) names.add(a.companyName);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [contacts, accounts]);

  // Handle header click-to-sort
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted contacts
  const processedContacts = useMemo(() => {
    // 1. Filter
    const filtered = contacts.filter(c => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q || (
        c.companyName?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.designation?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );

      const matchesCompany = selectedCompany === 'All' || c.companyName === selectedCompany;

      return matchesSearch && matchesCompany;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortColumn === 'companyName') {
        const comp = a.companyName.localeCompare(b.companyName);
        if (comp !== 0) {
          return sortOrder === 'asc' ? comp : -comp;
        }
        // Within same company, secondary sort Contact Person Name A-Z
        return a.name.localeCompare(b.name);
      }

      const valA = (a[sortColumn] || '').toLowerCase();
      const valB = (b[sortColumn] || '').toLowerCase();
      const comp = valA.localeCompare(valB);
      if (comp !== 0) {
        return sortOrder === 'asc' ? comp : -comp;
      }
      return a.companyName.localeCompare(b.companyName);
    });
  }, [contacts, searchTerm, selectedCompany, sortColumn, sortOrder]);

  // Clear All Filters
  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedCompany('All');
    setSortColumn('companyName');
    setSortOrder('asc');
  };

  // Add Contact Handler
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
      phone: '',
      email: '',
      department: 'Corporate Risk',
      isPrimary: true
    });
  };

  // Export Excel Handler: Exports authorized records respecting active filters and sorting
  const handleExportExcel = () => {
    const exportRows = processedContacts.map((c, idx) => ({
      'SL. No.': idx + 1,
      'Company Name': c.companyName,
      'Contact Person Name': c.name,
      'Designation': c.designation || '',
      'Mobile Number': c.phone,
      'Email ID': c.email || '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);

    ws['!cols'] = [
      { wch: 10 }, // SL. No.
      { wch: 32 }, // Company Name
      { wch: 26 }, // Contact Person Name
      { wch: 34 }, // Designation
      { wch: 20 }, // Mobile Number
      { wch: 30 }, // Email ID
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Contact Directory');
    XLSX.writeFile(wb, 'Bharat1_Epoch_Contact_Directory.xlsx');
  };

  // Import Excel Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const newImported: CRMContact[] = rows.map((r, i) => {
          const compName = r['Company Name'] || r['Company'] || r['companyName'] || 'Enterprise Client';
          const personName = r['Contact Person Name'] || r['Contact Person'] || r['Name'] || r['name'] || 'Contact';
          const desig = r['Designation'] || r['Role'] || r['designation'] || '';
          const phoneNum = String(r['Mobile Number'] || r['Phone Number'] || r['Phone'] || r['phone'] || '');
          const mailId = r['Email ID'] || r['Email'] || r['email'] || '';

          return {
            id: `CON-${Date.now().toString().slice(-4)}-${i}`,
            accountId: accounts.find(a => a.companyName.toLowerCase() === compName.toLowerCase())?.id || 'ACC-201',
            companyName: compName,
            name: personName,
            designation: desig,
            department: 'Corporate',
            phone: phoneNum,
            email: mailId,
            isPrimary: i === 0,
            notes: 'Imported via Excel'
          };
        });

        if (newImported.length > 0) {
          onUpdateContacts([...newImported, ...contacts]);
        }
      } catch (err) {
        console.error('Error importing contact excel:', err);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper for sort indicator in table header
  const renderSortIcon = (col: SortColumn) => {
    if (sortColumn !== col) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors ml-1 inline-block" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline-block" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      {/* Header Container & Action Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Epoch Insurance Brokers Pvt. Ltd.
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Key Stakeholders & Decision Makers
            </span>
          </div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Contact Directory</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 font-mono">
              {processedContacts.length} Contacts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Horizontal Excel-style directory of decision-makers, HR heads, procurement leaders, and risk managers
          </p>
        </div>

        {/* 3 Top Action Buttons: Add Contact, Import Excel, Export Excel */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200/80"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Import Excel</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-slate-200/80"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Section Directly Above Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Contacts */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Contacts (Company, Name, Designation, Phone, Email)..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
          />
        </div>

        {/* Company Dropdown & Clear All */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Company:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer w-full md:w-60"
            >
              <option value="All">All Companies</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCompany !== 'All' || sortColumn !== 'companyName' || sortOrder !== 'asc') && (
            <button
              onClick={handleClearAll}
              className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Single Horizontal, Full-Width Excel-Style Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200 select-none">
              <tr>
                {/* 1. SL. No. */}
                <th className="py-3 px-3.5 text-center w-14 border-r border-slate-200/60">
                  SL. No.
                </th>

                {/* 2. Company Name */}
                <th 
                  onClick={() => handleSort('companyName')}
                  className="py-3 px-4 border-r border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Company Name</span>
                    {renderSortIcon('companyName')}
                  </div>
                </th>

                {/* 3. Contact Person Name */}
                <th 
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 border-r border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Contact Person Name</span>
                    {renderSortIcon('name')}
                  </div>
                </th>

                {/* 4. Designation */}
                <th 
                  onClick={() => handleSort('designation')}
                  className="py-3 px-4 border-r border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Designation</span>
                    {renderSortIcon('designation')}
                  </div>
                </th>

                {/* 5. Mobile Number */}
                <th 
                  onClick={() => handleSort('phone')}
                  className="py-3 px-4 border-r border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Mobile Number</span>
                    {renderSortIcon('phone')}
                  </div>
                </th>

                {/* 6. Email ID */}
                <th 
                  onClick={() => handleSort('email')}
                  className="py-3 px-4 border-r border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span>Email ID</span>
                    {renderSortIcon('email')}
                  </div>
                </th>

                {/* 7. Actions */}
                <th className="py-3 px-4 text-center w-32">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {processedContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">No contact records found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or selecting All Companies</p>
                  </td>
                </tr>
              ) : (
                processedContacts.map((c, idx) => {
                  const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
                  const hasPhone = Boolean(c.phone && c.phone.trim());
                  const hasEmail = Boolean(c.email && c.email.trim());

                  return (
                    <tr 
                      key={c.id} 
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. SL. No. */}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono text-[11px] border-r border-slate-100">
                        {idx + 1}
                      </td>

                      {/* 2. Company Name */}
                      <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{c.companyName}</span>
                        </div>
                      </td>

                      {/* 3. Contact Person Name */}
                      <td className="py-3 px-4 font-extrabold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                        {c.name}
                      </td>

                      {/* 4. Designation */}
                      <td className="py-3 px-4 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {c.designation || '—'}
                      </td>

                      {/* 5. Mobile Number */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                        {c.phone || '—'}
                      </td>

                      {/* 6. Email ID */}
                      <td className="py-3 px-4 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {c.email ? (
                          <span className="text-blue-700 hover:underline">{c.email}</span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* 7. Actions: Phone | Email | WhatsApp Compact Icons */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Phone Icon */}
                          {hasPhone ? (
                            <a
                              href={`tel:${c.phone}`}
                              className="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title={`Call ${c.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed"
                              title="Phone number missing"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {/* Email Icon */}
                          {hasEmail ? (
                            <a
                              href={`mailto:${c.email}`}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title={`Send email to ${c.email}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed"
                              title="Email address missing"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {/* WhatsApp Icon */}
                          {hasPhone ? (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title={`Open WhatsApp chat with ${c.name}`}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span
                              className="w-7 h-7 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center cursor-not-allowed"
                              title="Phone number missing for WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-extrabold text-slate-900">Add New Contact Person</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddContact} className="p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                <select
                  value={newContact.companyName}
                  onChange={(e) => setNewContact({ ...newContact, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  {uniqueCompanies.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
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
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Designation</label>
                <input
                  type="text"
                  value={newContact.designation}
                  onChange={(e) => setNewContact({ ...newContact, designation: e.target.value })}
                  placeholder="e.g. Head of Global Procurement"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+91 98201 12345"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email ID</label>
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
