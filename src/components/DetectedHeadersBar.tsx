import React from 'react';
import { 
  Sparkles, 
  SlidersHorizontal, 
  Plus, 
  BarChart3, 
  Filter, 
  Hash, 
  Calendar, 
  Layers, 
  RotateCcw,
  Check,
  ChevronRight
} from 'lucide-react';
import { ColumnMeta, DashboardLayoutConfig } from '../types/dashboard';

interface DetectedHeadersBarProps {
  columns: ColumnMeta[];
  layoutConfig: DashboardLayoutConfig;
  onOpenBuilder: () => void;
  onOpenAddChart: () => void;
  onOpenAddKPI: () => void;
  onOpenFilterConfig: () => void;
  onResetToAuto: () => void;
  onQuickAddChartForColumn: (col: ColumnMeta) => void;
}

export const DetectedHeadersBar: React.FC<DetectedHeadersBarProps> = ({
  columns,
  layoutConfig,
  onOpenBuilder,
  onOpenAddChart,
  onOpenAddKPI,
  onOpenFilterConfig,
  onResetToAuto,
  onQuickAddChartForColumn,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 mb-4 select-none">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Headers Detection Overview */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200/60 rounded-lg text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>Detected Headers:</span>
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded font-mono">
              {columns.length}
            </span>
          </div>

          {/* Quick scrollable list of detected headers with type badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-2xl py-0.5 no-scrollbar">
            {columns.map((col) => {
              const isUsedInFilter = layoutConfig.filterColumns.includes(col.key);
              const isUsedInChart = layoutConfig.charts.some(
                (c) => c.dimensionKey === col.key || c.metricKey === col.key
              );

              return (
                <button
                  key={col.key}
                  onClick={() => onQuickAddChartForColumn(col)}
                  title={`Header: ${col.name} (${col.type}) • Click to quick-create visualization`}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all shrink-0 group ${
                    isUsedInChart || isUsedInFilter
                      ? 'bg-slate-100 text-slate-800 border-slate-300 hover:border-red-400'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                  }`}
                >
                  {col.type === 'numeric' && <Hash className="w-3 h-3 text-emerald-600 shrink-0" />}
                  {col.type === 'date' && <Calendar className="w-3 h-3 text-blue-600 shrink-0" />}
                  {col.type === 'categorical' && <Layers className="w-3 h-3 text-purple-600 shrink-0" />}
                  {col.type === 'text' && <span className="text-[10px] text-slate-400 font-bold shrink-0">Aa</span>}
                  
                  <span className="truncate max-w-[120px]">{col.name}</span>
                  
                  {isUsedInFilter && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" title="Active Filter" />
                  )}
                  {isUsedInChart && (
                    <span title="Visualized in Chart">
                      <BarChart3 className="w-2.5 h-2.5 text-red-600" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Dynamic Builder & Customization Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onOpenBuilder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            title="Open Dynamic Dashboard Builder"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
            <span>Customize Dashboard</span>
          </button>

          <button
            onClick={onOpenAddChart}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
            title="Create a new visualization"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Chart</span>
          </button>

          <button
            onClick={onOpenAddKPI}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            title="Add KPI summary card"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add KPI</span>
          </button>

          <button
            onClick={onOpenFilterConfig}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
            title="Configure Top Filter Bar columns"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters</span>
          </button>

          <button
            onClick={onResetToAuto}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset to Auto-Suggested layout for this sheet"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
