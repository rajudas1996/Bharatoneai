/**
 * Live Dashboard Component - PROTECTED MODULE
 * Preserves 100% of the working dashboard logic, state, formulas,
 * Excel parsing, filters, cross-filters, chart calculations, and export.
 */

import React, { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  Dataset, 
  FilterState, 
  DataRow, 
  DashboardLayoutConfig, 
  DynamicChartWidget, 
  DynamicKPIWidget,
  ColumnMeta
} from '../types/dashboard';
import { exportFilteredToExcel, parseWorkbookSheet } from '../utils/excelParser';
import { parseNumericValue } from '../utils/numberFormat';
import { generateAutoDashboardConfig } from '../utils/dashboardBuilder';
import { DatasetStatusCard } from './DatasetStatusCard';
import { DetectedHeadersBar } from './DetectedHeadersBar';
import { DynamicTopFilterBar } from './DynamicTopFilterBar';
import { DynamicKpiCards } from './DynamicKpiCards';
import { DynamicDashboardCharts } from './DynamicDashboardCharts';
import { DataTable } from './DataTable';
import { UploadModal } from './UploadModal';
import { RecordDetailModal } from './RecordDetailModal';
import { SchemaView } from './SchemaView';
import { EmptyWorkspace } from './EmptyWorkspace';
import { ResetConfirmModal } from './ResetConfirmModal';
import { FieldManagerDrawer } from './FieldManagerDrawer';
import { ChartBuilderModal } from './ChartBuilderModal';
import { KPIBuilderModal } from './KPIBuilderModal';
import { FilterConfigModal } from './FilterConfigModal';
import { 
  FileSpreadsheet, 
  RotateCcw, 
  UploadCloud, 
  LayoutDashboard, 
  Layers, 
  Table2,
  Download
} from 'lucide-react';

interface LiveDashboardViewProps {
  onDatasetChange?: (dataset: Dataset | null) => void;
}

