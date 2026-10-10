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
import { exportFilteredToExcel, parseWorkbookSheet, syncVisualizationsToWorkbook, downloadUpdatedWorkbook } from './utils/excelParser';
import { parseNumericValue } from './utils/numberFormat';
import { generateAutoDashboardConfig } from './utils/dashboardBuilder';
import { Sidebar, MainNavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
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
import { UpgradeModal } from './components/UpgradeModal';
import { AuthProfileModal, UserProfile } from './components/AuthProfileModal';

// AI Tool Workspaces
import { CRMLayout } from './components/crm/CRMLayout';
import { SalesCRMTool } from './components/tools/SalesCRMTool';
import { UnifiedImageEditor } from './components/tools/UnifiedImageEditor';
import { UnifiedVideoEditor } from './components/tools/UnifiedVideoEditor';
import { MusicGeneratorTool } from './components/tools/MusicGeneratorTool';
import { DatabaseAuthTool } from './components/tools/DatabaseAuthTool';
import { MapsDataTool } from './components/tools/MapsDataTool';
import { AllToolsView } from './components/tools/AllToolsView';
import { safeStorage } from './utils/safeStorage';
import { ProjectsView } from './components/tools/ProjectsView';
import { SettingsView } from './components/tools/SettingsView';
import { HelpSupportView } from './components/tools/HelpSupportView';
import { VisualWebsiteEditorModal } from './components/VisualWebsiteEditorModal';
import { Home, BarChart3, Sparkles, Film, Layers, Briefcase, Video } from 'lucide-react';

export default function App() {
  // Navigation tab: 'home' is the default landing page matching reference image
  const [currentTab, setCurrentTab] = useState<MainNavTab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Shared active image for Image Editor Studio
  const [activeEditorImage, setActiveEditorImage] = useState<string | null>(() => {
    return safeStorage.getItem('bharat1_active_editor_image');
  });

  const handleSendImageToEditor = (imgDataUrl: string) => {
    setActiveEditorImage(imgDataUrl);
    safeStorage.setItem('bharat1_active_editor_image', imgDataUrl);
    setCurrentTab('image_edit');
  };

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

  // Dynamic Builder modals & drawers
  const [isFieldManagerOpen, setIsFieldManagerOpen] = useState(false);
  const [isChartBuilderOpen, setIsChartBuilderOpen] = useState(false);
  const [editingChartWidget, setEditingChartWidget] = useState<DynamicChartWidget | null>(null);
  const [chartDefaultColKey, setChartDefaultColKey] = useState<string | undefined>(undefined);

  const [isKPIBuilderOpen, setIsKPIBuilderOpen] = useState(false);
  const [editingKPI, setEditingKPI] = useState<DynamicKPIWidget | null>(null);
  const [kpiDefaultColKey, setKpiDefaultColKey] = useState<string | undefined>(undefined);

  const [isFilterConfigOpen, setIsFilterConfigOpen] = useState(false);

  // User Profile state with safe localStorage persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = safeStorage.getItem('bharat1_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      }
    } catch {}
    return {
      name: '',
      rollNumber: '',
      email: '',
      phone: '',
      plan: 'Free',
      role: 'User',
      isLoggedIn: false,
    };
  });

  const handleUpdateProfile = useCallback((profile: UserProfile) => {
    setUserProfile(profile);
    safeStorage.setItem('bharat1_user_profile', JSON.stringify(profile));
  }, []);

  // Automatically sync visualization modifications to active workbook in real time
  React.useEffect(() => {
    if (workbook && layoutConfig?.charts) {
      syncVisualizationsToWorkbook(workbook, layoutConfig.charts, layoutConfig.kpis);
    }
  }, [workbook, layoutConfig]);

  // Handle Download Updated Workbook with modifications reflected
  const handleDownloadUpdatedWorkbook = useCallback(() => {
    if (!workbook || !dataset) return;
    if (layoutConfig?.charts) {
      syncVisualizationsToWorkbook(workbook, layoutConfig.charts, layoutConfig.kpis);
    }
    downloadUpdatedWorkbook(workbook, dataset.fileName);
  }, [workbook, dataset, layoutConfig]);

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisualEditorOpen, setIsVisualEditorOpen] = useState(false);

  // Interactive filter state
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

  // Cross-filter click handler
  const handleSetCrossFilter = useCallback((columnKey: string, value: string) => {
    setFilterState((prev) => {
      if (prev.crossFilter?.columnKey === columnKey && prev.crossFilter?.value === value) {
        return { ...prev, crossFilter: null };
      }
      return { ...prev, crossFilter: { columnKey, value } };
    });
  }, []);

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

      // 3. Numeric range filters
      for (const [colKey, range] of Object.entries(ranges)) {
        if (range && (range.min !== undefined || range.max !== undefined)) {
          const numVal = parseNumericValue(row[colKey]);
          if (numVal !== null) {
            if (range.min !== undefined && numVal < range.min) return false;
            if (range.max !== undefined && numVal > range.max) return false;
          }
        }
      }

      // 4. Global search
      if (hasSearch) {
        let match = false;
        for (const val of Object.values(row)) {
          if (val !== null && val !== undefined) {
            if (String(val).toLowerCase().includes(searchLower)) {
              match = true;
              break;
            }
          }
        }
        if (!match) return false;
      }

      return true;
    });
  }, [dataset, filterState]);

  // Handle dataset loaded from UploadModal or EmptyWorkspace
  const handleDatasetLoaded = useCallback((newDataset: Dataset, newWb?: XLSX.WorkBook) => {
    setDataset(newDataset);
    if (newWb) setWorkbook(newWb);

    // Automatically detect headers and generate dynamic layout
    const autoConfig = generateAutoDashboardConfig(newDataset.columns, newDataset.rows);
    setLayoutConfig(autoConfig);

    // Reset filters
    setFilterState({
      globalSearch: '',
      categorical: {},
      ranges: {},
      crossFilter: null,
    });

    setIsUploadOpen(false);
    setCurrentTab('dashboard');
  }, []);

  // Handle Sheet selection from multi-sheet workbook
  const handleSelectSheet = useCallback((sheetName: string) => {
    if (!workbook || !dataset) return;
    try {
      const switchedDataset = parseWorkbookSheet(workbook, dataset.fileName, sheetName);
      setDataset(switchedDataset);

      // Re-generate auto layout for the newly selected sheet
      const autoConfig = generateAutoDashboardConfig(switchedDataset.columns, switchedDataset.rows);
      setLayoutConfig(autoConfig);

      // Clear filters on sheet change
      handleClearAllFilters();
    } catch (err) {
      console.error('Error switching sheet:', err);
    }
  }, [workbook, dataset, handleClearAllFilters]);

  // Trigger Reset confirmation dialog
  const handleTriggerReset = useCallback(() => {
    setIsResetConfirmOpen(true);
  }, []);

  // Confirm Reset and purge all memory state
  const handleConfirmReset = useCallback(() => {
    setDataset(null);
    setWorkbook(null);
    setLayoutConfig(null);
    setFilterState({
      globalSearch: '',
      categorical: {},
      ranges: {},
      crossFilter: null,
    });
    setSelectedRecord(null);
    setIsResetConfirmOpen(false);
  }, []);

  // Export filtered rows to Excel
  const handleExportFilteredExcel = useCallback(() => {
    if (!dataset) return;
    exportFilteredToExcel(
      filteredRows,
      dataset.columns,
      dataset.fileName
    );
  }, [dataset, filteredRows]);

  // Reset to auto layout
  const handleResetToAuto = useCallback(() => {
    if (!dataset) return;
    const newConfig = generateAutoDashboardConfig(dataset.columns, dataset.rows);
    setLayoutConfig(newConfig);
  }, [dataset]);

  // Layout modifier callbacks
  const handleUpdateLayoutConfig = useCallback((newConfig: DashboardLayoutConfig) => {
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
          ? prev.kpis.map((k) => (k.id === kpi.id ? kpi : k))
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

  // Handle sidebar navigation clicks - direct workspace activation with strict login guards
  const handleSelectNavTab = useCallback((tab: MainNavTab) => {
    if (tab === 'sales_crm' && !userProfile.isLoggedIn) {
      setCurrentTab('sales_crm');
      setIsProfileOpen(true);
      return;
    }
    if ((tab === 'settings' || tab === 'database_auth') && !userProfile.isLoggedIn) {
      setCurrentTab('settings');
      setIsProfileOpen(true);
      return;
    }
    setCurrentTab(tab);
  }, [userProfile.isLoggedIn]);

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
        isOpenOnMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header matching reference image (No search bar per user request) */}
        <Header
          onOpenHelp={() => setCurrentTab('help')}
          onOpenUpgrade={() => setIsUpgradeOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenVisualEditor={() => setIsVisualEditorOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          userProfile={userProfile}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 bg-slate-50/60 pb-20 md:pb-6">
          {/* 1. HOME VIEW */}
          {currentTab === 'home' && (
            <HomePage
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
              onOpenTool={(toolId) => {
                if (toolId === 'live_dashboard') {
                  setCurrentTab('dashboard');
                } else {
                  setCurrentTab(toolId as MainNavTab);
                }
              }}
              dataset={dataset}
            />
          )}

          {/* 2. LIVE DASHBOARD VIEW */}
          {currentTab === 'dashboard' && (
            <>
              {!dataset ? (
                /* Blank Workspace Upload Dropzone */
                <EmptyWorkspace onDatasetLoaded={handleDatasetLoaded} />
              ) : (
                <>
                  {/* 1. Active Excel Card: Bold Heading, then [file name, sheet dropdown, reupload, reset in one line] */}
                  <DatasetStatusCard
                    dataset={dataset}
                    onSelectSheet={handleSelectSheet}
                    onTriggerReset={handleTriggerReset}
                    onOpenUpload={() => setIsUploadOpen(true)}
                    onDownloadUpdatedWorkbook={handleDownloadUpdatedWorkbook}
                    hasWorkbook={Boolean(workbook)}
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
                  {layoutConfig && (
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
                        onReorderCharts={(newCharts) => {
                          setLayoutConfig((prev) => prev ? { ...prev, charts: newCharts } : prev);
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
                </>
              )}
            </>
          )}

          {/* 3. SALES CRM (Integrated per User Blueprint) */}
          {currentTab === 'sales_crm' && (
            <CRMLayout
              isLoggedIn={userProfile.isLoggedIn}
              currentUserProfile={userProfile}
              onOpenLoginModal={() => setIsProfileOpen(true)}
            />
          )}

          {/* 4. UNIFIED IMAGE EDITOR (Merged Image Creator & Image Edit per User Request) */}
          {(currentTab === 'image_editor' || currentTab === 'image_create' || currentTab === 'image_edit') && (
            <UnifiedImageEditor
              initialImage={activeEditorImage}
              onNavigateTab={(tab) => setCurrentTab(tab as MainNavTab)}
            />
          )}

          {/* 5. UNIFIED VIDEO EDITOR (Merged Animate Image & Text to Video per User Request) */}
          {(currentTab === 'video_editor' || currentTab === 'animate_image' || currentTab === 'text_to_video') && (
            <UnifiedVideoEditor
              initialImage={activeEditorImage}
              onNavigateTab={(tab) => setCurrentTab(tab as MainNavTab)}
            />
          )}

          {/* 6. MUSIC GENERATION */}
          {currentTab === 'music_gen' && <MusicGeneratorTool />}

          {/* 7. MAPS DATA */}
          {currentTab === 'maps_data' && <MapsDataTool />}

          {/* 8. ALL TOOLS VIEW */}
          {currentTab === 'all_tools' && <AllToolsView onSelectTab={handleSelectNavTab} />}

          {/* 9. PROJECTS */}
          {currentTab === 'projects' && <ProjectsView onSelectTab={handleSelectNavTab} />}

          {/* 10. SETTINGS & DATABASE VAULT (Database & Auth moved under Settings with admin password raju1234) */}
          {(currentTab === 'settings' || currentTab === 'database_auth') && (
            <SettingsView 
              initialTab={currentTab === 'database_auth' ? 'database' : 'crm_users'} 
              currentUserProfile={userProfile}
              onOpenLoginModal={() => setIsProfileOpen(true)}
            />
          )}

          {/* 11. HELP & SUPPORT */}
          {currentTab === 'help' && <HelpSupportView />}
        </main>

        {/* Mobile Bottom Sticky Navigation Bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-30 md:hidden shadow-lg select-none">
          <button
            type="button"
            onClick={() => handleSelectNavTab('home')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentTab === 'home' ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectNavTab('dashboard')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentTab === 'dashboard' ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectNavTab('sales_crm')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentTab === 'sales_crm' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>CRM</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectNavTab('image_editor')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentTab === 'image_editor' || currentTab === 'image_create' || currentTab === 'image_edit' ? 'text-purple-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectNavTab('video_editor')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentTab === 'video_editor' || currentTab === 'animate_image' || currentTab === 'text_to_video' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Video</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectNavTab('all_tools')}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
              currentTab === 'all_tools' ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tools</span>
          </button>
        </div>
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
          onUpdateLayout={handleUpdateLayoutConfig}
          onOpenAddChartForColumn={handleQuickAddChartForColumn}
          onOpenAddKPIForColumn={handleQuickAddKPIForColumn}
          onOpenEditChart={(w) => {
            setEditingChartWidget(w);
            setIsChartBuilderOpen(true);
          }}
          onOpenEditKPI={(k) => {
            setEditingKPI(k);
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
          initialWidget={editingChartWidget}
          defaultColumnKey={chartDefaultColKey}
          onSaveWidget={handleSaveChartWidget}
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
          rows={dataset.rows}
          totalRowCount={dataset.totalRows}
          initialKPI={editingKPI}
          defaultColumnKey={kpiDefaultColKey}
          onSaveKPI={handleSaveKPIWidget}
        />
      )}

      {/* Filter Columns Configuration Modal */}
      {dataset && (
        <FilterConfigModal
          isOpen={isFilterConfigOpen}
          onClose={() => setIsFilterConfigOpen(false)}
          columns={dataset.columns}
          activeFilterColumns={layoutConfig?.filterColumns || []}
          onSaveFilterColumns={handleSaveFilterColumns}
        />
      )}

      {/* Upgrade Plan Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlan={userProfile.plan}
        onSelectPlan={(plan) => handleUpdateProfile({ ...userProfile, plan })}
      />

      {/* Auth & Profile Modal */}
      <AuthProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        onOpenUpgrade={() => {
          setIsProfileOpen(false);
          setIsUpgradeOpen(true);
        }}
      />

      {/* Global Visual Website Editor Modal (Bharat 1 AI Admin) */}
      <VisualWebsiteEditorModal
        isOpen={isVisualEditorOpen}
        onClose={() => setIsVisualEditorOpen(false)}
        onElementsUpdated={() => {}}
      />
    </div>
  );
}
