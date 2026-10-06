/**
 * Bharat 1 AI - Create. Analyze. Automate.
 * All-in-one AI platform & Interactive Excel Live Dashboard
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
} from './types/dashboard';
import { exportFilteredToExcel, parseWorkbookSheet } from './utils/excelParser';
import { parseNumericValue } from './utils/numberFormat';
import { generateAutoDashboardConfig } from './utils/dashboardBuilder';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ToolStudioModal } from './components/ToolStudioModal';
import { DatasetStatusCard } from './components/DatasetStatusCard';
import { DetectedHeadersBar } from './components/DetectedHeadersBar';
import { DynamicTopFilterBar } from './components/DynamicTopFilterBar';
import { DynamicKpiCards } from './components/DynamicKpiCards';
import { DynamicDashboardCharts } from './components/DynamicDashboardCharts';
import { DataTable } from './components/DataTable';
import { UploadModal } from './components/UploadModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { SchemaView } from './components/SchemaView';
import { EmptyWorkspace } from './components/EmptyWorkspace';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { FieldManagerDrawer } from './components/FieldManagerDrawer';
import { ChartBuilderModal } from './components/ChartBuilderModal';
import { KPIBuilderModal } from './components/KPIBuilderModal';
import { FilterConfigModal } from './components/FilterConfigModal';

export default function App() {
  // Navigation tab: 'home' is the default landing page matching reference image
  const [currentTab, setCurrentTab] = useState<MainNavTab>('home');

  // Main dataset state - in-memory only for uploaded Excel files
  const [dataset, setDataset] = useState<Dataset | null>(null);

  // In-memory workbook for instant multi-sheet switching without re-uploading
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Dynamic dashboard layout configuration (KPIs, Charts, Filter Columns)
  const [layoutConfig, setLayoutConfig] = useState<DashboardLayoutConfig | null>(null);

  // Modals and Drawers state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DataRow | null>(null);

  // Interactive AI Tool Studio Modal state
  const [activeStudioToolId, setActiveStudioToolId] = useState<string | null>(null);

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
    setCurrentTab('home');
    setIsResetConfirmOpen(false);
  }, [handleClearAllFilters]);

  // Uploaded dataset handler - instantly activates Live Dashboard
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
      // Navigate straight to the Live Dashboard view to play with data
      setCurrentTab('dashboard');
    },
    [handleClearAllFilters]
  );

  // Switch active sheet dynamically from workbook
  const handleSelectSheet = useCallback(
    (sheetName: string) => {
      if (!workbook || !dataset) return;
      try {
        const newDataset = parseWorkbookSheet(workbook, dataset.fileName, sheetName);
        setDataset(newDataset);
        const autoConfig = generateAutoDashboardConfig(newDataset.columns, newDataset.rows);
        setLayoutConfig(autoConfig);
        handleClearAllFilters();
      } catch (err: any) {
        console.error('Failed to switch sheet:', err);
      }
    },
    [workbook, dataset, handleClearAllFilters]
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

  // Handle sidebar navigation clicks
  const handleSelectNavTab = useCallback((tab: MainNavTab) => {
    if (tab === 'home' || tab === 'dashboard' || tab === 'table' || tab === 'schema') {
      setCurrentTab(tab);
    } else {
      // Open the interactive studio for other AI tools
      setActiveStudioToolId(tab);
    }
  }, []);

  const isLiveDashboardView = currentTab === 'dashboard' || currentTab === 'table' || currentTab === 'schema';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50/70 text-slate-900 font-sans antialiased">
      {/* Left Sidebar (Bharat 1 AI Branding + Navigation) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectNavTab}
        dataset={dataset}
        filteredCount={filteredRows.length}
        onOpenUpload={() => setIsUploadOpen(true)}
        onTriggerReset={handleTriggerReset}
        onSelectSheet={handleSelectSheet}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header matching reference image with Search bar, Help, Bell (3), and Profile avatar */}
        <Header
          dataset={dataset}
          globalSearch={filterState.globalSearch}
          setGlobalSearch={handleSetGlobalSearch}
          onOpenUpload={() => setIsUploadOpen(true)}
          onSelectSheet={handleSelectSheet}
          onOpenHelp={() => setActiveStudioToolId('help')}
          isDashboardView={isLiveDashboardView}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/60">
          {/* HOME VIEW: Matches Reference Image */}
          {currentTab === 'home' && (
            <HomePage
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
              onOpenTool={(toolId) => {
                if (toolId === 'live_dashboard') {
                  setCurrentTab('dashboard');
                } else {
                  setActiveStudioToolId(toolId);
                }
              }}
              dataset={dataset}
            />
          )}

          {/* LIVE DASHBOARD VIEW: Interactive Excel Dashboard Engine */}
          {isLiveDashboardView && (
            <>
              {!dataset ? (
                /* Blank Workspace Upload Dropzone */
                <EmptyWorkspace onDatasetLoaded={handleDatasetLoaded} />
              ) : (
                <>
                  {/* 1. Active Excel Card (Relocated in place of banner per Attachment 4/5) */}
                  <DatasetStatusCard
                    dataset={dataset}
                    onSelectSheet={handleSelectSheet}
                    onTriggerReset={handleTriggerReset}
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

                  {/* 5. Dynamic Dashboard Charts View */}
                  {currentTab === 'dashboard' && layoutConfig && (
                    <>
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

                  {/* 6. Full Page Table View */}
                  {currentTab === 'table' && (
                    <DataTable
                      columns={dataset.columns}
                      rows={filteredRows}
                      onSelectRow={(row) => setSelectedRecord(row)}
                      onExport={handleExportFilteredExcel}
                    />
                  )}

                  {/* 7. Detected Headers & Schema View */}
                  {currentTab === 'schema' && (
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
            </>
          )}
        </main>
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

      {/* Interactive Tool Studio Modal for other AI tools */}
      <ToolStudioModal
        toolId={activeStudioToolId}
        onClose={() => setActiveStudioToolId(null)}
        onNavigateToDashboard={() => {
          setActiveStudioToolId(null);
          setCurrentTab('dashboard');
        }}
        onOpenUpload={() => {
          setActiveStudioToolId(null);
          setIsUploadOpen(true);
        }}
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
}
