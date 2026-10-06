import React from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Hash, 
  Coins, 
  Layers, 
  Users, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { ColumnMeta, DataRow, DynamicKPIWidget } from '../types/dashboard';
import { calculateKPIValue } from '../utils/dashboardBuilder';

interface DynamicKpiCardsProps {
  kpis: DynamicKPIWidget[];
  columns: ColumnMeta[];
  filteredRows: DataRow[];
  totalRowCount: number;
  onOpenAddKPI: () => void;
  onOpenEditKPI: (kpi: DynamicKPIWidget) => void;
  onDeleteKPI: (id: string) => void;
}

export const DynamicKpiCards: React.FC<DynamicKpiCardsProps> = ({
  kpis,
  columns,
  filteredRows,
  totalRowCount,
  onOpenAddKPI,
  onOpenEditKPI,
  onDeleteKPI,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5 select-none">
      {kpis.map((kpi) => {
        const result = calculateKPIValue(kpi, filteredRows, totalRowCount);
        const col = kpi.columnKey ? columns.find((c) => c.key === kpi.columnKey) : null;

        return (
          <div
            key={kpi.id}
            className="group relative bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 flex flex-col justify-between hover:shadow-md hover:border-red-200 transition-all"
          >
            {/* Top Row: Title + Badges + Hover Actions */}
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <span className="text-xs font-bold text-slate-700 truncate block flex-1" title={kpi.title}>
                {kpi.title}
              </span>

              {/* Hover Edit/Delete Action Buttons */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                <button
                  onClick={() => onOpenEditKPI(kpi)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                  title="Edit KPI"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteKPI(kpi.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove KPI"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Static Aggregation Tag when not hovering */}
              <span className="group-hover:hidden text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-bold uppercase shrink-0">
                {kpi.aggregation.replace('_count', '')}
              </span>
            </div>

            {/* Main Value */}
            <div className="text-xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums mb-1 truncate">
              {result.formatted}
            </div>

            {/* Sub-label */}
            <div className="text-[10px] text-slate-400 truncate flex items-center justify-between">
              <span className="truncate">{result.subLabel || `${kpi.columnKey || 'Records'}`}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 ml-1" />
            </div>
          </div>
        );
      })}

      {/* Quick Add KPI Button Card */}
      <button
        onClick={onOpenAddKPI}
        className="bg-white hover:bg-red-50/50 rounded-xl border border-dashed border-slate-300 hover:border-red-400 p-3.5 flex flex-col items-center justify-center text-center transition-all group min-h-[90px]"
        title="Create new dynamic KPI metric"
      >
        <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-red-100 text-slate-500 group-hover:text-red-600 flex items-center justify-center mb-1 transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-slate-600 group-hover:text-red-700">
          + Add KPI Card
        </span>
      </button>
    </div>
  );
};
