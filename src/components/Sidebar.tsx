import React from 'react';
import { 
  Home, 
  BarChart3, 
  Image as ImageIcon, 
  SlidersHorizontal, 
  Film, 
  Video, 
  Music, 
  Database, 
  MapPin, 
  Sparkles, 
  Folder, 
  Settings, 
  HelpCircle,
  FileSpreadsheet,
  RotateCcw,
  Table2,
  Layers
} from 'lucide-react';
import { BharatLogo } from './BharatLogo';
import { Dataset } from '../types/dashboard';

export type MainNavTab = 
  | 'home' 
  | 'dashboard' 
  | 'table' 
  | 'schema' 
  | 'image_create' 
  | 'image_edit' 
  | 'animate_image' 
  | 'text_to_video' 
  | 'music_gen' 
  | 'database_auth' 
  | 'maps_data' 
  | 'all_tools'
  | 'projects'
  | 'settings'
  | 'help';

interface SidebarProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  dataset: Dataset | null;
  filteredCount: number;
  onOpenUpload: () => void;
  onTriggerReset: () => void;
  onSelectSheet: (sheetName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  dataset,
  filteredCount,
  onOpenUpload,
  onTriggerReset,
  onSelectSheet,
}) => {
  const isDashboardActive = currentTab === 'dashboard' || currentTab === 'table' || currentTab === 'schema';

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 border-r border-slate-200 z-20 select-none shadow-2xs h-full">
      {/* Brand Header with Bold Red "Bharat 1 AI" Logo */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <BharatLogo size="md" showSubtitle={false} />
      </div>

      {/* Primary Navigation List matching reference image */}
      <div className="p-3 space-y-1 overflow-y-auto flex-1 no-scrollbar">
        {/* 1. Home (Red active pill) */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            currentTab === 'home'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Home className={`w-4 h-4 shrink-0 ${currentTab === 'home' ? 'text-white' : 'text-slate-500'}`} />
          <span>Home</span>
        </button>

        {/* 2. Live Dashboard */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            isDashboardActive
              ? 'bg-red-50 text-red-600 font-bold border border-red-200/60'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <BarChart3 className={`w-4 h-4 shrink-0 ${isDashboardActive ? 'text-red-600' : 'text-slate-500'}`} />
          <span className="flex-1 text-left">Live Dashboard</span>
          {dataset && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Active Excel Loaded" />
          )}
        </button>

        {/* Sub-navigation items when Live Dashboard has an active dataset */}
        {isDashboardActive && dataset && (
          <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-red-200 ml-4 my-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-red-100/70 text-red-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Charts & KPIs</span>
            </button>
            <button
              onClick={() => onSelectTab('schema')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${
                currentTab === 'schema'
                  ? 'bg-red-100/70 text-red-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Detected Headers</span>
              <span className="ml-auto font-mono text-[9px] bg-slate-100 px-1 rounded">
                {dataset.totalColumns}
              </span>
            </button>
            <button
              onClick={() => onSelectTab('table')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-colors ${
                currentTab === 'table'
                  ? 'bg-red-100/70 text-red-800 font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-3 h-3" />
              <span>Data Table</span>
              <span className="ml-auto font-mono text-[9px] bg-slate-100 px-1 rounded">
                {filteredCount}
              </span>
            </button>
          </div>
        )}

        {/* 3. Image Creator */}
        <button
          type="button"
          onClick={() => onSelectTab('image_create')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'image_create'
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <ImageIcon className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Image Creator</span>
        </button>

        {/* 4. Image Edit */}
        <button
          type="button"
          onClick={() => onSelectTab('image_edit')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'image_edit'
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Image Edit</span>
        </button>

        {/* 5. Animate Image to Video */}
        <button
          type="button"
          onClick={() => onSelectTab('animate_image')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'animate_image'
              ? 'bg-amber-50 text-amber-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <Film className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Animate Image to Video</span>
        </button>

        {/* 6. Text to Video */}
        <button
          type="button"
          onClick={() => onSelectTab('text_to_video')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'text_to_video'
              ? 'bg-blue-50 text-blue-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <Video className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Text to Video</span>
        </button>

        {/* 7. Music Generation */}
        <button
          type="button"
          onClick={() => onSelectTab('music_gen')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'music_gen'
              ? 'bg-purple-50 text-purple-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <Music className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Music Generation</span>
        </button>

        {/* 8. Database & Auth */}
        <button
          type="button"
          onClick={() => onSelectTab('database_auth')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'database_auth'
              ? 'bg-red-50 text-red-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <Database className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Database & Auth</span>
        </button>

        {/* 9. Maps Data */}
        <button
          type="button"
          onClick={() => onSelectTab('maps_data')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'maps_data'
              ? 'bg-emerald-50 text-emerald-700 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <MapPin className="w-4 h-4 shrink-0 text-slate-500" />
          <span>Maps Data</span>
        </button>

        {/* 10. All Tools */}
        <button
          type="button"
          onClick={() => onSelectTab('all_tools')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-all ${
            currentTab === 'all_tools'
              ? 'bg-slate-100 text-slate-900 font-bold'
              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-slate-500" />
          <span>All Tools</span>
        </button>
      </div>

      {/* Bottom Navigation Section: Projects, Settings, Help & Support */}
      <div className="p-3 border-t border-slate-100 space-y-0.5 bg-white">
        <button
          type="button"
          onClick={() => onSelectTab('projects')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Folder className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Projects</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('settings')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('help')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Help & Support</span>
        </button>
      </div>
    </aside>
  );
};
