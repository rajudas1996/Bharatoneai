import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  X, 
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { CRMLead, CRMUser, LOBType, LeadStatus } from '../../types/crm.types';
import { 
  formatINR, 
  downloadLeadExcelTemplate, 
  exportLeadsToExcel, 
  addCrmAuditLog 
} from '../../utils/crmStore';

interface ManageLeadsProps {
  leads: CRMLead[];
  users: CRMUser[];
  currentUser: CRMUser | null;
  onUpdateLeads: (leads: CRMLead[]) => void;
  onNavigateToAssign?: () => void;
}

export const ManageLeads: React.FC<ManageLeadsProps> = ({
  leads,
  users,
  currentUser,
  onUpdateLeads,
  onNavigateToAssign,
}) => {
  const isRM = currentUser?.role === 'RM';

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('All');
  const [filterLOB, setFilterLOB] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterRM, setFilterRM] = useState('All');

  // Selected lead IDs for bulk actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CRMLead | null>(null);

  // New Lead Form state
  const [formData, setFormData] = useState<Partial<CRMLead>>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    state: 'Maharashtra',
    city: 'Mumbai',
    industry: 'Information Technology',
    lob: 'Group Health',
    expectedPremium: 5000000,
    renewalMonth: 'October',
    source: 'Website',
    status: 'New',
    assignedRMId: '',
    assignedRMName: '',
    remarks: ''
  });

  // Excel Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Relationship Managers list
  const rms = users.filter(u => u.role === 'RM');

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = filterState === 'All' || l.state === filterState;
    const matchesLOB = filterLOB === 'All' || l.lob === filterLOB;
    const matchesStatus = filterStatus === 'All' || l.status === filterStatus;
    const matchesRM = filterRM === 'All' || l.assignedRMId === filterRM || (filterRM === 'unassigned' && !l.assignedRMId);

    return matchesSearch && matchesState && matchesLOB && matchesStatus && matchesRM;
  });

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter(i => i !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  // Add / Edit Lead Handler
  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone) {
      alert('Please fill company name, contact person and phone number.');
      return;
    }

    const assignedRM = rms.find(r => r.rmId === formData.assignedRMId);

    if (editingLead) {
      // Update
      const updated = leads.map(l => {
        if (l.id === editingLead.id) {
          return {
            ...l,
            ...formData,
            assignedRMName: assignedRM ? assignedRM.name : formData.assignedRMName,
            updatedAt: new Date().toISOString().split('T')[0]
          } as CRMLead;
        }
        return l;
      });
      onUpdateLeads(updated);
      addCrmAuditLog(
        currentUser?.name || 'Admin',
        'LEAD_UPDATED',
        'Manage Leads',
        `Updated lead details for ${formData.companyName} (${editingLead.id})`
      );
      setEditingLead(null);
    } else {
      // Create new
      const newId = `LEAD-${1000 + leads.length + 1}`;
      const newLead: CRMLead = {
        id: newId,
        companyName: formData.companyName || '',
        contactPerson: formData.contactPerson || '',
        phone: formData.phone || '',
        email: formData.email || '',
        state: formData.state || 'Maharashtra',
        city: formData.city || 'Mumbai',
        industry: formData.industry || 'Information Technology',
        lob: (formData.lob as LOBType) || 'Group Health',
        expectedPremium: Number(formData.expectedPremium) || 1000000,
        renewalMonth: formData.renewalMonth || 'October',
        source: formData.source || 'Direct',
        assignedRMId: formData.assignedRMId || undefined,
        assignedRMName: assignedRM ? assignedRM.name : undefined,
        status: (formData.status as LeadStatus) || 'New',
        remarks: formData.remarks || '',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onUpdateLeads([newLead, ...leads]);
      addCrmAuditLog(
        currentUser?.name || 'Admin',
        'LEAD_CREATED',
        'Manage Leads',
        `Added new corporate lead for ${newLead.companyName} with ₹${newLead.expectedPremium}`
      );
      setIsAddModalOpen(false);
    }
  };

  // Delete Lead
  const handleDeleteLead = (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      const remaining = leads.filter(l => l.id !== id);
      onUpdateLeads(remaining);
      addCrmAuditLog(
        currentUser?.name || 'Admin',
        'LEAD_DELETED',
        'Manage Leads',
        `Deleted lead ${id}`
      );
    }
  };

  // Handle Excel File Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          setImportError('The uploaded Excel file does not contain any data rows.');
          return;
        }

        setParsedPreview(data);
      } catch (err) {
        setImportError('Failed to parse Excel file. Please use the official template.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    setIsImporting(true);

    try {
      const importedLeads: CRMLead[] = parsedPreview.map((row: any, index: number) => {
        const id = `LEAD-${1000 + leads.length + index + 1}`;
        return {
          id,
          companyName: String(row['Company Name'] || row['companyName'] || `Enterprise Account ${index + 1}`),
          contactPerson: String(row['Contact Person'] || row['contactPerson'] || 'Primary Contact'),
          phone: String(row['Phone Number'] || row['Phone'] || row['phone'] || '+91 98000 00000'),
          email: String(row['Email'] || row['email'] || ''),
          state: String(row['State'] || 'Maharashtra'),
          city: String(row['City'] || 'Mumbai'),
          industry: String(row['Industry'] || 'Information Technology'),
          lob: (row['Line of Business (LOB)'] || row['LOB'] || 'Group Health') as LOBType,
          expectedPremium: Number(row['Expected Premium (INR)'] || row['expectedPremium'] || 5000000),
          renewalMonth: String(row['Renewal Month'] || 'October'),
          source: String(row['Lead Source'] || 'Excel Bulk Import'),
          status: 'New',
          remarks: String(row['Remarks'] || 'Imported via Excel Batch'),
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      });

      onUpdateLeads([...importedLeads, ...leads]);
      addCrmAuditLog(
        currentUser?.name || 'Admin',
        'EXCEL_LEADS_IMPORTED',
        'Manage Leads',
        `Successfully imported ${importedLeads.length} leads from ${importFile?.name || 'Excel'}`
      );
      setIsImportModalOpen(false);
      setParsedPreview([]);
      setImportFile(null);
    } catch (err) {
      setImportError('Error importing data into CRM database.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>{isRM ? 'Raw Leads Database' : 'Master Lead Database'}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 font-mono">
              {filteredLeads.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRM
              ? 'Raw leads database for client discovery, cold calling, and booking in-person meeting conversions'
              : 'Search, filter, allocate, or import corporate insurance tenders and client portfolios'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template */}
          <button
            onClick={downloadLeadExcelTemplate}
            className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download formatted Excel template for uploading leads"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Template (.xlsx)</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Excel</span>
          </button>

          {/* Export Filtered */}
          <button
            onClick={() => exportLeadsToExcel(filteredLeads)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ({filteredLeads.length})</span>
          </button>

          {/* Add Lead */}
          <button
            onClick={() => {
              setFormData({
                companyName: '',
                contactPerson: '',
                phone: '',
                email: '',
                state: 'Maharashtra',
                city: 'Mumbai',
                industry: 'Information Technology',
                lob: 'Group Health',
                expectedPremium: 5000000,
                renewalMonth: 'October',
                source: 'Website',
                status: 'New'
              });
              setEditingLead(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Global Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, contact, city..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* Filter: Line of Business */}
          <div>
            <select
              value={filterLOB}
              onChange={(e) => setFilterLOB(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Lines of Business (LOB)</option>
              <option value="Group Health">Group Health</option>
              <option value="Fire & Special Perils">Fire & Special Perils</option>
              <option value="Marine Cargo">Marine Cargo</option>
              <option value="Directors & Officers">Directors & Officers</option>
              <option value="Cyber Risk">Cyber Risk</option>
              <option value="Commercial Motor">Commercial Motor</option>
              <option value="Keyman Life">Keyman Life</option>
              <option value="Liability & Crime">Liability & Crime</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
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

          {/* Filter: State */}
          <div>
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Indian States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          {/* Filter: Relationship Manager */}
          <div>
            <select
              value={filterRM}
              onChange={(e) => setFilterRM(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Assigned RMs</option>
              <option value="unassigned">⚠️ Unassigned Only</option>
              {rms.map(r => (
                <option key={r.id} value={r.rmId}>{r.name} ({r.rmId})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Leads Bulk Bar */}
        {selectedLeadIds.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs font-bold text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">
                {selectedLeadIds.length}
              </span>
              <span>leads selected for action</span>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToAssign && (
                <button
                  onClick={onNavigateToAssign}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Assign to RM</span>
                </button>
              )}
              <button
                onClick={() => setSelectedLeadIds([])}
                className="px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 rounded-lg text-xs transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Lead ID & Company</th>
                <th className="py-3 px-3">Contact Person</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Line of Business</th>
                <th className="py-3 px-3">Expected Premium</th>
                <th className="py-3 px-3">Renewal</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned RM</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No leads match your filter criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the filters or upload new leads via Excel</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((l) => {
                  const isChecked = selectedLeadIds.includes(l.id);

                  return (
                    <tr key={l.id} className={`hover:bg-slate-50/80 transition-colors ${isChecked ? 'bg-blue-50/40' : ''}`}>
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(l.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Lead ID & Company */}
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>{l.companyName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {l.id} • {l.industry}
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{l.contactPerson}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{l.phone}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-slate-700">
                        <div className="font-semibold">{l.city}</div>
                        <div className="text-[11px] text-slate-400">{l.state}</div>
                      </td>

                      {/* LOB */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 whitespace-nowrap">
                          {l.lob}
                        </span>
                      </td>

                      {/* Expected Premium */}
                      <td className="py-3 px-3 font-black text-slate-900 font-mono">
                        {formatINR(l.expectedPremium)}
                      </td>

                      {/* Renewal Month */}
                      <td className="py-3 px-3 text-slate-600 font-semibold">
                        {l.renewalMonth}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          l.status === 'Won' ? 'bg-emerald-100 text-emerald-800' :
                          l.status === 'Negotiation' ? 'bg-purple-100 text-purple-800' :
                          l.status === 'Proposal' ? 'bg-amber-100 text-amber-800' :
                          l.status === 'Contacted' ? 'bg-cyan-100 text-cyan-800' :
                          l.status === 'Lost' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>

                      {/* Assigned RM */}
                      <td className="py-3 px-3">
                        {l.assignedRMName ? (
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{l.assignedRMName}</span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingLead(l);
                              setFormData({ ...l });
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Lead"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLead(l.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* MODAL: ADD / EDIT LEAD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="text-sm font-extrabold text-slate-900">
                {editingLead ? `Edit Lead: ${editingLead.companyName}` : 'Add New Corporate Lead'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Tata Steel Limited"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Sanjay Verma"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sanjay@tatasteel.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="West Bengal">West Bengal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Line of Business (LOB)</label>
                  <select
                    value={formData.lob}
                    onChange={(e) => setFormData({ ...formData, lob: e.target.value as LOBType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="Group Health">Group Health</option>
                    <option value="Fire & Special Perils">Fire & Special Perils</option>
                    <option value="Marine Cargo">Marine Cargo</option>
                    <option value="Directors & Officers">Directors & Officers</option>
                    <option value="Cyber Risk">Cyber Risk</option>
                    <option value="Commercial Motor">Commercial Motor</option>
                    <option value="Keyman Life">Keyman Life</option>
                    <option value="Liability & Crime">Liability & Crime</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected Premium (INR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.expectedPremium}
                    onChange={(e) => setFormData({ ...formData, expectedPremium: Number(e.target.value) })}
                    placeholder="5000000"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Assign to RM</label>
                  <select
                    value={formData.assignedRMId || ''}
                    onChange={(e) => setFormData({ ...formData, assignedRMId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                  >
                    <option value="">Leave Unassigned</option>
                    {rms.map(r => (
                      <option key={r.id} value={r.rmId}>{r.name} ({r.rmId})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Remarks / Tender Notes</label>
                <textarea
                  rows={2}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Notes about quotation, broker partner, or meeting dates"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {editingLead ? 'Update Lead' : 'Save to CRM Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCEL IMPORT */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bulk Lead Upload from Excel (.xlsx)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedPreview([]);
                  setImportFile(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Step 1: Download Template */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Step 1: Download Standard Template</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Pre-configured with Company, LOB, Premium, State, and Contact columns
                  </div>
                </div>
                <button
                  onClick={downloadLeadExcelTemplate}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Get Template</span>
                </button>
              </div>

              {/* Step 2: Upload File */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Step 2: Select Filled Excel File (.xlsx, .xls)
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="excel-file-input"
                  />
                  <label htmlFor="excel-file-input" className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-800">
                      {importFile ? importFile.name : 'Click to browse and upload Excel spreadsheet'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Standard columns will be mapped to CRM database automatically
                    </div>
                  </label>
                </div>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Step 3: Preview */}
              {parsedPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Validation Preview: {parsedPreview.length} leads detected</span>
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Ready for Import
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-[11px] divide-y divide-slate-100">
                    {parsedPreview.slice(0, 5).map((row, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-800">
                            {row['Company Name'] || row['companyName'] || `Lead #${idx + 1}`}
                          </div>
                          <div className="text-slate-500">
                            {row['Line of Business (LOB)'] || row['lob'] || 'Group Health'} • {row['City'] || 'Mumbai'}
                          </div>
                        </div>
                        <div className="font-bold font-mono text-blue-900">
                          ₹{Number(row['Expected Premium (INR)'] || row['expectedPremium'] || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                    {parsedPreview.length > 5 && (
                      <div className="p-2 text-center text-slate-400 text-[10px] bg-slate-50">
                        + {parsedPreview.length - 5} additional leads
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedPreview.length === 0 || isImporting}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {isImporting ? 'Importing...' : `Confirm Import (${parsedPreview.length} Leads)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
