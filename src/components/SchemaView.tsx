import React from 'react';
import { Database, Hash, Calendar, Type, CheckCircle, Info, BarChart3, Sparkles, Filter } from 'lucide-react';
import { ColumnMeta } from '../types/dashboard';
import { formatSmartNumber } from '../utils/numberFormat';

interface SchemaViewProps {
  columns: ColumnMeta[];
  totalRows: number;
  onQuickAddChart?: (col: ColumnMeta) => void;
  onQuickAddKPI?: (col: ColumnMeta) => void;
  onToggleFilter?: (key: string) => void;
  filterColumns?: string[];
}

export const SchemaView: React.FC<SchemaViewProps> = ({ 
  columns, 
  totalRows,
  onQuickAddChart,
  onQuickAddKPI,
  onToggleFilter,
  filterColumns = [],
}) => {
  const getTypeBadge = (type: ColumnMeta['type']) => {
    switch (type) {
      case 'numeric':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Hash className="w-3 h-3" /> Numeric
          </span>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            <Calendar className="w-3 h-3" /> Date
          </span>
        );
      case 'categorical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            <Database className="w-3 h-3" /> Categorical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            <Type className="w-3 h-3" /> Text
          </span>
        );
    }
  };

  const getRoleLabel = (role: ColumnMeta['role']) => {
    switch (role) {
      case 'entity_name': return 'Primary Entity (Company/Client/Item)';
      case 'revenue': return 'Financial / Turnover / Sales';
      case 'premium': return 'Premium / Underwriting';
      case 'count': return 'Count / Units';
      case 'location_state': return 'State / Region';
      case 'location_city': return 'City / District';
      case 'industry': return 'Industry / Sector';
      case 'status': return 'Lifecycle / Status';
      case 'agent': return 'RM / Account Owner';
      case 'date': return 'Chronology / Timeline';
      default: return 'General Attribute';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 mb-10 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 mb-6 gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Detected Headers & Column Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic header classification, statistical distribution, and direct visualization triggers
          </p>
        </div>
        <div className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-semibold border border-slate-200 self-start sm:self-auto">
          {columns.length} Detected Headers
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="py-2.5 px-3 font-semibold">Column Header</th>
              <th className="py-2.5 px-3 font-semibold">Inferred Type</th>
              <th className="py-2.5 px-3 font-semibold">Role</th>
              <th className="py-2.5 px-3 font-semibold text-right">Unique Values</th>
              <th className="py-2.5 px-3 font-semibold text-right">Completeness</th>
              <th className="py-2.5 px-3 font-semibold">Statistical Profile</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {columns.map((col) => {
              const completeness = totalRows > 0 ? (((totalRows - col.nullCount) / totalRows) * 100).toFixed(0) : 100;
              const isRevenue = col.role === 'revenue' || col.role === 'premium';
              const isFilterActive = filterColumns.includes(col.key);

              return (
                <tr key={col.key} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                    {col.name}
                  </td>
                  <td className="py-3 px-3">{getTypeBadge(col.type)}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {getRoleLabel(col.role)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                    {col.uniqueValues.length}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    <span className={Number(completeness) < 80 ? 'text-amber-600' : 'text-emerald-600'}>
                      {completeness}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {col.type === 'numeric' && col.min !== undefined && col.max !== undefined ? (
                      <span className="font-mono text-[11px]">
                        Min: {formatSmartNumber(col.min, isRevenue)} | Max: {formatSmartNumber(col.max, isRevenue)} | Avg: {formatSmartNumber(col.avg, isRevenue)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 truncate max-w-xs inline-block">
                        Sample: {col.uniqueValues.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onQuickAddChart && (
                        <button
                          onClick={() => onQuickAddChart(col)}
                          className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                          title="Create Chart from this column"
                        >
                          <BarChart3 className="w-3 h-3" />
                          <span>Chart</span>
                        </button>
                      )}
                      {onQuickAddKPI && (
                        <button
                          onClick={() => onQuickAddKPI(col)}
                          className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          title="Create KPI from this column"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>KPI</span>
                        </button>
                      )}
                      {onToggleFilter && (
                        <button
                          onClick={() => onToggleFilter(col.key)}
                          className={`p-1 rounded transition-colors ${
                            isFilterActive 
                              ? 'bg-red-600 text-white' 
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title="Toggle in Top Filter Bar"
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
