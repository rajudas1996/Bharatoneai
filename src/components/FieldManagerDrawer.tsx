import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BarChart3, 
  Layers, 
  Hash, 
  Calendar, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  Check, 
  ArrowRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { 
  ColumnMeta, 
  DashboardLayoutConfig, 
  DynamicChartWidget, 
  DynamicKPIWidget 
} from '../types/dashboard';

interface FieldManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnMeta[];
  layoutConfig: DashboardLayoutConfig;
  onUpdateLayout: (newConfig: DashboardLayoutConfig) => void;
  onOpenAddChartForColumn: (col: ColumnMeta) => void;
  onOpenAddKPIForColumn: (col: ColumnMeta) => void;
  onOpenEditChart: (widget: DynamicChartWidget) => void;
  onOpenEditKPI: (kpi: DynamicKPIWidget) => void;
}

export const FieldManagerDrawer: React.FC<FieldManagerDrawerProps> = ({
  isOpen,
  onClose,
  columns,
  layoutConfig,
  onUpdateLayout,
  onOpenAddChartForColumn,
  onOpenAddKPIForColumn,
  onOpenEditChart,
  onOpenEditKPI,
}) => {
  const [activeTab, setActiveTab] = useState<'headers' | 'widgets' | 'filters'>('headers');

  if (!isOpen) return null;

  const handleToggleFilterColumn = (key: string) => {
    const exists = layoutConfig.filterColumns.includes(key);
    const updated = exists
      ? layoutConfig.filterColumns.filter((k) => k !== key)
      : [...layoutConfig.filterColumns, key];
    onUpdateLayout({ ...layoutConfig, filterColumns: updated });
  };

  const handleDeleteChart = (id: string) => {
    onUpdateLayout({
      ...layoutConfig,
      charts: layoutConfig.charts.filter((c) => c.id !== id),
    });
  };

  const handleDeleteKPI = (id: string) => {
    onUpdateLayout({
      ...layoutConfig,
      kpis: layoutConfig.kpis.filter((k) => k.id !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Dynamic Dashboard Builder
              </h2>
              <p className="text-[11px] text-slate-500">
                Detected Excel headers & live visualization manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 pt-2 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('headers')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'headers'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Detected Headers ({columns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('widgets')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'widgets'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Active Visuals ({layoutConfig.charts.length + layoutConfig.kpis.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('filters')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'filters'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Dropdowns ({layoutConfig.filterColumns.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* TAB 1: DETECTED HEADERS WITH DIRECT VISUALIZE ACTIONS */}
          {activeTab === 'headers' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-200/70 text-xs text-red-900">
                <p className="font-semibold mb-0.5">
                  Select any detected header below to turn it into a Chart, KPI, or Filter.
                </p>
                <p className="text-[11px] text-red-700">
                  Headers and data types are automatically inferred from your uploaded Excel sheet.
                </p>
              </div>

              {columns.map((col) => {
                const isFilter = layoutConfig.filterColumns.includes(col.key);
                const chartCount = layoutConfig.charts.filter(
                  (c) => c.dimensionKey === col.key || c.metricKey === col.key
                ).length;

                return (
                  <div
                    key={col.key}
                    className="p-3.5 bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200/90 transition-all shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {col.type === 'numeric' && (
                          <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                            <Hash className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {col.type === 'date' && (
                          <div className="p-1 rounded bg-blue-100 text-blue-700">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {col.type === 'categorical' && (
                          <div className="p-1 rounded bg-purple-100 text-purple-700">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {col.type === 'text' && (
                          <div className="p-1 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                            Aa
                          </div>
                        )}

                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{col.name}</span>
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-600 font-mono">
                              {col.type}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {col.uniqueValues.length} unique values • {col.nullCount} nulls
                          </div>
                        </div>
                      </div>

                      {/* Quick sample badges */}
                      {chartCount > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <BarChart3 className="w-2.5 h-2.5" /> {chartCount} chart{chartCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Sample Values Preview */}
                    {col.uniqueValues.length > 0 && (
                      <div className="text-[11px] text-slate-500 mb-3 truncate font-mono bg-white px-2 py-1 rounded border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-sans font-semibold mr-1">Samples:</span>
                        {col.uniqueValues.slice(0, 4).join(', ')}
                        {col.uniqueValues.length > 4 ? '...' : ''}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onOpenAddChartForColumn(col)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-2xs"
                      >
                        <BarChart3 className="w-3 h-3" />
                        <span>Add Chart</span>
                      </button>

                      <button
                        onClick={() => onOpenAddKPIForColumn(col)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-slate-500" />
                        <span>Add KPI</span>
                      </button>

                      <button
                        onClick={() => handleToggleFilterColumn(col.key)}
                        className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                          isFilter
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Toggle in Top Filter Bar"
                      >
                        <Filter className="w-3 h-3" />
                        <span>{isFilter ? 'In Filter Bar' : 'Set as Filter'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ACTIVE VISUALS MANAGER (CHARTS & KPIS) */}
          {activeTab === 'widgets' && (
            <div className="space-y-4">
              {/* KPIs Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    KPI Cards ({layoutConfig.kpis.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {layoutConfig.kpis.map((kpi) => (
                    <div
                      key={kpi.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{kpi.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {kpi.aggregation.toUpperCase()} • {kpi.columnKey || 'Total Records'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenEditKPI(kpi)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
                          title="Edit KPI"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteKPI(kpi.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Delete KPI"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Chart Visualizations ({layoutConfig.charts.length})
                  </h3>
                </div>
                <div className="space-y-2">
                  {layoutConfig.charts.map((chart) => (
                    <div
                      key={chart.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{chart.title}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-semibold uppercase">
                            {chart.chartType.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Dimension: {chart.dimensionKey} • Metric: {chart.metricKey ? `${chart.aggregation}(${chart.metricKey})` : 'Count'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenEditChart(chart)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
                          title="Edit Chart"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteChart(chart.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                          title="Delete Chart"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FILTER CONFIGURATION */}
          {activeTab === 'filters' && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mb-3">
                Check the headers you want to include in the Top Filter Bar at the top of your dashboard.
              </div>

              {columns.map((col) => {
                const isSelected = layoutConfig.filterColumns.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => handleToggleFilterColumn(col.key)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-red-50/70 border-red-400 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-red-600 text-white' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{col.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {col.type.toUpperCase()} • {col.uniqueValues.length} unique values
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Changes apply to your live dashboard instantly
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Done Building
          </button>
        </div>
      </div>
    </div>
  );
};