export const LiveDashboardView: React.FC<LiveDashboardViewProps> = ({ onDatasetChange }) => {
  // Main dataset state - starts blank (in-memory only, no stale storage)
  const [dataset, setDataset] = useState<Dataset | null>(null);

  // In-memory workbook for instant multi-sheet switching without re-uploading
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Dynamic dashboard layout configuration (KPIs, Charts, Filter Columns)
  const [layoutConfig, setLayoutConfig] = useState<DashboardLayoutConfig | null>(null);

  // Navigation sub-view state ('dashboard' | 'table' | 'schema')
  const [currentSubView, setCurrentSubView] = useState<'dashboard' | 'table' | 'schema'>('dashboard');

  // Modals and Drawers state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRow | null>(null);

  // Dynamic Builder Dialogs
  const [isFieldManagerOpen, setIsFieldManagerOpen] = useState(false);
  const [isChartBuilderOpen, setIsChartBuilderOpen] = useState(false);
  const [editingChartWidget, setEditingChartWidget] = useState<DynamicChartWidget | null>(null);
  const [chartDefaultColKey, setChartDefaultColKey] = useState<string | undefined>(undefined);

  const [isKPIBuilderOpen, setIsKPIBuilderOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<DynamicKPIWidget | null>(null);
  const [kpiDefaultColKey, setKpiDefaultColKey] = useState<string | undefined>(undefined);

  const [isFilterConfigOpen, setIsFilterConfigOpen] = useState(false);

  // Unified Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    globalSearch: '',
    categorical: {},
    ranges: {},
    crossFilter: null,
  });

  // Global search updater
  const handleSetGlobalSearch = useCallback((term: string) => {
    setFilterState((prev) => ({ ...prev, globalSearch: term }));
  }, []);

  // Cross-filter updater (Power BI-style)
  const handleSetCrossFilter = useCallback(
    (columnKey: string, value: string, sourceChartId: string) => {
      setFilterState((prev) => ({
        ...prev,
        crossFilter: { columnKey, value, sourceChartId },
      }));
    },
    []
  );

  const handleClearCrossFilter = useCallback(() => {
    setFilterState((prev) => ({ ...prev, crossFilter: null }));
  }, []);

  // Categorical filter updater
  const handleUpdateCategorical = useCallback((colKey: string, selectedValues: string[]) => {
    setFilterState((prev) => {
      const next = { ...prev.categorical };
      if (selectedValues.length === 0) {
        delete next[colKey];
      } else {
        next[colKey] = selectedValues;
      }
      return { ...prev, categorical: next };
    });
  }, []);

  const handleRemoveSingleCategorical = useCallback((colKey: string, value: string) => {
    setFilterState((prev) => {
      const current = prev.categorical[colKey] || [];
      const updated = current.filter((v) => v !== value);
      const next = { ...prev.categorical };
      if (updated.length === 0) {
        delete next[colKey];
      } else {
        next[colKey] = updated;
      }
      return { ...prev, categorical: next };
    });
  }, []);

  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilterState({
      globalSearch: '',
      categorical: {},
      ranges: {},
      crossFilter: null,
    });
  }, []);

  // Calculate filtered rows with high efficiency
  const filteredRows = useMemo(() => {
    if (!dataset) return [];

    const { globalSearch, categorical, ranges, crossFilter } = filterState;
    const hasSearch = !!globalSearch.trim();
    const searchLower = globalSearch.toLowerCase().trim();

    return dataset.rows.filter((row) => {
      // 1. Cross-filter check
      if (crossFilter) {
        const rowVal = String(row[crossFilter.columnKey] ?? '').trim();
        if (rowVal !== crossFilter.value) {
          return false;
        }
      }

      // 2. Categorical multi-select filters
      for (const [colKey, selectedVals] of Object.entries(categorical)) {
        if (selectedVals.length > 0) {
          const rowVal = String(row[colKey] ?? '').trim();
          if (!selectedVals.includes(rowVal)) {
            return false;
          }
        }
      }

      // 3. Range filters
      for (const [colKey, range] of Object.entries(ranges)) {
        const numVal = parseNumericValue(row[colKey]);
        if (numVal === null || numVal < range.min || numVal > range.max) {
          return false;
        }
      }

      // 4. Global search check
      if (hasSearch) {
        const matched = Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(searchLower);
        });
        if (!matched) return false;
      }

      return true;
    });
  }, [dataset, filterState]);

  // Download filtered Excel
  const handleExportFilteredExcel = useCallback(() => {
    if (!dataset) return;
    exportFilteredToExcel(filteredRows, dataset.columns, dataset.fileName);
  }, [filteredRows, dataset]);

  // Trigger Reset confirmation dialog
  const handleTriggerReset = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  // Confirmed reset - erases all loaded data from this session
  const handleConfirmReset = useCallback(() => {
    setDataset(null);
    setWorkbook(null);
    setLayoutConfig(null);
    handleClearAllFilters();
    setCurrentSubView('dashboard');
    setIsResetConfirmOpen(false);
    if (onDatasetChange) onDatasetChange(null);
  }, [handleClearAllFilters, onDatasetChange]);

  // Uploaded dataset handler
  const handleDatasetLoaded = useCallback(
    (newDataset: Dataset, newWorkbook?: XLSX.WorkBook) => {
      setDataset(newDataset);
      if (newWorkbook) {
        setWorkbook(newWorkbook);
      }
      // Automatically generate smart layout for these exact headers
      const autoConfig = generateAutoDashboardConfig(newDataset.columns, newDataset.rows);
      setLayoutConfig(autoConfig);

      handleClearAllFilters();
      setCurrentSubView('dashboard');
      if (onDatasetChange) onDatasetChange(newDataset);
    },
    [handleClearAllFilters, onDatasetChange]
  );

  // Switch active sheet dynamically from workbook
  const handleSelectSheet = useCallback(
    (sheetName: string) => {
      if (!workbook || !dataset) return;
      try {
        const newDataset = parseWorkbookSheet(workbook, dataset.fileName, sheetName);
        setDataset(newDataset);
        // Automatically re-generate layout matching new sheet's headers
        const autoConfig = generateAutoDashboardConfig(newDataset.columns, newDataset.rows);
        setLayoutConfig(autoConfig);
        handleClearAllFilters();
        if (onDatasetChange) onDatasetChange(newDataset);
      } catch (err: any) {
        console.error('Failed to switch sheet:', err);
      }
    },
    [workbook, dataset, handleClearAllFilters, onDatasetChange]
  );

  // Layout Modification Handlers
  const handleResetToAuto = useCallback(() => {
    if (!dataset) return;
    const autoConfig = generateAutoDashboardConfig(dataset.columns, dataset.rows);
    setLayoutConfig(autoConfig);
  }, [dataset]);

  const handleUpdateLayout = useCallback((newConfig: DashboardLayoutConfig) => {
    setLayoutConfig(newConfig);
  }, []);

  const handleUpdateChart = useCallback((updated: DynamicChartWidget) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        charts: prev.charts.map((c) => (c.id === updated.id ? updated : c)),
      };
    });
  }, []);

  const handleRemoveChart = useCallback((id: string) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        charts: prev.charts.filter((c) => c.id !== id),
      };
    });
  }, []);

  const handleSaveChartWidget = useCallback((widget: DynamicChartWidget) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      const exists = prev.charts.some((c) => c.id === widget.id);
      return {
        ...prev,
        charts: exists
          ? prev.charts.map((c) => (c.id === widget.id ? widget : c))
          : [...prev.charts, widget],
      };
    });
  }, []);

  const handleSaveKPIWidget = useCallback((kpi: DynamicKPIWidget) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      const exists = prev.kpis.some((k) => k.id === kpi.id);
      return {
        ...prev,
        kpis: exists
          ? prev.kpis.map((k) => (k.id === kpi.id ? k : k))
          : [...prev.kpis, kpi],
      };
    });
  }, []);

  const handleDeleteKPI = useCallback((id: string) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        kpis: prev.kpis.filter((k) => k.id !== id),
      };
    });
  }, []);

  const handleSaveFilterColumns = useCallback((selectedKeys: string[]) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        filterColumns: selectedKeys,
      };
    });
  }, []);

  const handleToggleFilterColumn = useCallback((key: string) => {
    setLayoutConfig((prev) => {
      if (!prev) return null;
      const exists = prev.filterColumns.includes(key);
      return {
        ...prev,
        filterColumns: exists
          ? prev.filterColumns.filter((k) => k !== key)
          : [...prev.filterColumns, key],
      };
    });
  }, []);

  // Quick Open Modal Triggers for specific column headers
  const handleQuickAddChartForColumn = useCallback((col: ColumnMeta) => {
    setEditingChartWidget(null);
    setChartDefaultColKey(col.key);
    setIsChartBuilderOpen(true);
  }, []);

  const handleQuickAddKPIForColumn = useCallback((col: ColumnMeta) => {
    setEditingKPI(null);
    setKpiDefaultColKey(col.key);
    setIsKPIBuilderOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Sub-Header Bar when Dataset is Loaded */}
      {dataset && (
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            {/* View Selector Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setCurrentSubView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  currentSubView === 'dashboard'
                    ? 'bg-white text-red-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard View</span>
              </button>

              <button
                onClick={() => setCurrentSubView('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  currentSubView === 'table'
                    ? 'bg-white text-red-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Data Table</span>
                <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1 rounded ml-1">
                  {filteredRows.length}
                </span>
              </button>

              <button
                onClick={() => setCurrentSubView('schema')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  currentSubView === 'schema'
                    ? 'bg-white text-red-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Detected Headers</span>
                <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1 rounded ml-1">
                  {dataset.totalColumns}
                </span>
              </button>
            </div>

            {/* Sheet Selector */}
            {dataset.availableSheets && dataset.availableSheets.length > 1 && (
              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium">Sheet:</span>
                <select
                  value={dataset.sheetName}
                  onChange={(e) => handleSelectSheet(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-md px-2 py-1 outline-none focus:border-red-500 cursor-pointer"
                >
                  {dataset.availableSheets.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportFilteredExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
              title="Download filtered rows as Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Filtered ({filteredRows.length})</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Replace Excel</span>
            </button>

            <button
              onClick={handleTriggerReset}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Reset and clear current dataset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto px-6 py-5 bg-slate-50/60">
        {!dataset ? (
          /* Blank Workspace Upload Dropzone */
          <EmptyWorkspace onDatasetLoaded={handleDatasetLoaded} />
        ) : (
          <>
            {/* 1. Dataset Upload Status Banner Card */}
            <DatasetStatusCard
              dataset={dataset}
              onViewDetails={() => setCurrentSubView('schema')}
            />

            {/* 2. Detected Headers Bar & Dynamic Builder Quick Triggers */}
            {layoutConfig && (
              <DetectedHeadersBar
                columns={dataset.columns}
                layoutConfig={layoutConfig}
                onOpenBuilder={() => setIsFieldManagerOpen(true)}
                onOpenAddChart={() => {
                  setEditingChartWidget(null);
                  setChartDefaultColKey(undefined);
                  setIsChartBuilderOpen(true);
                }}
                onOpenAddKPI={() => {
                  setEditingKPI(null);
                  setKpiDefaultColKey(undefined);
                  setIsKPIBuilderOpen(true);
                }}
                onOpenFilterConfig={() => setIsFilterConfigOpen(true)}
                onResetToAuto={handleResetToAuto}
                onQuickAddChartForColumn={handleQuickAddChartForColumn}
              />
            )}

            {/* 3. Top Interactive Filter Bar (Dynamic dropdowns for configured columns) */}
            {layoutConfig && (
              <DynamicTopFilterBar
                columns={dataset.columns}
                filterColumns={layoutConfig.filterColumns}
                allRows={dataset.rows}
                filterState={filterState}
                onUpdateCategorical={handleUpdateCategorical}
                onClearCrossFilter={handleClearCrossFilter}
                onClearGlobalSearch={() => handleSetGlobalSearch('')}
                onClearAll={handleClearAllFilters}
                onRemoveCategorical={handleRemoveSingleCategorical}
                onOpenFilterConfig={() => setIsFilterConfigOpen(true)}
              />
            )}

            {/* 4. Dynamic KPI Cards Row */}
            {layoutConfig && (
              <DynamicKpiCards
                kpis={layoutConfig.kpis}
                columns={dataset.columns}
                filteredRows={filteredRows}
                totalRowCount={dataset.totalRows}
                onOpenAddKPI={() => {
                  setEditingKPI(null);
                  setKpiDefaultColKey(undefined);
                  setIsKPIBuilderOpen(true);
                }}
                onOpenEditKPI={(kpi) => {
                  setEditingKPI(kpi);
                  setIsKPIBuilderOpen(true);
                }}
                onDeleteKPI={handleDeleteKPI}
              />
            )}

            {/* 5. Dynamic Dashboard Views */}
            {currentSubView === 'dashboard' && layoutConfig && (
              <>
                {/* Dynamic Interactive Charts Grid */}
                <DynamicDashboardCharts
                  charts={layoutConfig.charts}
                  columns={dataset.columns}
                  filteredRows={filteredRows}
                  filterState={filterState}
                  onSetCrossFilter={handleSetCrossFilter}
                  onClearCrossFilter={handleClearCrossFilter}
                  onUpdateChart={handleUpdateChart}
                  onRemoveChart={handleRemoveChart}
                  onOpenEditChart={(widget) => {
                    setEditingChartWidget(widget);
                    setIsChartBuilderOpen(true);
                  }}
                  onOpenAddChart={() => {
                    setEditingChartWidget(null);
                    setChartDefaultColKey(undefined);
                    setIsChartBuilderOpen(true);
                  }}
                />

                {/* Raw Data Preview Table at Bottom */}
                <DataTable
                  columns={dataset.columns}
                  rows={filteredRows}
                  onSelectRow={(row) => setSelectedRecord(row)}
                  onExport={handleExportFilteredExcel}
                />
              </>
            )}

            {currentSubView === 'table' && (
              <DataTable
                columns={dataset.columns}
                rows={filteredRows}
                onSelectRow={(row) => setSelectedRecord(row)}
                onExport={handleExportFilteredExcel}
              />
            )}

            {currentSubView === 'schema' && (
              <SchemaView
                columns={dataset.columns}
                totalRows={dataset.totalRows}
                onQuickAddChart={handleQuickAddChartForColumn}
                onQuickAddKPI={handleQuickAddKPIForColumn}
                onToggleFilter={handleToggleFilterColumn}
                filterColumns={layoutConfig?.filterColumns || []}
              />
            )}
          </>
        )}
      </div>

      {/* Upload / Replace Excel Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
        currentDataset={dataset}
      />

      {/* Record Details Inspector Modal */}
      {dataset && (
        <RecordDetailModal
          row={selectedRecord}
          columns={dataset.columns}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        fileName={dataset?.fileName}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Field Manager Drawer (Master Dynamic Builder) */}
      {dataset && layoutConfig && (
        <FieldManagerDrawer
          isOpen={isFieldManagerOpen}
          onClose={() => setIsFieldManagerOpen(false)}
          columns={dataset.columns}
          layoutConfig={layoutConfig}
          onUpdateLayout={handleUpdateLayout}
          onOpenAddChartForColumn={handleQuickAddChartForColumn}
          onOpenAddKPIForColumn={handleQuickAddKPIForColumn}
          onOpenEditChart={(chart) => {
            setEditingChartWidget(chart);
            setIsChartBuilderOpen(true);
          }}
          onOpenEditKPI={(kpi) => {
            setEditingKPI(kpi);
            setIsKPIBuilderOpen(true);
          }}
        />
      )}

      {/* Chart Builder Modal */}
      {dataset && (
        <ChartBuilderModal
          isOpen={isChartBuilderOpen}
          onClose={() => {
            setIsChartBuilderOpen(false);
            setEditingChartWidget(null);
            setChartDefaultColKey(undefined);
          }}
          columns={dataset.columns}
          rows={dataset.rows}
          onSaveWidget={handleSaveChartWidget}
          initialWidget={editingChartWidget}
          defaultColumnKey={chartDefaultColKey}
        />
      )}

      {/* KPI Builder Modal */}
      {dataset && (
        <KPIBuilderModal
          isOpen={isKPIBuilderOpen}
          onClose={() => {
            setIsKPIBuilderOpen(false);
            setEditingKPI(null);
            setKpiDefaultColKey(undefined);
          }}
          columns={dataset.columns}
          rows={filteredRows}
          totalRowCount={dataset.totalRows}
          onSaveKPI={handleSaveKPIWidget}
          initialKPI={editingKPI}
          defaultColumnKey={kpiDefaultColKey}
        />
      )}

      {/* Filter Configuration Modal */}
      {dataset && layoutConfig && (
        <FilterConfigModal
          isOpen={isFilterConfigOpen}
          onClose={() => setIsFilterConfigOpen(false)}
          columns={dataset.columns}
          activeFilterColumns={layoutConfig.filterColumns}
          onSaveFilterColumns={handleSaveFilterColumns}
        />
      )}
    </div>
  );
};
