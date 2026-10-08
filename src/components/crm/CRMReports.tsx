import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Users, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { CRMLead, CRMUser } from '../../types/crm.types';
import { formatINR, exportLeadsToExcel } from '../../utils/crmStore';

interface CRMReportsProps {
  leads: CRMLead[];
  users: CRMUser[];
}

export const CRMReports: React.FC<CRMReportsProps> = ({ leads, users }) => {
  const rms = users.filter(u => u.role === 'RM');

  // RM Performance Calculations
  const rmPerformance = rms.map(rm => {
    const rmLeads = leads.filter(l => l.assignedRMId === rm.rmId || l.assignedRMName === rm.name);
    const wonLeads = rmLeads.filter(l => l.status === 'Won');
    const wonPremium = wonLeads.reduce((s, l) => s + (l.expectedPremium || 0), 0);
    const activePipeline = rmLeads
      .filter(l => l.status !== 'Won' && l.status !== 'Lost')
      .reduce((s, l) => s + (l.expectedPremium || 0), 0);
    const conversion = rmLeads.length > 0 ? ((wonLeads.length / rmLeads.length) * 100).toFixed(0) : '0';

    return {
      rm,
      totalCount: rmLeads.length,
      wonCount: wonLeads.length,
      wonPremium,
      activePipeline,
      conversion
    };
  });

  // State-wise Distribution
  const stateDistribution: { [state: string]: { count: number; premium: number; won: number } } = {};
  leads.forEach(l => {
    if (!stateDistribution[l.state]) {
      stateDistribution[l.state] = { count: 0, premium: 0, won: 0 };
    }
    stateDistribution[l.state].count += 1;
    stateDistribution[l.state].premium += l.expectedPremium || 0;
    if (l.status === 'Won') stateDistribution[l.state].won += 1;
  });

  // LOB Distribution
  const lobDistribution: { [lob: string]: { count: number; premium: number } } = {};
  leads.forEach(l => {
    if (!lobDistribution[l.lob]) {
      lobDistribution[l.lob] = { count: 0, premium: 0 };
    }
    lobDistribution[l.lob].count += 1;
    lobDistribution[l.lob].premium += l.expectedPremium || 0;
  });

  const totalWonPremium = leads
    .filter(l => l.status === 'Won')
    .reduce((s, l) => s + (l.expectedPremium || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Reports, RM Realization & Geographic Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Territory conversion funnels, Line of Business performance, and Relationship Manager scorecards
          </p>
        </div>

        <button
          onClick={() => exportLeadsToExcel(leads, 'Bharat1_CRM_Executive_Report.xlsx')}
          className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Full Analytics (.xlsx)</span>
        </button>
      </div>

      {/* RM Scorecard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Relationship Manager Performance Scorecard</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold font-mono">
            Total Won Realization: <strong className="text-emerald-700">{formatINR(totalWonPremium)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">RM Name & ID</th>
                <th className="py-2.5 px-3">Territory / Dept</th>
                <th className="py-2.5 px-3">Allocated Leads</th>
                <th className="py-2.5 px-3">Won Policies</th>
                <th className="py-2.5 px-3">Won Premium (₹)</th>
                <th className="py-2.5 px-3">Active Pipeline (₹)</th>
                <th className="py-2.5 px-3">Win Ratio %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {rmPerformance.map(({ rm, totalCount, wonCount, wonPremium, activePipeline, conversion }) => (
                <tr key={rm.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{rm.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{rm.rmId}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {rm.department}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800">
                    {totalCount}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-black text-emerald-700 bg-emerald-50">
                      {wonCount} Won
                    </span>
                  </td>
                  <td className="py-3 px-3 font-black text-emerald-600 font-mono text-sm">
                    {formatINR(wonPremium)}
                  </td>
                  <td className="py-3 px-3 font-bold text-blue-900 font-mono">
                    {formatINR(activePipeline)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(Number(conversion) * 2, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800 text-[11px]">{conversion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Grid: Geographic Territory & LOB Realization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* State-wise Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>State-wise Geographical Lead Distribution</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto no-scrollbar">
            {Object.entries(stateDistribution).map(([state, data]) => (
              <div key={state} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{state}</div>
                  <div className="text-[11px] text-slate-400">
                    {data.count} enterprise accounts • {data.won} won policies
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-slate-900 font-mono">{formatINR(data.premium)}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Total Premium</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LOB Portfolio Contribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-600" />
            <span>Line of Business (LOB) Premium Contribution</span>
          </h3>

          <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto no-scrollbar">
            {Object.entries(lobDistribution).map(([lob, data]) => {
              const totalAll = leads.reduce((s, l) => s + (l.expectedPremium || 0), 0);
              const share = totalAll > 0 ? ((data.premium / totalAll) * 100).toFixed(1) : '0';

              return (
                <div key={lob} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{lob}</div>
                    <div className="text-[11px] text-slate-400">
                      {data.count} opportunities ({share}% of total pipeline)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-blue-900 font-mono">{formatINR(data.premium)}</div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      Active LOB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
